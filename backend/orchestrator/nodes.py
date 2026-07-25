"""
Zorya - Orchestrator Nodes
==========================
Defines the stubs and wrappers for the LangGraph nodes.
"""
from typing import Dict, Any
from backend.orchestrator.state import ZoryaAgentState

def parsing_node(state: ZoryaAgentState) -> Dict[str, Any]:
    """
    Stub for the Parsing Agent Node (ZOR-8).
    Dynamically invokes the Celestial MCP tool and populates celestial_context and cbt_scores.
    """
    return {}

def guardrail_node(state: ZoryaAgentState) -> Dict[str, Any]:
    """
    Stub for the Ethical Guardrail Node (ZOR-12).
    Inspects the clinical_plan and sets guardrail flags if needed.
    """
    return {
        "guardrail_flagged": False,
        "guardrail_reason": None
    }
