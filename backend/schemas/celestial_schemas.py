from enum import Enum
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class ElementEnum(str, Enum):
    FIRE = "Fire"     # Agni (Aries, Leo, Sagittarius)
    EARTH = "Earth"   # Prithvi (Taurus, Virgo, Capricorn)
    AIR = "Air"       # Vayu (Gemini, Libra, Aquarius)
    WATER = "Water"   # Jala (Cancer, Scorpio, Pisces)

class GunaEnum(str, Enum):
    SATTVA = "Sattva" # Clarity / Goodness (Sun, Moon, Jupiter)
    RAJAS = "Rajas"   # Passion / Activity (Mercury, Venus)
    TAMAS = "Tamas"   # Inertia / Rest (Mars, Saturn, Rahu, Ketu)

class NatalInputModel(BaseModel):
    birth_date: str = Field(description="YYYY-MM-DD birth date")
    birth_time: str = Field(description="HH:MM birth time in 24h format")
    latitude: float = Field(description="Latitude coordinates (-90 to 90)", ge=-90.0, le=90.0)
    longitude: float = Field(description="Longitude coordinates (-180 to 180)", ge=-180.0, le=180.0)

class CelestialContextModel(BaseModel):
    moon_sign: str = Field(description="Lahiri Sidereal Moon Sign (Janma Rashi)")
    moon_element: ElementEnum = Field(description="Tattva/Element of Moon sign")
    sun_sign: str = Field(description="Lahiri Sidereal Sun Sign")
    sun_element: ElementEnum = Field(description="Tattva/Element of Sun sign")
    dasha_lord: str = Field(description="Active Vimshottari Dasha Lord")
    dasha_guna: GunaEnum = Field(description="Triguna mode of active Dasha Lord")
    ayanamsa: str = Field(default="Lahiri", description="Ayanamsa system used")
    raw_transit_data: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Raw astronomical positions from pyswisseph")
