"""SQLite database initialization and connection management."""
import sqlite3
import os
from pathlib import Path

DB_PATH = Path(__file__).parent / "data" / "queue.db"


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    os.makedirs(DB_PATH.parent, exist_ok=True)
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS queue_tasks (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            status      TEXT NOT NULL DEFAULT 'pending',
            command     TEXT NOT NULL,
            category    TEXT DEFAULT 'general',
            priority    INTEGER DEFAULT 0,
            result      TEXT,
            error       TEXT,
            created_at  TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
            started_at  TEXT,
            completed_at TEXT
        );

        CREATE TABLE IF NOT EXISTS sessions (
            token       TEXT PRIMARY KEY,
            created_at  TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
            expires_at  TEXT NOT NULL
        );
    """)
    conn.close()


if __name__ == "__main__":
    init_db()
    print(f"Database initialized at {DB_PATH}")
