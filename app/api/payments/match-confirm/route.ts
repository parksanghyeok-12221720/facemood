import { NextRequest, NextResponse } from "next/server";
import {
  getMatchReport,
  grantBundleCode,
  setMatchCheckoutPassword,
} from "@/lib/matchReports";
import { MATCH_BUNDLE_PRICE_KRW, MATCH_PRICE_KRW, confirmTossPayment } from "@/lib/payment";
import { KAKAO_CHANNEL_DISCOUNT_KRW } from "@/lib/kakaoChannel";
import { TEST_AMOUNT_KRW, isTestPhone } from "@/lib/testPayment";

export const runtime = "nodejs";

// Mirrors /api/payments/confirm for the Match product. orderId is always
// the match_reports row's own id (set client-side when requestPayment is
// called).
export async function POST(request: NextRequest) {
  let body: {
    paymentKey?: string;
    orderId?: string;
    amount?: number;
    password?: string;
    phone?: string;
    bundle?: boolean;
    kakaoDiscount?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "요청 형식을 읽을 수 없습니다." },
      { status: 400 },
    );
  }

  const { paymentKey, orderId, amount, password, phone, kakaoDiscount } = body;
  const bundle = body.bundle === true;

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

  const record = getMatchReport(orderId);
  if (!record) {
    return NextResponse.json(
      { error: "리포트를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  if (record.paid) {
    return NextResponse.json({ ok: true, bundle: record.bundle });
  }

  const matchPrice = bundle ? MATCH_BUNDLE_PRICE_KRW : MATCH_PRICE_KRW;
  // The Kakao channel discount is self-reported by the client (no
  // server-verifiable proof the user actually finished adding the channel
  // — see lib/kakaoChannel.ts) — same trust level as a coupon code, so it
  // just needs to be an allowed alternate amount, not proof of anything.
  // Bundle-only: standalone Match never gets it, even with the flag set.
  const expectedAmount =
    phone && isTestPhone(phone)
      ? TEST_AMOUNT_KRW
      : kakaoDiscount && bundle
        ? matchPrice - KAKAO_CHANNEL_DISCOUNT_KRW
        : matchPrice;
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

  setMatchCheckoutPassword(
    orderId,
    password,
    { paymentKey, orderId, amount },
    phone ?? null,
    bundle,
  );

  if (bundle) {
    const bundleCode = grantBundleCode(orderId);
    return NextResponse.json({ ok: true, bundle, bundleCode });
  }

  return NextResponse.json({ ok: true, bundle });
}
