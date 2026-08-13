import { NextRequest, NextResponse } from "next/server";
import { redeemMatchBundleCreditByCode } from "@/lib/matchReports";
import { getReport, redeemBundleGenderCredit, setCheckoutPassword } from "@/lib/reports";
import { redeemFreeCode } from "@/lib/freeCodes";

export const runtime = "nodejs";

// Redeems a Match+Premium bundle's free FACEMOOD Premium report credit by
// its short code instead of the match_reports.id — for redeeming on a
// different device than the one that made the purchase (see
// /api/payments/redeem-bundle for the same-device localStorage path).
//
// This single code box is shared by three different credit types (Match
// bundle, gender bundle, admin free code) so customers never have to know
// which kind of code they were sent — each is tried in turn below.
export async function POST(request: NextRequest) {
  let body: {
    code?: string;
    targetReportId?: string;
    password?: string;
    phone?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "요청 형식을 읽을 수 없습니다." },
      { status: 400 },
    );
  }

  const { code, targetReportId, password, phone } = body;
  if (!code || !targetReportId || !password) {
    return NextResponse.json(
      { error: "필수 정보가 누락되었습니다." },
      { status: 400 },
    );
  }
  if (password.length < 4) {
    return NextResponse.json(
      { error: "비밀번호는 4자 이상이어야 합니다." },
      { status: 400 },
    );
  }

  const targetRecord = getReport(targetReportId);
  if (!targetRecord) {
    return NextResponse.json(
      { error: "리포트를 찾을 수 없습니다." },
      { status: 404 },
    );
  }
  if (targetRecord.paid) {
    return NextResponse.json(
      { error: "이미 결제가 완료된 리포트입니다." },
      { status: 409 },
    );
  }

  const redeemed = redeemMatchBundleCreditByCode(code, targetReportId);
  if (redeemed) {
    setCheckoutPassword(
      targetReportId,
      password,
      { paymentKey: `code:${code}`, orderId: targetReportId, amount: 0 },
      phone ?? null,
      "premium",
    );
    return NextResponse.json({ ok: true });
  }

  // Not a Match-bundle code — try a gender-bundle credit (the male+female
  // bundle sold on /checkout and /checkout-male). Unlike the Match bundle
  // (always grants "premium"), this grants whichever tier is the OPPOSITE
  // of the original purchase, so the tier comes back from the redeem call
  // itself rather than being hardcoded here.
  const genderBundleTier = redeemBundleGenderCredit(code, targetReportId);
  if (genderBundleTier) {
    setCheckoutPassword(
      targetReportId,
      password,
      { paymentKey: `code:${code}`, orderId: targetReportId, amount: 0 },
      phone ?? null,
      genderBundleTier,
    );
    return NextResponse.json({ ok: true });
  }

  // Not a bundle code of either kind — try an admin-issued free code (see
  // /api/admin/free-codes) before giving up, so support can hand out a
  // one-time code through the same input box customers already know.
  const freeCode = redeemFreeCode(code, "facemood", targetReportId);
  if (!freeCode.ok) {
    return NextResponse.json(
      { error: "유효하지 않거나 이미 사용된 코드예요." },
      { status: 409 },
    );
  }

  setCheckoutPassword(
    targetReportId,
    password,
    { paymentKey: `code:${code}`, orderId: targetReportId, amount: 0 },
    phone ?? null,
    freeCode.tier ?? "premium",
  );

  return NextResponse.json({ ok: true });
}
