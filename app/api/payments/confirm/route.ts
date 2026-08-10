import { NextRequest, NextResponse } from "next/server";
import { getReport, grantBundleMatchCredit, setCheckoutPassword } from "@/lib/reports";
import type { ReportTier } from "@/lib/reports";
import {
  BASIC_PRICE_KRW,
  PREMIUM_PRICE_KRW,
  PREMIUM_MATCH_PRICE_KRW,
  confirmTossPayment,
} from "@/lib/payment";
import { KAKAO_CHANNEL_DISCOUNT_KRW } from "@/lib/kakaoChannel";
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
    tier?: string;
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
  // "premiumMatch" is a separate SKU (Premium report + a free FACEMOOD
  // Match redemption code) but the report itself is always generated at
  // premium depth — the bundle flag lives on bundle_match_code, not tier.
  const isPremiumMatchBundle = body.tier === "premiumMatch";
  const tier: ReportTier = body.tier === "basic" ? "basic" : "premium";

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
  // matches the selected tier's fixed price before even asking Toss to
  // confirm. The one exception is the internal test phone number, which
  // is allowed to charge TEST_AMOUNT_KRW instead (regardless of tier) so
  // the real Toss flow can be tested end-to-end without paying full price.
  const tierPrice = isPremiumMatchBundle
    ? PREMIUM_MATCH_PRICE_KRW
    : tier === "basic"
      ? BASIC_PRICE_KRW
      : PREMIUM_PRICE_KRW;
  // The Kakao channel discount is self-reported by the client (no
  // server-verifiable proof the user actually finished adding the channel
  // — see lib/kakaoChannel.ts) — same trust level as a coupon code, so it
  // just needs to be an allowed alternate amount, not proof of anything.
  // Available on Premium and the bundle — never on Basic.
  const expectedAmount =
    phone && isTestPhone(phone)
      ? TEST_AMOUNT_KRW
      : kakaoDiscount && tier !== "basic"
        ? tierPrice - KAKAO_CHANNEL_DISCOUNT_KRW
        : tierPrice;
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
    tier,
  );

  if (isPremiumMatchBundle) {
    const bundleMatchCode = grantBundleMatchCredit(orderId);
    return NextResponse.json({ ok: true, bundleMatchCode });
  }

  return NextResponse.json({ ok: true });
}
