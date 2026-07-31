# Zorya Task Plan — Sprint 1 (July 21 – July 26, 2026)

## Active Sprint Goal

Establish the foundational infrastructure for Zorya. This includes isolating the FastMCP Python servers, wiring the basic LangGraph multi-agent pipeline, and scaffolding out both the Next.js web dashboard and the accompanying mobile application using standard JavaScript.

---

## Phase Breakdown

### Phase 1: Environment & Workspace Setup

- [x] **ZOR-1A:** Initialize Next.js 15 repository for the web dashboard (App Router, Tailwind CSS, shadcn/ui). Ensure strict use of `.js`/`.jsx` files (no TypeScript).
- [ ] **ZOR-1B:** Initialize the mobile application repository (React Native/Expo) to pair with the web platform. Ensure standard JavaScript configuration.
- [x] **ZOR-4:** Set up the Python workspace, virtual environment, and dependency management (`fastmcp`, `pyswisseph`, `pydantic`, `langgraph`) for the backend.
- [x] **ZOR-7:** Define the base LangGraph state class (`AgentState`) and construct the initial graph topology with SQLite memory checkpointer.

### Phase 2: Core MCP Infrastructure (Backend Engine)

- [x] **ZOR-5:** Wrap `pyswisseph` securely inside a FastMCP tool endpoint (Celestial MCP) to calculate planetary longitudes and transits based on coordinates and birth time.
- [x] **ZOR-6:** Construct the Clinical MCP Server with mock vector mapping dictionaries that translate planetary states into 5 CBT categories (Focus, Rest, Communication, Grounding, Reflection).
- [x] **ZOR-X:** Use the FastMCP `Client` inside LangGraph nodes instead of exposing REST/SSE endpoints.

### Phase 3: Multi-Agent AI Pipeline

- [x] **ZOR-8:** Implement the Parsing Agent node to dynamically invoke the Celestial MCP tool and validate raw outputs into strict Pydantic schemas. *(Fixed in Session 8: node now uses FastMCP in-process `Client` to route calls through the MCP protocol layer.)*
- [x] **ZOR-9:** Engineer the system prompt layer for the Clinical CBT Agent to restrict responses to evidence-based CBT habit formation.
- [x] **ZOR-G:** Draft the Ethical Guardrail Node in LangGraph to actively intercept and block deterministic or fatalistic outputs before they reach the user interface.

### Phase 4: Web & Mobile Frontend Integration

- [x] **ZOR-2:** Build the Astronomical Onboarding Form components (Web) using React Hook Form to capture Date of Birth, Time, and Location (Lat/Long).
- [x] **ZOR-3:** Build the dynamic Calendar UI and Habit Dashboard shell (Web & Mobile) to render daily/weekly focus blocks and CBT exercises.
- [x] **ZOR-Y:** Create the placeholder UI slots for the real-time Server-Sent Events (SSE) chat streaming companion.

### Phase 5: Product, Legal & Strategy

- [x] **ZOR-11:** Conduct the open-source licensing audit (confirming GPLv2 compliance path for `pyswisseph`).
- [x] **ZOR-12:** Finalize the Ethical Guardrail Rulebook, defining prohibited phrases and mapping them to positive CBT reframing for the AI prompt layer.
- [x] **ZOR-Z:** Draft standard CBT habit templates for the Clinical MCP mock data mappings.

---

## 🚀 Sprint 2 Backlog: Full-Stack Integration & Pitch Polish

### EPIC 1: Full-Stack SSE Stream Wiring

**Task: ZOR-13 — FastAPI Gateway & Next.js BFF SSE Proxy**
- **Issue Type:** Task
- **Story Points:** 5
- **Priority:** High
- **Assignee:** Backend Lead / Dev 2
- **Description:** Expose the LangGraph pipeline via `POST /stream` in `api_server.py` and create a Next.js Backend-for-Frontend (BFF) proxy at `src/app/api/agent/stream/route.js` to avoid CORS issues and secure backend execution.
- **Acceptance Criteria:**
  - [x] `api_server.py` runs on port 8000 using uvicorn.
  - [x] `POST /stream` yields LangGraph node updates via `astream(..., stream_mode="updates")`.
  - [x] Next.js `route.js` uses `export const dynamic = 'force-dynamic'` and proxies stream chunks cleanly with `Content-Type: text/event-stream`.

**Task: ZOR-14 — Dashboard Dynamic UI Hydration**
- **Issue Type:** Task
- **Story Points:** 5
- **Priority:** High
- **Assignee:** Frontend Lead / Dev 1
- **Description:** Convert `dashboard-client.jsx` to fetch live SSE streams from `/api/agent/stream` and dynamically populate `<PlanetaryInfluences/>` and `<DailyPlan/>` components, removing all hardcoded fallback arrays.
- **Acceptance Criteria:**
  - [x] `dashboard-client.jsx` manages `isStreaming`, `celestialContext`, and `clinicalPlan` state.
  - [x] `<PlanetaryInfluences/>` maps raw planetary longitudes into active transit badges.
  - [x] `<DailyPlan/>` renders the generated CBT blocks (Morning, Afternoon, Evening) progressively as SSE chunks arrive.

### EPIC 2: Onboarding Data Flow & State Management

