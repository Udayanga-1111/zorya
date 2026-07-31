"""
Zorya Pipeline Fallback Integration Test
=========================================
Tests that the pipeline completes gracefully when external dependencies fail.
We simulate an external failure by setting GROQ_API_KEY to an invalid value.
"""

import asyncio
import os
import sys
import traceback

# Force an invalid API key to trigger LLM failures
os.environ["GROQ_API_KEY"] = "gsk_invalidkey1234567890"

from orchestrator.graph import compile_graph
from orchestrator.checkpointer import get_memory_saver

TEST_USER_PROFILE = {
    "birth_date": "1994-07-15",
    "birth_time": "08:30",
    "lat": 6.9271,
    "lon": 79.8612,
    "goal": "I want to improve my daily focus and reduce anxiety.",
    "user_id": "test-user-fallback",
}

PASS = "[PASS]"
FAIL = "[FAIL]"
INFO = "[INFO]"

async def run_fallback_test():
    errors = []

    print("\n" + "=" * 60)
    print("  Zorya Backend Pipeline Fallback Test")
    print("=" * 60 + "\n")

    checkpointer = get_memory_saver()
    graph = compile_graph(checkpointer=checkpointer)

    initial_state = {
        "user_id": TEST_USER_PROFILE["user_id"],
        "thread_id": "thread-test-fallback",
        "user_profile": TEST_USER_PROFILE,
    }
    config = {"configurable": {"thread_id": "thread-test-fallback"}}

    print(f"\n{INFO} Running graph with forced invalid Groq API key...\n")

    node_results = {}
    try:
        async for event in graph.astream(initial_state, config=config, stream_mode="updates"):
            for node_name, updates in event.items():
                node_results[node_name] = updates
                keys = list(updates.keys()) if isinstance(updates, dict) else []
                print(f"  {PASS} Node completed without crashing: [{node_name}] -- keys: {keys}")
    except Exception as e:
        print(f"\n{FAIL} Pipeline execution raised an unhandled exception:")
        traceback.print_exc()
        sys.exit(1)

    print(f"\n{'-' * 60}")
    print("  Fallback Assertions")
    print(f"{'-' * 60}")

    # Check if clinical_cbt_node provided the fallback plan and error key
    clinical_updates = node_results.get("clinical_cbt_node", {})
    if "clinical_plan" in clinical_updates:
        blocks = clinical_updates["clinical_plan"].get("blocks", [])
        if len(blocks) == 3:
            print(f"  {PASS} clinical_plan contains 3 fallback blocks")
        else:
            msg = f"clinical_plan fallback blocks missing, got {len(blocks)}"
            print(f"  {FAIL} {msg}")
            errors.append(msg)
    else:
        msg = "clinical_plan not found in clinical_cbt_node output"
        print(f"  {FAIL} {msg}")
        errors.append(msg)

    if "clinical_error" in clinical_updates:
        print(f"  {PASS} clinical_error key was populated: {clinical_updates['clinical_error'][:50]}...")
    else:
        msg = "clinical_error key not populated in state"
        print(f"  {FAIL} {msg}")
        errors.append(msg)

    print(f"\n{'=' * 60}")
    if errors:
        print(f"  {FAIL} FALLBACK TEST FAILED -- {len(errors)} error(s):")
        for e in errors:
            print(f"       * {e}")
    else:
        print(f"  {PASS} FALLBACK ASSERTIONS PASSED -- Pipeline recovers gracefully!")
    print("=" * 60 + "\n")

    return len(errors) == 0

if __name__ == "__main__":
    ok = asyncio.run(run_fallback_test())
    sys.exit(0 if ok else 1)
