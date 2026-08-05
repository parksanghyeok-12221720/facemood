import crypto from "crypto";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import type { MatchFullReport } from "@/types/matchReport";

export type MatchReportRecord = {
  id: string;
  answers: Record<string, unknown>;
  myPhoto: string | null;
  partnerPhoto: string | null;
  fullReport: MatchFullReport | null;
  paid: boolean;
  paymentKey: string | null;
  amount: number | null;
  phone: string | null;
  bundle: boolean;
  bundleRedeemedReportId: string | null;
  bundleCode: string | null;
  reportSentAt: string | null;
  createdAt: string;
};

type MatchReportRow = {
  id: string;
  answers: string;
  my_photo: string | null;
  partner_photo: string | null;
  full_report: string | null;
  password_hash: string | null;
  paid: number;
  paid_at: string | null;
  payment_key: string | null;
  order_id: string | null;
  amount: number | null;
  phone: string | null;
  bundle: number;
  bundle_redeemed_report_id: string | null;
  bundle_code: string | null;
  report_sent_at: string | null;
  created_at: string;
};

function rowToRecord(row: MatchReportRow): MatchReportRecord {
  return {
    id: row.id,
    answers: JSON.parse(row.answers),
    myPhoto: row.my_photo,
    partnerPhoto: row.partner_photo,
    fullReport: row.full_report ? JSON.parse(row.full_report) : null,
    paid: row.paid === 1,
    paymentKey: row.payment_key,
    amount: row.amount,
    phone: row.phone,
    bundle: row.bundle === 1,
    bundleRedeemedReportId: row.bundle_redeemed_report_id,
    bundleCode: row.bundle_code,
    reportSentAt: row.report_sent_at,
    createdAt: row.created_at,
  };
}

export function createMatchReport(
  answers: Record<string, unknown>,
  myPhoto: string | null,
  partnerPhoto: string | null,
): string {
  const id = crypto.randomUUID();
  db.prepare(
    `INSERT INTO match_reports (id, answers, my_photo, partner_photo) VALUES (?, ?, ?, ?)`,
  ).run(id, JSON.stringify(answers), myPhoto, partnerPhoto);
  return id;
}

export function getMatchReport(id: string): MatchReportRecord | null {
  const row = db.prepare(`SELECT * FROM match_reports WHERE id = ?`).get(id) as
    | MatchReportRow
    | undefined;
  return row ? rowToRecord(row) : null;
}

export function updateMatchFullReport(id: string, fullReport: MatchFullReport): boolean {
  const result = db
    .prepare(`UPDATE match_reports SET full_report = ? WHERE id = ?`)
    .run(JSON.stringify(fullReport), id);
  return result.changes > 0;
}

export function setMatchCheckoutPassword(
  id: string,
  password: string,
  payment: { paymentKey: string; orderId: string; amount: number },
  phone: string | null,
  bundle: boolean,
): boolean {
  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare(
      `UPDATE match_reports
       SET password_hash = ?, paid = 1, paid_at = datetime('now'),
           payment_key = ?, order_id = ?, amount = ?, phone = ?, bundle = ?
       WHERE id = ?`,
    )
    .run(
      passwordHash,
      payment.paymentKey,
      payment.orderId,
      payment.amount,
      phone,
      bundle ? 1 : 0,
      id,
    );
  return result.changes > 0;
}

// Consumes a Match bundle's "one free FACEMOOD Premium report" credit
// against a specific (unpaid) FACEMOOD reports.id — one-time use, enforced
// by only succeeding while bundle_redeemed_report_id is still NULL.
export function redeemMatchBundleCredit(
  matchReportId: string,
  targetReportId: string,
): boolean {
  const result = db
    .prepare(
      `UPDATE match_reports
       SET bundle_redeemed_report_id = ?
       WHERE id = ? AND paid = 1 AND bundle = 1 AND bundle_redeemed_report_id IS NULL`,
    )
    .run(targetReportId, matchReportId);
  return result.changes > 0;
}

function generateBundleCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

// Called once, right after a Match+Premium bundle payment is confirmed —
// generates and stores a one-time redemption code for the free FACEMOOD
// Premium report credit. Delivered via the report-ready SMS (lib/notify.ts)
// and redeemed on /checkout (see redeemMatchBundleCreditByCode).
export function grantBundleCode(id: string): string {
  const code = generateBundleCode();
  db.prepare(`UPDATE match_reports SET bundle_code = ? WHERE id = ?`).run(
    code,
    id,
  );
  return code;
}

// Same credit as redeemMatchBundleCredit, but looked up by the short code
// instead of the match_reports.id — for redeeming on a different device
// than the one that made the purchase.
export function redeemMatchBundleCreditByCode(
  code: string,
  targetReportId: string,
): boolean {
  const result = db
    .prepare(
      `UPDATE match_reports
       SET bundle_redeemed_report_id = ?
       WHERE bundle_code = ? AND paid = 1 AND bundle = 1 AND bundle_redeemed_report_id IS NULL`,
    )
    .run(targetReportId, code.trim().toUpperCase());
  return result.changes > 0;
}

export function markMatchReportSent(id: string): void {
  db.prepare(
    `UPDATE match_reports SET report_sent_at = datetime('now') WHERE id = ?`,
  ).run(id);
}

export function verifyMatchReportPassword(id: string, password: string): boolean {
  const row = db
    .prepare(`SELECT password_hash FROM match_reports WHERE id = ?`)
    .get(id) as { password_hash: string | null } | undefined;
  if (!row || !row.password_hash) return false;
  return bcrypt.compareSync(password, row.password_hash);
}

export type PaidMatchReportSummary = {
  id: string;
  myName: string | null;
  partnerName: string | null;
  relationship: string | null;
  phone: string | null;
  amount: number | null;
  bundle: boolean;
  paidAt: string | null;
  reportSentAt: string | null;
  createdAt: string;
};

type PaidMatchReportRow = {
  id: string;
  answers: string;
  amount: number | null;
  phone: string | null;
  bundle: number;
  paid_at: string | null;
  report_sent_at: string | null;
  created_at: string;
};

export function listPaidMatchReports(): PaidMatchReportSummary[] {
  const rows = db
    .prepare(
      `SELECT id, answers, amount, phone, bundle, paid_at, report_sent_at, created_at
       FROM match_reports WHERE paid = 1 ORDER BY paid_at DESC`,
    )
    .all() as PaidMatchReportRow[];

  const readField = (
    answers: Record<string, unknown>,
    key: string,
  ): string | null => {
    const value = answers[key];
    return typeof value === "string" && value.trim() ? value.trim() : null;
  };

  return rows.map((row) => {
    let myName: string | null = null;
    let partnerName: string | null = null;
    let relationship: string | null = null;
    try {
      const answers = JSON.parse(row.answers) as Record<string, unknown>;
      myName = readField(answers, "myName");
      partnerName = readField(answers, "partnerName");
      relationship = readField(answers, "relationship");
    } catch {
      // Malformed answers JSON — just show no name instead of failing.
    }

    return {
      id: row.id,
      myName,
      partnerName,
      relationship,
      phone: row.phone,
      amount: row.amount,
      bundle: row.bundle === 1,
      paidAt: row.paid_at,
      reportSentAt: row.report_sent_at,
      createdAt: row.created_at,
    };
  });
}

export function getMatchRevenueTotal(): { total: number; count: number } {
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count
       FROM match_reports WHERE paid = 1`,
    )
    .get() as { total: number; count: number };
  return row;
}
