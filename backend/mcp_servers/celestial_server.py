"""
Zorya — Celestial MCP Server
==============================
Wraps `pyswisseph` inside a FastMCP tool to calculate high-fidelity planetary
positions and active Dasha periods based on birth coordinates and time.

Design constraints (from celestial-mcp-builder skill):
  - Uses `swe.FLG_MOSEPH` (Moshier analytical ephemeris) — no binary .se1
    files required in any container or deployment environment.
  - All inputs are validated by Pydantic before reaching the C-extension.
  - Output is a strict Pydantic model consumed by the LangGraph Parsing Agent.

Ethical guardrail: This tool produces raw astronomical telemetry ONLY.
Interpretation into CBT time blocks is delegated to the Clinical MCP Server.
No deterministic life predictions are made here.
"""

import os
from dotenv import load_dotenv
from fastmcp import FastMCP
from pydantic import BaseModel, Field
import swisseph as swe

load_dotenv()

# ── Server Initialization ──────────────────────────────────────────────────────
mcp = FastMCP("Zorya-Celestial-Server")

# ── Swiss Ephemeris Configuration ─────────────────────────────────────────────
# Use Moshier analytical mode — set empty path to disable binary file lookup.
_ephe_path = os.getenv("SWE_EPHE_PATH", "")
swe.set_ephe_path(_ephe_path)


# ── Pydantic Schemas ───────────────────────────────────────────────────────────

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


class PlanetaryPosition(BaseModel):
    """Ecliptic longitude for a single celestial body (degrees, 0–360)."""

    name: str
    longitude: float
    sign: str
    sign_degree: float  # Degrees within the sign (0–30)


class TransitResponse(BaseModel):
    """Validated output: raw astronomical telemetry for the Parsing Agent."""

    julian_day: float
    sun: PlanetaryPosition
    moon: PlanetaryPosition
    mercury: PlanetaryPosition
    venus: PlanetaryPosition
    mars: PlanetaryPosition
    jupiter: PlanetaryPosition
    saturn: PlanetaryPosition
    active_dasha: str
    transit_summary: str


# ── Helpers ────────────────────────────────────────────────────────────────────

_ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]

_PLANET_IDS = {
    "sun": swe.SUN,
    "moon": swe.MOON,
    "mercury": swe.MERCURY,
    "venus": swe.VENUS,
    "mars": swe.MARS,
    "jupiter": swe.JUPITER,
    "saturn": swe.SATURN,
}


def _longitude_to_position(name: str, longitude: float) -> PlanetaryPosition:
    """Convert a raw ecliptic longitude (0–360°) to a PlanetaryPosition."""
    sign_index = int(longitude // 30)
    sign_degree = longitude % 30
    return PlanetaryPosition(
        name=name,
        longitude=round(longitude, 6),
        sign=_ZODIAC_SIGNS[sign_index],
        sign_degree=round(sign_degree, 4),
    )


def _derive_dasha_from_moon(moon_longitude: float) -> str:
    """
    Approximate active Dasha from Moon's Nakshatra (27-fold lunar mansion).
    This is a simplified placeholder — ZOR-5 will implement the full
    Vimshottari Dasha calculation with precise birth Moon position.
    """
    nakshatra_index = int((moon_longitude / 360.0) * 27)
    dasha_lords = [
        "Ketu", "Venus", "Sun", "Moon", "Mars",
        "Rahu", "Jupiter", "Saturn", "Mercury",
    ]
    lord = dasha_lords[nakshatra_index % 9]
    return f"{lord} Mahadasha (approximate)"


# ── FastMCP Tool ───────────────────────────────────────────────────────────────

@mcp.tool()
def calculate_active_transits(req: TransitRequest) -> TransitResponse:
    """
    Calculates real-time planetary positions and the approximate active Dasha
    using pyswisseph Moshier analytical ephemeris.

    Returns raw astronomical telemetry only. No deterministic life predictions
    are made. CBT interpretation is handled by the Clinical MCP Server.
    """
    # Parse birth date and time
    year, month, day = map(int, req.birth_date.split("-"))
    hour, minute = map(int, req.birth_time.split(":"))
    decimal_hour = hour + (minute / 60.0)

    # Compute Julian Day Number (Universal Time)
    jd = swe.julday(year, month, day, decimal_hour)

    # Set Lahiri Ayanamsa
    swe.set_sid_mode(swe.SIDM_LAHIRI)

    # CRITICAL: Moshier analytical flag and Sidereal mode
    flags = swe.FLG_MOSEPH | swe.FLG_SIDEREAL

    # Calculate all planet positions
    positions: dict[str, PlanetaryPosition] = {}
    for planet_name, planet_id in _PLANET_IDS.items():
        result, _ = swe.calc_ut(jd, planet_id, flags)
        positions[planet_name] = _longitude_to_position(planet_name, result[0])

    active_dasha = _derive_dasha_from_moon(positions["moon"].longitude)

    return TransitResponse(
        julian_day=round(jd, 6),
        sun=positions["sun"],
        moon=positions["moon"],
        mercury=positions["mercury"],
        venus=positions["venus"],
        mars=positions["mars"],
        jupiter=positions["jupiter"],
        saturn=positions["saturn"],
        active_dasha=active_dasha,
        transit_summary=(
            f"Sun in {positions['sun'].sign}, Moon in {positions['moon'].sign}. "
            f"Active period: {active_dasha}."
        ),
    )

def calculate_sidereal_positions(date_str: str, time_str: str, lat: float, lon: float) -> dict:
    """Helper function to be called by the parsing node directly."""
    req = TransitRequest(
        birth_date=date_str,
        birth_time=time_str,
        latitude=lat,
        longitude=lon
    )
    res = calculate_active_transits(req)
    
    # Format exactly as expected by the parsing node in ZOR-8
    return {
        "moon_sign": res.moon.sign,
        "sun_sign": res.sun.sign,
        "dasha_lord": res.active_dasha.split()[0], # "Jupiter Mahadasha..." -> "Jupiter"
        "julian_day": res.julian_day,
        "transit_summary": res.transit_summary
    }


if __name__ == "__main__":
    mcp.run()
