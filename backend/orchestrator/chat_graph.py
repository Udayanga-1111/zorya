"""
Zorya - Chat Graph Compilation
==============================
Wires the topology for the conversational Chat Companion.

Graph topology:

  START
    │
    ▼
  chat_guardrail_node  ──(blocked)──► END
    │
   (safe)
    │
    ▼
  intent_node  ──(update_plan)──► plan_edit_node ──► END
    │
   (general_chat)
    │
    ▼
  chat_node ──────────────────────────────────────► END
"""
from langgraph.graph import StateGraph, START, END
from orchestrator.state import ZoryaAgentState
from agents.chat_agent import chat_node, intent_detection_node, plan_edit_node
from agents.guardrail_agent import chat_guardrail_node


def _route_after_guardrail(state: ZoryaAgentState) -> str:
    """Routes to END if guardrail blocked the message, otherwise to intent classification."""
    if state.get("guardrail_flagged", False):
        return END
    return "intent_node"


def _route_after_intent(state: ZoryaAgentState) -> str:
    """Routes to plan_edit_node if user wants to change the plan, otherwise to chat Q&A."""
    intent = state.get("detected_intent", "general_chat")
    if intent == "update_plan":
        return "plan_edit_node"
    return "chat_node"


def create_chat_graph():
    builder = StateGraph(ZoryaAgentState)

    # ── Nodes ────────────────────────────────────────────────────────────────
    builder.add_node("chat_guardrail_node", chat_guardrail_node)
    builder.add_node("intent_node", intent_detection_node)
    builder.add_node("plan_edit_node", plan_edit_node)
    builder.add_node("chat_node", chat_node)

    # ── Edges ────────────────────────────────────────────────────────────────
    builder.add_edge(START, "chat_guardrail_node")
    builder.add_conditional_edges("chat_guardrail_node", _route_after_guardrail)
    builder.add_conditional_edges("intent_node", _route_after_intent)
    builder.add_edge("plan_edit_node", END)
    builder.add_edge("chat_node", END)

    return builder


def compile_chat_graph(checkpointer=None):
    """
    Compiles the chat state graph with an optional checkpointer.
    """
    builder = create_chat_graph()
    return builder.compile(checkpointer=checkpointer)
