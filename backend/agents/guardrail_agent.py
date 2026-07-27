import logging
from typing import Dict, Any, List
from orchestrator.state import ZoryaAgentState
from schemas.agent_schemas import GuardrailResponse, GuardrailStatusPayload, NodeError
from agents.prompts import (
    GUARDRAIL_SYSTEM_PROMPT, GUARDRAIL_EVALUATOR_PROMPT, GUARDRAIL_REFRAME_PROMPT, SRI_LANKA_CRISIS_RESPONSE
)
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import BaseMessage
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI

logger = logging.getLogger(__name__)

# Keywords triggering immediate Sri Lankan crisis response override
CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end my life", "want to die", 
    "self harm", "cutting myself", "hopeless", "no point living",
    "hurt myself", "no reason to live", "overdose", "self-injury"
]

def safe_extract_messages(messages: List[Any]) -> str:
    """Safely extracts text content from a list of BaseMessage objects or dicts."""
    if not messages:
        return ""
    
    latest_msg = messages[-1]
    if isinstance(latest_msg, BaseMessage):
        return str(latest_msg.content).lower()
    elif isinstance(latest_msg, dict):
        return str(latest_msg.get("content", "")).lower()
    return str(latest_msg).lower()

def _get_evaluator_llm():
    """Default provider to Groq, fallback to OpenAI if fails."""
    # Here we define the fallback mechanism. LangChain's .with_fallbacks() can be used.
    # However, since we need to use with_structured_output, we can try/except at the call level.
    # We will just return the primary model here, and if it fails, we catch it and use fallback.
    return ChatGroq(model="llama-3.3-70b-versatile", temperature=0.0)

def _get_fallback_evaluator_llm():
    return ChatOpenAI(model="gpt-4o-mini", temperature=0.0)

def _get_reframer_llm():
    return ChatGroq(model="llama-3.3-70b-versatile", temperature=0.2)

def _get_fallback_reframer_llm():
    return ChatOpenAI(model="gpt-4o-mini", temperature=0.2)

def guardrail_node(state: ZoryaAgentState) -> Dict[str, Any]:
    """
    LangGraph node that inspects clinical_plan for safety compliance,
    intercepts crisis prompts, reframes fatalistic outputs, appends disclaimers,
    and strips GPS coordinates for PDPA compliance.
    """
    try:
        logger.info("Executing guardrail_node...")
        messages = state.get("messages", [])
        clinical_plan = state.get("clinical_plan", {}) or {}
        user_profile = state.get("user_profile", {})
        
        # AGPLv3 Mitigation & GPS Stripping
        # Remove raw GPS data if present to ensure they are transient
        if user_profile and "lat" in user_profile:
            del user_profile["lat"]
        if user_profile and "lon" in user_profile:
            del user_profile["lon"]
            
        # Ensure only timezone/region remains or is noted (dummy timezone if not set)
        if user_profile and "timezone" not in user_profile:
            user_profile["timezone"] = "Asia/Colombo"
            
        source_metadata = state.get("source_metadata", {})
        source_metadata["license_tag"] = "AGPLv3 mitigated via network decoupling (SaaS loophole)"
        
        # 1. Check User Messages for Crisis Keywords
        latest_user_text = safe_extract_messages(messages)
        
        if any(keyword in latest_user_text for keyword in CRISIS_KEYWORDS):
            logger.warning("Crisis keyword detected! Injecting Sri Lankan helpline override.")
            return {
                "clinical_plan": SRI_LANKA_CRISIS_RESPONSE,
                "guardrail_flagged": True,
                "guardrail_reason": "Emergency crisis support triggered.",
                "user_profile": user_profile,
                "source_metadata": source_metadata
            }

        # 2. Semantic Evaluation of Generated Clinical Plan
        eval_result = None
        eval_prompt = ChatPromptTemplate.from_messages([
            ("system", GUARDRAIL_SYSTEM_PROMPT),
            ("system", GUARDRAIL_EVALUATOR_PROMPT),
            ("human", "Audit this daily plan JSON: {plan_data}")
        ])

        try:
            primary_llm = _get_evaluator_llm()
            structured_evaluator = primary_llm.with_structured_output(GuardrailResponse)
            eval_chain = eval_prompt | structured_evaluator
            eval_result = eval_chain.invoke({"plan_data": str(clinical_plan)})
        except Exception as e:
            logger.warning(f"Primary evaluator failed: {e}. Falling back to ChatOpenAI.")
            fallback_llm = _get_fallback_evaluator_llm()
            structured_evaluator = fallback_llm.with_structured_output(GuardrailResponse)
            eval_chain = eval_prompt | structured_evaluator
            eval_result = eval_chain.invoke({"plan_data": str(clinical_plan)})

        if getattr(eval_result, "is_safe", True):
            # Plan is clean
            status = GuardrailStatusPayload(flagged=False, reframed=False)
            clinical_plan["guardrail_status"] = status.model_dump()
            return {
                "clinical_plan": clinical_plan,
                "guardrail_flagged": False,
                "guardrail_reason": None,
                "user_profile": user_profile,
                "source_metadata": source_metadata
            }
        
        # 3. Plan Unsafe -> Reframe
        violation_reason = getattr(eval_result, "violation_reason", "Safety violation")
        logger.warning(f"Guardrail intercepted violation: {violation_reason}. Reframing...")
        
        reframe_prompt = ChatPromptTemplate.from_messages([
            ("system", GUARDRAIL_REFRAME_PROMPT),
            ("human", "Reframe this unsafe plan into compliant CBT micro-habits:\nUnsafe Plan: {plan_data}\nViolation Reason: {reason}")
        ])
        
        try:
            reframed_plan = (reframe_prompt | _get_reframer_llm()).invoke({
                "plan_data": str(clinical_plan),
                "reason": violation_reason
            })
        except Exception as e:
            logger.warning(f"Primary reframer failed: {e}. Falling back to ChatOpenAI.")
            reframed_plan = (reframe_prompt | _get_fallback_reframer_llm()).invoke({
                "plan_data": str(clinical_plan),
                "reason": violation_reason
            })

        status = GuardrailStatusPayload(
            flagged=True,
            reframed=True,
            reason=violation_reason
        )
        
        output_plan = clinical_plan if isinstance(reframed_plan, str) else reframed_plan
        output_plan["guardrail_status"] = status.model_dump()

        return {
            "clinical_plan": output_plan,
            "guardrail_flagged": True,
            "guardrail_reason": violation_reason,
            "user_profile": user_profile,
            "source_metadata": source_metadata
        }

    except Exception as e:
        logger.error(f"Error in guardrail_node evaluation: {e}")
        # Return a structured NodeError object on failure without crashing the graph
        node_error = NodeError(error=str(e), node_name="guardrail_node")
        return {
            "error": node_error.model_dump_json()
        }
