import json
import logging
import re
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
- If the user asks what they can replace a block with, or asks for suggestions, give them concrete CBT-based alternatives and encourage them to tell you which one to apply.
"""

def _get_llm(temperature: float = 0.7) -> ChatGroq:
    return ChatGroq(model="llama-3.3-70b-versatile", temperature=temperature)


def _extract_latest_user_text(messages: list) -> str:
    """Safely extracts text from the last message in the list."""
    if not messages:
        return ""
    latest = messages[-1]
    if isinstance(latest, HumanMessage):
        return latest.content
    elif isinstance(latest, dict):
        return latest.get("content", "")
    return str(latest)


async def intent_detection_node(state: ZoryaAgentState) -> dict:
    """
    LangGraph node that classifies the user's latest message into:
      - 'update_plan': direct command to change one or more daily schedule blocks
      - 'general_chat': all other queries (advice, info, exploratory, emotional check-in)

    Uses a zero-temperature structured-output call for maximum reliability.
    The classification result is stored in state['detected_intent'] so the
    conditional edge in chat_graph.py can route to the correct downstream node.
    """
    messages = state.get("messages", [])
    if not messages:
        return {"detected_intent": "general_chat", "intent_target_categories": []}

    latest_text = _extract_latest_user_text(messages)

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


def _parse_plan_edit_json(raw_text: str) -> PlanEditOutput | None:
    """
    Fallback parser: extracts a JSON object from raw LLM text when structured_output fails.
    Handles cases where the LLM wraps JSON in markdown code fences.
    """
    try:
        # Strip markdown code fences if present
        cleaned = re.sub(r"```(?:json)?\n?", "", raw_text).strip().rstrip("```").strip()
        data = json.loads(cleaned)
        if isinstance(data, dict) and "modified_blocks" in data:
            return PlanEditOutput(
                modified_blocks=[CBTBlock(**b) for b in data["modified_blocks"]],
                confirmation_message=data.get("confirmation_message", "Your plan has been updated."),
            )
    except Exception as parse_err:
        logger.error(f"Fallback JSON parse also failed: {parse_err}")
    return None


async def plan_edit_node(state: ZoryaAgentState) -> dict:
    """
    LangGraph node for targeted daily plan mutation.

    1. Reads the current clinical_plan from state (injected from frontend via ChatRequest).
    2. Reads the user's request and target_categories from state.
    3. Calls the LLM with PLAN_EDIT_SYSTEM_PROMPT to produce modified CBTBlock objects.
       Primary path: with_structured_output(PlanEditOutput).
       Fallback path: plain text generation + JSON extraction regex.
    4. Merges changed blocks into the existing plan by category key (partial replacement).
    5. Returns the updated clinical_plan and a short confirmation AIMessage.

    The inline guardrail is embedded in PLAN_EDIT_SYSTEM_PROMPT — zero extra latency.
    """
    messages = state.get("messages", [])
    clinical_plan = state.get("clinical_plan") or {}
    target_categories = state.get("intent_target_categories", [])
    user_request = _extract_latest_user_text(messages)

    current_blocks = clinical_plan.get("blocks", [])

    # ── Guard: no plan available ──────────────────────────────────────────────
    if not current_blocks:
        logger.warning("plan_edit_node: clinical_plan has no blocks in state. Cannot edit.")
        no_plan_msg = AIMessage(
            content=(
                "I don't have your daily plan loaded yet. "
                "Please visit your dashboard first so Zorya can generate today's schedule, "
                "then come back and tell me what you'd like to change."
            )
        )
        return {"messages": [no_plan_msg]}

    context = (
        f"--- CURRENT DAILY PLAN ---\n"
        f"{json.dumps(current_blocks, indent=2)}\n"
        f"--- TARGET CATEGORIES TO MODIFY ---\n"
        f"{json.dumps(target_categories) if target_categories else '(infer from user request)'}\n"
        f"--------------------------\n"
    )

    # Build messages directly (NOT via ChatPromptTemplate) so that curly braces
    # inside json.dumps(current_blocks) are never treated as format specifiers.
    messages_for_llm = [
        SystemMessage(content=PLAN_EDIT_SYSTEM_PROMPT),
        SystemMessage(content=context),
        HumanMessage(content=f"User request: {user_request}\n\nApply the targeted edit now and output valid JSON."),
    ]

    result: PlanEditOutput | None = None

    # ── Primary path: structured output ──────────────────────────────────────
    try:
        llm = _get_llm(temperature=0.3)
        structured_llm = llm.with_structured_output(PlanEditOutput)
        result = await structured_llm.ainvoke(messages_for_llm)
        logger.info(f"plan_edit_node structured_output succeeded. blocks: {len(result.modified_blocks) if result else 0}")
    except Exception as primary_err:
        logger.warning(f"plan_edit_node structured_output failed: {primary_err}. Trying plain-text fallback.")

        # ── Fallback path: plain text → regex JSON extraction ─────────────────
        try:
            plain_llm = _get_llm(temperature=0.3)
            raw_response = await plain_llm.ainvoke(messages_for_llm)
            raw_text = raw_response.content if hasattr(raw_response, "content") else str(raw_response)
            logger.info(f"plan_edit_node fallback raw response: {raw_text[:300]}")
            result = _parse_plan_edit_json(raw_text)
        except Exception as fallback_err:
            logger.error(f"plan_edit_node fallback also failed: {fallback_err}")


    # ── Handle total failure ──────────────────────────────────────────────────
    if result is None:
        fallback_msg = AIMessage(
            content=(
                "I ran into a brief issue processing that edit. "
                "Try being specific — for example: "
                "'Replace my Focus block with a 10-minute breathing exercise.'"
            )
        )
        return {"messages": [fallback_msg]}

    # ── Partial merge: replace only matching category blocks ──────────────────
    if result.modified_blocks:
        modified_by_category = {b.category: b.model_dump() for b in result.modified_blocks}
        merged_blocks = []
        existing_categories = set()

        for block in current_blocks:
            cat = block.get("category") if isinstance(block, dict) else getattr(block, "category", None)
            existing_categories.add(cat)
            if cat and cat in modified_by_category:
                merged_blocks.append(modified_by_category[cat])
            else:
                merged_blocks.append(block)

        # Append any brand-new categories
        for mod_cat, mod_block in modified_by_category.items():
            if mod_cat not in existing_categories:
                merged_blocks.append(mod_block)

        updated_plan = {**clinical_plan, "blocks": merged_blocks}
        logger.info(f"plan_edit_node complete. Modified: {list(modified_by_category.keys())}")
    else:
        # LLM returned empty modified_blocks
        updated_plan = clinical_plan
        result.confirmation_message = (
            "I wasn't able to identify exactly which block to update. "
            "Could you name the block you'd like to change? "
            "For example: 'Replace my Focus block with a journaling session.'"
        )

    confirmation = AIMessage(content=result.confirmation_message)
    return {
        "clinical_plan": updated_plan,
        "messages": [confirmation],
    }


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
