import json
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from backend.schemas.agent_schemas import ClinicalAgentOutput
from backend.agents.prompts import CLINICAL_CBT_SYSTEM_PROMPT
from backend.orchestrator.state import ZoryaAgentState

def clinical_cbt_node(state: ZoryaAgentState) -> dict:
    """
    LangGraph node for the Clinical CBT Agent.
    Translates astronomical telemetry and CBT category weights into a daily CBT micro-habit plan.
    """
    # Initialize the LLM
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2)
    
    # Wrap the LLM to enforce the ClinicalAgentOutput schema
    structured_llm = llm.with_structured_output(ClinicalAgentOutput)
    
    # Construct the input prompt using the state
    celestial_data = state.get("celestial_context", {})
    cbt_weights = state.get("cbt_scores", {})
    
    user_prompt = f"Planetary Data: {json.dumps(celestial_data)}\nCBT Weights: {json.dumps(cbt_weights)}"
    
    messages = [
        SystemMessage(content=CLINICAL_CBT_SYSTEM_PROMPT),
        HumanMessage(content=user_prompt)
    ]
    
    # Generate the structured output
    response = structured_llm.invoke(messages)
    
    # Return updated state (or just the plan as part of state updates)
    return {"clinical_plan": response.model_dump()}
