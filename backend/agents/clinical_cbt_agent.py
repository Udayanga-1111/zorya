import json
import asyncio
from fastmcp import Client
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from schemas.agent_schemas import ClinicalAgentOutput
from agents.prompts import CLINICAL_CBT_SYSTEM_PROMPT
from orchestrator.state import ZoryaAgentState
from mcp_servers.clinical_server import mcp as clinical_mcp

async def _call_clinical_tool(req_dict: dict) -> dict:
    """
    Calls the Clinical MCP tool through the FastMCP in-process client.
    """
    async with Client(clinical_mcp) as client:
        result = await client.call_tool(
            "get_cbt_day_plan",
            {"req": req_dict},
        )
        return result.structured_content


async def clinical_cbt_node(state: ZoryaAgentState) -> dict:
    """
    LangGraph node for the Clinical CBT Agent.
    Translates astronomical telemetry and CBT category weights into a daily CBT micro-habit plan.
    """
    # Initialize the LLM using Groq
    llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.2)
    
    # Wrap the LLM to enforce the ClinicalAgentOutput schema
    structured_llm = llm.with_structured_output(ClinicalAgentOutput)
    
    # Construct the input prompt using the state
    celestial_data = state.get("celestial_context", {})
    
    # Safely extract variables for the Clinical Server
    natal_chart = celestial_data.get("natal_chart", {})
    transit_chart = celestial_data.get("transit_chart", {})
    
    sun_sign = natal_chart.get("sun", {}).get("sign", "Aries")
    moon_sign = transit_chart.get("moon", {}).get("sign", "Aries")
    active_dasha = celestial_data.get("active_dasha", "Jupiter Mahadasha")
    
    user_profile = state.get("user_profile", {})
    user_goal = user_profile.get("goal", "Focus and personal growth.")

    # 1. Query the clinical server via FastMCP
    req_dict = {
        "sun_sign": sun_sign,
        "moon_sign": moon_sign,
        "active_dasha": active_dasha,
        "user_goal": user_goal
    }
    
    scored_cbt_plan = await _call_clinical_tool(req_dict)
    
    user_prompt = (
        f"Planetary Data: {json.dumps(celestial_data)}\n"
        f"Scored CBT Plan: {json.dumps(scored_cbt_plan)}\n"
        f"User Goal: {user_goal}"
    )
    
    messages = [
        SystemMessage(content=CLINICAL_CBT_SYSTEM_PROMPT),
        HumanMessage(content=user_prompt)
    ]
    
    # Generate the structured output via the async invoke method
    response = await structured_llm.ainvoke(messages)
    
    # Return updated state (or just the plan as part of state updates)
    return {"clinical_plan": response.model_dump()}

