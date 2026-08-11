import { NextRequest, NextResponse } from "next/server";
import { redeemBundleMatchCredit } from "@/lib/reports";
import { getMatchReport, setMatchCheckoutPassword } from "@/lib/matchReports";
import { redeemFreeCode } from "@/lib/freeCodes";

export const runtime = "nodejs";

// Redeems a FACEMOOD Premium+Match bundle's free Match report code against
// a specific (unpaid) match_reports.id, instead of charging Toss again.
export async function POST(request: NextRequest) {
  let body: {
    code?: string;
    matchReportId?: string;
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

  const { code, matchReportId, password, phone } = body;
  if (!code || !matchReportId || !password) {
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

  const matchRecord = getMatchReport(matchReportId);
  if (!matchRecord) {
    return NextResponse.json(
      { error: "리포트를 찾을 수 없습니다." },
      { status: 404 },
    );
  }
  if (matchRecord.paid) {
    return NextResponse.json(
      { error: "이미 결제가 완료된 리포트입니다." },
      { status: 409 },
    );
  }

  const redeemed = redeemBundleMatchCredit(code, matchReportId);
  if (redeemed) {
    setMatchCheckoutPassword(
      matchReportId,
      password,
      { paymentKey: `code:${code}`, orderId: matchReportId, amount: 0 },
      phone ?? null,
      true,
    );
    return NextResponse.json({ ok: true });
  }

  // Not a Premium+Match bundle credit code — try an admin-issued free code
  // (see /api/admin/free-codes) before giving up. `bundle: false` here
  // (unlike the branch above) so a support-issued code can't itself be
  // chained into another free bundle credit.
  const freeCode = redeemFreeCode(code, "match", matchReportId);
  if (!freeCode.ok) {
    return NextResponse.json(
      { error: "유효하지 않거나 이미 사용된 코드예요." },
      { status: 409 },
    );
  }

  setMatchCheckoutPassword(
    matchReportId,
    password,
    { paymentKey: `code:${code}`, orderId: matchReportId, amount: 0 },
    phone ?? null,
    false,
  );

  return NextResponse.json({ ok: true });
}
