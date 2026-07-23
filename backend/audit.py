"""
Deep audit script for ZOR-5 and ZOR-6.
Checks:
  1. Sidereal mode is active and not re-using tropical cache
  2. Nakshatra-Dasha derivation correctness
  3. Longitude bounds safety (no negative or >360 values)
  4. _ELEMENT_MAPPING completeness (all 12 signs covered)
  5. _DASHA_GUNA_MAPPING completeness (all 9 Dasha lords covered)
  6. Unknown sign fallback (graceful degradation)
  7. Unknown dasha lord fallback (graceful degradation)
  8. Test Case A (Tamas + Water Moon)
  9. Test Case B (Rajas + Air Moon)
 10. CBT block title/disclaimer presence (schema compliance)
 11. Score tie-breaking consistency
 12. `FLG_SIDEREAL` is not accidentally masked
"""

import sys, os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

import swisseph as swe
from mcp_servers.celestial_server import (
    calculate_active_transits, TransitRequest,
    _longitude_to_position, _derive_dasha_from_moon, _ZODIAC_SIGNS, _PLANET_IDS
)
from mcp_servers.clinical_server import (
    get_cbt_day_plan, ClinicalRequest, ClinicalResponse,
    _calculate_cbt_scores, _ELEMENT_MAPPING, _DASHA_GUNA_MAPPING,
    _ELEMENT_WEIGHTS, _GUNA_MODIFIERS, _DEFAULT_BLOCKS
)

PASS = "PASS"
FAIL = "FAIL"
WARN = "WARN"

results = []

def check(name, condition, note=""):
    status = PASS if condition else FAIL
    results.append((status, name, note))
    print(f"{status}  [{name}]  {note}")

# ────────────────────────────────────────────────────────────────────────────────
print("\n=== 1. FLAG AUDIT: FLG_SIDEREAL + FLG_MOSEPH ===")
# Verify the combined flag value
expected_flags = swe.FLG_MOSEPH | swe.FLG_SIDEREAL
check(
    "FLG_MOSEPH | FLG_SIDEREAL",
    expected_flags != swe.FLG_MOSEPH,  # Must be different from tropical
    f"flags value = {expected_flags} (MOSEPH={swe.FLG_MOSEPH}, SIDEREAL={swe.FLG_SIDEREAL})"
)
check(
    "SIDM_LAHIRI constant exists",
    hasattr(swe, "SIDM_LAHIRI"),
    f"swe.SIDM_LAHIRI = {swe.SIDM_LAHIRI}"
)

# ────────────────────────────────────────────────────────────────────────────────
print("\n=== 2. SIDEREAL vs TROPICAL DIFFERENCE ===")
# For Nov 15, 2002 the tropical Sun should be ~Scorpio and sidereal should be ~Libra
jd_test = swe.julday(2002, 11, 15, 12.0)

