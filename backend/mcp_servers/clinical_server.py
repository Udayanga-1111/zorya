"""
Zorya — Clinical CBT MCP Server
========================================
Translates raw astronomical telemetry from the Celestial MCP Server into
evidence-based CBT time blocks and micro-habit recommendations.

Five CBT Categories mapped from planetary state combinations:
  1. Focus        — Deep cognitive work, learning, analytical tasks
  2. Rest         — Recovery, mindfulness, sleep hygiene
  3. Communication — Social connection, journaling, expression
  4. Grounding    — Physical exercise, nature, embodied routines
  5. Reflection   — Emotional processing, CBT journaling, gratitude practice

Ethical guardrail: All outputs are framed as evidence-based behavioral
suggestions only. No medical diagnoses or deterministic life predictions
are generated. Users are always reminded to consult licensed clinicians
for clinical-grade mental health support.
"""

from enum import Enum
from typing import Dict
from fastmcp import FastMCP
from pydantic import BaseModel, Field

# ── Server Initialization ──────────────────────────────────────────────────────
mcp = FastMCP("Zorya-Clinical-Server")

# ── Pydantic Schemas ───────────────────────────────────────────────────────────

class ClinicalRequest(BaseModel):
    """Minimal astronomical input required to derive a CBT block recommendation."""

    sun_sign: str = Field(..., description="Current Sun zodiac sign (e.g., 'Leo')")
    moon_sign: str = Field(..., description="Current Moon zodiac sign (e.g., 'Scorpio')")
    active_dasha: str = Field(..., description="Active Dasha period label")
    user_goal: str = Field(
        ...,
        description="User's stated self-improvement goal for the day (free text).",
        max_length=500,
    )

class CBTBlock(BaseModel):
    """A single recommended CBT habit block for a time window."""

    category: str = Field(..., description="One of: Focus, Rest, Communication, Grounding, Reflection")
    title: str
    description: str
    duration_minutes: int
    disclaimer: str = (
        "This suggestion is for self-improvement purposes only and does not "
        "constitute medical or clinical advice. Please consult a licensed "
        "mental health professional for clinical support."
    )

class ClinicalResponse(BaseModel):
    """Validated output: a prioritized list of CBT blocks for the day."""

    morning_block: CBTBlock
    afternoon_block: CBTBlock
    evening_block: CBTBlock
    ethical_note: str = (
        "Zorya provides behavioral suggestions grounded in evidence-based CBT "
        "frameworks. It does not predict outcomes, diagnose conditions, or "
        "replace professional therapy."
    )


# ── Vector Mapping & Scoring Engine ────────────────────────────────────────────

class CBTCategory(str, Enum):
    GROUNDING = "Grounding"
    FOCUS = "Focus"
    REST = "Rest"
    COMMUNICATION = "Communication"
    REFLECTION = "Reflection"


SIGN_ELEMENTS = {
    "Aries": "Fire", "Leo": "Fire", "Sagittarius": "Fire",
    "Taurus": "Earth", "Virgo": "Earth", "Capricorn": "Earth",
    "Gemini": "Air", "Libra": "Air", "Aquarius": "Air",
    "Cancer": "Water", "Scorpio": "Water", "Pisces": "Water"
}

ELEMENT_BASE = {
    "Fire":  {CBTCategory.GROUNDING: 3, CBTCategory.FOCUS: 3, CBTCategory.REST: 1, CBTCategory.COMMUNICATION: 1, CBTCategory.REFLECTION: 1},
    "Earth": {CBTCategory.FOCUS: 3, CBTCategory.REST: 3, CBTCategory.GROUNDING: 2, CBTCategory.COMMUNICATION: 1, CBTCategory.REFLECTION: 1},
    "Air":   {CBTCategory.COMMUNICATION: 3, CBTCategory.REFLECTION: 3, CBTCategory.FOCUS: 2, CBTCategory.GROUNDING: 1, CBTCategory.REST: 1},
    "Water": {CBTCategory.REFLECTION: 3, CBTCategory.REST: 3, CBTCategory.GROUNDING: 2, CBTCategory.COMMUNICATION: 1, CBTCategory.FOCUS: 1},
}

DASHA_TRIGUNAS = {
    "Sun": "Sattva", "Moon": "Sattva", "Jupiter": "Sattva",
    "Mercury": "Rajas", "Venus": "Rajas",
    "Mars": "Tamas", "Saturn": "Tamas", "Rahu": "Tamas", "Ketu": "Tamas"
}

GUNA_MODIFIERS = {
    "Sattva": [CBTCategory.REFLECTION, CBTCategory.FOCUS],
    "Rajas":  [CBTCategory.COMMUNICATION, CBTCategory.FOCUS],
    "Tamas":  [CBTCategory.GROUNDING, CBTCategory.REST]
}

