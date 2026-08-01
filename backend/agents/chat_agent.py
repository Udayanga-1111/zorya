import json
import logging
from langchain_core.messages import SystemMessage, AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from orchestrator.state import ZoryaAgentState
from schemas.agent_schemas import IntentClassification, PlanEditOutput, CBTBlock
from agents.prompts import (
    INTENT_CLASSIFIER_PROMPT,
    PLAN_EDIT_SYSTEM_PROMPT,
)

logger = logging.getLogger(__name__)

CHAT_SYSTEM_PROMPT = """You are Zorya, an empathetic, proactive AI wellness companion.
You have access to the user's daily planetary transits and CBT habit schedule.
Review their current state and answer their questions gracefully.

RULES:
- Be concise, warm, and professional. You must use concise micro-coaching: keep all responses strictly under 3 sentences per turn.
- Actively apply CBT (Cognitive Behavioral Therapy) reframing to help users shift negative thoughts into constructive, balanced perspectives.
- Absolutely NO deterministic or fatalistic claims. Use planetary data ONLY as a metaphor for personal growth.
- If asked about the future, gently pivot to what they can control today.
"""

def _get_llm(temperature: float = 0.7) -> ChatGroq:
    return ChatGroq(model="llama-3.3-70b-versatile", temperature=temperature)


async def intent_detection_node(state: ZoryaAgentState) -> dict:
    """
    LangGraph node that classifies the user's latest message into:
      - 'update_plan': the user wants to change one or more daily schedule blocks
      - 'general_chat': all other queries (advice, info, emotional check-in)

    Uses a zero-temperature structured-output call for maximum reliability.
    The classification result is stored in state['detected_intent'] so the
    conditional edge in chat_graph.py can route to the correct downstream node.
    """
    messages = state.get("messages", [])
    if not messages:
        return {"detected_intent": "general_chat", "intent_target_categories": []}

    # Extract the latest user message text
    latest = messages[-1]
    if isinstance(latest, HumanMessage):
        latest_text = latest.content
    elif isinstance(latest, dict):
        latest_text = latest.get("content", "")
    else:
        latest_text = str(latest)

    try:
        llm = _get_llm(temperature=0.0)
        structured_llm = llm.with_structured_output(IntentClassification)

        prompt = ChatPromptTemplate.from_messages([
            ("system", INTENT_CLASSIFIER_PROMPT),
            ("user", "Classify this message: {user_message}")
        ])
        chain = prompt | structured_llm

        result: IntentClassification = await chain.ainvoke({"user_message": latest_text})

        intent = result.intent if result.intent in ("update_plan", "general_chat") else "general_chat"
        logger.info(f"Intent detected: {intent} | targets: {result.target_categories} | reason: {result.reasoning}")

        return {
            "detected_intent": intent,
            "intent_target_categories": result.target_categories or [],
        }

    except Exception as e:
        logger.error(f"Intent detection failed: {e}. Defaulting to general_chat.")
        return {"detected_intent": "general_chat", "intent_target_categories": []}


