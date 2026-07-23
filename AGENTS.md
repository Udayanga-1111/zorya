# Zorya Workspace Instructions — IDEALIZE 2026 (Team: CtrlFreaks)

## 1. Project Overview & Core Concept

Zorya is a proactive, autonomous web dashboard that translates mathematically modeled planetary time cycles (Dashas) into a dynamic, evidence-based Cognitive Behavioral Therapy (CBT) planning calendar.

The application solves the "One Size Fits All" fallacy in self-improvement by evaluating active planetary transits against daily schedules to recommend optimal behavioral routines, utilizing a multi-agent AI system for dynamic micro-habit coaching.

## 2. Technical Stack & Coding Standards

### Frontend Web Stack

- **Framework:** Next.js 15 (App Router).
- **Language:** Use standard JavaScript (.jsx/.js files). Do not use TypeScript.
- **Styling & UI:** Tailwind CSS and shadcn/ui.
- **Data Streaming:** Implement Server-Sent Events (SSE) to natively stream reactive agent responses in real-time.
- **Rules:** Keep components modular. Ensure responsive design prioritizing clean, low-latency dashboard interfaces.

### Backend & MCP Infrastructure

- **Framework:** Python, utilizing the decentralized FastMCP framework.
- **Celestial Server:** Wraps `pyswisseph` as an isolated tool. It calculates high-fidelity astronomical telemetry (birth charts, transits) via structured URI resources.
- **Clinical Server:** Houses local vector mappings that translate raw astronomical longitudes directly into granular, context-aware CBT time blocks.

### AI Orchestration & Multi-Agent Logic

- **Framework:** LangGraph for cyclical agent memory and multi-agent hierarchical state.
- **State Saving:** Encrypted PostgreSQL or SQLite for conversation and habit state persistence.
- **Data Models:** Use strict Pydantic validated data models for all outputs passing between MCP tools and AI agents.

## 3. Multi-Agent Orchestration Schema

Zorya is powered by three specialized, cooperative LLM agents:

1. **The Parsing Agent:** An automated context collector that calls the Celestial MCP tool for instant transit data, outputting clean Pydantic data.
2. **The Clinical CBT Agent:** Evaluates astronomical inputs against the Clinical MCP Server's logic to safely tailor psychological behavioral tasks.
3. **The Proactive Prompt Agent:** An autonomous event-driven loop that tracks live user habit interactions and offers accountability check-ins if routines deviate.

## 4. Strict Ethical Guardrails (CRITICAL)

Zorya is a mental wellness and adaptive self-improvement tool. It operates in a highly sensitive domain. Agents generating code, prompts, or UI copy must strictly adhere to the following semantic boundaries:

- **NO Determinism:** Actively intercept, filter, and block any deterministic, fatalistic, or predictive claims (e.g., financial, medical, or health prophecies).
- **Practical Application:** All astronomical data must be strictly confined to practical personal growth, behavioral habits, and mindfulness strategies.
- **Medical Disclaimer:** Always maintain clear UI disclaimers that Zorya does not replace professional clinical therapy or medical diagnostics.

## 5. Development Workflow & Sprint 1 Goals

- **Deadline:** August 3, 2026.
- **Current Phase:** Sprint 1 (Core Engine & MCP Infrastructure).
- **Objectives:**
  - Initialize Next.js 15 dashboard shell and onboarding form.
  - Set up FastMCP `pyswisseph` wrapper tool.
  - Establish LangGraph multi-agent structure (Parsing Agent -> Clinical CBT Agent) with SQLite checkpointer.
- **Documentation:** Log daily completed tasks in `progress.md` and reference `task_plan.md` before initiating new development steps.

## 6. Continuous Memory Maintenance

- **Rule:** Before completing any prompt that alters code or project state, refer to `.agents/rules/session-sync.md` and automatically update `task_plan.md`, `progress.md`, and `findings.md`.
