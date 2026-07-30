# Zorya 🌅

**An AI Health, Mental Wellness, & Adaptive Self-Improvement Web Platform**

## Problem Statement

*   **The "One-Size-Fits-All" Fallacy:** Modern self-improvement platforms rely on static daily trackers (e.g., waking up early or generic meditation intervals) that ignore unique biological, psychological, and situational variations of the individual.
*   **The Stigma & Access Metric:** Public support infrastructure is heavily congested, while data shows up to 75% of Sri Lankans needing mental care avoid formal services due to severe social stigma.
*   **The Surging Local Demand:** Recent clinical reports show that up to 30% of local adults and 40% of adolescents grapple with anxiety and depression due to compounding economic and academic pressures.
*   **Passive, Low Engagement Tech:** Existing holistic and mindfulness web apps offer static, text-heavy readings or generic sound loops. They lack interactive loop mechanisms to convert self-awareness into structured, daily behavioral habits.

## Application Blueprint

*   **Core Concept:** A proactive, autonomous web dashboard that translates mathematically modeled planetary time cycles (Dashas) into a dynamic, evidence-based Cognitive Behavioral Therapy (CBT) planning calendar.
*   **Core Functionalities:**
    *   **Onboarding Chart Engine:** Takes precise astronomical inputs (birth date, time, and latitude/longitude coordinates) to construct a high-fidelity digital natal chart.
    *   **Dynamic Micro-Habit Interface:** Evaluates active planetary transits against daily user schedules, recommending optimal behavioral routines (e.g., focus sessions, critical communication blocks, or meditative pauses).
    *   **Persistent AI Well-being Companion:** A responsive, chat-based agent that initiates micro-coaching interventions, tracks emotional states, and acts as a continuous accountability partner.

## Agentic AI Integration

*   **Multi-Agent Orchestration:** Powered by three specialized, cooperative LLM agents managed via hierarchical workflows:
    1.  **The Parsing Agent:** Functions as an automated context collector, calling the Celestial MCP tool to grab instant transit data and outputting clean Pydantic validated data models.
    2.  **The Clinical CBT Agent:** Evaluates those exact inputs against the Clinical MCP Server's data logs to safely tailor psychological behavioral tasks for the day.
    3.  **The Proactive Prompt Agent:** An autonomous event-driven loop that tracks live user habit interactions, stepping in to offer accountability check-ins if a routine deviates.
*   **Strict Ethical Guardrails:** Built-in semantic boundaries that actively intercept, filter, and block any deterministic, fatalistic, or predictive claims (e.g., financial/health prophecies). The output is strictly confined to practical personal growth and mindfulness strategies.

## Technical Architecture & Feasibility

*   **Frontend Web Stack:** Built on Next.js 15, Tailwind CSS, and shadcn/ui, establishing a low-latency web dashboard utilizing Server-Sent Events (SSE) to natively stream reactive agent responses in real-time.
*   **MCP Server Infrastructure:** Powered by a decentralized FastMCP / Python framework separating computation from context.
    *   **Celestial Server:** Wraps `pyswisseph` as an isolated MCP tool, instantly exposing high-fidelity astronomical telemetry via structured URI resources.
    *   **Clinical Server:** Houses local vector mappings that translate raw longitudes directly into granular, context-aware CBT time blocks.
*   **AI Orchestration & Security:** Driven by LangGraph, acting as an MCP client that dynamically queries available server tools, handles cyclical agent memory, and manages multi-agent hierarchical state with encrypted PostgreSQL state saving.

## Market Potential & Sustainability

*   **Vast Market Opportunity:** Intersects the Astrology Market and the Global Wellness Economy, specifically targeting productivity-minded professionals looking for personalized habit structures. The global wellness apps market size is projected to scale to $14.71 billion, driven aggressively by a shift toward AI-powered personalization and habit formation platforms.
*   **Low-Friction Virality:** Operating as a web platform allows users to instantly share their customized astronomical transit dashboards and achievements via clean, secure web URLs, driving highly scalable organic growth.
*   **SaaS Sustainability:**
    *   **Freemium Tier:** Basic interactive transit dashboard and manual personal habit logging.
    *   **Premium Tier ($4.99 / approx. LKR 1,500 per month):** Unlocks proactive multi-agent coaching messages, calendar syncing (Google/Outlook), and long-term behavioral pattern analytics.
*   **The Global Wellness Boom:** Zorya acts at the vector of the global wellness economy, which surpassed a value of $6.8 trillion and sees mental wellness standing as one of the fastest-growing sectors at a 12.4% annual growth rate.
