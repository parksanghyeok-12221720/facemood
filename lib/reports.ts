import crypto from "crypto";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import type { PreviewResult, FullReport } from "@/types/report";

export type ReportTier = "basic" | "premium";

export type ReportRecord = {
  id: string;
  answers: Record<string, unknown>;
  previewResult: PreviewResult | null;
  fullReport: FullReport | null;
  paid: boolean;
  paymentKey: string | null;
  phone: string | null;
  reportSentAt: string | null;
  tier: ReportTier | null;
  bundleMatchCode: string | null;
  bundleMatchRedeemedMatchReportId: string | null;
  createdAt: string;
};

type ReportRow = {
  id: string;
  answers: string;
  preview_result: string | null;
  full_report: string | null;
  password_hash: string | null;
  paid: number;
  paid_at: string | null;
  payment_key: string | null;
  order_id: string | null;
  amount: number | null;
  phone: string | null;
  report_sent_at: string | null;
  tier: string | null;
  bundle_match_code: string | null;
  bundle_match_redeemed_match_report_id: string | null;
  created_at: string;
};

function rowToRecord(row: ReportRow): ReportRecord {
  return {
    id: row.id,
    answers: JSON.parse(row.answers),
    previewResult: row.preview_result ? JSON.parse(row.preview_result) : null,
    fullReport: row.full_report ? JSON.parse(row.full_report) : null,
    paid: row.paid === 1,
    paymentKey: row.payment_key,
    phone: row.phone,
    reportSentAt: row.report_sent_at,
    tier: row.tier === "premium" ? "premium" : row.tier === "basic" ? "basic" : null,
    bundleMatchCode: row.bundle_match_code,
    bundleMatchRedeemedMatchReportId: row.bundle_match_redeemed_match_report_id,
    createdAt: row.created_at,
  };
}

export function createReport(answers: Record<string, unknown>): string {
  const id = crypto.randomUUID();
  db.prepare(`INSERT INTO reports (id, answers) VALUES (?, ?)`).run(
    id,
    JSON.stringify(answers),
  );
  return id;
}

export function getReport(id: string): ReportRecord | null {
  const row = db.prepare(`SELECT * FROM reports WHERE id = ?`).get(id) as
    | ReportRow
    | undefined;
  return row ? rowToRecord(row) : null;
}

export function updatePreviewResult(
  id: string,
  previewResult: PreviewResult,
): boolean {
  const result = db
    .prepare(`UPDATE reports SET preview_result = ? WHERE id = ?`)
    .run(JSON.stringify(previewResult), id);
  return result.changes > 0;
}

export function updateFullReport(id: string, fullReport: FullReport): boolean {
  const result = db
    .prepare(`UPDATE reports SET full_report = ? WHERE id = ?`)
    .run(JSON.stringify(fullReport), id);
  return result.changes > 0;
}

export function setCheckoutPassword(
  id: string,
  password: string,
  payment: { paymentKey: string; orderId: string; amount: number },
  phone?: string | null,
  tier?: ReportTier | null,
): boolean {
  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare(
      `UPDATE reports
       SET password_hash = ?, paid = 1, paid_at = datetime('now'),
           payment_key = ?, order_id = ?, amount = ?, phone = ?, tier = ?
       WHERE id = ?`,
    )
    .run(
      passwordHash,
      payment.paymentKey,
      payment.orderId,
      payment.amount,
      phone ?? null,
      tier ?? null,
      id,
    );
  return result.changes > 0;
}

function generateBundleMatchCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

// Called once, right after a "Premium + Match" bundle payment is confirmed
// — generates and stores a one-time redemption code for a free FACEMOOD
// Match report. Delivered to the customer via the report-ready SMS (see
// lib/notify.ts) and redeemed on /match/checkout (see redeemBundleMatchCredit).
export function grantBundleMatchCredit(id: string): string {
  const code = generateBundleMatchCode();
  db.prepare(`UPDATE reports SET bundle_match_code = ? WHERE id = ?`).run(
    code,
    id,
  );
  return code;
}

// Consumes a Premium+Match bundle's "one free FACEMOOD Match report" credit
// against a specific (unpaid) match_reports.id — one-time use, enforced by
// only succeeding while bundle_match_redeemed_match_report_id is still NULL.
export function redeemBundleMatchCredit(
  code: string,
  matchReportId: string,
): boolean {
  const result = db
    .prepare(
      `UPDATE reports
       SET bundle_match_redeemed_match_report_id = ?
       WHERE bundle_match_code = ? AND bundle_match_redeemed_match_report_id IS NULL`,
    )
    .run(matchReportId, code.trim().toUpperCase());
  return result.changes > 0;
}

