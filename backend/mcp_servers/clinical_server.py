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
from schemas.agent_schemas import CBTBlock
import operator
import random

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

# CBTBlock is imported from schemas.agent_schemas — single source of truth.

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

_CBT_TEMPLATES = {
    "Focus": [
        CBTBlock(
            category="Focus",
            title="Deep Work Pomodoro",
            description=(
                "Allocate uninterrupted time for your highest-priority cognitive task. "
                "Use the Pomodoro technique (25 min work / 5 min break) to sustain "
                "concentration without burnout."
            ),
            duration_minutes=90,
        ),
        CBTBlock(
            category="Focus",
            title="Cognitive Restructuring Sprint",
            description=(
                "Dedicate this session to tackling a complex problem. Catch any 'all-or-nothing' "
                "or 'catastrophizing' thoughts as they arise during work, and reframe them to "
                "maintain steady, analytical focus."
            ),
            duration_minutes=45,
        ),
        CBTBlock(
            category="Focus",
            title="Distraction Detox",
            description=(
                "Disable all notifications and place your phone in another room. "
                "Practice single-tasking. If your mind wanders, gently label the distraction "
                "and return your attention to the task at hand."
            ),
            duration_minutes=60,
        )
    ],
    "Rest": [
        CBTBlock(
            category="Rest",
            title="Mindful Recovery",
            description=(
                "Engage in a body-scan meditation or progressive muscle relaxation. "
                "Limit screen exposure during this window to support nervous system "
                "regulation."
            ),
            duration_minutes=30,
        ),
        CBTBlock(
            category="Rest",
            title="Sensory Decompression",
            description=(
                "Lie comfortably in a quiet, dimly lit room. Close your eyes and focus solely "
                "on the physical sensation of your breath to reduce sensory overload and reset "
                "cognitive fatigue."
            ),
            duration_minutes=20,
        ),
        CBTBlock(
            category="Rest",
            title="Digital Sunset",
            description=(
                "Step away from all digital screens. Engage in a low-stimulation activity like "
                "reading a physical book, stretching, or listening to calm music to signal "
                "to your brain that it is time to down-regulate."
            ),
            duration_minutes=45,
        )
    ],
    "Communication": [
        CBTBlock(
            category="Communication",
            title="Intentional Connection",
            description=(
                "Reach out to one meaningful contact. Practice active listening by reflecting "
                "back what they say without immediate judgment. This strengthens social bonds "
                "and emotional regulation."
            ),
            duration_minutes=45,
        ),
        CBTBlock(
            category="Communication",
            title="Assertiveness Practice",
            description=(
                "Script a difficult conversation or boundary you need to set. Use 'I feel' "
                "statements (e.g., 'I feel overwhelmed when X happens, and I need Y'). "
                "This builds confidence in healthy expression."
            ),
            duration_minutes=30,
        ),
        CBTBlock(
            category="Communication",
            title="Gratitude Expression",
            description=(
                "Send a thoughtful message of appreciation to a friend, family member, or colleague. "
                "Externalizing gratitude shifts cognitive focus away from internal stressors "
                "and reinforces positive social loops."
            ),
            duration_minutes=15,
        )
    ],
    "Grounding": [
        CBTBlock(
            category="Grounding",
            title="Physical Anchoring",
            description=(
                "Take a brisk walk outdoors or complete a brief yoga flow. Reconnecting with "
                "your physical environment reduces cognitive overload and "
                "supports mood stability."
            ),
            duration_minutes=30,
        ),
        CBTBlock(
            category="Grounding",
            title="5-4-3-2-1 Sensory Grounding",
            description=(
                "Pause and identify: 5 things you can see, 4 things you can physically feel, "
                "3 things you can hear, 2 things you can smell, and 1 thing you can taste. "
                "This halts anxious rumination and anchors you in the present."
            ),
            duration_minutes=15,
        ),
        CBTBlock(
            category="Grounding",
            title="Box Breathing Anchor",
            description=(
                "Practice box breathing: Inhale for 4 seconds, hold for 4, exhale for 4, hold for 4. "
                "Repeat for several cycles. This physiological intervention instantly lowers "
                "cortisol levels and sympathetic nervous system arousal."
            ),
            duration_minutes=10,
        )
    ],
    "Reflection": [
        CBTBlock(
            category="Reflection",
            title="CBT Thought Record",
            description=(
                "Write down one automatic negative thought from today. Identify the cognitive distortion "
                "(e.g., mind-reading, filtering), and reframe it with a balanced, evidence-based "
                "counter-thought."
            ),
            duration_minutes=20,
        ),
        CBTBlock(
            category="Reflection",
            title="Values Alignment Check",
            description=(
                "Review today's actions. Did they align with your core personal values? "
                "Identify one small adjustment you can make tomorrow to act more consistently "
                "with the person you want to be."
            ),
            duration_minutes=15,
        ),
        CBTBlock(
            category="Reflection",
            title="Objective Review",
            description=(
                "Log three specific things that went well today and your exact role in making them happen. "
                "This combats the 'negativity bias' distortion by forcing the brain to acknowledge "
                "positive evidence."
            ),
            duration_minutes=15,
        )
    ],
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
        morning_block=random.choice(_CBT_TEMPLATES[morning_cat.value]),
        afternoon_block=random.choice(_CBT_TEMPLATES[afternoon_cat.value]),
        evening_block=random.choice(_CBT_TEMPLATES[evening_cat.value]),
    )

if __name__ == "__main__":
    mcp.run()
