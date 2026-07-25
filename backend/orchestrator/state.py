"""
Zorya — LangGraph Agent State
==============================
Defines the shared state TypedDict that flows through every node in the
Zorya multi-agent LangGraph pipeline.
"""
from typing import TypedDict, Annotated, List, Dict, Any, Optional
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class ZoryaAgentState(TypedDict, total=False):
    # Short-term chat & conversation history (uses LangGraph add_messages reducer)
    messages: Annotated[List[BaseMessage], add_messages]
    
    # User Profile & Onboarding Data
    user_id: str
    thread_id: str
    user_profile: Dict[str, Any]  # e.g., {"birth_date": "...", "birth_time": "...", "lat": 7.2906, "lon": 80.6337}

    # Astronomical Context (Populated by Parsing Agent via Celestial MCP)
    celestial_context: Dict[str, Any]  # Moon Sign, Sun Sign, Dasha Lord, Active Transits

    # CBT Category Scoring Weights (Populated by FastMCP Clinical Server)
    cbt_scores: Dict[str, float]

    # Structured Output from Clinical CBT Agent
    clinical_plan: Optional[Dict[str, Any]]

    # Guardrail Interception Status & Safety Flags
    guardrail_flagged: bool
    guardrail_reason: Optional[str]

    # Error handling state
    error: Optional[str]
