import { NextRequest, NextResponse } from "next/server";
import { getReport, setCheckoutPassword } from "@/lib/reports";
import { confirmTossPayment, REPORT_PRICE_KRW } from "@/lib/payment";
import { TEST_AMOUNT_KRW, isTestPhone } from "@/lib/testPayment";

export const runtime = "nodejs";

// The only place Toss Payments is confirmed. orderId is always the report's
// own id (set client-side when requestPayment is called), so this doubles
// as the record we attach the password/paid status to.
export async function POST(request: NextRequest) {
  let body: {
    paymentKey?: string;
    orderId?: string;
    amount?: number;
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

  const { paymentKey, orderId, amount, password, phone } = body;

  if (!paymentKey || !orderId || typeof amount !== "number" || !password) {
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

  const record = getReport(orderId);
  if (!record) {
    return NextResponse.json(
      { error: "리포트를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  // Already confirmed (e.g. duplicate success-page load) — don't
  // re-confirm the same paymentKey with Toss a second time.
  if (record.paid) {
    return NextResponse.json({ ok: true });
  }

  // Never trust the client-sent amount for the actual charge — verify it
  // matches our fixed price before even asking Toss to confirm. The one
  // exception is the internal test phone number, which is allowed to
  // charge TEST_AMOUNT_KRW instead so the real Toss flow can be tested
  // end-to-end without paying full price.
  const expectedAmount =
    phone && isTestPhone(phone) ? TEST_AMOUNT_KRW : REPORT_PRICE_KRW;
  if (amount !== expectedAmount) {
    return NextResponse.json(
      { error: "결제 금액이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const result = await confirmTossPayment(paymentKey, orderId, amount);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 502 });
  }

  setCheckoutPassword(
    orderId,
    password,
    { paymentKey, orderId, amount },
    phone ?? null,
  );

  return NextResponse.json({ ok: true });
}
