import logging
from typing import Dict, Any

from backend.orchestrator.state import ZoryaAgentState
from backend.schemas.celestial_schemas import (
    NatalInputModel, CelestialContextModel, ElementEnum, GunaEnum
)
from backend.mcp_servers.celestial_server import calculate_sidereal_positions

logger = logging.getLogger(__name__)

# Tattva (Element) Mapping
SIGN_TO_ELEMENT = {
    # Agni (Fire)
    "Aries": ElementEnum.FIRE, "Leo": ElementEnum.FIRE, "Sagittarius": ElementEnum.FIRE,
    # Prithvi (Earth)
    "Taurus": ElementEnum.EARTH, "Virgo": ElementEnum.EARTH, "Capricorn": ElementEnum.EARTH,
    # Vayu (Air)
    "Gemini": ElementEnum.AIR, "Libra": ElementEnum.AIR, "Aquarius": ElementEnum.AIR,
    # Jala (Water)
    "Cancer": ElementEnum.WATER, "Scorpio": ElementEnum.WATER, "Pisces": ElementEnum.WATER,
}

# Triguna Mapping for Vimshottari Dasha Lords
DASHA_LORD_TO_GUNA = {
    "Sun": GunaEnum.SATTVA, "Moon": GunaEnum.SATTVA, "Jupiter": GunaEnum.SATTVA,
    "Mercury": GunaEnum.RAJAS, "Venus": GunaEnum.RAJAS,
    "Mars": GunaEnum.TAMAS, "Saturn": GunaEnum.TAMAS, "Rahu": GunaEnum.TAMAS, "Ketu": GunaEnum.TAMAS
}

# Fallback model in case of tool failure or invalid coordinates
DEFAULT_FALLBACK_CELESTIAL = CelestialContextModel(
    moon_sign="Taurus",
    moon_element=ElementEnum.EARTH,
    sun_sign="Leo",
    sun_element=ElementEnum.FIRE,
    dasha_lord="Jupiter",
    dasha_guna=GunaEnum.SATTVA,
    ayanamsa="Lahiri",
    raw_transit_data={"fallback": True}
)

def calculate_cbt_scores_from_context(celestial: CelestialContextModel) -> Dict[str, float]:
    """Helper calculating base category scores from validated celestial context."""
    # Matches ZOR-6 Clinical scoring logic (Moon 2x, Sun 1x, Guna +2)
    scores = {"Grounding": 0.0, "Focus": 0.0, "Rest": 0.0, "Communication": 0.0, "Reflection": 0.0}
    
    # Apply Moon element (2x)
    if celestial.moon_element == ElementEnum.FIRE:
        scores["Grounding"] += 6.0; scores["Focus"] += 6.0
    elif celestial.moon_element == ElementEnum.EARTH:
        scores["Focus"] += 6.0; scores["Rest"] += 6.0
    elif celestial.moon_element == ElementEnum.AIR:
        scores["Communication"] += 6.0; scores["Reflection"] += 6.0
    elif celestial.moon_element == ElementEnum.WATER:
        scores["Reflection"] += 6.0; scores["Rest"] += 6.0

    # Apply Sun element (1x)
    if celestial.sun_element == ElementEnum.FIRE:
        scores["Grounding"] += 3.0; scores["Focus"] += 3.0
    elif celestial.sun_element == ElementEnum.EARTH:
        scores["Focus"] += 3.0; scores["Rest"] += 3.0
    elif celestial.sun_element == ElementEnum.AIR:
        scores["Communication"] += 3.0; scores["Reflection"] += 3.0
    elif celestial.sun_element == ElementEnum.WATER:
        scores["Reflection"] += 3.0; scores["Rest"] += 3.0

    # Apply Dasha Guna Modifier (+2)
    if celestial.dasha_guna == GunaEnum.SATTVA:
        scores["Reflection"] += 2.0; scores["Focus"] += 2.0
    elif celestial.dasha_guna == GunaEnum.RAJAS:
        scores["Communication"] += 2.0; scores["Focus"] += 2.0
    elif celestial.dasha_guna == GunaEnum.TAMAS:
        scores["Grounding"] += 2.0; scores["Rest"] += 2.0

    return scores

def parsing_node(state: ZoryaAgentState) -> Dict[str, Any]:
    """
    Parses user birth telemetry, invokes Celestial MCP tool (Lahiri Sidereal mode),
    and validates output into CelestialContextModel.
    """
    logger.info("Executing parsing_node...")
    user_profile = state.get("user_profile", {})

    try:
        # 1. Validate Input Payload
        natal_input = NatalInputModel(
            birth_date=user_profile.get("birth_date", "2000-01-01"),
            birth_time=user_profile.get("birth_time", "12:00"),
            latitude=float(user_profile.get("latitude", 7.2906)),  # Default Kandy, Sri Lanka
            longitude=float(user_profile.get("longitude", 80.6337))
        )

        # 2. Invoke Celestial MCP Server / Function (Lahiri Sidereal)
        raw_astro = calculate_sidereal_positions(
            date_str=natal_input.birth_date,
            time_str=natal_input.birth_time,
            lat=natal_input.latitude,
            lon=natal_input.longitude
        )

        # Extract positions
        moon_sign = raw_astro.get("moon_sign", "Taurus")
        sun_sign = raw_astro.get("sun_sign", "Leo")
        dasha_lord = raw_astro.get("dasha_lord", "Jupiter")

        # 3. Apply Sri Lankan Vedic Mappings
        celestial_model = CelestialContextModel(
            moon_sign=moon_sign,
            moon_element=SIGN_TO_ELEMENT.get(moon_sign, ElementEnum.EARTH),
            sun_sign=sun_sign,
            sun_element=SIGN_TO_ELEMENT.get(sun_sign, ElementEnum.FIRE),
            dasha_lord=dasha_lord,
            dasha_guna=DASHA_LORD_TO_GUNA.get(dasha_lord, GunaEnum.SATTVA),
            ayanamsa="Lahiri",
            raw_transit_data=raw_astro
        )

        logger.info(f"Celestial parsing successful: Moon in {moon_sign} ({celestial_model.moon_element.value}), Dasha: {dasha_lord} ({celestial_model.dasha_guna.value})")
        
        # Calculate base CBT scores using Clinical Server logic
        cbt_scores = calculate_cbt_scores_from_context(celestial_model)

        return {
            "celestial_context": celestial_model.model_dump(),
            "cbt_scores": cbt_scores,
            "error": None
        }

    except Exception as e:
        logger.error(f"Error in parsing_node (invoking fallback): {e}")
        # Fallback gracefully without crashing the graph state
        cbt_scores = calculate_cbt_scores_from_context(DEFAULT_FALLBACK_CELESTIAL)
        return {
            "celestial_context": DEFAULT_FALLBACK_CELESTIAL.model_dump(),
            "cbt_scores": cbt_scores,
            "error": f"Celestial parsing warning: {str(e)}"
        }