**Task: ZOR-15 — Database Schema & Onboarding API Integration**
- **Issue Type:** Task
- **Story Points:** 3
- **Priority:** High
- **Assignee:** Full-Stack / Dev 1
- **Description:** Update Prisma schema with celestial fields (`birthDate`, `birthTime`, `latitude`, `longitude`, `onboarded`, `isApproximateTime`). Wire `POST /api/onboarding` to save telemetry and update user status.
- **Acceptance Criteria:**
  - [x] `prisma/schema.prisma` contains updated User fields and migrations pass (`npx prisma db push`).
  - [x] Client component uses OpenStreetMap Nominatim for free city-to-coordinate geocoding.
  - [x] Checking "I don't know my exact birth time" sets `birthTime = "12:00"` and `isApproximateTime = true`.
  - [x] Successful submission updates the user record, sets `onboarded = true`, and redirects to `/dashboard`.

**Task: ZOR-16 — Dashboard Empty State Guard**
- **Issue Type:** Task
- **Story Points:** 2
- **Priority:** Medium
- **Assignee:** Frontend Lead / Dev 1
- **Description:** Check user onboarding status on `/dashboard`. If `onboarded === false` or birth coordinates are missing, display an inviting Empty State Hero Banner instead of broken/mocked plans.
- **Acceptance Criteria:**
  - [x] Server component reads user profile state and passes it to `dashboard-client.jsx`.
  - [x] Non-onboarded users see a glassmorphism CTA card: "Complete Your Natal Setup to Unlock Personalized Habit Plans".
  - [x] CTA button routes directly to `/onboarding`.

### EPIC 3: Real-Time AI Companion Chat (ZOR-Y)

**Task: ZOR-17 — Conversational Agent Node & Isolated Chat Graph**
- **Issue Type:** Task
- **Story Points:** 5
- **Priority:** High
- **Assignee:** AI / Agent Developer
- **Description:** Implement `backend/agents/chat_agent.py` and construct `compile_chat_graph()`. The agent must read conversation history via LangGraph's SqliteSaver (`thread_id`) and integrate today's CBT schedule context.
- **Acceptance Criteria:**
  - [x] `chat_node` uses `ChatGroq(model="llama-3.3-70b-versatile")`.
  - [x] System prompt enforces concise micro-coaching (under 3 sentences per turn) and CBT reframing.
  - [x] Multi-turn conversation memory works smoothly using `thread_id` state checkpointer.

**Task: ZOR-18 — Token-by-Token Streaming Chat UI (/chat)**
- **Issue Type:** Task
- **Story Points:** 5
- **Priority:** High
- **Assignee:** Full-Stack / Dev 1 & Dev 2
- **Description:** Build the `/chat` page UI in `src/app/(dashboard)/chat/page.jsx`, add "AI Companion" to `sidebar.jsx`, and connect `chat-client.jsx` to `POST /api/agent/chat` using `astream_events`.
- **Acceptance Criteria:**
  - [x] `POST /chat` endpoint in `api_server.py` streams tokens using `astream_events(..., version="v2")`.
  - [x] Next.js BFF route (`/api/agent/chat`) streams tokens directly to frontend.
  - [x] `chat-client.jsx` parses incoming stream using `response.body.getReader()` for a fluid typing animation.

### EPIC 4: Safety, Compliance & Pitch Deliverables

**Task: ZOR-19 — Guardrail Interception UI & Crisis Handoff**
- **Issue Type:** Task
- **Story Points:** 3
- **Priority:** High
- **Assignee:** Frontend / AI Dev
- **Description:** If `guardrail_agent` intercepts a fatalistic prompt or crisis intent, the backend will yield a specific `guardrail_block` event. Update the frontend UI to parse this event and render a specific "Safety Modal" overriding the standard chat stream.
- **Acceptance Criteria:**
  - [x] Test prompt: "When will I die based on my chart?"
  - [x] `backend/agents/guardrail_agent.py` intercepts this and sets `is_safe = False`.
  - [x] UI renders an un-dismissible modal: "Zorya focuses strictly on personal growth. For medical or psychiatric emergencies, please contact [Resources]."
  - [x] If crisis keywords trigger `guardrail_node`, UI overrides normal response with a high-visibility support card featuring 1926 NIMH Helpline and Sri Lanka Sumithrayo contacts.

**Task: ZOR-20 — LangSmith Observability Proof & Demo Video Prep**
- **Issue Type:** Task
- **Story Points:** 2
- **Priority:** High
- **Assignee:** All Hands
- **Description:** Verify end-to-end LangSmith tracing in the Zorya-Hackathon project, capture visual graph execution proofs for the pitch deck, and record the final 3-minute video submission.
- **Acceptance Criteria:**
  - [ ] `smith.langchain.com` records complete execution trees showing `parsing_node -> clinical_cbt_node -> guardrail_node` latencies.
  - [ ] High-resolution screenshots of the multi-agent execution tree are saved for pitch slides.
  - [ ] 3-minute demo video recorded highlighting onboarding, live dashboard streaming, AI chat memory, and active guardrail interception.

---

## 🛑 Blockers & Risk Tracking

- **Risk 1 (Licensing):** ✅ RESOLVED — GPLv2 open-source declaration added in Session 18.
- **Risk 2 (Time constraints):** ✅ RESOLVED — Mobile decided as responsive web (not separate app). Full mobile responsiveness implemented Session 26.
- **Risk 3 (Agent Latency):** Multi-agent orchestrations can be slow. Next.js SSE implementation must be bulletproof to avoid user timeout on the frontend.

## 📝 Usage Instructions for AI Agents

When beginning work, check off the relevant markdown box using an `x` (e.g., `- [x] ZOR-1A`). Do not move to Phase 2 until Phase 1 core setup tasks are marked as complete. Log any technical roadblocks in the "Blockers & Risk Tracking" section.
