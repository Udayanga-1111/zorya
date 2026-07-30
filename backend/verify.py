import os
import sys

# Add the current directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from mcp_servers.celestial_server import calculate_active_transits, TransitRequest
from mcp_servers.clinical_server import get_cbt_day_plan, ClinicalRequest, _calculate_cbt_scores

print("=== VERIFYING ZOR-5: Celestial Sidereal ===")
req = TransitRequest(
    birth_date="2002-11-15",
    birth_time="12:00",
    latitude=6.9271,  # Colombo, Sri Lanka
    longitude=79.8612
)
res = calculate_active_transits(req)
print(f"Sun Sign: {res.sun.sign} ({res.sun.longitude:.2f} deg)")
print(f"Moon Sign: {res.moon.sign} ({res.moon.longitude:.2f} deg)")
print(f"Transit Summary: {res.transit_summary}")
print()

print("=== VERIFYING ZOR-6: Clinical Mappings ===")
# Test Case A: High Tamas + Water Moon
# Moon in Cancer, Sun in Scorpio, Dasha Lord Saturn
print("Test Case A: Moon=Cancer (Water), Sun=Scorpio (Water), Dasha=Saturn (Tamas)")
scores_a = _calculate_cbt_scores("Scorpio", "Cancer", "Saturn")
print(f"Scores Ranked: {scores_a}")
res_a = get_cbt_day_plan(ClinicalRequest(
    sun_sign="Scorpio",
    moon_sign="Cancer",
    active_dasha="Saturn Mahadasha",
    user_goal="I want to relax"
))
print(f"Morning: {res_a.morning_block.category}")
print(f"Afternoon: {res_a.afternoon_block.category}")
print(f"Evening: {res_a.evening_block.category}")
print()

# Test Case B: High Rajas + Air Moon
# Moon in Gemini, Sun in Leo, Dasha Lord Venus
print("Test Case B: Moon=Gemini (Air), Sun=Leo (Fire), Dasha=Venus (Rajas)")
scores_b = _calculate_cbt_scores("Leo", "Gemini", "Venus")
print(f"Scores Ranked: {scores_b}")
res_b = get_cbt_day_plan(ClinicalRequest(
    sun_sign="Leo",
    moon_sign="Gemini",
    active_dasha="Venus Mahadasha",
    user_goal="I want to be productive"
))
print(f"Morning: {res_b.morning_block.category}")
print(f"Afternoon: {res_b.afternoon_block.category}")
print(f"Evening: {res_b.evening_block.category}")
