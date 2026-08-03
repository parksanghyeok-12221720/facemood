import { NextRequest, NextResponse } from "next/server";
import { getMatchReport, redeemMatchBundleCredit } from "@/lib/matchReports";
import { getReport, setCheckoutPassword } from "@/lib/reports";

export const runtime = "nodejs";

// Redeems a Match bundle's free FACEMOOD Premium report credit against a
// specific (unpaid) FACEMOOD reports.id, instead of charging Toss again.
export async function POST(request: NextRequest) {
  let body: {
    matchReportId?: string;
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

  const { matchReportId, targetReportId, password, phone } = body;
  if (!matchReportId || !targetReportId || !password) {
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
  if (!matchRecord || !matchRecord.paid || !matchRecord.bundle) {
    return NextResponse.json(
      { error: "사용할 수 있는 번들 혜택을 찾을 수 없습니다." },
      { status: 404 },
    );
  }
  if (matchRecord.bundleRedeemedReportId) {
    return NextResponse.json(
      { error: "이 번들 혜택은 이미 사용되었습니다." },
      { status: 409 },
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

  const redeemed = redeemMatchBundleCredit(matchReportId, targetReportId);
  if (!redeemed) {
    return NextResponse.json(
      { error: "번들 혜택을 적용하지 못했습니다. 다시 시도해주세요." },
      { status: 409 },
    );
  }

  setCheckoutPassword(
    targetReportId,
    password,
    { paymentKey: `bundle:${matchReportId}`, orderId: targetReportId, amount: 0 },
    phone ?? null,
    "premium",
  );

  return NextResponse.json({ ok: true });
}
