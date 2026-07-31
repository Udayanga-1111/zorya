import json
import logging
from langchain_core.messages import SystemMessage, AIMessage
from langchain_groq import ChatGroq
from orchestrator.state import ZoryaAgentState

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

async def chat_node(state: ZoryaAgentState) -> dict:
    """
    LangGraph node for the Chat Companion.
    Reads user messages, injects current astronomical and CBT context, and streams the response.
    """
    llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.7)
    
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
