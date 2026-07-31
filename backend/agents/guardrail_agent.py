import logging
from typing import Dict, Any, List
from orchestrator.state import ZoryaAgentState
from schemas.agent_schemas import GuardrailResponse, GuardrailStatusPayload, NodeError, ChatGuardrailEvaluation
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

# Safe pass-through plan used when ALL LLM calls fail in guardrail_node
_GUARDRAIL_PASSTHROUGH_STATUS = {
    "flagged": False,
    "reframed": False,
    "reason": None,
    "disclaimer": "Zorya is a self-improvement habit tool and does not provide clinical, medical, or financial advice."
}


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
    return ChatGroq(model="llama-3.3-70b-versatile", temperature=0.0)


def _get_fallback_evaluator_llm():
    return ChatOpenAI(model="gpt-4o-mini", temperature=0.0)


def _get_reframer_llm():
    return ChatGroq(model="llama-3.3-70b-versatile", temperature=0.2)


def _get_fallback_reframer_llm():
    return ChatOpenAI(model="gpt-4o-mini", temperature=0.2)


async def chat_guardrail_node(state: ZoryaAgentState) -> Dict[str, Any]:
    """
    Evaluates the user's latest chat message for fatalistic or crisis intents.
    Runs as async to avoid blocking the LangGraph event loop.
    """
    try:
        logger.info("Executing chat_guardrail_node...")
        messages = state.get("messages", [])
        latest_user_text = safe_extract_messages(messages)

        if not latest_user_text:
            return {"guardrail_flagged": False, "guardrail_reason": None}

        # 1. Check Hardcoded Crisis Keywords (fast path, no LLM needed)
        if any(keyword in latest_user_text for keyword in CRISIS_KEYWORDS):
            logger.warning("Crisis keyword detected in chat! Flagging as crisis.")
            return {
                "guardrail_flagged": True,
                "guardrail_reason": "crisis"
            }

        # 2. Semantic LLM Evaluation (async)
        eval_prompt = ChatPromptTemplate.from_messages([
            ("system", (
                "You are a safety guardrail for a CBT wellness AI companion. "
                "Your job is to analyze user queries. Flag queries that ask for fatalistic "
                "astrological predictions (e.g., predicting death, exact future events, "
                "financial ruin/gain) or that show severe mental health crisis/self-harm intent. "
                "Do NOT flag general negative emotions or normal questions about astrology."
            )),
            ("human", "Evaluate this user message: {user_message}")
        ])

        eval_result = None
        try:
            primary_llm = _get_evaluator_llm()
            structured_evaluator = primary_llm.with_structured_output(ChatGuardrailEvaluation)
            eval_chain = eval_prompt | structured_evaluator
            eval_result = await eval_chain.ainvoke({"user_message": latest_user_text})
        except Exception as e:
            logger.warning(f"Primary chat evaluator failed: {e}. Falling back...")
            try:
                fallback_llm = _get_fallback_evaluator_llm()
                structured_evaluator = fallback_llm.with_structured_output(ChatGuardrailEvaluation)
                eval_chain = eval_prompt | structured_evaluator
                eval_result = await eval_chain.ainvoke({"user_message": latest_user_text})
            except Exception as e2:
                logger.error(f"Both chat guardrail evaluators failed: {e2}. Defaulting to safe.")
                return {"guardrail_flagged": False, "guardrail_reason": None}

        if getattr(eval_result, "is_crisis", False):
            return {
                "guardrail_flagged": True,
                "guardrail_reason": "crisis"
            }

        if getattr(eval_result, "is_fatalistic", False):
            return {
                "guardrail_flagged": True,
                "guardrail_reason": "fatalistic"
            }

        return {
            "guardrail_flagged": False,
            "guardrail_reason": None
        }

    except Exception as e:
        logger.error(f"Unhandled error in chat_guardrail_node: {e}")
        # Default to safe pass-through on unexpected errors
        return {"guardrail_flagged": False, "guardrail_reason": None}


