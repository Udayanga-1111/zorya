from mcp_servers.celestial_server import _derive_active_dasha, mcp
from schemas.agent_schemas import TransitRequest
import swisseph as swe

def test_dasha_logic():
    # natal sidereal moon at 210.0 degrees (Vishakha, ruled by Jupiter)
    natal_lon = 210.0
    # natal jd for 1998-05-15 12:00 UTC
    natal_jd = swe.julday(1998, 5, 15, 12.0)
    # transit jd for 2026-07-27 12:00 UTC
    transit_jd = swe.julday(2026, 7, 27, 12.0)
    
    elapsed_years = (transit_jd - natal_jd) / 365.2422
    print(f"Elapsed tropical years: {elapsed_years}")
    
    active_dasha = _derive_active_dasha(natal_lon, natal_jd, transit_jd)
    print(f"Active Dasha: {active_dasha}")

def test_endpoint():
    req = TransitRequest(
        birth_date="1998-05-15",
        birth_time="12:00",
        latitude=0.0,
        longitude=0.0,
        current_date="2026-07-27",
        current_time="12:00"
    )
    # the function is registered as calculate_active_transits tool
    from mcp_servers.celestial_server import calculate_active_transits
    res = calculate_active_transits(req)
    print("Endpoint active Dasha:", res.active_dasha)
    print("Natal Moon Sidereal:", res.natal_chart.moon.longitude, res.natal_chart.moon.sign)

if __name__ == "__main__":
    test_dasha_logic()
    test_endpoint()
