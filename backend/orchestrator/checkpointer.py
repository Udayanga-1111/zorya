"""
Zorya - Checkpointer Configuration
==================================
Configures the SQLite checkpointer for LangGraph state persistence.
"""
import os
import sqlite3
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.checkpoint.memory import MemorySaver

def get_sqlite_saver(db_path: str = None) -> SqliteSaver:
    """
    Initializes a SqliteSaver configured for threaded/async execution safety.
    """
    if db_path is None:
        db_path = os.getenv("CHECKPOINT_DB_PATH", "zorya_checkpoints.sqlite")
    
    conn = sqlite3.connect(db_path, check_same_thread=False)
    return SqliteSaver(conn)

def get_memory_saver() -> MemorySaver:
    """
    Returns an in-memory saver for fast unit testing.
    """
    return MemorySaver()
