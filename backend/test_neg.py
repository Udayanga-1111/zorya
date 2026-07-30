import sys, os
sys.path.insert(0, os.path.abspath('.'))
import swisseph as swe
from mcp_servers.celestial_server import _longitude_to_position, _ZODIAC_SIGNS

print("--- Negative longitude edge case ---")
try:
    pos = _longitude_to_position('test', -1.0)
    idx = int(-1.0 // 30)
    sign = _ZODIAC_SIGNS[idx]
    print(f"Negative lon: sign_index={idx}, mapped sign={sign} (WRONG - should wrap to Pisces)")
except IndexError as e:
    print(f"REAL BUG - IndexError with negative longitude: {e}")
except Exception as e:
    print(f"Other: {e}")

print()
print("--- Near-0 planet longitudes in sidereal ---")
swe.set_sid_mode(swe.SIDM_LAHIRI)
jd = swe.julday(2000, 1, 1, 12.0)
for pid, name in [(swe.MEAN_NODE, "Mean Node"), (swe.SUN, "Sun"), (swe.MARS, "Mars")]:
    res, _ = swe.calc_ut(jd, pid, swe.FLG_MOSEPH | swe.FLG_SIDEREAL)
    lon = res[0]
    is_neg = lon < 0
    print(f"  {name}: lon={lon:.4f} {'<-- NEGATIVE, needs fix' if is_neg else 'OK'}")
