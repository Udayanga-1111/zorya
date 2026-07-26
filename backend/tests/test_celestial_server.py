"""
Tests for the Celestial MCP Server tool.

Calls `calculate_active_transits` through the FastMCP in-process Client,
which routes through the full MCP protocol layer — the same path used by
the Parsing Agent in production.

Note on FastMCP 3.x conventions:
  - Tool args with a Pydantic model parameter must be nested under the
    parameter name: {"req": {<fields>}}.
  - `client.call_tool()` returns a `CallToolResult`; use `.structured_content`
    to get the already-deserialized dict (no manual JSON parsing needed).

Uses the `anyio` pytest plugin (already installed) for async test execution.
"""
import pytest
from fastmcp import Client
from mcp_servers.celestial_server import mcp as celestial_mcp


@pytest.mark.anyio
async def test_calculate_active_transits_default_current_time():
    """Test that calculate_active_transits works with default current_time (now)."""
    async with Client(celestial_mcp) as client:
        result = await client.call_tool(
            "calculate_active_transits",
            {
                "req": {
                    "birth_date": "1990-01-01",
                    "birth_time": "12:00",
                    "latitude": 40.7128,
                    "longitude": -74.0060,
                }
            },
        )

    response = result.structured_content

    assert response["natal_julian_day"] > 0
    assert response["transit_julian_day"] > 0

    # Check that natal chart has all 7 classical planets
    assert response["natal_chart"]["sun"]["name"] == "sun"
    assert response["natal_chart"]["moon"]["name"] == "moon"
    assert response["natal_chart"]["saturn"]["name"] == "saturn"

    # Check that transit chart has all 7 classical planets
    assert response["transit_chart"]["sun"]["name"] == "sun"
    assert response["transit_chart"]["moon"]["name"] == "moon"
    assert response["transit_chart"]["saturn"]["name"] == "saturn"

    assert "Active period" in response["transit_summary"]


@pytest.mark.anyio
async def test_calculate_active_transits_explicit_current_time():
    """Test that calculate_active_transits works with explicit current_date and current_time."""
    async with Client(celestial_mcp) as client:
        result = await client.call_tool(
            "calculate_active_transits",
            {
                "req": {
                    "birth_date": "1990-01-01",
                    "birth_time": "12:00",
                    "latitude": 40.7128,
                    "longitude": -74.0060,
                    "current_date": "2026-07-26",
                    "current_time": "00:00",
                }
            },
        )

    response = result.structured_content

    assert response["natal_julian_day"] > 0
    # Expected julian day for 2026-07-26 00:00 is around 2461247.5
    assert 2461000 < response["transit_julian_day"] < 2462000


@pytest.mark.anyio
async def test_invalid_latitude_rejected():
    """Test that Pydantic validation rejects out-of-range latitude."""
    async with Client(celestial_mcp) as client:
        with pytest.raises(Exception):
            await client.call_tool(
                "calculate_active_transits",
                {
                    "req": {
                        "birth_date": "1990-01-01",
                        "birth_time": "12:00",
                        "latitude": 999.0,   # Invalid — exceeds 90.0
                        "longitude": -74.0060,
                    }
                },
            )
