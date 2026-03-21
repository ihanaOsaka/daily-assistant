import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function ensureTable() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS queue_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT NOT NULL DEFAULT 'pending',
      command TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      priority INTEGER DEFAULT 0,
      result TEXT,
      error TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      started_at TEXT,
      completed_at TEXT
    )
  `);
}
