# Zorya Task Plan — Sprint 1 (July 21 – July 26, 2026)

## Active Sprint Goal

Establish the foundational infrastructure for Zorya. This includes isolating the FastMCP Python servers, wiring the basic LangGraph multi-agent pipeline, and scaffolding out both the Next.js web dashboard and the accompanying mobile application using standard JavaScript.

---

## Phase Breakdown

### Phase 1: Environment & Workspace Setup

- [x] **ZOR-1A:** Initialize Next.js 15 repository for the web dashboard (App Router, Tailwind CSS, shadcn/ui). Ensure strict use of `.js`/`.jsx` files (no TypeScript).
- [ ] **ZOR-1B:** Initialize the mobile application repository (React Native/Expo) to pair with the web platform. Ensure standard JavaScript configuration.
- [x] **ZOR-4:** Set up the Python workspace, virtual environment, and dependency management (`fastmcp`, `pyswisseph`, `pydantic`, `langgraph`) for the backend.
- [ ] **ZOR-7:** Define the base LangGraph state class (`AgentState`) and construct the initial graph topology with SQLite memory checkpointer.

### Phase 2: Core MCP Infrastructure (Backend Engine)

- [ ] **ZOR-5:** Wrap `pyswisseph` securely inside a FastMCP tool endpoint (Celestial MCP) to calculate planetary longitudes and transits based on coordinates and birth time.
- [ ] **ZOR-6:** Construct the Clinical MCP Server with mock vector mapping dictionaries that translate planetary states into 5 CBT categories (Focus, Rest, Communication, Grounding, Reflection).
- [ ] **ZOR-X:** Expose REST or SSE endpoints from the FastMCP tools so they can be queried by the LangGraph orchestrator.

### Phase 3: Multi-Agent AI Pipeline

- [ ] **ZOR-8:** Implement the Parsing Agent node to dynamically invoke the Celestial MCP tool and validate raw outputs into strict Pydantic schemas.
- [ ] **ZOR-9:** Engineer the system prompt layer for the Clinical CBT Agent to restrict responses to evidence-based CBT habit formation.
- [ ] **ZOR-G:** Draft the Ethical Guardrail Node in LangGraph to actively intercept and block deterministic or fatalistic outputs before they reach the user interface.

### Phase 4: Web & Mobile Frontend Integration

- [ ] **ZOR-2:** Build the Astronomical Onboarding Form components (Web & Mobile) using React Hook Form to capture Date of Birth, Time, and Location (Lat/Long).
- [ ] **ZOR-3:** Build the dynamic Calendar UI and Habit Dashboard shell (Web & Mobile) to render daily/weekly focus blocks and CBT exercises.
- [ ] **ZOR-Y:** Create the placeholder UI slots for the real-time Server-Sent Events (SSE) chat streaming companion.

### Phase 5: Product, Legal & Strategy

- [ ] **ZOR-11:** Conduct the open-source licensing audit (confirming GPLv2 compliance path for `pyswisseph`).
- [ ] **ZOR-12:** Finalize the Ethical Guardrail Rulebook, defining prohibited phrases and mapping them to positive CBT reframing for the AI prompt layer.
- [ ] **ZOR-Z:** Draft standard CBT habit templates for the Clinical MCP mock data mappings.

---

## 🛑 Blockers & Risk Tracking

- **Risk 1 (Licensing):** Ensuring the open-source declaration is visible in the repo to satisfy `pyswisseph` GPLv2 requirements for the competition.
- **Risk 2 (Time constraints):** Managing the dual-platform frontend development (Web + Mobile App) within the 13-day hackathon window. Ensure shared UI logic where possible.
- **Risk 3 (Agent Latency):** Multi-agent orchestrations can be slow. Next.js SSE implementation must be bulletproof to avoid user timeout on the frontend.

## 📝 Usage Instructions for AI Agents

When beginning work, check off the relevant markdown box using an `x` (e.g., `- [x] ZOR-1A`). Do not move to Phase 2 until Phase 1 core setup tasks are marked as complete. Log any technical roadblocks in the "Blockers & Risk Tracking" section.
