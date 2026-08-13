import { NextRequest, NextResponse } from "next/server";
import {
  getReport,
  grantBundleGenderCredit,
  grantBundleMatchCredit,
  setCheckoutPassword,
} from "@/lib/reports";
import type { ReportTier } from "@/lib/reports";
import {
  BASIC_PRICE_KRW,
  PREMIUM_PRICE_KRW,
  PREMIUM_MATCH_PRICE_KRW,
  MALE_PREMIUM_PRICE_KRW,
  HAIR_PRICE_KRW,
  MAKEUP_PRICE_KRW,
  COLOR_PRICE_KRW,
  GENDER_BUNDLE_PRICE_KRW,
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
  // "maleBundle"/"premiumBundle" are the male+female gender bundle, sold
  // from /checkout-male and /checkout respectively — same idea as
  // premiumMatch above, except the free credit is for a report of the
  // OPPOSITE gender's tier instead of a FACEMOOD Match report (see
  // grantBundleGenderCredit). The report itself still generates at the
  // normal male/premium depth — the bundle flag lives on bundle_gender_code.
  const isGenderBundle =
    body.tier === "maleBundle" || body.tier === "premiumBundle";
  const tier: ReportTier =
    body.tier === "basic"
      ? "basic"
      : body.tier === "male" || body.tier === "maleBundle"
        ? "male"
        : body.tier === "hair"
          ? "hair"
          : body.tier === "makeup"
            ? "makeup"
            : body.tier === "color"
              ? "color"
              : "premium";

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
    : isGenderBundle
      ? GENDER_BUNDLE_PRICE_KRW
      : tier === "basic"
        ? BASIC_PRICE_KRW
        : tier === "male"
          ? MALE_PREMIUM_PRICE_KRW
          : tier === "hair"
            ? HAIR_PRICE_KRW
            : tier === "makeup"
              ? MAKEUP_PRICE_KRW
              : tier === "color"
                ? COLOR_PRICE_KRW
                : PREMIUM_PRICE_KRW;
  // The Kakao channel discount is self-reported by the client (no
  // server-verifiable proof the user actually finished adding the channel
  // — see lib/kakaoChannel.ts) — same trust level as a coupon code, so it
  // just needs to be an allowed alternate amount, not proof of anything.
  // Available on Premium, the Match bundle, and the gender bundle (even
  // when the gender bundle was bought from the male checkout) — never on
  // Basic, a plain male purchase, or the single-item tiers.
  const isKakaoDiscountEligible =
    tier === "premium" || isPremiumMatchBundle || isGenderBundle;
  const expectedAmount =
    phone && isTestPhone(phone)
      ? TEST_AMOUNT_KRW
      : kakaoDiscount && isKakaoDiscountEligible
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

  if (isGenderBundle) {
    // Must run after setCheckoutPassword above, since
    // grantBundleGenderCredit's later redemption reads this row's
    // just-persisted tier to decide which tier the credit grants.
    const bundleGenderCode = grantBundleGenderCredit(orderId);
    return NextResponse.json({ ok: true, bundleGenderCode });
  }

  return NextResponse.json({ ok: true });
}
