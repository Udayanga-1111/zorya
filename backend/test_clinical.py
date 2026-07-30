from mcp_servers.clinical_server import score_cbt_plan, get_cbt_day_plan, ClinicalRequest

def test_scoring():
    # Test 1: Moon in Aries (Fire), Sun in Taurus (Earth), active Dasha Jupiter (Sattva)
    scores = score_cbt_plan("Aries", "Taurus", "Jupiter Mahadasha")
    print("Scores:", scores)
    
    req = ClinicalRequest(
        sun_sign="Taurus",
        moon_sign="Aries",
        active_dasha="Jupiter Mahadasha",
        user_goal="I want to focus and build a consistent routine"
    )
    res = get_cbt_day_plan(req)
    print("\nMorning:", res.morning_block.category)
    print("Afternoon:", res.afternoon_block.category)
    print("Evening:", res.evening_block.category)

if __name__ == "__main__":
    test_scoring()
