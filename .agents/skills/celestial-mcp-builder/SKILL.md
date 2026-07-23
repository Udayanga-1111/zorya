---
name: celestial-mcp-builder
description: Teaches Google Antigravity how to wrap pyswisseph into a FastMCP Python server for Zorya's astronomical calculations.
---

# Skill: Celestial FastMCP Server Implementation

When tasked with building or updating the **Celestial MCP Server** for the Zorya project, you must strictly follow these instructions to ensure high-fidelity astronomical telemetry via `pyswisseph` and `FastMCP`.

## 1. Core Dependencies
The server relies on the following libraries:
- `fastmcp`: The core framework exposing tools and resources.
- `pyswisseph` (imported as `swe`): The C-extension for Swiss Ephemeris calculations.
- `pydantic`: For strict input/output data validation.

## 2. Pydantic Schema Requirements
Before calculating any transits, inputs must be validated to prevent crash loops in the multi-agent pipeline.
- `latitude` must be constrained between `-90.0` and `90.0`.
- `longitude` must be constrained between `-180.0` and `180.0`.
- Dates and times must be strictly formatted (`YYYY-MM-DD` and `HH:MM`).

## 3. The `pyswisseph` Flag Rule (Critical)
To ensure the server runs flawlessly in any container or environment without needing bundled `.se1` binary ephemeris files, you **MUST** use the Moshier analytical ephemeris flag: `swe.FLG_MOSEPH`.

## 4. Code Template
When generating or refactoring the Celestial MCP tool, structure your Python code using this exact pattern:

```python
from fastmcp import FastMCP
from pydantic import BaseModel, Field
import swisseph as swe

# 1. Initialize Server
mcp = FastMCP("Zorya-Celestial-Server")

# 2. Define Input Schema
class TransitRequest(BaseModel):
    birth_date: str = Field(..., description="Format: YYYY-MM-DD")
    birth_time: str = Field(..., description="Format: HH:MM (UTC)")
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)

# 3. Define Output Schema
class TransitResponse(BaseModel):
    julian_day: float
    sun_longitude: float
    moon_longitude: float
    active_dasha: str
    transit_summary: str

# 4. Expose FastMCP Tool
@mcp.tool()
def calculate_active_transits(req: TransitRequest) -> TransitResponse:
    """Calculates planetary positions and active Dashas using pyswisseph analytical formulas."""
    
    # Parse inputs
    year, month, day = map(int, req.birth_date.split("-"))
    hour, minute = map(int, req.birth_time.split(":"))
    decimal_hour = hour + (minute / 60.0)
    
    # Calculate Julian Day
    jd = swe.julday(year, month, day, decimal_hour)
    
    # CRITICAL: Set analytical ephemeris flag (requires no binary files)
    swe.set_ephe_path('') 
    flags = swe.FLG_MOSEPH
    
    # Calculate celestial bodies
    sun_pos, _ = swe.calc_ut(jd, swe.SUN, flags)
    moon_pos, _ = swe.calc_ut(jd, swe.MOON, flags)
    
    # TODO: Implement Dasha specific period logic here based on Moon's Nakshatra
    
    return TransitResponse(
        julian_day=jd,
        sun_longitude=sun_pos[0],
        moon_longitude=moon_pos[0],
        active_dasha="Mercury-Jupiter", # Placeholder to be updated
        transit_summary="High analytical energy focus block"
    )

if __name__ == "__main__":
    mcp.run()