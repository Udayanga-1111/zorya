import pytest
import json
from unittest.mock import patch, MagicMock
from schemas.agent_schemas import GuardrailResponse, GuardrailStatusPayload, NodeError, SessionState
from agents.prompts import SRI_LANKA_CRISIS_RESPONSE
from agents.guardrail_agent import guardrail_node
from orchestrator.state import ZoryaAgentState
from langchain_core.messages import HumanMessage

@pytest.fixture
def clean_plan():
    return {
        "blocks": [
            {
                "category": "Focus",
                "title": "Deep Work",
                "description": "Focus on tasks.",
                "duration_minutes": 15
            }
        ]
    }

@patch("agents.guardrail_agent._get_evaluator_llm")
def test_guardrail_clean_plan(mock_get_evaluator, clean_plan):
    mock_evaluator_llm = MagicMock()
    mock_get_evaluator.return_value = mock_evaluator_llm
    
    mock_structured_evaluator = MagicMock()
    mock_evaluator_llm.with_structured_output.return_value = mock_structured_evaluator
    
    mock_structured_evaluator.return_value = GuardrailResponse(
        is_safe=True,
        violates_fatalism=False,
        violates_diagnostic=False,
        violates_medical_advice=False,
        violates_financial=False,
        violation_reason=None
    )
    
    state = ZoryaAgentState(clinical_plan=clean_plan, messages=[])
    result = guardrail_node(state)
    
    assert result["guardrail_flagged"] is False
    assert result["guardrail_reason"] is None
    
    status = result["clinical_plan"].get("guardrail_status")
    assert status is not None
    assert status["flagged"] is False
    assert status["reframed"] is False
    assert "source_metadata" in result
    assert "AGPLv3 mitigated" in result["source_metadata"]["license_tag"]

@patch("agents.guardrail_agent._get_reframer_llm")
@patch("agents.guardrail_agent._get_evaluator_llm")
def test_guardrail_fatalistic_interception(mock_get_evaluator, mock_get_reframer):
    mock_evaluator_llm = MagicMock()
    mock_reframer_llm = MagicMock()
    
    mock_get_evaluator.return_value = mock_evaluator_llm
    mock_get_reframer.return_value = mock_reframer_llm
    
    mock_structured_evaluator = MagicMock()
    mock_evaluator_llm.with_structured_output.return_value = mock_structured_evaluator
    
    mock_structured_evaluator.return_value = GuardrailResponse(
        is_safe=False,
        violates_fatalism=True,
        violates_diagnostic=False,
        violates_medical_advice=False,
        violates_financial=False,
        violation_reason="Predicted financial loss."
    )
    
    mock_reframer_llm.return_value = "Reframed plan string"
    
    fatalistic_plan = {
        "blocks": [
            {"description": "You will suffer financial loss today"}
        ]
    }
    
    state = ZoryaAgentState(clinical_plan=fatalistic_plan, messages=[])
    result = guardrail_node(state)
    
    assert result["guardrail_flagged"] is True
    assert result["guardrail_reason"] == "Predicted financial loss."
    
    status = result["clinical_plan"].get("guardrail_status")
    assert status is not None
    assert status["flagged"] is True
    assert status["reframed"] is True

def test_guardrail_crisis_override():
    state = ZoryaAgentState(
        clinical_plan={},
        messages=[HumanMessage(content="I want to end my life")]
    )
    result = guardrail_node(state)
    
    assert result["guardrail_flagged"] is True
    assert result["guardrail_reason"] == "Emergency crisis support triggered."
    assert result["clinical_plan"] == SRI_LANKA_CRISIS_RESPONSE

@patch("agents.guardrail_agent._get_evaluator_llm")
def test_guardrail_gps_stripping(mock_get_evaluator):
    mock_evaluator_llm = MagicMock()
    mock_get_evaluator.return_value = mock_evaluator_llm
    mock_structured_evaluator = MagicMock()
    mock_evaluator_llm.with_structured_output.return_value = mock_structured_evaluator
    mock_structured_evaluator.return_value = GuardrailResponse(
        is_safe=True,
        violates_fatalism=False,
        violates_diagnostic=False,
        violates_medical_advice=False,
        violates_financial=False,
        violation_reason=None
    )

    state = ZoryaAgentState(
        clinical_plan={},
        user_profile={
            "lat": 7.2906,
            "lon": 80.6337,
            "birth_time": "12:00"
        }
    )
    result = guardrail_node(state)
    
    user_profile = result.get("user_profile", {})
    assert "lat" not in user_profile
    assert "lon" not in user_profile
    assert "birth_time" in user_profile
    assert user_profile.get("timezone") == "Asia/Colombo"

@patch("agents.guardrail_agent.safe_extract_messages")
def test_guardrail_exception_handling(mock_safe_extract):
    mock_safe_extract.side_effect = Exception("Simulated runtime error")
    
    state = ZoryaAgentState(clinical_plan={})
    result = guardrail_node(state)
    
    assert "error" in result
    error_data = json.loads(result["error"])
    assert error_data["error"] == "Simulated runtime error"
    assert error_data["node_name"] == "guardrail_node"

def test_session_state_validation():
    # Valid data
    valid_data = {"consent_given": True, "consent_timestamp": "2026-07-27T14:00:00Z"}
    state = SessionState.model_validate(valid_data)
    assert state.consent_given is True
    
    # Missing required field
    with pytest.raises(ValueError):
        SessionState.model_validate({"consent_timestamp": "2026-07-27T14:00:00Z"})
