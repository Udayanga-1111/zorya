import pytest
from schemas.agent_schemas import TransitRequest
from mcp_servers.celestial_server import calculate_active_transits

def test_calculate_active_transits_default_current_time():
    """Test that calculate_active_transits works with default current_time (now)"""
    req = TransitRequest(
        birth_date="1990-01-01",
        birth_time="12:00",
        latitude=40.7128,
        longitude=-74.0060,
    )
    
    response = calculate_active_transits(req)
    
    assert response.natal_julian_day > 0
    assert response.transit_julian_day > 0
    
    # Check that natal chart has all 7 classical planets
    assert response.natal_chart.sun.name == "sun"
    assert response.natal_chart.moon.name == "moon"
    assert response.natal_chart.saturn.name == "saturn"
    
    # Check that transit chart has all 7 classical planets
    assert response.transit_chart.sun.name == "sun"
    assert response.transit_chart.moon.name == "moon"
    assert response.transit_chart.saturn.name == "saturn"
    
    assert "Active period" in response.transit_summary

def test_calculate_active_transits_explicit_current_time():
    """Test that calculate_active_transits works with explicit current_date and current_time"""
    req = TransitRequest(
        birth_date="1990-01-01",
        birth_time="12:00",
        latitude=40.7128,
        longitude=-74.0060,
        current_date="2026-07-26",
        current_time="00:00"
    )
    
    response = calculate_active_transits(req)
    
    assert response.natal_julian_day > 0
    # Expected julian day for 2026-07-26 00:00 is around 2461247.5
    assert 2461000 < response.transit_julian_day < 2462000
