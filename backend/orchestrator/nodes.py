"""
Zorya - Orchestrator Nodes
==========================
Defines the stubs and wrappers for the LangGraph nodes.
"""
import asyncio
from typing import Dict, Any

from fastmcp import Client
from orchestrator.state import ZoryaAgentState
from mcp_servers.celestial_server import mcp as celestial_mcp
from schemas.agent_schemas import TransitRequest
from agents.guardrail_agent import guardrail_node


async def _call_celestial_tool(req_dict: dict) -> dict:
    """
    Calls the Celestial MCP tool through the FastMCP in-process client.

    Uses the FastMCP app object directly as the transport — this routes the
    call through the full MCP protocol layer (tool call is serialized and
    deserialized as MCP messages) without the overhead of spawning a subprocess.

    Note: FastMCP 3.x wraps Pydantic-model parameters under the parameter name.
    Since the tool signature is `calculate_active_transits(req: TransitRequest)`,
    the MCP call arguments must be {"req": {<TransitRequest fields>}}.
    """
    async with Client(celestial_mcp) as client:
        result = await client.call_tool(
            "calculate_active_transits",
            {"req": req_dict},   # FastMCP 3.x: nest under parameter name "req"
        )
        # FastMCP 3.x CallToolResult: use .structured_content for the typed dict
        # (avoids a redundant JSON parse round-trip through .content[0].text)
        return result.structured_content


def parsing_node(state: ZoryaAgentState) -> Dict[str, Any]:
    """
    Parsing Agent Node (ZOR-12).

    Dynamically invokes the Celestial MCP tool via the FastMCP in-process
    client using validated user coordinates, and populates celestial_context
    with the resulting TransitResponse dict.

    The MCP protocol boundary is maintained: the tool call is routed through
    FastMCP's Client/transport layer — not a direct Python function import.
    """
    user_profile = state.get("user_profile", {})

    # Extract expected keys, fail gracefully if missing
    birth_date = user_profile.get("birth_date")
    birth_time = user_profile.get("birth_time")
    lat = user_profile.get("lat")
    lon = user_profile.get("lon")

    if not all([birth_date, birth_time, lat is not None, lon is not None]):
        raise ValueError("Missing critical birth coordinates in user_profile for Parsing Agent.")

    # Validate inputs with Pydantic before handing off to the MCP tool
    req = TransitRequest(
        birth_date=birth_date,
        birth_time=birth_time,
        latitude=float(lat),
        longitude=float(lon),
    )

    # Invoke the tool through the MCP client — this is the correct protocol path
    celestial_data = asyncio.run(_call_celestial_tool(req.model_dump()))

    return {
        "celestial_context": celestial_data
    }



