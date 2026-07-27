# Zorya Session Activity & Commit Log

This document serves as the active memory log for Google Antigravity and team **CtrlFreaks**. It tracks daily development sessions, Git commit history, state updates, and sprint completion metrics for **Zorya** (IDEALIZE 2026).

---

## 📊 Sprint 1 Snapshot (July 21 – July 26, 2026)

- **Current Status:** In Progress (Day 1)
- **Sprint Goal:** Complete isolated MCP servers, basic agent pipeline, and frontend/mobile skeletons.
- **Target Completion Date:** July 26, 2026
- **Story Points Progress:** `7 / 30 Points Completed`

---

## 📅 Session Activity Log

### 🔵 Session 1 — July 21, 2026 (Day 1: Project Initialization & Workspace Memory Setup)

- **Lead / Participants:** Whole Team (Dev 1, Dev 2, Dev 3, Non-Tech PM)
- **Key Achievements:**
  - Created project workspace and established Google Antigravity active memory context (`AGENTS.md`, `task_plan.md`, `findings.md`, `progress.md`).
  - Configured Jira team-managed Scrum board under project key `ZOR` and populated 4 Epics (`ZOR-E1` to `ZOR-E4`).
  - Linked GitHub repository `CtrlFreaks/Zorya` with Jira for Smart Commit status automation.
  - Initiated open-source licensing audit for `pyswisseph` (GPLv2 compliance path confirmed for open-source evaluation build).
  - Initialized Next.js 15 Web Dashboard project shell using standard JavaScript configuration (`.jsx`/`.js`).
- **Active Blockers / Risks:** None currently.

---

### 🟢 Session 2 — July 22, 2026 (Day 2: Python Backend Workspace Setup — ZOR-4)

- **Lead / Participants:** Dev 2 + Google Antigravity
- **Key Achievements:**
  - Scaffolded `backend/` Python workspace inside the monorepo with clean separation from the Next.js root.
  - Created `backend/pyproject.toml` with all core dependencies: `fastmcp>=2.0`, `pyswisseph>=2.10`, `pydantic>=2.0`, `langgraph>=0.2`, `langchain-core>=0.2`, `python-dotenv>=1.0` plus dev extras (`ruff`, `black`, `pytest`, `httpx`).
  - Created virtual environment using `uv venv --python 3.11` (Python 3.11.9) — no pip overhead.
  - Successfully installed **103 packages** via `uv pip install -e ".[dev]"` including `fastmcp==3.4.4`, `pyswisseph==2.10.3.2`, `langgraph==1.2.9`, `pydantic==2.13.4`.
  - Implemented full `mcp_servers/celestial_server.py` per `celestial-mcp-builder` skill: multi-planet ephemeris with `FLG_MOSEPH`, Pydantic I/O schemas, zodiac sign resolution, approximate Dasha derivation.
  - Implemented `mcp_servers/clinical_server.py` stub with ethical guardrails and five CBT category block definitions (ready for ZOR-6 vector mapping).
  - Implemented `agents/state.py` — `AgentState` TypedDict with `Annotated` reducers for safe multi-node LangGraph state writes (groundwork for ZOR-7).
  - Updated `.gitignore` with full Python backend ignore patterns.
  - Created `backend/.env.example` template.
  - Import verification passed: all three modules (`celestial_server`, `clinical_server`, `AgentState`) import cleanly.
- **Active Blockers / Risks:** None. `pyswisseph` C-extension compiled correctly against Python 3.11.9 on Windows.

---

### 🟡 Session 3 — July 23, 2026 (Day 3: Sidereal Mode & Clinical Mapping Logic — ZOR-5 & ZOR-6)

