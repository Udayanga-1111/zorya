# Zorya Technical Findings Log

A living document recording technical insights, quirks, and resolutions discovered during development.

---

## 🐍 Python Backend & FastMCP

### [Session 2 — 2026-07-22] `uv` Package Manager Behavior

- `uv 0.11.6` is installed on the dev machine and resolves 100+ packages in ~80ms (cached).
- **Editable installs with `hatchling`** require two things when package dirs don't match the project slug:
  1. A `README.md` must exist in `backend/` (hatchling enforces this even for editable installs).
  2. `[tool.hatch.build.targets.wheel] packages = [...]` must be explicitly set when the source directories don't share the project name (`zorya_backend`).
- **Fix applied:** Added `backend/README.md` and `packages = ["mcp_servers", "agents"]` to `pyproject.toml`.

### [Session 2 — 2026-07-22] `pyswisseph` on Windows

- `pyswisseph==2.10.3.2` installs as a **pre-compiled wheel** on Windows x86-64 — no C compilation step needed.
- Imported as `import swisseph as swe` (not `pyswisseph`). The `__version__` attribute returns `"20230604"` (datestamp, not semver).
- `swe.FLG_MOSEPH` confirmed available and functional. Setting `swe.set_ephe_path('')` before calculation correctly enables Moshier mode.

### [Session 2 — 2026-07-22] `langgraph` Version Upgrade

- Installed `langgraph==1.2.9` (latest, far ahead of the `>=0.2` minimum).
- `langgraph` does **not** expose a `__version__` attribute at the top-level module — use `importlib.metadata.version("langgraph")` if version checking is needed at runtime.
- `MessagesState` from `langgraph.graph` is the correct base class for `AgentState` — it includes the `add_messages` reducer automatically.

### [Session 2 — 2026-07-22] `fastmcp` Version

- Installed `fastmcp==3.4.4` — significantly ahead of `>=2.0` minimum. API compatible.
- `FastMCP("name")` constructor and `@mcp.tool()` decorator confirmed working per skill spec.

---

## 🌐 Next.js / Frontend

*(No findings yet — placeholder for Session 3+)*

---

## 🤖 LangGraph Agent Pipeline

### [Session 5 — 2026-07-23] ZOR-7: SqliteSaver Initialization

- **Fix applied:** When providing a saver directly without a context block (e.g., for simple wrappers or long-lived FastAPI instances), initialize the SQLite connection explicitly (`sqlite3.connect(..., check_same_thread=False)`) and pass it to `SqliteSaver(conn)`.

### [Session 6 — 2026-07-25] Python Imports in Subdirectories

- When `pyproject.toml` defines the project root inside a subdirectory (`backend/`), importing local modules prefixed with the root directory name (e.g. `from backend.orchestrator import X`) will trigger a `ModuleNotFoundError` during `pytest` execution because the Python path is anchored inside `backend/`.
- **Fix applied:** Stripped all `backend.` prefixes across internal imports. Tests resolve correctly using `from orchestrator.X import Y`.

---
### [Session 9 — 2026-07-26] LangChain `with_structured_output` and Groq Models

- **Issue:** Using `with_structured_output` on smaller Groq models (like `llama-3.1-8b-instant`) frequently throws `400 tool_use_failed` because the model generates non-standard tool prefixes (e.g. `<function=ClinicalAgentOutput> {"blocks": [...]}`).
- **Fix applied:** For deterministic structured output using native LangChain tool calling bindings, upgrade to `llama-3.3-70b-versatile` which has highly reliable tool parsing. Alternatively, for 8B models, use `method="json_mode"` and explicitly instruct the model to return JSON in the system prompt.

---

### [Session 10 — 2026-07-27] ZOR-2: Telemetry Geocoding for Celestial Calculations

- **Issue:** The Python backend (`celestial_server.py`) requires exact floating-point coordinates (`lat` and `lon`) to calculate birth charts and active Dashas. A simple string like "Kandy, Sri Lanka" will break the ephemeris calculations.
- **Fix applied:** Integrated the free OpenStreetMap Nominatim API directly in the client component (`src/app/onboarding/page.jsx`). The user's city search is instantly geocoded on the frontend, allowing the precise latitude and longitude to be safely submitted via `POST /api/onboarding` and persisted to the Prisma `User` model.

---

### [Session 12 — 2026-07-27] ZOR-5: Vimshottari Dasha Accuracy

- **Issue:** Vimshottari Dasha requires extreme precision regarding the Moon's exact Nakshatra. If tropical coordinates are passed, the Moon will be placed ~24 degrees off, triggering an entirely wrong Dasha Lord schedule.
- **Fix applied:** Set `swe.set_sid_mode(swe.SIDM_LAHIRI)` and `swe.FLG_SIDEREAL` to guarantee all calculation outputs are strictly Vedic Sidereal.
- **Insight:** Time progression for Vimshottari Dasha is most accurate using the standard tropical year (365.2422 days) instead of 360-day Savana years, which introduce severe cumulative drift in long-term cycle calculations.

---

### [Session 13 — 2026-07-27] Ethical Guardrail Rulebook Strict Schema Adherence

- **Issue:** Abstracting the 4 prohibited categories (Determinism, Diagnostics, Medical Guidance, Financial) into just two boolean fields (`violates_fatalism`, `violates_diagnostic`) in the Pydantic schema weakened the downstream parsing logic.
- **Fix applied:** Always create a strictly 1-to-1 schema field mapping for every explicit prohibition in an ethical rulebook. Added `violates_medical_advice` and `violates_financial` to `GuardrailResponse`, allowing the LLM's structured output parser to distinctly isolate the violation vectors.
- **Insight:** Verbatim system prompts (when provided by a product or legal team, such as in the Rulebook Section 4) must be used exactly as written rather than "semantically approximated" to ensure compliance liability remains covered.
