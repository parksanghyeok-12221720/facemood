"use client";

import { useState } from "react";
import { ANONYMOUS, loadTossPayments } from "@tosspayments/tosspayments-sdk";
import Container from "@/app/components/Container";

const REPORT_ID_KEY = "facemood_report_id";
const PENDING_PASSWORD_KEY = "facemood_pending_password";
const PENDING_PHONE_KEY = "facemood_pending_phone";
const REPORT_PRICE_KRW = 34900;
const ORIGINAL_PRICE_KRW = 79800;
const DISCOUNT_KRW = ORIGINAL_PRICE_KRW - REPORT_PRICE_KRW;
const DISCOUNT_PERCENT = Math.round((DISCOUNT_KRW / ORIGINAL_PRICE_KRW) * 100);

const phonePrefixOptions = ["010", "011", "016", "017", "018", "019"];

function PriceRow({
  label,
  value,
  tone = "neutral",
  strike = false,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "accent" | "bold";
  strike?: boolean;
}) {
  const valueClass =
    tone === "bold"
      ? "text-lg font-bold text-black"
      : tone === "accent"
        ? "font-semibold text-violet-600"
        : "text-gray-500";
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className={tone === "bold" ? "font-semibold text-black" : "text-gray-500"}>
        {label}
      </span>
      <span className={`${valueClass} ${strike ? "line-through decoration-gray-400" : ""}`}>
        {value}
      </span>
    </div>
  );
}

