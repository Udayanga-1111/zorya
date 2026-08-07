from typing import Optional
from pydantic import BaseModel, Field

class TransitRequest(BaseModel):
    """Validated input for a planetary transit calculation."""

    birth_date: str = Field(
        ...,
        description="Date of birth in UTC. Format: YYYY-MM-DD",
        pattern=r"^\d{4}-\d{2}-\d{2}$",
    )
    birth_time: str = Field(
        ...,
        description="Time of birth in UTC. Format: HH:MM",
        pattern=r"^\d{2}:\d{2}$",
    )
    latitude: float = Field(
        ...,
        ge=-90.0,
        le=90.0,
        description="Geographic latitude of birth location (degrees).",
    )
    longitude: float = Field(
        ...,
        ge=-180.0,
        le=180.0,
        description="Geographic longitude of birth location (degrees).",
    )
    current_date: Optional[str] = Field(
        None,
        description="Current date in UTC. Format: YYYY-MM-DD. Defaults to today.",
        pattern=r"^\d{4}-\d{2}-\d{2}$",
    )
    current_time: Optional[str] = Field(
        None,
        description="Current time in UTC. Format: HH:MM. Defaults to current time.",
        pattern=r"^\d{2}:\d{2}$",
    )

class UserProfileModel(BaseModel):
    """User profile data including basic info and wellness goals."""
    birth_date: str = Field(..., description="YYYY-MM-DD")
    birth_time: str = Field(..., description="HH:MM (24h UTC)")
    lat: float = Field(..., ge=-90.0, le=90.0)
    lon: float = Field(..., ge=-180.0, le=180.0)
    user_id: str = Field(default="anonymous")
    primary_goal: Optional[str] = Field(default=None, description="Primary wellness goal")
    focus_areas: Optional[list[str]] = Field(default_factory=list, description="Specific focus areas")
    user_notes: Optional[str] = Field(default=None, description="Custom context or challenge for the day")

class PlanetaryPosition(BaseModel):
    """Ecliptic longitude for a single celestial body (degrees, 0–360)."""

    name: str
    longitude: float
    sign: str
    sign_degree: float  # Degrees within the sign (0–30)

class ChartPositions(BaseModel):
    """Positions of the 7 classical planets for a given time."""

    sun: PlanetaryPosition
    moon: PlanetaryPosition
    mercury: PlanetaryPosition
    venus: PlanetaryPosition
    mars: PlanetaryPosition
    jupiter: PlanetaryPosition
    saturn: PlanetaryPosition

class TransitResponse(BaseModel):
    """Validated output: raw astronomical telemetry for the Parsing Agent."""

    natal_julian_day: float
    transit_julian_day: float
    natal_chart: ChartPositions
    transit_chart: ChartPositions
    active_dasha: str
    transit_summary: str

class CBTBlock(BaseModel):
    category: str = Field(..., description="One of: Focus, Rest, Communication, Grounding, Reflection")
    title: str = Field(..., description="A short, actionable title for the block.")
    description: str = Field(..., description="Detailed instructions for this CBT block.")
    duration_minutes: int = Field(..., description="Recommended duration in minutes.")
    is_reframed: Optional[bool] = Field(default=False, description="True if the block was dynamically reframed to lower friction.")
    disclaimer: str = Field(
        default=(
            "This suggestion is for self-improvement purposes only and does not "
            "constitute medical or clinical advice. Please consult a licensed "
            "mental health professional for clinical support."
        )
    )

class ClinicalAgentOutput(BaseModel):
    """Structured output expected from the Clinical CBT Agent node."""
    blocks: list[CBTBlock] = Field(..., description="List of recommended CBT blocks for the user's day.")

class ReplanRequest(BaseModel):
    """Validated input for the Adaptive Re-plan Loop endpoint."""
    block: CBTBlock = Field(..., description="The original CBT block to be reframed.")
    # Assuming user context can optionally be sent, but block is the primary requirement.

class GuardrailResponse(BaseModel):
    is_safe: bool = Field(description="True if output is safe, non-deterministic, and non-diagnostic")
    violates_fatalism: bool = Field(description="True if output predicts future events, health, finance, or destiny")
    violates_diagnostic: bool = Field(description="True if output attempts medical diagnosis")
    violates_medical_advice: bool = Field(description="True if output advises changes to medication or treatment")
    violates_financial: bool = Field(description="True if output predicts financial gains or losses")
    violation_reason: Optional[str] = Field(default=None, description="Explanation of safety violation if detected")

class GuardrailStatusPayload(BaseModel):
    flagged: bool = Field(description="True if the plan was flagged for safety violations")
    reframed: bool = Field(description="True if the plan was reframed")
    reason: Optional[str] = Field(default=None, description="Reason for flagging")
    disclaimer: str = Field(default="Zorya is a self-improvement habit tool and does not provide clinical, medical, or financial advice.", description="Medical disclaimer")

class SessionState(BaseModel):
    consent_given: bool = Field(description="True if the user has explicitly consented to PDPA data processing.")
    consent_timestamp: Optional[str] = Field(default=None, description="ISO 8601 timestamp of when consent was granted.")

class NodeError(BaseModel):
    error: str = Field(description="Description of the error that occurred.")
    node_name: str = Field(description="Name of the node where the error occurred.")

class ChatGuardrailEvaluation(BaseModel):
    is_safe: bool = Field(description="True if the user's message is safe and does not violate guidelines.")
    is_fatalistic: bool = Field(description="True if the user's message asks for fatalistic predictions (e.g., when they will die, predictive health outcomes, guaranteed financial loss/gain).")
    is_crisis: bool = Field(description="True if the user's message indicates a severe mental health crisis, self-harm, or suicidal intent.")
    reason: Optional[str] = Field(default=None, description="Explanation of why the message was flagged as fatalistic or crisis.")


class IntentClassification(BaseModel):
    """Structured output of the intent classifier node."""
    intent: str = Field(
        description="Exactly one of: 'update_plan' (user wants to change daily schedule blocks) or 'general_chat' (all other queries)."
    )
    target_categories: list[str] = Field(
        default_factory=list,
        description="List of CBT category names the user wants to modify (e.g., ['Focus', 'Rest']). Empty list for general_chat."
    )
    reasoning: Optional[str] = Field(
        default=None,
        description="Short explanation of why this intent was chosen."
    )


class PlanEditOutput(BaseModel):
    """Structured output of the plan_edit_node: only the mutated blocks."""
    modified_blocks: list[CBTBlock] = Field(
        description="List of ONLY the CBTBlock objects that were changed by the user's request. Other blocks are untouched."
    )
    confirmation_message: str = Field(
        description="A short, warm 1-2 sentence confirmation message to show the user in the chat explaining what was changed."
    )
