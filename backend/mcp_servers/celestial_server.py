"""
Zorya — Celestial MCP Server
==============================
Wraps `pyswisseph` inside a FastMCP tool to calculate high-fidelity planetary
positions and active Dasha periods based on birth coordinates and time.

Design constraints (from celestial-mcp-builder skill):
  - Uses `swe.FLG_MOSEPH` (Moshier analytical ephemeris) — no binary .se1
    files required in any container or deployment environment.
  - Uses `swe.SIDM_LAHIRI` Sidereal Ayanamsa — required for authentic Sri
    Lankan / Indian Vedic (Jyotisha) natal chart calculation. Western Tropical
    zodiac is explicitly NOT used.
  - All inputs are validated by Pydantic before reaching the C-extension.
  - Output is a strict Pydantic model consumed by the LangGraph Parsing Agent.

Ethical guardrail: This tool produces raw astronomical telemetry ONLY.
Interpretation into CBT time blocks is delegated to the Clinical MCP Server.
No deterministic life predictions are made here.
"""

import os
from datetime import datetime, timezone
from typing import Dict
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

# 120-Year Vimshottari Dasha Sequence and Durations
DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
DASHA_YEARS: Dict[str, float] = {
    "Ketu": 7.0, "Venus": 20.0, "Sun": 6.0, "Moon": 10.0,
    "Mars": 7.0, "Rahu": 18.0, "Jupiter": 16.0, "Saturn": 19.0, "Mercury": 17.0
}


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
    """Convert a raw ecliptic longitude (0–360°) to a PlanetaryPosition.

    Normalises the value with % 360 to safely handle the rare edge case where
    pyswisseph returns a slightly negative sidereal longitude (e.g., -0.5°)
    for a planet sitting very close to 0° Aries after the Lahiri subtraction.
    """
    longitude = longitude % 360  # Normalise to [0, 360) — guards against negatives
    sign_index = int(longitude // 30)
    sign_degree = longitude % 30
    return PlanetaryPosition(
        name=name,
        longitude=round(longitude, 6),
        sign=_ZODIAC_SIGNS[sign_index],
        sign_degree=round(sign_degree, 4),
    )


def _derive_active_dasha(natal_sidereal_moon_lon: float, natal_jd: float, transit_jd: float) -> str:
    """
    Calculates the active Vimshottari Mahadasha Lord based on the sidereal moon 
    longitude at birth and elapsed tropical years to transit_jd.
    """
    # 1. Determine Nakshatra Index (0 to 26) and fraction traversed
    nakshatra_span = 360.0 / 27.0  # 13.333333 degrees
    nakshatra_idx = int(natal_sidereal_moon_lon / nakshatra_span) % 27
    fraction_traversed = (natal_sidereal_moon_lon % nakshatra_span) / nakshatra_span
    
    # 2. Identify initial birth Dasha Lord
    first_dasha_lord = DASHA_ORDER[nakshatra_idx % 9]
    first_dasha_total_years = DASHA_YEARS[first_dasha_lord]
    
    # 3. Calculate remaining years of the first Dasha at birth
    remaining_first_dasha_years = (1.0 - fraction_traversed) * first_dasha_total_years
    
    # 4. Calculate elapsed tropical years between birth and transit
    elapsed_days = transit_jd - natal_jd
    elapsed_years = elapsed_days / 365.2422
    
    # If still within the first Mahadasha
    if elapsed_years < remaining_first_dasha_years:
        return first_dasha_lord
        
    # Subtract remaining time of first Dasha
    elapsed_years -= remaining_first_dasha_years
    
    # Iterate through subsequent Mahadashas
    current_idx = (DASHA_ORDER.index(first_dasha_lord) + 1) % 9
    while elapsed_years >= DASHA_YEARS[DASHA_ORDER[current_idx]]:
        elapsed_years -= DASHA_YEARS[DASHA_ORDER[current_idx]]
        current_idx = (current_idx + 1) % 9
        
    return DASHA_ORDER[current_idx]


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
    Calculates real-time planetary positions and the active Vimshottari Mahadasha
    using pyswisseph Moshier analytical ephemeris and Lahiri Ayanamsa (Sidereal).

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

    # CRITICAL: Set Lahiri Ayanamsa and flags for Sidereal Moshier calculation
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    flags = swe.FLG_MOSEPH | swe.FLG_SIDEREAL

    # Calculate charts (Sidereal)
    natal_chart = _calculate_chart(natal_jd, flags)
    transit_chart = _calculate_chart(transit_jd, flags)

    active_dasha_lord = _derive_active_dasha(natal_chart.moon.longitude, natal_jd, transit_jd)
    active_dasha = f"{active_dasha_lord} Mahadasha"

    return TransitResponse(
        natal_julian_day=round(natal_jd, 6),
        transit_julian_day=round(transit_jd, 6),
        natal_chart=natal_chart,
        transit_chart=transit_chart,
        active_dasha=active_dasha,
        transit_summary=(
            f"Natal Moon in {natal_chart.moon.sign}, Transit Moon in {transit_chart.moon.sign}. "
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
        "moon_sign": res.transit_chart.moon.sign,
        "sun_sign": res.natal_chart.sun.sign,
        "dasha_lord": res.active_dasha.split()[0], # "Jupiter Mahadasha..." -> "Jupiter"
        "julian_day": res.transit_julian_day,
        "transit_summary": res.transit_summary
    }


if __name__ == "__main__":
    mcp.run()