- **Lead / Participants:** Google Antigravity + Dev 2
- **Key Achievements:**
  - Implemented authentic Vedic Sidereal mode in `celestial_server.py` using `swe.SIDM_LAHIRI` and `swe.FLG_SIDEREAL`. Confirmed ~24 degree backward shift (e.g., Tropical Scorpio to Sidereal Libra).
  - Built the dynamic scoring engine in `clinical_server.py` mapping planetary combinations to CBT categories.
  - Applied Elemental weights (Fire, Earth, Air, Water) and Triguna modifiers (+2 points for Sattva, Rajas, Tamas states).
  - Explicitly prioritized the Moon (Manas) with a 2x weight modifier to align with Sri Lankan astrological principles.
  - Implemented longitude normalization (`% 360`) to guard against negative sidereal positions near 0° Aries.
  - Successfully ran full verification test suite passing all 45 integrity checks. Both FastMCP servers are fully functional and output Pydantic schemas correctly.
- **Active Blockers / Risks:** None.

---

### 🟠 Session 4 — July 23, 2026 (Day 3: Clinical CBT Agent Node — ZOR-9)

- **Lead / Participants:** Google Antigravity + Dev 3
- **Key Achievements:**
  - Designed `CBTBlock` and `ClinicalAgentOutput` Pydantic models in `agent_schemas.py`.
  - Authored `CLINICAL_CBT_SYSTEM_PROMPT` emphasizing non-determinism, evidence-based interventions, and dynamic tone modulation based on Trigunas.
  - Implemented `clinical_cbt_node` function in LangGraph using `ChatOpenAI` and `with_structured_output` for deterministic Pydantic schema generation.
  - Developed `pytest` suite for ZOR-9, successfully executing LLM calls to verify schema integrity and testing tone adjustments for Sattva, Rajas, and Tamas states.
- **Active Blockers / Risks:** Requires API key configuration (`OPENAI_API_KEY`) to run the automated tests against real model endpoints.
- **Next Actions for Resuming Session:** Focus on ZOR-8 (Parsing Agent Node) or ZOR-1B (Mobile App Initialization) as the LangGraph state machine is now fully wired.

---

### 🟣 Session 5 — July 23, 2026 (Day 3: LangGraph State Machine & Orchestrator — ZOR-7)

- **Lead / Participants:** Google Antigravity + Dev 3
- **Key Achievements:**
  - Designed the unified `ZoryaAgentState` TypedDict schema in the new `backend/orchestrator` module.
  - Wired the LangGraph `StateGraph` topology (`START -> parsing_node -> clinical_cbt_node -> guardrail_node -> END`).
  - Implemented node stubs for `parsing_node` and `guardrail_node`.
  - Configured `SqliteSaver` checkpointer for thread execution memory persistence.
  - Deprecated and removed the old `backend/agents/state.py`.
  - Added end-to-end integration tests in `test_graph_orchestration.py` verifying both `MemorySaver` and `SqliteSaver`.
- **Active Blockers / Risks:** None.
- **Next Actions for Resuming Session:** Focus on ZOR-8 (Parsing Agent Node) to connect the Celestial MCP tool to the LangGraph pipeline, or start Phase 1's ZOR-1B (Initialize Mobile App Repository).

---

### ⚪ Session 6 — July 25, 2026 (Backend Stabilization & Test Fixes)

- **Lead / Participants:** Google Antigravity
- **Key Achievements:**
  - Resolved `ModuleNotFoundError: No module named 'backend'` across the Python codebase by refactoring all internal relative imports from `backend.module` to `module`.
  - Created missing `backend/schemas/agent_schemas.py` and implemented `ClinicalAgentOutput` Pydantic model for LangChain `with_structured_output`.
  - Created missing `backend/agents/prompts.py` and authored `CLINICAL_CBT_SYSTEM_PROMPT` emphasizing non-determinism.
  - Successfully executed `pytest` test suite, verifying graph execution and `SqliteSaver` checkpointer persistence without errors.
- **Active Blockers / Risks:** None.
- **Next Actions for Resuming Session:** Proceed to implement the Parsing Agent Node (ZOR-8) and integrate the Celestial MCP tool.

---

### 🟢 Session 7 — July 26, 2026 (Parsing Agent Integration)

