import crypto from "crypto";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import type { PreviewResult, FullReport } from "@/types/report";

export type ReportRecord = {
  id: string;
  answers: Record<string, unknown>;
  previewResult: PreviewResult | null;
  fullReport: FullReport | null;
  paid: boolean;
  paymentKey: string | null;
  phone: string | null;
  reportSentAt: string | null;
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
): boolean {
  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare(
      `UPDATE reports
       SET password_hash = ?, paid = 1, paid_at = datetime('now'),
           payment_key = ?, order_id = ?, amount = ?, phone = ?
       WHERE id = ?`,
    )
    .run(
      passwordHash,
      payment.paymentKey,
      payment.orderId,
      payment.amount,
      phone ?? null,
      id,
    );
  return result.changes > 0;
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
