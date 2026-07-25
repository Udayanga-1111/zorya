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
from datetime import datetime, timezone
from dotenv import load_dotenv
from fastmcp import FastMCP
import swisseph as swe

from schemas.agent_schemas import (
    TransitRequest,
    TransitResponse,
    PlanetaryPosition,
    ChartPositions,
)

load_dotenv()

# ── Server Initialization ──────────────────────────────────────────────────────
mcp = FastMCP("Zorya-Celestial-Server")

# ── Swiss Ephemeris Configuration ─────────────────────────────────────────────
# Use Moshier analytical mode — set empty path to disable binary file lookup.
_ephe_path = os.getenv("SWE_EPHE_PATH", "")
swe.set_ephe_path(_ephe_path)


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

def _calculate_chart(jd: float, flags: int) -> ChartPositions:
    """Helper to calculate positions for all 7 planets at a given Julian day."""
    positions = {}
    for planet_name, planet_id in _PLANET_IDS.items():
        result, _ = swe.calc_ut(jd, planet_id, flags)
        positions[planet_name] = _longitude_to_position(planet_name, result[0])
    
    return ChartPositions(
        sun=positions["sun"],
        moon=positions["moon"],
        mercury=positions["mercury"],
        venus=positions["venus"],
        mars=positions["mars"],
        jupiter=positions["jupiter"],
        saturn=positions["saturn"],
    )

@mcp.tool()
def calculate_active_transits(req: TransitRequest) -> TransitResponse:
    """
    Calculates real-time planetary positions and the approximate active Dasha
    using pyswisseph Moshier analytical ephemeris.

    Returns raw astronomical telemetry only. No deterministic life predictions
    are made. CBT interpretation is handled by the Clinical MCP Server.
    """
    # Parse birth date and time
    b_year, b_month, b_day = map(int, req.birth_date.split("-"))
    b_hour, b_minute = map(int, req.birth_time.split(":"))
    b_decimal_hour = b_hour + (b_minute / 60.0)

    # Compute Natal Julian Day Number (Universal Time)
    natal_jd = swe.julday(b_year, b_month, b_day, b_decimal_hour)

    # Determine current/transit date and time
    now = datetime.now(timezone.utc)
    t_date = req.current_date if req.current_date else now.strftime("%Y-%m-%d")
    t_time = req.current_time if req.current_time else now.strftime("%H:%M")
    
    t_year, t_month, t_day = map(int, t_date.split("-"))
    t_hour, t_minute = map(int, t_time.split(":"))
    t_decimal_hour = t_hour + (t_minute / 60.0)
    
    # Compute Transit Julian Day Number
    transit_jd = swe.julday(t_year, t_month, t_day, t_decimal_hour)

    # CRITICAL: Moshier analytical flag — no binary ephemeris files needed
    flags = swe.FLG_MOSEPH

    # Calculate charts
    natal_chart = _calculate_chart(natal_jd, flags)
    transit_chart = _calculate_chart(transit_jd, flags)

    active_dasha = _derive_dasha_from_moon(natal_chart.moon.longitude)

    return TransitResponse(
        natal_julian_day=round(natal_jd, 6),
        transit_julian_day=round(transit_jd, 6),
        natal_chart=natal_chart,
        transit_chart=transit_chart,
        active_dasha=active_dasha,
        transit_summary=(
            f"Natal Sun in {natal_chart.sun.sign}, Transit Moon in {transit_chart.moon.sign}. "
            f"Active period: {active_dasha}."
        ),
    )


if __name__ == "__main__":
    mcp.run()