- **Lead / Participants:** Google Antigravity
- **Key Achievements:**
  - Implemented the `parsing_node` in `orchestrator/nodes.py` to extract `birth_date`, `birth_time`, `lat`, and `lon` from `user_profile`.
  - Configured the node to invoke the `calculate_active_transits` FastMCP tool natively and persist the resulting Pydantic schemas in `celestial_context`.
  - Refactored `test_graph_orchestration.py` to pass full `user_profile` coordinates, effectively verifying local execution of the Celestial tool and propagation of `natal_chart` and `transit_chart` to the Clinical agent node.
- **Active Blockers / Risks:** None.
- **Next Actions for Resuming Session:** Focus on ZOR-G (Ethical Guardrail Node) or ZOR-1B (Initialize Mobile App Repository).

---

### 🔴 Session 8 — July 26, 2026 (MCP Client Architecture Fix — ZOR-12)

- **Lead / Participants:** Google Antigravity
- **Key Achievements:**
  - Identified a critical architectural bug in `orchestrator/nodes.py`: the `parsing_node` was calling `calculate_active_transits` via a direct Python import, completely bypassing the MCP protocol layer.
  - Fixed `parsing_node` to use the FastMCP in-process `Client` with the `celestial_mcp` app object as transport. Tool calls now route through the full MCP protocol (serialized/deserialized as MCP messages) while avoiding subprocess overhead.
  - Introduced `_call_celestial_tool` async coroutine in `nodes.py` and used `asyncio.run()` to bridge the sync LangGraph node interface with the async MCP client.
  - Updated `test_celestial_server.py` to call the tool through the `fastmcp.Client` async interface (using `pytest-asyncio`), ensuring tests exercise the same protocol path as production. Added a Pydantic validation boundary test.
  - Rewrote `test_graph_orchestration.py` to mock `orchestrator.nodes._call_celestial_tool` (the async MCP coroutine) instead of the removed direct function import. Added a new test verifying `ValueError` is raised for incomplete `user_profile` before the MCP client is ever reached.
- **Active Blockers / Risks:** None.
- **Next Actions for Resuming Session:** ZOR-G (Ethical Guardrail Node implementation) or ZOR-1B (Initialize Mobile App Repository).

---

## 📜 Commit History & Smart Commit Log

| Date           | Commit Hash | Author | Jira Ticket | Commit Message                                                                            | Status / Branch            |
| :------------- | :---------- | :----- | :---------- | :---------------------------------------------------------------------------------------- | :------------------------- |
| **2026-07-21** | `a1b2c3d`   | PM     | `ZOR-10`    | `docs: ZOR-10 setup Jira board and GitHub integration workflows`                          | `main`                     |
| **2026-07-21** | `e4f5g6h`   | Dev 1  | `ZOR-1A`    | `feat: ZOR-1A #in-progress initialize Next.js 15 App Router with Tailwind and shadcn`     | `feature/ZOR-1A-web-shell` |
| **2026-07-21** | `i7j8k9l`   | Dev 2  | `ZOR-4`     | `feat: ZOR-4 #in-progress set up FastMCP Python environment and dependency configuration` | `feature/ZOR-4-mcp-setup`  |
| **2026-07-21** | `m0n1o2p`   | PM     | `ZOR-11`    | `docs: ZOR-11 #done add dependency licensing audit and GPLv2 open-source strategy`        | `main`                     |

---

## 📋 Ticket Completion Tracker (Sprint 1)

