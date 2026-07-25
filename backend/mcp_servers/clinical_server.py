"""
Zorya — Clinical CBT MCP Server (Stub)
========================================
Translates raw astronomical telemetry from the Celestial MCP Server into
evidence-based CBT time blocks and micro-habit recommendations.

Current status: STUB — ZOR-6 will implement the full vector mapping logic.

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


# ── Placeholder Vector Mappings ────────────────────────────────────────────────
# TODO (ZOR-6): Replace with full vector mapping dictionaries keyed by
#               planetary sign combinations.

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
    [STUB — ZOR-6] Returns a CBT day plan based on the user's active planetary
    transits and stated self-improvement goal.

    Currently returns evidence-based defaults. Full vector mapping from planetary
    sign combinations to CBT categories will be implemented in ZOR-6.
    """
    # TODO (ZOR-6): Implement sign-pair → category mapping logic
    return ClinicalResponse(
        morning_block=_DEFAULT_BLOCKS["Focus"],
        afternoon_block=_DEFAULT_BLOCKS["Grounding"],
        evening_block=_DEFAULT_BLOCKS["Reflection"],
    )


if __name__ == "__main__":
    mcp.run()