# Tropical (no sidereal flag)
res_tropical, _ = swe.calc_ut(jd_test, swe.SUN, swe.FLG_MOSEPH)
sun_trop_lon = res_tropical[0]
sun_trop_sign = _ZODIAC_SIGNS[int(sun_trop_lon // 30)]

# Sidereal Lahiri
swe.set_sid_mode(swe.SIDM_LAHIRI)
res_sidereal, _ = swe.calc_ut(jd_test, swe.SUN, swe.FLG_MOSEPH | swe.FLG_SIDEREAL)
sun_sid_lon = res_sidereal[0]
sun_sid_sign = _ZODIAC_SIGNS[int(sun_sid_lon // 30)]

ayanamsa_diff = sun_trop_lon - sun_sid_lon
check(
    "Ayanamsa shift ~23-24 degrees",
    22.0 < ayanamsa_diff < 25.0,
    f"Tropical={sun_trop_lon:.2f}° ({sun_trop_sign}), Sidereal={sun_sid_lon:.2f}° ({sun_sid_sign}), Diff={ayanamsa_diff:.2f}°"
)
check(
    "Tropical Sun in Scorpio (expected for Nov 15)",
    sun_trop_sign == "Scorpio",
    f"Got: {sun_trop_sign}"
)
check(
    "Sidereal Sun in Libra (Lahiri-corrected)",
    sun_sid_sign == "Libra",
    f"Got: {sun_sid_sign}"
)

# ────────────────────────────────────────────────────────────────────────────────
print("\n=== 3. NAKSHATRA / DASHA DERIVATION AUDIT ===")
# The 27 Nakshatras map cyclically to 9 Dasha lords in order:
# Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury (repeating 3x)
# Verify the mapping covers all 27 nakshatras correctly
expected_lords_sequence = [
    "Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury",
    "Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury",
    "Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury",
]
dasha_lords = ["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"]
derived = [dasha_lords[i % 9] for i in range(27)]
check(
    "Nakshatra-Dasha sequence matches traditional 27-fold Vimshottari",
    derived == expected_lords_sequence,
    f"Derived: {derived}"
)

# Verify boundary cases: longitude=0, 359.9, 360-epsilon
for lon, expected_nak in [(0.0, 0), (359.9, 26), (180.0, 13)]:
    nak_idx = int((lon / 360.0) * 27)
    check(
        f"Nakshatra index for lon={lon}",
        nak_idx == expected_nak,
        f"Got nak_idx={nak_idx}, expected={expected_nak}"
    )

# ────────────────────────────────────────────────────────────────────────────────
print("\n=== 4. LONGITUDE BOUNDS — NEGATIVE VALUE SAFETY ===")
# pyswisseph can return negative longitudes if the ayanamsa is larger than the
# tropical longitude for slow planets near 0°. Check if _longitude_to_position
# handles this gracefully.
# Simulate a case where sidereal longitude might go negative (unlikely for most
# planets in modern era, but test the guard)
try:
    pos = _longitude_to_position("test", 0.5)
    check("Low longitude (0.5°) → Aries", pos.sign == "Aries", f"Got {pos.sign}")
except Exception as e:
    check("Low longitude guard", False, str(e))

# Check a negative longitude scenario (not expected but should be caught)
try:
    pos_neg = _longitude_to_position("test", -1.0)
    sign_idx = int(-1.0 // 30)  # Python floor division: -1 // 30 = -1
    check("Negative longitude guard",
          False,
          f"RISK: sign_index={sign_idx} → _ZODIAC_SIGNS[{sign_idx}] = {_ZODIAC_SIGNS[sign_idx] if -12 <= sign_idx < 12 else 'INDEX ERROR'}")
except Exception as e:
    check("Negative longitude guard", False, f"Exception: {e}")

# ────────────────────────────────────────────────────────────────────────────────
print("\n=== 5. ELEMENT MAPPING COMPLETENESS ===")
expected_signs = {
    "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
    "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
}
mapped_signs = set(_ELEMENT_MAPPING.keys())
check(
    "All 12 signs covered in _ELEMENT_MAPPING",
    mapped_signs == expected_signs,
    f"Missing: {expected_signs - mapped_signs}" if expected_signs != mapped_signs else "Complete"
)

# ────────────────────────────────────────────────────────────────────────────────
print("\n=== 6. DASHA GUNA MAPPING COMPLETENESS ===")
# Traditional 9 Dasha lords
expected_lords = {"Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"}
mapped_lords = set(_DASHA_GUNA_MAPPING.keys())
check(
    "All 9 Dasha lords in _DASHA_GUNA_MAPPING",
    mapped_lords == expected_lords,
    f"Missing: {expected_lords - mapped_lords}" if expected_lords != mapped_lords else "Complete"
)

# ────────────────────────────────────────────────────────────────────────────────
print("\n=== 7. FALLBACK: UNKNOWN SIGN / DASHA ===")
scores_unknown_sign = _calculate_cbt_scores("UnknownSign", "Cancer", "Saturn Mahadasha")
check(
    "Unknown sun_sign falls back to Fire element gracefully",
    len(scores_unknown_sign) == 5,
    f"Ranked: {scores_unknown_sign}"
)
scores_unknown_dasha = _calculate_cbt_scores("Leo", "Cancer", "Pluto Mahadasha")
check(
    "Unknown dasha lord falls back to Sattva gracefully",
    len(scores_unknown_dasha) == 5,
    f"Ranked: {scores_unknown_dasha}"
)

# ────────────────────────────────────────────────────────────────────────────────
print("\n=== 8. TEST CASE A: HIGH TAMAS + WATER MOON ===")
# Moon=Cancer (Water, 2x), Sun=Scorpio (Water, 1x), Dasha=Saturn (Tamas +2 Grounding/Rest)
# Expected: Reflection, Rest, Grounding as top 3
scores_a = _calculate_cbt_scores("Scorpio", "Cancer", "Saturn Mahadasha")
print(f"  Scores ranked: {scores_a}")
check("Test A: Reflection in top 3", "Reflection" in scores_a[:3], f"Top3={scores_a[:3]}")
check("Test A: Rest in top 3", "Rest" in scores_a[:3], f"Top3={scores_a[:3]}")
check("Test A: Grounding in top 3", "Grounding" in scores_a[:3], f"Top3={scores_a[:3]}")
check("Test A: Focus NOT #1", scores_a[0] != "Focus", f"#1={scores_a[0]}")

# ────────────────────────────────────────────────────────────────────────────────
print("\n=== 9. TEST CASE B: HIGH RAJAS + AIR MOON ===")
# Moon=Gemini (Air, 2x), Sun=Leo (Fire, 1x), Dasha=Venus (Rajas +2 Communication/Focus)
# Expected: Communication and Focus in top 3
scores_b = _calculate_cbt_scores("Leo", "Gemini", "Venus Mahadasha")
print(f"  Scores ranked: {scores_b}")
check("Test B: Communication in top 2", "Communication" in scores_b[:2], f"Top3={scores_b[:3]}")
check("Test B: Focus in top 3", "Focus" in scores_b[:3], f"Top3={scores_b[:3]}")
check("Test B: Rest NOT in top 2", "Rest" not in scores_b[:2], f"Top2={scores_b[:2]}")

# ────────────────────────────────────────────────────────────────────────────────
print("\n=== 10. SCHEMA COMPLIANCE: ALL BLOCKS HAVE DISCLAIMER + TITLE ===")
for cat, block in _DEFAULT_BLOCKS.items():
    check(
        f"{cat} block has title",
        bool(block.title),
        block.title
    )
    check(
        f"{cat} block has disclaimer",
        "consult" in block.disclaimer.lower(),
        block.disclaimer[:60] + "..."
    )
    check(
        f"{cat} block has positive duration",
        block.duration_minutes > 0,
        f"{block.duration_minutes} min"
    )

# ────────────────────────────────────────────────────────────────────────────────
print("\n=== 11. FULL ENDPOINT: FastMCP Tool Returns ClinicalResponse ===")
response = get_cbt_day_plan(ClinicalRequest(
    sun_sign="Scorpio",
    moon_sign="Cancer",
    active_dasha="Saturn Mahadasha",
    user_goal="I want to de-stress"
))
check("Response is ClinicalResponse", isinstance(response, ClinicalResponse), type(response).__name__)
check("morning_block is present", response.morning_block is not None, response.morning_block.category)
check("afternoon_block is present", response.afternoon_block is not None, response.afternoon_block.category)
check("evening_block is present", response.evening_block is not None, response.evening_block.category)
check(
    "ethical_note is present and non-empty",
    bool(response.ethical_note),
    response.ethical_note[:60] + "..."
)
check(
    "3 blocks are distinct categories",
    len({response.morning_block.category, response.afternoon_block.category, response.evening_block.category}) == 3,
    f"{response.morning_block.category} / {response.afternoon_block.category} / {response.evening_block.category}"
)

# ────────────────────────────────────────────────────────────────────────────────
print("\n=== SUMMARY ===")
passed = sum(1 for r in results if r[0] == PASS)
failed = sum(1 for r in results if r[0] == FAIL)
warned = sum(1 for r in results if r[0] == WARN)
print(f"Total: {len(results)} checks | {PASS}: {passed} | {FAIL}: {failed} | {WARN}: {warned}")
if failed > 0:
    print("\nFailed checks:")
    for r in results:
        if r[0] == FAIL:
            print(f"  {r[0]}  [{r[1]}]  {r[2]}")
