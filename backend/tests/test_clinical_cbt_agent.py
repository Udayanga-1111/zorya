import pytest
from dotenv import load_dotenv
from backend.agents.clinical_cbt_agent import clinical_cbt_node
from backend.schemas.agent_schemas import ClinicalAgentOutput
import os

# Load environment variables (e.g., OPENAI_API_KEY)
load_dotenv()

# We mark tests that call the LLM so they can be optionally skipped if no API key is present.
pytestmark = pytest.mark.skipif(
    not os.getenv("OPENAI_API_KEY"),
    reason="OPENAI_API_KEY is not set"
)

@pytest.fixture
def tamas_state():
    return {
        "celestial_data": {
            "dasha_lord": "Saturn",
            "triguna": "Tamas",
            "moon_sign": "Capricorn",
            "sun_sign": "Aquarius"
        },
        "cbt_weights": {
            "Rest": 0.8,
            "Grounding": 0.7,
            "Reflection": 0.5
        }
    }

@pytest.fixture
def rajas_state():
    return {
        "celestial_data": {
            "dasha_lord": "Mars",
            "triguna": "Rajas",
            "moon_sign": "Aries",
            "sun_sign": "Leo"
        },
        "cbt_weights": {
            "Focus": 0.9,
            "Grounding": 0.6,
            "Communication": 0.4
        }
    }

@pytest.fixture
def sattva_state():
    return {
        "celestial_data": {
            "dasha_lord": "Jupiter",
            "triguna": "Sattva",
            "moon_sign": "Sagittarius",
            "sun_sign": "Pisces"
        },
        "cbt_weights": {
            "Reflection": 0.9,
            "Focus": 0.8,
            "Communication": 0.7
        }
    }

def verify_no_fatalistic_language(output_str: str):
    fatalistic_words = ["predict", "fate", "destined", "cure", "destiny", "prophecy"]
    output_lower = output_str.lower()
    for word in fatalistic_words:
        assert word not in output_lower, f"Found fatalistic word: '{word}' in output: {output_str}"

def test_tamas_node(tamas_state):
    result = clinical_cbt_node(tamas_state)
    assert "clinical_plan" in result
    plan = result["clinical_plan"]
    
    # 1. Verify Schema Integrity
    ClinicalAgentOutput.model_validate(plan)
    
    # 2. Deterministic Output Prevention
    dumped_plan = str(plan)
    verify_no_fatalistic_language(dumped_plan)
    
    # 3. Tone Verification for Tamas
    tone = plan["tone_mode"].lower()
    assert "tamas" in tone, f"Expected Tamas tone, got: {tone}"

def test_rajas_node(rajas_state):
    result = clinical_cbt_node(rajas_state)
    assert "clinical_plan" in result
    plan = result["clinical_plan"]
    
    # 1. Verify Schema Integrity
    ClinicalAgentOutput.model_validate(plan)
    
    # 2. Deterministic Output Prevention
    dumped_plan = str(plan)
    verify_no_fatalistic_language(dumped_plan)
    
    # 3. Tone Verification for Rajas
    tone = plan["tone_mode"].lower()
    assert "rajas" in tone, f"Expected Rajas tone, got: {tone}"

def test_sattva_node(sattva_state):
    result = clinical_cbt_node(sattva_state)
    assert "clinical_plan" in result
    plan = result["clinical_plan"]
    
    # 1. Verify Schema Integrity
    ClinicalAgentOutput.model_validate(plan)
    
    # 2. Deterministic Output Prevention
    dumped_plan = str(plan)
    verify_no_fatalistic_language(dumped_plan)
    
    # 3. Tone Verification for Sattva
    tone = plan["tone_mode"].lower()
    assert "sattva" in tone, f"Expected Sattva tone, got: {tone}"