export default function CheckoutPage() {
  const [phonePrefix, setPhonePrefix] = useState("010");
  const [phoneMiddle, setPhoneMiddle] = useState("");
  const [phoneLast, setPhoneLast] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): string | null {
    if (phoneMiddle.length < 3 || phoneLast.length !== 4) {
      return "리포트를 받을 연락처를 정확히 입력해주세요.";
    }
    if (password.length < 4) {
      return "비밀번호는 4자 이상 입력해주세요.";
    }
    if (!agreed) {
      return "결제 서비스 이용약관과 개인정보 처리에 동의해주세요.";
    }
    return null;
  }

  async function startCheckout() {
    if (isSubmitting) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const reportId = localStorage.getItem(REPORT_ID_KEY);
    if (!reportId) {
      setError(
        "결제를 진행할 리포트를 찾을 수 없습니다. 처음부터 다시 진행해주세요.",
      );
      return;
    }

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey) {
      setError("결제 설정이 누락되었습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const phone = `${phonePrefix}-${phoneMiddle}-${phoneLast}`;

      // Read back on the success page after Toss redirects here — the
      // payment is only confirmed (and this password/phone saved)
      // server-side once Toss verifies the charge.
      sessionStorage.setItem(PENDING_PASSWORD_KEY, password);
      sessionStorage.setItem(PENDING_PHONE_KEY, phone);

      const tossPayments = await loadTossPayments(clientKey);
      const payment = tossPayments.payment({ customerKey: ANONYMOUS });

      // method: "CARD" with the default flowMode opens Toss's own
      // integrated payment window, where the buyer picks card, 카카오페이,
      // 네이버페이, etc. themselves — Toss owns the method selection UI.
      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: REPORT_PRICE_KRW },
        orderId: reportId,
        orderName: "FACEMOOD 상세 리포트",
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail`,
      });
      // Browser navigates away to Toss's payment page here on success.
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "결제창을 여는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      setError(message);
      setIsSubmitting(false);
    }
  }

  const numericInputClass =
    "w-full rounded-xl border border-violet-100 bg-white px-3 py-3 text-center text-sm text-black outline-none focus:border-violet-300";

  return (
    <main className="min-h-screen bg-[#faf9f7] pb-24 text-black">
      <div className="sticky top-0 z-10 border-b border-black/5 bg-white/90 backdrop-blur">
        <Container className="flex items-center justify-center py-4">
          <h1 className="text-sm font-bold tracking-[0.1em]">결제하기</h1>
        </Container>
      </div>

      <Container className="mt-6">
        {/* Promo banner */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-5 text-white shadow-lg shadow-violet-200">
          <p className="text-[11px] font-semibold tracking-wide text-violet-100">
            결제 혜택 놓치지 마세요
          </p>
          <p className="mt-1 text-lg font-extrabold leading-snug">
            런칭 기념 얼리버드 할인
          </p>
          <span className="mt-3 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">
            오늘 결제 시 {DISCOUNT_PERCENT}% 할인
          </span>
        </div>

        {/* Contact */}
        <section className="mt-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-violet-500">
            리포트 받을 연락처
          </p>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            리포트가 완성되면 이 번호로 알려드려요.
          </p>
          <div className="mt-3 grid grid-cols-[88px_1fr_1fr] gap-2">
            <select
              value={phonePrefix}
              onChange={(event) => setPhonePrefix(event.target.value)}
              disabled={isSubmitting}
              className={`${numericInputClass} appearance-none`}
            >
              {phonePrefixOptions.map((prefix) => (
                <option key={prefix} value={prefix}>
                  {prefix}
                </option>
              ))}
            </select>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={phoneMiddle}
              onChange={(event) =>
                setPhoneMiddle(event.target.value.replace(/\D/g, ""))
              }
              placeholder="1234"
              disabled={isSubmitting}
              className={numericInputClass}
            />
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={phoneLast}
              onChange={(event) =>
                setPhoneLast(event.target.value.replace(/\D/g, ""))
              }
              placeholder="5678"
              disabled={isSubmitting}
              className={numericInputClass}
            />
          </div>
        </section>

        {/* Password */}
        <section className="mt-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-violet-500">
            다시보기용 비밀번호 설정
          </p>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            나중에 이 리포트 링크로 다시 접속할 때 필요해요.
          </p>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호 (4자 이상)"
            disabled={isSubmitting}
            className="mt-3 w-full rounded-xl border border-violet-100 px-4 py-3 text-sm text-black outline-none focus:border-violet-300"
          />
        </section>

        {/* Product selection */}
        <section className="mt-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-violet-500">
            상품 선택
          </p>
          <div className="mt-3 rounded-2xl border-2 border-violet-500 bg-violet-50/50 p-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-bold text-white">
                BEST
              </span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white">
                ✓
              </span>
            </div>
            <p className="mt-3 text-sm font-bold text-black">
              FACEMOOD 상세 리포트
            </p>
            <p className="mt-1 text-xs text-gray-500">
              컬러 · 헤어 · 메이크업 · 스타일링 전 영역 상세 분석
            </p>
            <p className="mt-3 text-xl font-extrabold text-black">
              {REPORT_PRICE_KRW.toLocaleString()}원
            </p>
          </div>
        </section>

        {/* Price breakdown */}
        <section className="mt-8 rounded-2xl border border-violet-100 bg-white p-5">
          <PriceRow
            label="기준 가격"
            value={`${ORIGINAL_PRICE_KRW.toLocaleString()}원`}
            strike
          />
          <PriceRow
            label="얼리버드 특별 할인"
            value={`-${DISCOUNT_PERCENT}% -${DISCOUNT_KRW.toLocaleString()}원`}
            tone="accent"
          />
          <div className="my-2 border-t border-violet-100" />
          <PriceRow
            label="최종 결제금액"
            value={`${REPORT_PRICE_KRW.toLocaleString()}원`}
            tone="bold"
          />
        </section>

        {/* Agreement */}
        <section className="mt-8">
          <label className="flex items-start gap-2.5 text-xs leading-relaxed text-gray-600">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              disabled={isSubmitting}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-violet-200 bg-white accent-violet-300 focus:ring-violet-300"
            />
            <span>(필수) 결제 서비스 이용약관 및 개인정보 처리방침에 동의합니다.</span>
          </label>
          {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
        </section>

        {/* Pay */}
        <section className="mt-6">
          <button
            type="button"
            onClick={startCheckout}
            disabled={!agreed || isSubmitting}
            className="flex w-full items-center justify-center rounded-full bg-black px-8 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting
              ? "결제창 여는 중..."
              : `${REPORT_PRICE_KRW.toLocaleString()}원 결제하기`}
          </button>
          <p className="mt-3 text-center text-xs text-gray-400">
            토스페이먼츠 결제창에서 원하는 결제수단을 선택할 수 있습니다.
          </p>
        </section>
      </Container>
    </main>
  );
}
