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
  ["tier", "ALTER TABLE reports ADD COLUMN tier TEXT"],
  ["bundle_match_code", "ALTER TABLE reports ADD COLUMN bundle_match_code TEXT"],
  [
    "bundle_match_redeemed_match_report_id",
    "ALTER TABLE reports ADD COLUMN bundle_match_redeemed_match_report_id TEXT",
  ],
] as const) {
  if (!existingColumns.has(column)) {
    db.exec(ddl);
  }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS match_reports (
    id TEXT PRIMARY KEY,
    answers TEXT NOT NULL,
    my_photo TEXT,
    partner_photo TEXT,
    full_report TEXT,
    password_hash TEXT,
    paid INTEGER NOT NULL DEFAULT 0,
    paid_at TEXT,
    payment_key TEXT,
    order_id TEXT,
    amount INTEGER,
    phone TEXT,
    bundle INTEGER NOT NULL DEFAULT 0,
    bundle_redeemed_report_id TEXT,
    report_sent_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Same lightweight migration pattern as reports above — adds the
// redemption-code column for existing databases created before it existed.
const existingMatchColumns = new Set(
  (
    db.prepare(`PRAGMA table_info(match_reports)`).all() as {
      name: string;
    }[]
  ).map((col) => col.name),
);
for (const [column, ddl] of [
  ["bundle_code", "ALTER TABLE match_reports ADD COLUMN bundle_code TEXT"],
] as const) {
  if (!existingMatchColumns.has(column)) {
    db.exec(ddl);
  }
}

// Admin-issued free one-time codes — for customer-support cases (forgotten
// password, a report that errored out mid-generation/delivery) where the
// existing bundle-credit codes don't apply because no bundle was purchased.
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_free_codes (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    product TEXT NOT NULL,
    tier TEXT,
    note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    redeemed_report_id TEXT,
    redeemed_at TEXT
  )
`);

export default db;
