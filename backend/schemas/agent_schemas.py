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