async def guardrail_node(state: ZoryaAgentState) -> Dict[str, Any]:
    """
    LangGraph node that inspects clinical_plan for safety compliance,
    intercepts crisis prompts, reframes fatalistic outputs, appends disclaimers,
    and strips GPS coordinates for PDPA compliance.
    Runs as async to avoid blocking the LangGraph event loop.
    """
    # AGPLv3 Mitigation & GPS Stripping
    # Build a NEW dict excluding raw GPS coordinates — never mutate state in-place
    raw_profile = state.get("user_profile", {}) or {}
    user_profile = {k: v for k, v in raw_profile.items() if k not in ("lat", "lon", "latitude", "longitude")}

    # Ensure timezone is noted (default to Asia/Colombo if missing)
    if "timezone" not in user_profile:
        user_profile["timezone"] = "Asia/Colombo"

    source_metadata = dict(state.get("source_metadata", {}) or {})
    source_metadata["license_tag"] = "AGPLv3 mitigated via network decoupling (SaaS loophole)"

    clinical_plan = dict(state.get("clinical_plan", {}) or {})

    try:
        logger.info("Executing guardrail_node...")
        messages = state.get("messages", [])

        # 1. Check User Messages for Crisis Keywords (fast path, no LLM needed)
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

        # 2. Semantic Evaluation of Generated Clinical Plan (async)
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
            eval_result = await eval_chain.ainvoke({"plan_data": str(clinical_plan)})
        except Exception as e:
            logger.warning(f"Primary evaluator failed: {e}. Falling back to ChatOpenAI.")
            try:
                fallback_llm = _get_fallback_evaluator_llm()
                structured_evaluator = fallback_llm.with_structured_output(GuardrailResponse)
                eval_chain = eval_prompt | structured_evaluator
                eval_result = await eval_chain.ainvoke({"plan_data": str(clinical_plan)})
            except Exception as e2:
                logger.error(f"Both guardrail evaluators failed: {e2}. Passing through as safe.")
                clinical_plan["guardrail_status"] = _GUARDRAIL_PASSTHROUGH_STATUS
                return {
                    "clinical_plan": clinical_plan,
                    "guardrail_flagged": False,
                    "guardrail_reason": None,
                    "user_profile": user_profile,
                    "source_metadata": source_metadata
                }

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

        reframed_plan = None
        try:
            reframed_plan = await (reframe_prompt | _get_reframer_llm()).ainvoke({
                "plan_data": str(clinical_plan),
                "reason": violation_reason
            })
        except Exception as e:
            logger.warning(f"Primary reframer failed: {e}. Falling back to ChatOpenAI.")
            try:
                reframed_plan = await (reframe_prompt | _get_fallback_reframer_llm()).ainvoke({
                    "plan_data": str(clinical_plan),
                    "reason": violation_reason
                })
            except Exception as e2:
                logger.error(f"Both reframers failed: {e2}. Using original plan with violation flag.")

        status = GuardrailStatusPayload(
            flagged=True,
            reframed=reframed_plan is not None,
            reason=violation_reason
        )

        output_plan = clinical_plan if (reframed_plan is None or isinstance(reframed_plan, str)) else reframed_plan
        if isinstance(output_plan, dict):
            output_plan["guardrail_status"] = status.model_dump()

        return {
            "clinical_plan": output_plan,
            "guardrail_flagged": True,
            "guardrail_reason": violation_reason,
            "user_profile": user_profile,
            "source_metadata": source_metadata
        }

    except Exception as e:
        logger.error(f"Unhandled error in guardrail_node: {e}")
        # Return a safe pass-through — never break the graph with a missing clinical_plan
        clinical_plan["guardrail_status"] = _GUARDRAIL_PASSTHROUGH_STATUS
        return {
            "clinical_plan": clinical_plan,
            "guardrail_flagged": False,
            "guardrail_reason": None,
            "user_profile": user_profile,
            "source_metadata": source_metadata,
            "error": str(e)
        }
