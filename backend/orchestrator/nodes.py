"""
Zorya - Orchestrator Nodes
==========================
Defines the stubs and wrappers for the LangGraph nodes.
"""
from typing import Dict, Any
from orchestrator.state import ZoryaAgentState

from mcp_servers.celestial_server import calculate_active_transits
from schemas.agent_schemas import TransitRequest

def parsing_node(state: ZoryaAgentState) -> Dict[str, Any]:
    """
    Parsing Agent Node (ZOR-12).
    Dynamically invokes the Celestial MCP tool using user coordinates and populates celestial_context.
    """
    user_profile = state.get("user_profile", {})
    
    # Extract expected keys, fail gracefully if missing
    birth_date = user_profile.get("birth_date")
    birth_time = user_profile.get("birth_time")
    lat = user_profile.get("lat")
    lon = user_profile.get("lon")
    
    if not all([birth_date, birth_time, lat is not None, lon is not None]):
        raise ValueError("Missing critical birth coordinates in user_profile for Parsing Agent.")
        
    req = TransitRequest(
        birth_date=birth_date,
        birth_time=birth_time,
        latitude=float(lat),
        longitude=float(lon)
    )
    
    response = calculate_active_transits(req)
    
    # Serialize the Pydantic model to dict for state storage
    return {
        "celestial_context": response.model_dump()
    }

def guardrail_node(state: ZoryaAgentState) -> Dict[str, Any]:
    """
    Stub for the Ethical Guardrail Node (ZOR-12).
    Inspects the clinical_plan and sets guardrail flags if needed.
    """
    return {
        "guardrail_flagged": False,
        "guardrail_reason": None
    }