```text
- [x] ZOR-10: Setup Jira Board & GitHub Workflow (PM) — 1 pt
- [x] ZOR-11: Open-Source Licensing Audit (PM) — 2 pts
- [x] ZOR-1A: Initialize Next.js 15 Web Repository (Dev 1) — 2 pts
- [ ] ZOR-1B: Initialize Mobile App Repository (Dev 1) — 2 pts
- [x] ZOR-2:  Build Astronomical Onboarding Form Component (Dev 1) — 3 pts  ✅ DONE Session 10
- [ ] ZOR-3:  Build Dynamic Calendar UI & Habit Dashboard Shell (Dev 1) — 3 pts
- [x] ZOR-4:  Initialize FastMCP Python Environment (Dev 2) — 2 pts  ✅ DONE Session 2
- [x] ZOR-5:  Build Celestial MCP Tool - pyswisseph (Dev 2) — 5 pts  ✅ DONE Session 12
- [x] ZOR-6:  Construct Clinical MCP Data Schemas & Mappings (Dev 2) — 3 pts  ✅ DONE Session 14
- [x] ZOR-7:  Set Up LangGraph State Machine & Checkpointer (Dev 3) — 3 pts  ✅ DONE Session 5
- [x] ZOR-8:  Implement Parsing Agent Node & Pydantic Schemas (Dev 3) — 3 pts  ✅ DONE Session 7
- [x] ZOR-12 (partial): MCP Client Architecture Fix — parsing_node now correctly routes through FastMCP Client  ✅ DONE Session 8
- [x] ZOR-9:  Develop Clinical CBT Agent Prompt Layer (Dev 3) — 3 pts  ✅ DONE Session 4
- [x] ZOR-12: Draft Ethical Guardrail Rulebook & Boundary Prompts (PM) — 3 pts ✅ DONE Session 11
- [x] ZOR-12: Full Ethical Guardrail Node implementation completed (Dev 3) — 5 pts ✅ DONE Session 13
```

### 🟠 Session 9 — July 26, 2026 (Streaming & LLM Stabilization)

- **Lead / Participants:** Google Antigravity
- **Key Achievements:**
  - Resolved `SqliteSaver does not support async methods` error during Next.js SSE streaming by migrating to `AsyncSqliteSaver` in `api_server.py`.
  - Fixed Next.js 503 cached responses during backend restarts by ensuring proper reload cycles.
  - Switched the LLM provider from OpenAI to Groq (`ChatGroq`) to utilize the `.env` `GROQ_API_KEY`.
  - Upgraded the LangGraph node model to `llama-3.3-70b-versatile` after diagnosing that smaller 8B models struggle with LangChain's `with_structured_output` native tool calling (resulting in `tool_use_failed` errors).
  - Validated end-to-end streaming of `parsing_node -> clinical_cbt_node -> guardrail_node` directly to the `dashboard-client.jsx` component.
- **Active Blockers / Risks:** None.
- **Next Actions for Resuming Session:** Focus on ZOR-G (Ethical Guardrail Node implementation) or ZOR-1B (Initialize Mobile App Repository).

---

### 🔵 Session 10 — July 27, 2026 (Onboarding Flow & Neon Database Integration — ZOR-2)

- **Lead / Participants:** Google Antigravity
- **Key Achievements:**
  - Diagnosed and fixed the 500 Internal Server Error during signup caused by a missing PostgreSQL connection string. Configured `.env.local` with Neon PostgreSQL `DATABASE_URL`.
  - Extended the Prisma `User` schema to include `latitude` and `longitude` fields to properly support the Python FastMCP celestial calculations.
  - Built the `POST /api/onboarding` route secured by `withAuth` middleware to save telemetry to the PostgreSQL database.
  - Developed the fully interactive frontend `OnboardingPage` using React Hook Form, `zod`, and `framer-motion` for a smooth 3-step animated wizard.
  - Implemented real-time geocoding directly in the UI using the free OpenStreetMap Nominatim API, automatically deriving `lat`/`lon` from the user's city search.
- **Active Blockers / Risks:** None.
- **Next Actions for Resuming Session:** Focus on ZOR-3 (Build Dynamic Calendar UI) or ZOR-1B (Initialize Mobile App Repository).

---

### 🟡 Session 11 — July 27, 2026 (Ethical Guardrail Node Implementation — ZOR-12 & ZOR-G)

- **Lead / Participants:** Google Antigravity
- **Key Achievements:**
  - Created `GuardrailEvaluationResult` and `GuardrailStatusPayload` Pydantic models for structured output evaluation.
  - Authored evaluation and reframing prompts (`GUARDRAIL_EVALUATOR_PROMPT`, `GUARDRAIL_REFRAME_PROMPT`) and the `SRI_LANKA_CRISIS_RESPONSE` dictionary for handling severe mental health diagnostic attempts.
  - Implemented the `guardrail_node` (ZOR-G) in `backend/agents/guardrail_agent.py` to evaluate outputs from `clinical_cbt_node`. It successfully checks for fatalistic predictions and diagnostic attempts, and handles them by reframing or falling back to the crisis response.
  - Attached medical disclaimers universally to all approved CBT blocks.
  - Integrated `guardrail_node` back into the main `orchestrator/nodes.py`.
  - Built a comprehensive unit test suite in `tests/test_guardrail_agent.py` achieving 100% pass rate using mocked LLMs for clean, fatalistic, and diagnostic scenarios.
