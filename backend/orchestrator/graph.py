"""
Zorya - State Graph Compilation
===============================
Wires the node topology and compiles the LangGraph StateGraph.
"""
from langgraph.graph import StateGraph, START, END
from backend.orchestrator.state import ZoryaAgentState
from backend.orchestrator.nodes import parsing_node, guardrail_node
from backend.agents.clinical_cbt_agent import clinical_cbt_node

def create_graph():
    builder = StateGraph(ZoryaAgentState)
    
    # Add Nodes
    builder.add_node("parsing_node", parsing_node)
    builder.add_node("clinical_cbt_node", clinical_cbt_node)
    builder.add_node("guardrail_node", guardrail_node)
    
    # Wire Edges
    builder.add_edge(START, "parsing_node")
    builder.add_edge("parsing_node", "clinical_cbt_node")
    builder.add_edge("clinical_cbt_node", "guardrail_node")
    builder.add_edge("guardrail_node", END)
    
    return builder

def compile_graph(checkpointer=None):
    """
    Compiles the state graph with an optional checkpointer.
    """
    builder = create_graph()
    return builder.compile(checkpointer=checkpointer)
