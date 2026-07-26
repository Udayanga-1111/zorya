"""
Integration tests for the LangGraph multi-agent orchestration graph.

The Parsing Agent node now calls the Celestial MCP tool through the FastMCP
in-process Client. These tests mock that client call at the `asyncio.run`
boundary to avoid real pyswisseph calculations during graph topology tests.
"""
import pytest
import json
from unittest.mock import patch, AsyncMock, MagicMock
from orchestrator.graph import compile_graph
from orchestrator.checkpointer import get_memory_saver, get_sqlite_saver


# ---------------------------------------------------------------------------
# Shared Fixtures
# ---------------------------------------------------------------------------

MOCK_CELESTIAL_DATA = {
    "natal_julian_day": 2447892.0,
    "transit_julian_day": 2461247.5,
    "natal_chart": {
        "sun":     {"name": "sun",     "longitude": 280.5, "sign": "Capricorn", "sign_degree": 10.5},
        "moon":    {"name": "moon",    "longitude": 120.3, "sign": "Leo",       "sign_degree": 0.3},
        "mercury": {"name": "mercury", "longitude": 270.1, "sign": "Capricorn", "sign_degree": 0.1},
        "venus":   {"name": "venus",   "longitude": 300.2, "sign": "Aquarius",  "sign_degree": 0.2},
        "mars":    {"name": "mars",    "longitude": 15.6,  "sign": "Aries",     "sign_degree": 15.6},
        "jupiter": {"name": "jupiter", "longitude": 65.4,  "sign": "Gemini",    "sign_degree": 5.4},
        "saturn":  {"name": "saturn",  "longitude": 280.9, "sign": "Capricorn", "sign_degree": 10.9},
    },
    "transit_chart": {
        "sun":     {"name": "sun",     "longitude": 124.1, "sign": "Leo",       "sign_degree": 4.1},
        "moon":    {"name": "moon",    "longitude": 55.7,  "sign": "Taurus",    "sign_degree": 25.7},
        "mercury": {"name": "mercury", "longitude": 118.3, "sign": "Cancer",    "sign_degree": 28.3},
        "venus":   {"name": "venus",   "longitude": 90.5,  "sign": "Cancer",    "sign_degree": 0.5},
        "mars":    {"name": "mars",    "longitude": 200.2, "sign": "Libra",     "sign_degree": 20.2},
        "jupiter": {"name": "jupiter", "longitude": 73.8,  "sign": "Gemini",    "sign_degree": 13.8},
        "saturn":  {"name": "saturn",  "longitude": 345.6, "sign": "Pisces",    "sign_degree": 15.6},
    },
    "active_dasha": "Venus Mahadasha (approximate)",
    "transit_summary": "Natal Sun in Capricorn, Transit Moon in Taurus. Active period: Venus Mahadasha (approximate).",
}


def _make_mock_mcp_result():
    """Build a mock return value matching what fastmcp Client.call_tool returns."""
    mock_content = MagicMock()
    mock_content.text = json.dumps(MOCK_CELESTIAL_DATA)
    return [mock_content]


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

@patch("orchestrator.graph.clinical_cbt_node")
@patch("orchestrator.nodes._call_celestial_tool", new_callable=AsyncMock)
def test_graph_memory_saver(mock_celestial_call, mock_clinical_node):
    """Test graph execution with MemorySaver, mocking the MCP client call."""
    mock_celestial_call.return_value = MOCK_CELESTIAL_DATA
    mock_clinical_node.return_value = {"clinical_plan": {"blocks": []}}

    memory_saver = get_memory_saver()
    graph = compile_graph(checkpointer=memory_saver)

    config = {"configurable": {"thread_id": "test_thread_1"}}
    initial_state = {
        "user_id": "u1",
        "user_profile": {
            "birth_date": "1990-01-01",
            "birth_time": "12:00",
            "lat": 40.7128,
            "lon": -74.0060,
        },
        "cbt_scores": {"Focus": 10.0},
    }

    final_state = graph.invoke(initial_state, config)

    assert final_state["guardrail_flagged"] is False
    assert "clinical_plan" in final_state
    assert final_state["user_id"] == "u1"
    assert "natal_chart" in final_state["celestial_context"]
    assert "transit_chart" in final_state["celestial_context"]

    # Confirm the MCP client (not a direct function) was called
    mock_celestial_call.assert_called_once()


@patch("orchestrator.graph.clinical_cbt_node")
@patch("orchestrator.nodes._call_celestial_tool", new_callable=AsyncMock)
def test_graph_sqlite_saver(mock_celestial_call, mock_clinical_node, tmp_path):
    """Test graph execution and checkpoint retrieval with SqliteSaver."""
    mock_celestial_call.return_value = MOCK_CELESTIAL_DATA
    mock_clinical_node.return_value = {"clinical_plan": {"blocks": []}}

    db_path = str(tmp_path / "test_checkpoints.sqlite")
    sqlite_saver = get_sqlite_saver(db_path=db_path)

    graph = compile_graph(checkpointer=sqlite_saver)

    config = {"configurable": {"thread_id": "test_thread_sqlite"}}
    initial_state = {
        "user_id": "u2",
        "user_profile": {
            "birth_date": "1985-06-15",
            "birth_time": "08:30",
            "lat": 34.0522,
            "lon": -118.2437,
        },
    }

    # First run
    graph.invoke(initial_state, config)

    # Fetch and verify checkpoint
    snapshot = graph.get_state(config)
    assert snapshot.values["user_id"] == "u2"
    assert "natal_chart" in snapshot.values["celestial_context"]


@patch("orchestrator.graph.clinical_cbt_node")
@patch("orchestrator.nodes._call_celestial_tool", new_callable=AsyncMock)
def test_graph_raises_on_missing_profile(mock_celestial_call, mock_clinical_node):
    """Test that parsing_node raises ValueError when user_profile is incomplete."""
    mock_clinical_node.return_value = {"clinical_plan": {"blocks": []}}

    memory_saver = get_memory_saver()
    graph = compile_graph(checkpointer=memory_saver)

    config = {"configurable": {"thread_id": "test_thread_invalid"}}
    initial_state = {
        "user_id": "u3",
        "user_profile": {
            # Missing birth_time, lat, lon
            "birth_date": "1990-01-01",
        },
    }

    with pytest.raises(Exception):
        graph.invoke(initial_state, config)

    # MCP client should never have been reached
    mock_celestial_call.assert_not_called()