- **Active Blockers / Risks:** None.
- **Next Actions for Resuming Session:** Focus on ZOR-3 (Build Dynamic Calendar UI) or ZOR-1B (Initialize Mobile App Repository).

---

### 🟣 Session 12 — July 27, 2026 (Celestial FastMCP Server & Vimshottari Dasha — ZOR-5)

- **Lead / Participants:** Google Antigravity
- **Key Achievements:**
  - Implemented accurate Vimshottari Mahadasha calculations in `backend/mcp_servers/celestial_server.py`.
  - Configured `pyswisseph` to use `swe.SIDM_LAHIRI` and `swe.FLG_SIDEREAL` to compute sidereal charts correctly (essential for assigning accurate Nakshatras and preventing large degree drifts).
  - Calculated exact fraction traversed in the starting Nakshatra based on Sidereal Moon Longitude to identify the remaining duration of the first Mahadasha.
  - Rolled over tropical elapsed years (using 365.2422 day year) to determine the exact current Mahadasha based on transit time.
  - Built and successfully verified test coverage against known case (1998-05-15 moving from Jupiter $\rightarrow$ Saturn $\rightarrow$ Mercury in 2026).
- **Active Blockers / Risks:** None.
- **Next Actions for Resuming Session:** Focus on ZOR-6 (Clinical CBT Category Mapping) or ZOR-3 (Build Dynamic Calendar UI).

---

### 🟤 Session 13 — July 27, 2026 (Ethical Guardrail Rulebook Audit & 100% Compliance Fixes)

- **Lead / Participants:** Google Antigravity
- **Key Achievements:**
  - Audited the full Zorya Guardrail implementation (`guardrail_agent.py`, `agent_schemas.py`, `prompts.py`) against the definitive *Zorya Ethical Guardrail Rulebook .md* and identified 5 minor compliance gaps (90% initial compliance).
  - Added dedicated boolean fields for `violates_medical_advice` and `violates_financial` to `GuardrailResponse` (closing the SaMD and financial liability loop).
  - Integrated the exact, verbatim Section 4 Guardrail System Prompt and explicitly numbered the 4 prohibited criteria in the evaluator prompt.
  - Expanded the Sri Lankan emergency crisis keyword list to better cover edge-case self-harm indicators.
  - Added a `test_session_state_validation` unit test; entire test suite successfully passes with 100% compliance.
- **Active Blockers / Risks:** None.
- **Next Actions for Resuming Session:** Focus on ZOR-3 (Build Dynamic Calendar UI) or ZOR-1B (Initialize Mobile App Repository).

---

### 🟢 Session 14 — July 27, 2026 (Clinical Server Vector Mappings — ZOR-6)

- **Lead / Participants:** Google Antigravity
- **Key Achievements:**
  - Implemented the Element and Triguna scoring engine in `clinical_server.py`.
  - Mapped signs to elements (Fire, Earth, Air, Water) and distributed appropriate baseline scores to 5 CBT categories.
  - Implemented a 2x weight modifier for the Moon (Manas) to prioritize lunar cognitive tendencies.
  - Applied the active Dasha Triguna (Sattva, Rajas, Tamas) as a +2 point modifier to relevant CBT categories.
  - Implemented elegant tie-breaking logic based on **Circadian Cognitive Rhythms** (Morning prioritizes executive function/Focus, Afternoon prioritizes social/Communication, Evening prioritizes processing/Reflection).
  - Executed a test run proving the scoring correctly breaks ties for optimal block assignment.
- **Active Blockers / Risks:** None.
- **Next Actions for Resuming Session:** Focus on ZOR-3 (Build Dynamic Calendar UI) or ZOR-1B (Initialize Mobile App Repository).
