"""
Zorya Pipeline Integration Test
================================
Tests the full pipeline: parsing_node -> clinical_cbt_node -> guardrail_node
using a MemorySaver (no DB I/O), real user coordinates (Colombo, Sri Lanka),
and asserts that no default fallback values appear in the output.

Run from backend/ directory:
    python test_pipeline_integration.py
"""

import asyncio
import sys
import traceback

# ── Test user: born in Colombo, Sri Lanka ─────────────────────────────────────
TEST_USER_PROFILE = {
    "birth_date": "1994-07-15",
    "birth_time": "08:30",
    "lat": 6.9271,
    "lon": 79.8612,
    "goal": "I want to improve my daily focus and reduce anxiety.",
    "user_id": "test-user-pipeline",
}

PASS = "[PASS]"
FAIL = "[FAIL]"
INFO = "[INFO]"

async def run_pipeline():
    errors = []

    print("\n" + "=" * 60)
    print("  Zorya Backend Pipeline Integration Test")
    print("=" * 60 + "\n")

    # ── Import the graph and MemorySaver ─────────────────────────────────────
    try:
        from orchestrator.graph import compile_graph
        from orchestrator.checkpointer import get_memory_saver
        print(f"{PASS} Imports resolved: orchestrator.graph, orchestrator.checkpointer")
    except ImportError as e:
        print(f"{FAIL} Import failed: {e}")
        traceback.print_exc()
        sys.exit(1)

    checkpointer = get_memory_saver()
    graph = compile_graph(checkpointer=checkpointer)
    print(f"{PASS} Graph compiled with MemorySaver")

    # ── Build initial state ───────────────────────────────────────────────────
    initial_state = {
        "user_id": TEST_USER_PROFILE["user_id"],
        "thread_id": "thread-test-pipeline",
        "user_profile": TEST_USER_PROFILE,
    }
    config = {"configurable": {"thread_id": "thread-test-pipeline"}}

    # ── Stream events ─────────────────────────────────────────────────────────
    print(f"\n{INFO} Running graph with stream_mode='updates'...\n")

    node_results = {}
    try:
        async for event in graph.astream(initial_state, config=config, stream_mode="updates"):
            for node_name, updates in event.items():
                node_results[node_name] = updates
                keys = list(updates.keys()) if isinstance(updates, dict) else []
                print(f"  {PASS} Node completed: [{node_name}] -- keys written: {keys}")
    except Exception as e:
        print(f"\n{FAIL} Pipeline execution raised an exception:")
        traceback.print_exc()
        sys.exit(1)

    # ── Assertions ────────────────────────────────────────────────────────────
    print(f"\n{'-' * 60}")
    print("  Assertions")
    print(f"{'-' * 60}")

    # 1. All three nodes must have run
    expected_nodes = {"parsing_node", "clinical_cbt_node", "guardrail_node"}
    for node in expected_nodes:
        if node in node_results:
            print(f"  {PASS} {node} ran and produced state updates")
        else:
            msg = f"{node} did not run or produced no updates"
            print(f"  {FAIL} {msg}")
            errors.append(msg)

    # 2. celestial_context must be present and not a fallback
    celestial = None
    for node_updates in node_results.values():
        if isinstance(node_updates, dict) and "celestial_context" in node_updates:
            celestial = node_updates["celestial_context"]
            break

    if celestial:
        print(f"  {PASS} celestial_context is present in state")

        error_flag = celestial.get("error") or celestial.get("fallback")
        if error_flag:
            msg = f"celestial_context contains fallback/error flag: {error_flag}"
            print(f"  {FAIL} {msg}")
            errors.append(msg)
        else:
            print(f"  {PASS} celestial_context has no fallback/error flag")

        transit_chart = celestial.get("transit_chart", {})
        moon_sign = transit_chart.get("moon", {}).get("sign", "")
        if moon_sign:
            print(f"  {PASS} transit_chart.moon.sign = '{moon_sign}'")
        else:
            msg = "transit_chart.moon.sign is missing"
            print(f"  {FAIL} {msg}")
            errors.append(msg)

        natal_chart = celestial.get("natal_chart", {})
        sun_sign = natal_chart.get("sun", {}).get("sign", "")
        if sun_sign:
            print(f"  {PASS} natal_chart.sun.sign = '{sun_sign}'")
        else:
            msg = "natal_chart.sun.sign is missing"
            print(f"  {FAIL} {msg}")
            errors.append(msg)

        dasha = celestial.get("active_dasha", "")
        if dasha:
            print(f"  {PASS} active_dasha = '{dasha}'")
        else:
            msg = "active_dasha is missing from celestial_context"
            print(f"  {FAIL} {msg}")
            errors.append(msg)
    else:
        msg = "celestial_context not found in any node output"
        print(f"  {FAIL} {msg}")
        errors.append(msg)

    # 3. clinical_plan must be present and have blocks
    clinical_plan = None
    for node_updates in node_results.values():
        if isinstance(node_updates, dict) and "clinical_plan" in node_updates:
            clinical_plan = node_updates["clinical_plan"]
            break

    if clinical_plan:
        print(f"  {PASS} clinical_plan is present in state")
        blocks = clinical_plan.get("blocks", [])
        if blocks:
            print(f"  {PASS} clinical_plan has {len(blocks)} block(s)")
        else:
            msg = "clinical_plan has no blocks"
            print(f"  {FAIL} {msg}")
            errors.append(msg)
    else:
        msg = "clinical_plan not found in any node output"
        print(f"  {FAIL} {msg}")
        errors.append(msg)

    # 4. guardrail must not have flagged a safe run
    guardrail_flagged = None
    for node_updates in node_results.values():
        if isinstance(node_updates, dict) and "guardrail_flagged" in node_updates:
            guardrail_flagged = node_updates["guardrail_flagged"]
            break

    if guardrail_flagged is False:
        print(f"  {PASS} guardrail_flagged = False (plan is safe)")
    elif guardrail_flagged is True:
        msg = "guardrail flagged the pipeline output -- check guardrail_reason"
        print(f"  {FAIL} {msg}")
        errors.append(msg)
    else:
        print(f"  {INFO} guardrail_flagged key not emitted (None/absent in updates-mode)")

    # 5. GPS stripping: user_profile in guardrail output must not contain lat/lon
    guardrail_updates = node_results.get("guardrail_node", {})
    stripped_profile = guardrail_updates.get("user_profile", None)
    if stripped_profile is not None:
        leaked = [k for k in ("lat", "lon", "latitude", "longitude") if k in stripped_profile]
        if leaked:
            msg = f"GPS coordinates leaked in guardrail user_profile output: {leaked}"
            print(f"  {FAIL} {msg}")
            errors.append(msg)
        else:
            print(f"  {PASS} GPS coordinates stripped cleanly from guardrail user_profile")

    # ── Summary ───────────────────────────────────────────────────────────────
    print(f"\n{'=' * 60}")
    if errors:
        print(f"  {FAIL} PIPELINE TEST FAILED -- {len(errors)} error(s):")
        for e in errors:
            print(f"       * {e}")
    else:
        print(f"  {PASS} ALL ASSERTIONS PASSED -- Pipeline is clean!")
    print("=" * 60 + "\n")

    return len(errors) == 0

if __name__ == "__main__":
    ok = asyncio.run(run_pipeline())
    sys.exit(0 if ok else 1)
