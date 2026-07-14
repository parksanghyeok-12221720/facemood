import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "facemood.db");

// Reused across Next.js dev hot-reloads so we don't open a new file handle
// on every module re-evaluation.
declare global {
  var __facemoodDb: Database.Database | undefined;
}

const db = globalThis.__facemoodDb ?? new Database(dbPath);
globalThis.__facemoodDb = db;

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    answers TEXT NOT NULL,
    preview_result TEXT,
    full_report TEXT,
    password_hash TEXT,
    paid INTEGER NOT NULL DEFAULT 0,
    paid_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Lightweight migration: add payment-tracking columns for existing
// databases created before Toss Payments was wired up.
const existingColumns = new Set(
  (db.prepare(`PRAGMA table_info(reports)`).all() as { name: string }[]).map(
    (col) => col.name,
  ),
);
for (const [column, ddl] of [
  ["payment_key", "ALTER TABLE reports ADD COLUMN payment_key TEXT"],
  ["order_id", "ALTER TABLE reports ADD COLUMN order_id TEXT"],
  ["amount", "ALTER TABLE reports ADD COLUMN amount INTEGER"],
  ["phone", "ALTER TABLE reports ADD COLUMN phone TEXT"],
  ["report_sent_at", "ALTER TABLE reports ADD COLUMN report_sent_at TEXT"],
] as const) {
  if (!existingColumns.has(column)) {
    db.exec(ddl);
  }
}

export default db;
