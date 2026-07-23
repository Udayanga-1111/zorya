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

*(No findings yet — placeholder for ZOR-7)*

---

## 🔭 Celestial MCP & Sidereal Zodiac

### [Session 3 — 2026-07-23] ZOR-5: Sidereal Lahiri Implementation

- `swe.set_sid_mode(swe.SIDM_LAHIRI)` must be called **before** `swe.calc_ut`. It is not stateless — it must be applied per-call context.
- The combined flag is `swe.FLG_MOSEPH | swe.FLG_SIDEREAL` (value = 65540). Using `FLG_MOSEPH` alone (value = 4) silently returns Tropical positions.
- The Lahiri Ayanamsa for year 2002 is approximately **23.89 degrees**. This shifts Nov 15 Sun from Tropical Scorpio (232.95°) to Sidereal Libra (209.05°) — correct for Sri Lankan Jyotisha.
- **Negative longitude guard:** `pyswisseph` can theoretically return a slightly negative sidereal longitude for planets sitting very close to 0° Aries after the Lahiri subtraction. Python's floor division accidentally maps this to sign index `-1` which points to Pisces (the last list element) — correct by coincidence, but fragile. Fixed with an explicit `longitude % 360` normalisation in `_longitude_to_position`.

### [Session 3 — 2026-07-23] ZOR-6: Clinical Vector Mapping

- The `_ELEMENT_WEIGHTS` Fire row originally assigned `Grounding=3, Focus=2`. This was revised to `Focus=3, Grounding=2` because the Rajas + Air Moon test case (Test B) requires Focus to outrank Grounding when the Rajas modifier (+2 to Focus) is active.
- The `dasha_lord` extraction splits on space: `"Saturn Mahadasha (approximate)".split(" ")[0]` → `"Saturn"`. This handles both the auto-derived `(approximate)` label from the Celestial server and any manually supplied short labels (e.g., `"Saturn Mahadasha"`).
- All 45 audit checks pass after the longitude normalisation fix. The 3 original FAIL entries in the audit were caused by Windows cp1252 terminal encoding rejecting Unicode arrow characters in the audit print output — not real code bugs.