# Tie-Breaking Priorities based on Circadian Cognitive Rhythms
MORNING_PRIORITY = {
    CBTCategory.FOCUS: 5, CBTCategory.GROUNDING: 4, CBTCategory.COMMUNICATION: 3, 
    CBTCategory.REFLECTION: 2, CBTCategory.REST: 1
}

AFTERNOON_PRIORITY = {
    CBTCategory.COMMUNICATION: 5, CBTCategory.FOCUS: 4, CBTCategory.REST: 3, 
    CBTCategory.REFLECTION: 2, CBTCategory.GROUNDING: 1
}

EVENING_PRIORITY = {
    CBTCategory.REFLECTION: 5, CBTCategory.REST: 4, CBTCategory.GROUNDING: 3, 
    CBTCategory.COMMUNICATION: 2, CBTCategory.FOCUS: 1
}

def score_cbt_plan(moon_sign: str, sun_sign: str, active_dasha: str) -> Dict[str, float]:
    scores = {cat.value: 0.0 for cat in CBTCategory}
    
    moon_elem = SIGN_ELEMENTS.get(moon_sign, "Earth")
    sun_elem = SIGN_ELEMENTS.get(sun_sign, "Earth")
    
    # Extract Lord from "Jupiter Mahadasha" string
    dasha_lord = active_dasha.split(" ")[0] if " " in active_dasha else active_dasha
    guna = DASHA_TRIGUNAS.get(dasha_lord, "Sattva")

    # Moon (2x Weight)
    for cat, base in ELEMENT_BASE[moon_elem].items():
        scores[cat.value] += base * 2.0

    # Sun (1x Weight)
    for cat, base in ELEMENT_BASE[sun_elem].items():
        scores[cat.value] += base * 1.0

    # Dasha Triguna (+2 Bonus Points)
    for cat in GUNA_MODIFIERS[guna]:
        scores[cat.value] += 2.0

    return scores


# ── Defaults ───────────────────────────────────────────────────────────────────

_DEFAULT_BLOCKS = {
    "Focus": CBTBlock(
        category="Focus",
        title="Deep Work Session",
        description=(
            "Allocate uninterrupted time for your highest-priority cognitive task. "
            "Use the Pomodoro technique (25 min work / 5 min break) to sustain "
            "concentration without burnout."
        ),
        duration_minutes=90,
    ),
    "Rest": CBTBlock(
        category="Rest",
        title="Mindful Recovery",
        description=(
            "Engage in a body-scan meditation or progressive muscle relaxation. "
            "Limit screen exposure during this window to support nervous system "
            "regulation."
        ),
        duration_minutes=30,
    ),
    "Communication": CBTBlock(
        category="Communication",
        title="Intentional Connection",
        description=(
            "Reach out to one meaningful contact or journal your thoughts on a "
            "recent interpersonal experience. Practicing active listening "
            "strengthens social bonds and emotional regulation."
        ),
        duration_minutes=45,
    ),
    "Grounding": CBTBlock(
        category="Grounding",
        title="Physical Anchoring",
        description=(
            "A 20–30 minute walk outdoors or a brief yoga flow to reconnect with "
            "your physical environment. Grounding reduces cognitive overload and "
            "supports mood stability."
        ),
        duration_minutes=30,
    ),
    "Reflection": CBTBlock(
        category="Reflection",
        title="CBT Journaling",
        description=(
            "Write down one automatic negative thought from today, identify the "
            "cognitive distortion, and reframe it with a balanced, evidence-based "
            "counter-thought. This is the core CBT thought-record exercise."
        ),
        duration_minutes=20,
    ),
}

# ── FastMCP Tool ───────────────────────────────────────────────────────────────

@mcp.tool()
def get_cbt_day_plan(req: ClinicalRequest) -> ClinicalResponse:
    """
    Returns a dynamically scored CBT day plan based on the user's active 
    planetary transits and stated self-improvement goal.
    """
    scores = score_cbt_plan(req.moon_sign, req.sun_sign, req.active_dasha)
    
    available = list(CBTCategory)
    
    # Pick Morning
    available.sort(key=lambda c: (scores[c.value], MORNING_PRIORITY[c]), reverse=True)
    morning_cat = available.pop(0)

    # Pick Afternoon
    available.sort(key=lambda c: (scores[c.value], AFTERNOON_PRIORITY[c]), reverse=True)
    afternoon_cat = available.pop(0)

    # Pick Evening
    available.sort(key=lambda c: (scores[c.value], EVENING_PRIORITY[c]), reverse=True)
    evening_cat = available.pop(0)
    
    return ClinicalResponse(
        morning_block=_DEFAULT_BLOCKS[morning_cat.value],
        afternoon_block=_DEFAULT_BLOCKS[afternoon_cat.value],
        evening_block=_DEFAULT_BLOCKS[evening_cat.value],
    )

if __name__ == "__main__":
    mcp.run()