async def plan_edit_node(state: ZoryaAgentState) -> dict:
    """
    LangGraph node for targeted daily plan mutation.

    1. Reads the current clinical_plan from state.
    2. Reads the user's request and target_categories from state.
    3. Calls the LLM (with PLAN_EDIT_SYSTEM_PROMPT + inline guardrails) to
       produce ONLY the modified CBTBlock objects.
    4. Merges those into the existing plan by category key (partial replacement).
    5. Returns the updated clinical_plan and a short confirmation AIMessage.

    The inline guardrail is embedded in PLAN_EDIT_SYSTEM_PROMPT — no extra
    LLM call is needed, keeping latency at zero overhead.
    """
    messages = state.get("messages", [])
    clinical_plan = state.get("clinical_plan") or {}
    target_categories = state.get("intent_target_categories", [])

    # Extract user request text
    latest = messages[-1] if messages else None
    if isinstance(latest, HumanMessage):
        user_request = latest.content
    elif isinstance(latest, dict):
        user_request = latest.get("content", "")
    else:
        user_request = str(latest) if latest else ""

    current_blocks = clinical_plan.get("blocks", [])

    try:
        llm = _get_llm(temperature=0.5)
        structured_llm = llm.with_structured_output(PlanEditOutput)

        context = (
            f"--- CURRENT DAILY PLAN ---\n"
            f"{json.dumps(current_blocks, indent=2)}\n"
            f"--- TARGET CATEGORIES TO MODIFY ---\n"
            f"{json.dumps(target_categories)}\n"
            f"--------------------------\n"
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", PLAN_EDIT_SYSTEM_PROMPT),
            ("system", context),
            ("user", "User request: {user_request}\n\nApply the targeted edit now."),
        ])
        chain = prompt | structured_llm

        result: PlanEditOutput = await chain.ainvoke({"user_request": user_request})

        # ── Partial merge: replace only matching category blocks ──────────────
        if result.modified_blocks:
            modified_by_category = {b.category: b.model_dump() for b in result.modified_blocks}
            merged_blocks = []
            for block in current_blocks:
                cat = block.get("category") if isinstance(block, dict) else getattr(block, "category", None)
                if cat and cat in modified_by_category:
                    merged_blocks.append(modified_by_category[cat])
                else:
                    merged_blocks.append(block)

            # Handle new categories not present in the original plan
            existing_categories = {
                (b.get("category") if isinstance(b, dict) else getattr(b, "category", None))
                for b in current_blocks
            }
            for mod_cat, mod_block in modified_by_category.items():
                if mod_cat not in existing_categories:
                    merged_blocks.append(mod_block)

            updated_plan = {**clinical_plan, "blocks": merged_blocks}
        else:
            # LLM returned nothing — fall back gracefully to unchanged plan
            logger.warning("plan_edit_node: LLM returned no modified blocks, plan unchanged.")
            updated_plan = clinical_plan
            result.confirmation_message = (
                "I wasn't able to identify which block to update precisely. "
                "Could you mention the block name (e.g., Focus, Rest, Grounding) you'd like to change?"
            )

        confirmation = AIMessage(content=result.confirmation_message)
        logger.info(f"plan_edit_node complete. Modified categories: {list(modified_by_category.keys()) if result.modified_blocks else []}")

        return {
            "clinical_plan": updated_plan,
            "messages": [confirmation],
        }

    except Exception as e:
        logger.error(f"plan_edit_node failed: {e}")
        fallback_msg = AIMessage(
            content=(
                "I had a brief issue updating your plan. "
                "Could you rephrase which block you'd like to change? "
                "For example: 'Replace my Focus block with a 10-minute breathing exercise.'"
            )
        )
        return {"messages": [fallback_msg]}


async def chat_node(state: ZoryaAgentState) -> dict:
    """
    LangGraph node for the Chat Companion.
    Reads user messages, injects current astronomical and CBT context, and streams the response.
    """
    llm = _get_llm(temperature=0.7)

    # Construct context from state
    celestial_data = state.get("celestial_context", {})
    clinical_plan = state.get("clinical_plan", {})

    # We serialize context so the model knows the current state
    context_msg = (
        f"--- CURRENT CONTEXT ---\n"
        f"Celestial Data: {json.dumps(celestial_data)}\n"
        f"Today's Plan: {json.dumps(clinical_plan)}\n"
        f"-----------------------\n"
    )

    messages = state.get("messages", [])

    # Add System Prompt and Context
    system_messages = [
        SystemMessage(content=CHAT_SYSTEM_PROMPT),
        SystemMessage(content=context_msg)
    ]

    # Prepare full message list
    full_messages = system_messages + messages

    try:
        # Invoke LLM (Streaming is handled by LangGraph's astream_events in the API)
        response = await llm.ainvoke(full_messages)

        # Return updated messages array
        return {"messages": [response]}
    except Exception as e:
        logger.error(f"Chat LLM invocation failed: {e}")
        fallback_msg = AIMessage(content="I'm currently experiencing a brief connection issue, but your daily habits are still available on your dashboard. Let's focus on those for now.")
        return {"messages": [fallback_msg]}
