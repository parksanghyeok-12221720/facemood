import crypto from "crypto";
import db from "@/lib/db";
import type { ReportTier } from "@/lib/reports";

export type FreeCodeProduct = "facemood" | "match";

export type FreeCodeRecord = {
  id: string;
  code: string;
  product: FreeCodeProduct;
  tier: ReportTier | null;
  note: string | null;
  createdAt: string;
  redeemedReportId: string | null;
  redeemedAt: string | null;
};

type FreeCodeRow = {
  id: string;
  code: string;
  product: string;
  tier: string | null;
  note: string | null;
  created_at: string;
  redeemed_report_id: string | null;
  redeemed_at: string | null;
};

function toTier(value: string | null): ReportTier | null {
  return value === "premium" ? "premium" : value === "basic" ? "basic" : null;
}

function rowToRecord(row: FreeCodeRow): FreeCodeRecord {
  return {
    id: row.id,
    code: row.code,
    product: row.product === "match" ? "match" : "facemood",
    tier: toTier(row.tier),
    note: row.note,
    createdAt: row.created_at,
    redeemedReportId: row.redeemed_report_id,
    redeemedAt: row.redeemed_at,
  };
}

function generateCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

// Admin-only — issues a free one-time redemption code for support cases
// (forgotten password, a report that errored out mid-generation/delivery)
// where the customer already should have a working report but doesn't, and
// asking them to pay again isn't reasonable. Redeemed on /checkout or
// /match/checkout depending on `product`, through the same code box as the
// existing bundle-credit codes (see redeemFreeCode below).
export function createFreeCode(
  product: FreeCodeProduct,
  tier: ReportTier | null,
  note: string | null,
): string {
  const id = crypto.randomUUID();
  const code = generateCode();
  db.prepare(
    `INSERT INTO admin_free_codes (id, code, product, tier, note) VALUES (?, ?, ?, ?, ?)`,
  ).run(id, code, product, tier, note && note.trim() ? note.trim() : null);
  return code;
}

// One-time use, enforced by only succeeding while redeemed_report_id is
// still NULL. `product` scopes the lookup so a facemood code can't be
// redeemed on /match/checkout or vice versa.
export function redeemFreeCode(
  code: string,
  product: FreeCodeProduct,
  targetReportId: string,
): { ok: true; tier: ReportTier | null } | { ok: false } {
  const normalized = code.trim().toUpperCase();
  const row = db
    .prepare(
      `SELECT id, tier FROM admin_free_codes
       WHERE code = ? AND product = ? AND redeemed_report_id IS NULL`,
    )
    .get(normalized, product) as { id: string; tier: string | null } | undefined;
  if (!row) return { ok: false };

  const result = db
    .prepare(
      `UPDATE admin_free_codes
       SET redeemed_report_id = ?, redeemed_at = datetime('now')
       WHERE id = ? AND redeemed_report_id IS NULL`,
    )
    .run(targetReportId, row.id);
  if (result.changes === 0) return { ok: false };

  return { ok: true, tier: toTier(row.tier) };
}

export function listFreeCodes(): FreeCodeRecord[] {
  const rows = db
    .prepare(`SELECT * FROM admin_free_codes ORDER BY created_at DESC`)
    .all() as FreeCodeRow[];
  return rows.map(rowToRecord);
}
