"""
Zorya — FastAPI SSE Streaming Server
======================================
Exposes the LangGraph multi-agent pipeline over HTTP with Server-Sent Events.

Endpoint: POST /stream
  - Accepts a JSON body with user_profile data.
  - Runs the compiled LangGraph graph using .astream() with stream_mode="updates".
  - Streams SSE events to the client as each node (parsing_node, clinical_cbt_node,
    guardrail_node) completes, enabling progressive UI rendering on the frontend.

Usage (development):
  uvicorn api_server:app --reload --port 8000
"""

import json
import os
import asyncio
from typing import AsyncGenerator

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sse_starlette.sse import EventSourceResponse

from orchestrator.graph import compile_graph
from orchestrator.checkpointer import get_async_sqlite_saver

load_dotenv()

app = FastAPI(
    title="Zorya Agent API",
    description="SSE streaming endpoint for the LangGraph multi-agent pipeline.",
    version="0.1.0",
)

# Allow requests from the Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)

# ── Request Schema ─────────────────────────────────────────────────────────────

class UserProfile(BaseModel):
    """Birth data required to calculate planetary transits."""
    birth_date: str = Field(..., description="YYYY-MM-DD")
    birth_time: str = Field(..., description="HH:MM (24h UTC)")
    lat: float = Field(..., ge=-90.0, le=90.0)
    lon: float = Field(..., ge=-180.0, le=180.0)
    user_id: str = Field(default="anonymous")
    goal: str = Field(default="I want to focus on personal growth today.")


class StreamRequest(BaseModel):
    user_profile: UserProfile

_db_path = os.getenv("ZORYA_DB_PATH", "./zorya_state.db")


# ── SSE Generator ──────────────────────────────────────────────────────────────

async def _stream_graph(request: StreamRequest) -> AsyncGenerator[dict, None]:
    """
    Runs the LangGraph pipeline and yields SSE events as each node completes.

    stream_mode="updates" emits one event per node, containing only the state
    keys that node wrote — this is what allows progressive frontend rendering:
      1. parsing_node  -> emits {celestial_context: {...}}
      2. clinical_cbt_node -> emits {clinical_plan: {...}}
      3. guardrail_node    -> emits {guardrail_flagged: bool, ...}
    """
    profile = request.user_profile
    initial_state = {
        "user_id": profile.user_id,
        "thread_id": f"thread-{profile.user_id}",
        "user_profile": {
            "birth_date": profile.birth_date,
            "birth_time": profile.birth_time,
            "lat": profile.lat,
            "lon": profile.lon,
            "goal": profile.goal,
        },
    }

    config = {"configurable": {"thread_id": f"thread-{profile.user_id}"}}

    try:
        # Yield a "start" event so the frontend can show a loading state immediately
        yield {"event": "start", "data": json.dumps({"status": "pipeline_started"})}

        async with get_async_sqlite_saver(_db_path) as checkpointer:
            graph = compile_graph(checkpointer=checkpointer)

            async for event in graph.astream(initial_state, config=config, stream_mode="updates"):
                # event is a dict like: {"parsing_node": {state_updates}}
                for node_name, node_updates in event.items():
                    yield {
                        "event": node_name,
                        "data": json.dumps(node_updates),
                    }
                    # Small yield to keep the event loop responsive
                    await asyncio.sleep(0)

        yield {"event": "done", "data": json.dumps({"status": "pipeline_complete"})}

    except Exception as e:
        yield {
            "event": "error",
            "data": json.dumps({"error": str(e)}),
        }


# ── Route ──────────────────────────────────────────────────────────────────────

@app.post("/stream")
async def stream_agent(request: StreamRequest):
    """
    POST /stream — Run the Zorya LangGraph pipeline and stream results via SSE.
    
    The frontend should consume this with fetch() + response.body.getReader()
    since native EventSource only supports GET requests.
    """
    return EventSourceResponse(_stream_graph(request))


@app.get("/health")
async def health():
    """Simple health check for the FastAPI server."""
    return {"status": "ok", "service": "zorya-agent-api"}
