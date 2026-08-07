"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ANONYMOUS, loadTossPayments } from "@tosspayments/tosspayments-sdk";
import type { TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import Container from "@/app/components/Container";
import { TEST_AMOUNT_KRW, isTestPhone } from "@/lib/testPayment";

const MATCH_REPORT_ID_KEY = "facemood_match_report_id";
const PENDING_PASSWORD_KEY = "facemood_match_pending_password";
const PENDING_PHONE_KEY = "facemood_match_pending_phone";
const PENDING_BUNDLE_KEY = "facemood_match_pending_bundle";

const MATCH_PRICE_KRW = 34900;
const MATCH_BUNDLE_PRICE_KRW = 59900;

const phonePrefixOptions = ["010", "011", "016", "017", "018", "019"];

function RefundPolicyModal({
  onClose,
  onAgree,
}: {
  onClose: () => void;
  onAgree: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-t-3xl bg-white sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-violet-100 px-6 py-4">
          <h2 className="text-sm font-bold text-black">취소 및 환불 규정</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-lg leading-none text-gray-400"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 text-xs leading-relaxed text-gray-600">
          <p>
            본 서비스는 사용자가 입력한 답변 및 업로드한 두 장의 사진을
            바탕으로 커플 무드 궁합 리포트를 제공하는 디지털 콘텐츠
            서비스입니다.
          </p>

          <h3 className="mt-5 text-sm font-bold text-black">
            1. 결제 취소 및 환불 가능 기준
          </h3>
          <p className="mt-2">
            결제 후 리포트 생성이 시작되기 전에는 전액 환불이 가능합니다.
          </p>
          <p className="mt-2">
            다만, 결제 후 리포트가 생성되어 열람 가능한 상태가 된 경우에는
            디지털 콘텐츠의 특성상 단순 변심에 의한 취소 및 환불이 제한될 수
            있습니다.
          </p>

          <h3 className="mt-5 text-sm font-bold text-black">
            2. 전액 환불이 가능한 경우
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>결제는 완료되었으나 리포트가 정상적으로 제공되지 않은 경우</li>
            <li>시스템 오류로 인해 리포트 생성이 실패한 경우</li>
            <li>동일 주문이 중복 결제된 경우</li>
            <li>회사의 귀책 사유로 정상적인 서비스 이용이 불가능한 경우</li>
          </ul>

          <h3 className="mt-5 text-sm font-bold text-black">
            3. 환불이 제한될 수 있는 경우
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>리포트 생성이 완료된 후 단순 변심으로 환불을 요청하는 경우</li>
            <li>리포트를 이미 열람한 후 환불을 요청하는 경우</li>
            <li>사용자가 잘못된 정보 또는 사진을 제출한 경우</li>
          </ul>

          <h3 className="mt-5 text-sm font-bold text-black">
            4. 리포트 결과에 대한 안내
          </h3>
          <p className="mt-2">
            FACEMOOD Match 리포트는 두 사람의 관계 성립 가능성, 궁합 점수의
            절대적 정확성을 보장하지 않습니다.
          </p>
          <p className="mt-2">
            본 리포트는 업로드한 사진에서 보이는 시각적 분위기와 답변을
            바탕으로 커플 무드, 스타일 방향을 제안하는 참고용 콘텐츠입니다.
          </p>

          <h3 className="mt-5 text-sm font-bold text-black">
            5. 환불 요청 방법
          </h3>
          <p className="mt-2">
            환불을 원하는 경우 고객센터 또는 문의 채널을 통해 결제자 이름,
            결제 일시, 주문번호, 환불 요청 사유를 전달해주시기 바랍니다.
          </p>

          <h3 className="mt-5 text-sm font-bold text-black">6. 기타</h3>
          <p className="mt-2 mb-1">
            본 취소 및 환불 규정에 명시되지 않은 사항은 관련 법령 및 결제기관
            정책에 따릅니다.
          </p>
        </div>

        <div className="border-t border-violet-100 px-6 py-4">
          <button
            type="button"
            onClick={onAgree}
            className="flex w-full items-center justify-center rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MatchCheckoutPage() {
  const [bundle, setBundle] = useState(false);
  const [phonePrefix, setPhonePrefix] = useState("010");
  const [phoneMiddle, setPhoneMiddle] = useState("");
  const [phoneLast, setPhoneLast] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [refundAgreed, setRefundAgreed] = useState(false);
  const [showRefundPolicy, setShowRefundPolicy] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [widgetsReady, setWidgetsReady] = useState(false);

  const [showCodeInput, setShowCodeInput] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [isRedeemingCode, setIsRedeemingCode] = useState(false);

  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const phone = `${phonePrefix}-${phoneMiddle}-${phoneLast}`;
  const price = bundle ? MATCH_BUNDLE_PRICE_KRW : MATCH_PRICE_KRW;
  const chargeAmount = isTestPhone(phone) ? TEST_AMOUNT_KRW : price;

  useEffect(() => {
    window.fbq?.("track", "InitiateCheckout", { value: price, currency: "KRW" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) {
        setError("결제 설정이 누락되었습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      try {
        const tossPayments = await loadTossPayments(clientKey);
        const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
        if (cancelled) return;

        await widgets.setAmount({ currency: "KRW", value: MATCH_PRICE_KRW });
        await widgets.renderPaymentMethods({ selector: "#toss-payment-method" });
        await widgets.renderAgreement({ selector: "#toss-agreement" });
        if (cancelled) return;

        widgetsRef.current = widgets;
        setWidgetsReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "결제 위젯을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          );
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    widgetsRef.current
      ?.setAmount({ currency: "KRW", value: chargeAmount })
      .catch(() => {});
  }, [chargeAmount]);

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
    if (!refundAgreed) {
      return "취소·환불 규정 처리방침에 동의해주세요.";
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

    const widgets = widgetsRef.current;
    if (!widgets) {
      setError("결제 위젯이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const reportId = localStorage.getItem(MATCH_REPORT_ID_KEY);
    if (!reportId) {
      setError(
        "결제를 진행할 리포트를 찾을 수 없습니다. 처음부터 다시 진행해주세요.",
      );
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      sessionStorage.setItem(PENDING_PASSWORD_KEY, password);
      sessionStorage.setItem(PENDING_PHONE_KEY, phone);
      sessionStorage.setItem(PENDING_BUNDLE_KEY, bundle ? "1" : "0");

      await widgets.requestPayment({
        orderId: reportId,
        orderName: bundle
          ? "FACEMOOD Match + Premium 번들"
          : "FACEMOOD Match 리포트",
        customerMobilePhone: `${phonePrefix}${phoneMiddle}${phoneLast}`,
        successUrl: `${window.location.origin}/match/checkout/success`,
        failUrl: `${window.location.origin}/match/checkout/fail`,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "결제 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      setError(message);
      setIsSubmitting(false);
    }
  }

  async function redeemWithCode() {
    if (isRedeemingCode) return;

    if (redeemCode.trim().length === 0) {
      setCodeError("코드를 입력해주세요.");
      return;
    }
    if (password.length < 4) {
      setCodeError("다시보기용 비밀번호를 4자 이상 입력해주세요.");
      return;
    }

    const matchReportId = localStorage.getItem(MATCH_REPORT_ID_KEY);
    if (!matchReportId) {
      setCodeError("리포트를 찾을 수 없습니다. 처음부터 다시 진행해주세요.");
      return;
    }

    setCodeError("");
    setIsRedeemingCode(true);

    try {
      const response = await fetch("/api/payments/redeem-match-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: redeemCode.trim(),
          matchReportId,
          password,
          phone: phoneMiddle && phoneLast ? phone : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "코드를 확인하지 못했습니다.");
      }

      window.location.href = `/match/report?id=${matchReportId}`;
    } catch (err) {
      setCodeError(
        err instanceof Error ? err.message : "코드 확인 중 오류가 발생했습니다.",
      );
      setIsRedeemingCode(false);
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
        {/* Photo banner */}
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl">
          <Image
            src="/match-checkout-banner/couple.png"
            alt="FACEMOOD Match"
            fill
            priority
            sizes="(max-width: 480px) 100vw, 448px"
            className="object-cover"
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-5 text-white shadow-lg shadow-violet-200">
          <p className="text-[11px] font-semibold tracking-wide text-violet-100">
            FACEMOOD MATCH
          </p>
          <p className="mt-1 text-lg font-extrabold leading-snug">
            우리 커플 무드 리포트 받기
          </p>
        </div>

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
              onChange={(event) => setPhoneMiddle(event.target.value.replace(/\D/g, ""))}
              placeholder="1234"
              disabled={isSubmitting}
              className={numericInputClass}
            />
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={phoneLast}
              onChange={(event) => setPhoneLast(event.target.value.replace(/\D/g, ""))}
              placeholder="5678"
              disabled={isSubmitting}
              className={numericInputClass}
            />
          </div>
        </section>

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

        <section className="mt-6">
          {!showCodeInput ? (
            <button
              type="button"
              onClick={() => setShowCodeInput(true)}
              className="text-xs font-semibold text-violet-600 underline underline-offset-2"
            >
              코드가 있으신가요?
            </button>
          ) : (
            <div className="rounded-2xl border border-violet-100 bg-white p-5">
              <p className="text-xs font-semibold tracking-[0.2em] text-violet-500">
                무료 이용 코드 입력
              </p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                FACEMOOD Premium + Match 번들 결제 시 문자로 받은 코드를
                입력하면 결제 없이 바로 리포트를 받아보실 수 있어요.
              </p>
              <input
                type="text"
                value={redeemCode}
                onChange={(event) => setRedeemCode(event.target.value)}
                placeholder="코드 입력"
                disabled={isRedeemingCode}
                className="mt-3 w-full rounded-xl border border-violet-100 px-4 py-3 text-center text-sm uppercase text-black outline-none focus:border-violet-300"
              />
              {codeError && (
                <p className="mt-2 text-xs text-red-500">{codeError}</p>
              )}
              <button
                type="button"
                onClick={redeemWithCode}
                disabled={isRedeemingCode}
                className="mt-3 flex w-full items-center justify-center rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isRedeemingCode ? "확인 중..." : "코드로 무료 확인하기"}
              </button>
            </div>
          )}
        </section>

        <section className="mt-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-violet-500">
            상품 선택
          </p>
          <div className="mt-3 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setBundle(false)}
              disabled={isSubmitting}
              className={`rounded-2xl border-2 p-5 text-left transition-colors ${
                !bundle ? "border-violet-500 bg-violet-50/50" : "border-violet-100 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-black">FACEMOOD Match</span>
                {!bundle && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white">
                    ✓
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Mood Type · 얼굴 무드 · 스타일 · 무드 라이프 · 공유 리포트
              </p>
              <p className="mt-3 text-xl font-extrabold text-black">
                {MATCH_PRICE_KRW.toLocaleString()}원
              </p>
            </button>

            <button
              type="button"
              onClick={() => setBundle(true)}
              disabled={isSubmitting}
              className={`rounded-2xl border-2 p-5 text-left transition-colors ${
                bundle ? "border-violet-500 bg-violet-50/50" : "border-violet-100 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-bold text-white">
                  BEST
                </span>
                {bundle && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white">
                    ✓
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm font-bold text-black">
                Match + FACEMOOD Premium 번들
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Match 리포트 + 나만의 FACEMOOD Premium 리포트(17개 챕터)까지
                함께
              </p>
              <p className="mt-3 text-xl font-extrabold text-black">
                {MATCH_BUNDLE_PRICE_KRW.toLocaleString()}원
              </p>
            </button>
          </div>
        </section>

        <section className="mt-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-violet-500">
            결제 수단
          </p>
          <div className="mt-3 overflow-hidden rounded-2xl border border-violet-100 bg-white">
            {!widgetsReady && !error && (
              <p className="p-5 text-center text-xs text-gray-400">
                결제 수단을 불러오는 중...
              </p>
            )}
            <div id="toss-payment-method" />
          </div>
          <div id="toss-agreement" className="mt-3" />
        </section>

        <section className="mt-8 flex flex-col gap-3">
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

          <div className="flex items-start gap-2.5 text-xs leading-relaxed text-gray-600">
            <input
              id="refund-agree"
              type="checkbox"
              checked={refundAgreed}
              onChange={(event) => setRefundAgreed(event.target.checked)}
              disabled={isSubmitting}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-violet-200 bg-white accent-violet-300 focus:ring-violet-300"
            />
            <label htmlFor="refund-agree" className="flex-1">
              (필수) 취소·환불 규정 처리방침에 동의합니다.{" "}
              <button
                type="button"
                onClick={() => setShowRefundPolicy(true)}
                className="font-semibold text-violet-600 underline underline-offset-2"
              >
                자세히 보기
              </button>
            </label>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </section>

        <section className="mt-6">
          <button
            type="button"
            onClick={startCheckout}
            disabled={!agreed || !refundAgreed || !widgetsReady || isSubmitting}
            className="flex w-full items-center justify-center rounded-full bg-black px-8 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? "결제 요청 중..." : `${chargeAmount.toLocaleString()}원 결제하기`}
          </button>
          <p className="mt-3 text-center text-xs text-gray-400">
            위에서 원하는 결제수단을 선택한 뒤 결제를 진행해주세요.
          </p>
        </section>
      </Container>

      {showRefundPolicy && (
        <RefundPolicyModal
          onClose={() => setShowRefundPolicy(false)}
          onAgree={() => {
            setRefundAgreed(true);
            setShowRefundPolicy(false);
          }}
        />
      )}
    </main>
  );
}