export type PaidReportSummary = {
  id: string;
  name: string | null;
  age: string | null;
  height: string | null;
  weight: string | null;
  phone: string | null;
  amount: number | null;
  tier: ReportTier | null;
  bundleMatchCode: string | null;
  paidAt: string | null;
  reportSentAt: string | null;
  createdAt: string;
};

type PaidReportRow = {
  id: string;
  answers: string;
  amount: number | null;
  phone: string | null;
  tier: string | null;
  bundle_match_code: string | null;
  paid_at: string | null;
  report_sent_at: string | null;
  created_at: string;
};

export function listPaidReports(): PaidReportSummary[] {
  const rows = db
    .prepare(
      `SELECT id, answers, amount, phone, tier, bundle_match_code, paid_at, report_sent_at, created_at
       FROM reports WHERE paid = 1 ORDER BY paid_at DESC`,
    )
    .all() as PaidReportRow[];

  const readField = (
    answers: Record<string, unknown>,
    key: string,
  ): string | null => {
    const value = answers[key];
    return typeof value === "string" && value.trim() ? value.trim() : null;
  };

  return rows.map((row) => {
    let name: string | null = null;
    let age: string | null = null;
    let height: string | null = null;
    let weight: string | null = null;
    try {
      const answers = JSON.parse(row.answers) as Record<string, unknown>;
      name = readField(answers, "name");
      age = readField(answers, "age");
      height = readField(answers, "height");
      weight = readField(answers, "weight");
    } catch {
      // Malformed/legacy answers JSON — just show no name instead of failing.
    }

    return {
      id: row.id,
      name,
      age,
      height,
      weight,
      phone: row.phone,
      amount: row.amount,
      tier: row.tier === "premium" ? "premium" : row.tier === "basic" ? "basic" : null,
      bundleMatchCode: row.bundle_match_code,
      paidAt: row.paid_at,
      reportSentAt: row.report_sent_at,
      createdAt: row.created_at,
    };
  });
}

export type DailyRevenuePoint = { date: string; total: number; count: number };

export type RevenueStats = {
  todayTotal: number;
  todayCount: number;
  monthTotal: number;
  monthCount: number;
  allTimeTotal: number;
  daily: DailyRevenuePoint[];
};

// paid_at is written via SQLite's datetime('now'), which is UTC — shift
// by +9h before taking the date portion so "오늘"/"이번달" line up with
// Korea Standard Time regardless of what timezone the server itself runs in.
function toKstDateString(epochMs: number): string {
  return new Date(epochMs + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function getRevenueStats(days = 30): RevenueStats {
  const rows = db
    .prepare(`SELECT amount, paid_at FROM reports WHERE paid = 1 AND paid_at IS NOT NULL`)
    .all() as { amount: number | null; paid_at: string }[];

  const byDay = new Map<string, { total: number; count: number }>();
  let allTimeTotal = 0;

  for (const row of rows) {
    const utcMs = new Date(`${row.paid_at.replace(" ", "T")}Z`).getTime();
    if (Number.isNaN(utcMs)) continue;
    const day = toKstDateString(utcMs);
    const entry = byDay.get(day) ?? { total: 0, count: 0 };
    entry.total += row.amount ?? 0;
    entry.count += 1;
    byDay.set(day, entry);
    allTimeTotal += row.amount ?? 0;
  }

  const now = Date.now();
  const todayKey = toKstDateString(now);
  const monthKey = todayKey.slice(0, 7);

  let todayTotal = 0;
  let todayCount = 0;
  let monthTotal = 0;
  let monthCount = 0;
  for (const [day, entry] of byDay) {
    if (day === todayKey) {
      todayTotal = entry.total;
      todayCount = entry.count;
    }
    if (day.startsWith(monthKey)) {
      monthTotal += entry.total;
      monthCount += entry.count;
    }
  }

  const daily: DailyRevenuePoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = toKstDateString(now - i * 24 * 60 * 60 * 1000);
    const entry = byDay.get(day) ?? { total: 0, count: 0 };
    daily.push({ date: day, total: entry.total, count: entry.count });
  }

  return { todayTotal, todayCount, monthTotal, monthCount, allTimeTotal, daily };
}

export function markReportSent(id: string): void {
  db.prepare(
    `UPDATE reports SET report_sent_at = datetime('now') WHERE id = ?`,
  ).run(id);
}

export function verifyReportPassword(id: string, password: string): boolean {
  const row = db
    .prepare(`SELECT password_hash FROM reports WHERE id = ?`)
    .get(id) as { password_hash: string | null } | undefined;
  if (!row || !row.password_hash) return false;
  return bcrypt.compareSync(password, row.password_hash);
}
