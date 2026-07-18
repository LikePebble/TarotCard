// SQLite persistence via the Node built-in driver (zero dependencies).
// The DB file lives in data/ and is gitignored; schema is created on boot.
const { DatabaseSync } = require("node:sqlite");
const path = require("path");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "data", "app.db");
const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    is_premium INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS journal_entries (
    user_id TEXT NOT NULL REFERENCES users(id),
    date TEXT NOT NULL,             -- YYYY-MM-DD
    theme TEXT,
    spread TEXT,
    draws_json TEXT,                -- snapshot of the reading's drawn cards
    memo TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, date)
  );
`);

module.exports = db;
