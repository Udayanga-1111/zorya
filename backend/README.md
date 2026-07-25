# Zorya Backend

Python backend for **Zorya** — FastMCP servers and LangGraph multi-agent pipeline.

## Structure

```
backend/
├── mcp_servers/
│   ├── celestial_server.py   # FastMCP + pyswisseph planetary calculations
│   └── clinical_server.py    # FastMCP CBT block recommendation server
└── agents/
    └── state.py              # LangGraph AgentState definition
```

## Setup

```powershell
uv venv .venv --python 3.11
uv pip install -e ".[dev]"
```

## License

GPL-2.0 (required for pyswisseph compliance).
