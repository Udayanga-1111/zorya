"""
Zorya - Chat Graph Compilation
==============================
Wires the topology for the conversational Chat Companion.
"""
from langgraph.graph import StateGraph, START, END
from orchestrator.state import ZoryaAgentState
from agents.chat_agent import chat_node
from agents.guardrail_agent import chat_guardrail_node

def route_guardrail(state: ZoryaAgentState):
    if state.get("guardrail_flagged", False):
        return END
    return "chat_node"

def create_chat_graph():
    builder = StateGraph(ZoryaAgentState)
    
    # Add Nodes
    builder.add_node("chat_guardrail_node", chat_guardrail_node)
    builder.add_node("chat_node", chat_node)
    
    # Wire Edges
    builder.add_edge(START, "chat_guardrail_node")
    builder.add_conditional_edges("chat_guardrail_node", route_guardrail)
    builder.add_edge("chat_node", END)
    
    return builder

def compile_chat_graph(checkpointer=None):
    """
    Compiles the chat state graph with an optional checkpointer.
    """
    builder = create_chat_graph()
    return builder.compile(checkpointer=checkpointer)
