import asyncio
import os
from orchestrator.graph import compile_graph
from orchestrator.checkpointer import get_async_sqlite_saver

_db_path = os.getenv("ZORYA_DB_PATH", "./zorya_state.db")

async def main():
    initial_state = {
        "user_id": "test",
        "thread_id": "thread-test",
        "user_profile": {
            "birth_date": "2000-01-01",
            "birth_time": "06:00",
            "lat": 7.2906,
            "lon": 80.6337,
            "goal": "growth",
        },
    }
    config = {"configurable": {"thread_id": "thread-test"}}
    
    async with get_async_sqlite_saver(_db_path) as checkpointer:
        print("CHECKPOINTER TYPE:", type(checkpointer))
        graph = compile_graph(checkpointer=checkpointer)
        async for event in graph.astream(initial_state, config=config, stream_mode="updates"):
            print(event)

if __name__ == "__main__":
    asyncio.run(main())
