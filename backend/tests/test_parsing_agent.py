import pytest
from unittest.mock import patch

from backend.agents.parsing_agent import parsing_node, DEFAULT_FALLBACK_CELESTIAL, calculate_cbt_scores_from_context
from backend.schemas.celestial_schemas import CelestialContextModel, ElementEnum, GunaEnum
from backend.orchestrator.state import ZoryaAgentState

def test_parsing_node_valid_input():
    state: ZoryaAgentState = {
        "user_profile": {
            "birth_date": "1990-05-15",
            "birth_time": "14:30",
            "latitude": 7.2906,
            "longitude": 80.6337
        },
        "celestial_context": None,
        "cbt_scores": {},
        "clinical_plan": None,
        "chat_history": []
    }

    result = parsing_node(state)
    
    assert result["error"] is None
    celestial_context = result["celestial_context"]
    assert celestial_context["ayanamsa"] == "Lahiri"
    assert "moon_sign" in celestial_context
    assert "sun_sign" in celestial_context
    assert "dasha_lord" in celestial_context
    assert "julian_day" in celestial_context["raw_transit_data"]

@patch("backend.agents.parsing_agent.calculate_sidereal_positions")
def test_parsing_node_tool_failure(mock_calculate_sidereal_positions):
    # Simulate a tool failure (e.g. C-extension crashes, invalid parsing)
    mock_calculate_sidereal_positions.side_effect = Exception("Simulated tool crash")
    
    state: ZoryaAgentState = {
        "user_profile": {
            "birth_date": "1990-05-15",
            "birth_time": "14:30",
            "latitude": 7.2906,
            "longitude": 80.6337
        },
        "celestial_context": None,
        "cbt_scores": {},
        "clinical_plan": None,
        "chat_history": []
    }

    result = parsing_node(state)
    
    # Verify fallback is triggered gracefully
    assert result["error"] == "Celestial parsing warning: Simulated tool crash"
    celestial_context = result["celestial_context"]
    assert celestial_context == DEFAULT_FALLBACK_CELESTIAL.model_dump()
    
    # Validate CBT scores from fallback
    expected_scores = calculate_cbt_scores_from_context(DEFAULT_FALLBACK_CELESTIAL)
    assert result["cbt_scores"] == expected_scores

def test_parsing_node_malformed_input():
    # Pass malformed coords that Pydantic will reject
    state: ZoryaAgentState = {
        "user_profile": {
            "birth_date": "1990-05-15",
            "birth_time": "14:30",
            "latitude": 900.0, # Invalid lat
            "longitude": 80.6337
        },
        "celestial_context": None,
        "cbt_scores": {},
        "clinical_plan": None,
        "chat_history": []
    }

    result = parsing_node(state)
    
    assert "validation error" in result["error"].lower() or "validation error" in result["error"].lower() or result["error"] is not None
    celestial_context = result["celestial_context"]
    assert celestial_context == DEFAULT_FALLBACK_CELESTIAL.model_dump()

def test_cbt_score_calculation():
    context = CelestialContextModel(
        moon_sign="Aries",
        moon_element=ElementEnum.FIRE, # Grounding +6, Focus +6
        sun_sign="Cancer",
        sun_element=ElementEnum.WATER, # Reflection +3, Rest +3
        dasha_lord="Jupiter",
        dasha_guna=GunaEnum.SATTVA, # Reflection +2, Focus +2
        ayanamsa="Lahiri",
        raw_transit_data={}
    )
    scores = calculate_cbt_scores_from_context(context)
    assert scores["Grounding"] == 6.0
    assert scores["Focus"] == 8.0 # 6 + 2
    assert scores["Reflection"] == 5.0 # 3 + 2
    assert scores["Rest"] == 3.0
    assert scores["Communication"] == 0.0
