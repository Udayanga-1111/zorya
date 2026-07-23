import pytest
import os
from unittest.mock import patch
from backend.orchestrator.graph import compile_graph
from backend.orchestrator.checkpointer import get_memory_saver, get_sqlite_saver

@patch("backend.orchestrator.graph.clinical_cbt_node")
def test_graph_memory_saver(mock_clinical_node):
    """Test graph execution with MemorySaver."""
    # Setup mock to just return a dummy plan without hitting LLM
    mock_clinical_node.return_value = {"clinical_plan": {"blocks": []}}
    
    memory_saver = get_memory_saver()
    graph = compile_graph(checkpointer=memory_saver)
    
    config = {"configurable": {"thread_id": "test_thread_1"}}
    initial_state = {
        "user_id": "u1",
        "user_profile": {"birth_date": "1990-01-01", "birth_time": "12:00", "latitude": 0, "longitude": 0},
        "cbt_scores": {"Focus": 10.0}
    }
    
    final_state = graph.invoke(initial_state, config)
    
    assert final_state["guardrail_flagged"] is False
    assert "clinical_plan" in final_state
    assert final_state["user_id"] == "u1"
    assert "sun_sign" in final_state["celestial_context"]

@patch("backend.orchestrator.graph.clinical_cbt_node")
def test_graph_sqlite_saver(mock_clinical_node, tmp_path):
    """Test graph execution and checkpoint retrieval with SqliteSaver."""
    mock_clinical_node.return_value = {"clinical_plan": {"blocks": []}}
    
    db_path = str(tmp_path / "test_checkpoints.sqlite")
    sqlite_saver = get_sqlite_saver(db_path=db_path)
    
    graph = compile_graph(checkpointer=sqlite_saver)
    
    config = {"configurable": {"thread_id": "test_thread_sqlite"}}
    initial_state = {
        "user_id": "u2",
        "user_profile": {"birth_date": "1990-01-01", "birth_time": "12:00", "latitude": 0, "longitude": 0}
    }
    
    # First run
    graph.invoke(initial_state, config)
    
    # Fetch checkpoint
    snapshot = graph.get_state(config)
    assert snapshot.values["user_id"] == "u2"
    assert "sun_sign" in snapshot.values["celestial_context"]
