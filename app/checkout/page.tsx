"use client";

import { useEffect, useRef, useState } from "react";
import { ANONYMOUS, loadTossPayments } from "@tosspayments/tosspayments-sdk";
import type { TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import Container from "@/app/components/Container";
import { TEST_AMOUNT_KRW, isTestPhone } from "@/lib/testPayment";

const REPORT_ID_KEY = "facemood_report_id";
const PENDING_PASSWORD_KEY = "facemood_pending_password";
const PENDING_PHONE_KEY = "facemood_pending_phone";
const REPORT_PRICE_KRW = 34900;
const ORIGINAL_PRICE_KRW = 79800;
const DISCOUNT_KRW = ORIGINAL_PRICE_KRW - REPORT_PRICE_KRW;
const DISCOUNT_PERCENT = Math.round((DISCOUNT_KRW / ORIGINAL_PRICE_KRW) * 100);

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
            본 서비스는 사용자가 입력한 설문 답변 및 업로드한 사진을 바탕으로
            개인별 온라인 이미지 분석 리포트를 제공하는 디지털 콘텐츠
            서비스입니다.
          </p>

          <h3 className="mt-5 text-sm font-bold text-black">
            1. 결제 취소 및 환불 가능 기준
          </h3>
          <p className="mt-2">
            결제 후 리포트 생성이 시작되기 전에는 전액 환불이 가능합니다.
          </p>
          <p className="mt-2">
            다만, 결제 후 사용자의 요청에 따라 리포트 생성이 시작되었거나,
            리포트가 생성되어 사용자가 열람 가능한 상태가 된 경우에는 디지털
            콘텐츠의 특성상 단순 변심에 의한 취소 및 환불이 제한될 수
            있습니다.
          </p>
          <p className="mt-2">
            이는 개인별 입력 정보에 따라 즉시 생성되는 맞춤형 디지털
            리포트의 특성상, 생성 이후에는 콘텐츠의 회수 및 재판매가
            어렵기 때문입니다.
          </p>

          <h3 className="mt-5 text-sm font-bold text-black">
            2. 전액 환불이 가능한 경우
          </h3>
          <p className="mt-2">
            아래의 경우에는 리포트 생성 또는 열람 여부와 관계없이 전액
            환불이 가능합니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>결제는 완료되었으나 리포트가 정상적으로 제공되지 않은 경우</li>
            <li>시스템 오류로 인해 리포트 생성이 실패한 경우</li>
            <li>결제 완료 후에도 사용자가 리포트를 확인할 수 없는 경우</li>
            <li>동일 주문이 중복 결제된 경우</li>
            <li>결제 승인 후 서비스 제공이 불가능한 경우</li>
            <li>회사의 귀책 사유로 정상적인 서비스 이용이 불가능한 경우</li>
          </ul>

          <h3 className="mt-5 text-sm font-bold text-black">
            3. 환불이 제한될 수 있는 경우
          </h3>
          <p className="mt-2">아래의 경우에는 환불이 제한될 수 있습니다.</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>리포트 생성이 완료된 후 단순 변심으로 환불을 요청하는 경우</li>
            <li>
              사용자가 입력한 정보 또는 업로드한 사진의 품질 문제로 결과가
              기대와 다르다는 사유만으로 환불을 요청하는 경우
            </li>
            <li>리포트를 이미 열람한 후 환불을 요청하는 경우</li>
            <li>사용자가 잘못된 정보 또는 부정확한 사진을 제출한 경우</li>
            <li>
              서비스 안내 및 결과 제공 범위를 충분히 확인하지 않고 결제한
              경우
            </li>
          </ul>
          <p className="mt-2">
            단, 서비스 오류나 리포트 미제공 등 회사의 귀책 사유가 확인되는
            경우에는 환불이 가능합니다.
          </p>

          <h3 className="mt-5 text-sm font-bold text-black">
            4. 리포트 결과에 대한 안내
          </h3>
          <p className="mt-2">
            FACEMOOD 리포트는 외모 점수, 외모 등급, 확정적인 퍼스널컬러
            진단, 의료적·심리적 진단을 제공하지 않습니다.
          </p>
          <p className="mt-2">
            본 리포트는 사진상으로 보이는 이미지 무드와 사용자의 답변을
            바탕으로 추구미, 컬러 방향, 헤어, 메이크업, 스타일링 방향을
            제안하는 참고용 콘텐츠입니다.
          </p>
          <p className="mt-2">
            사진의 조명, 각도, 화질, 보정 여부, 배경색, 사용자의 답변
            내용에 따라 분석 결과는 달라질 수 있습니다.
          </p>

          <h3 className="mt-5 text-sm font-bold text-black">
            5. 환불 요청 방법
          </h3>
          <p className="mt-2">
            환불을 원하는 경우 고객센터 또는 문의 채널을 통해 아래 정보를
            전달해주시기 바랍니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>결제자 이름</li>
            <li>결제 일시</li>
            <li>주문번호 또는 결제 내역</li>
            <li>환불 요청 사유</li>
            <li>리포트 확인 가능 여부</li>
          </ul>
          <p className="mt-2">
            환불 요청 접수 후 결제 내역과 서비스 제공 상태를 확인한 뒤
            환불 가능 여부를 안내드립니다.
          </p>

          <h3 className="mt-5 text-sm font-bold text-black">
            6. 환불 처리 기간
          </h3>
          <p className="mt-2">
            환불이 승인된 경우 결제수단에 따라 환불 처리 기간이 달라질 수
            있습니다.
          </p>
          <p className="mt-2">
            신용카드 및 체크카드 결제의 경우 카드사 정책에 따라 환불
            반영까지 일정 시간이 소요될 수 있습니다. 카드 결제는 매입 전
            취소 시 비교적 빠르게 처리되며, 매입 이후 또는 부분 취소는
            영업일 기준 3~4일 정도 소요될 수 있습니다. 일부 결제수단이나
            카드사 사정에 따라 환불 반영 기간은 더 길어질 수 있습니다.
          </p>

          <h3 className="mt-5 text-sm font-bold text-black">
            7. 청약철회 관련 안내
          </h3>
          <p className="mt-2">
            본 서비스는 결제 후 사용자의 입력 정보에 따라 개별적으로
            생성되는 온라인 디지털 리포트입니다.
          </p>
          <p className="mt-2">
            무료 미리보기를 통해 서비스의 일부 내용을 확인할 수 있으며,
            결제 전 리포트 제공 방식과 환불 제한 가능성을 안내합니다.
          </p>
          <p className="mt-2">
            사용자가 결제 후 리포트 생성을 요청한 경우, 디지털 콘텐츠
            제공이 시작된 것으로 보아 단순 변심에 의한 청약철회가 제한될
            수 있습니다.
          </p>

          <h3 className="mt-5 text-sm font-bold text-black">8. 기타</h3>
          <p className="mt-2 mb-1">
            본 취소 및 환불 규정에 명시되지 않은 사항은 관련 법령 및
            결제기관 정책에 따릅니다.
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
  const [refundAgreed, setRefundAgreed] = useState(false);
  const [showRefundPolicy, setShowRefundPolicy] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [widgetsReady, setWidgetsReady] = useState(false);
  const [tossAgreementOk, setTossAgreementOk] = useState(false);

  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const phone = `${phonePrefix}-${phoneMiddle}-${phoneLast}`;
  const chargeAmount = isTestPhone(phone) ? TEST_AMOUNT_KRW : REPORT_PRICE_KRW;

  // Renders Toss's payment-method and agreement widgets inline as soon as
  // the page loads, using the default price — the widget object stays in
  // widgetsRef so startCheckout() can call requestPayment() on it later.
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

        await widgets.setAmount({ currency: "KRW", value: REPORT_PRICE_KRW });
        await widgets.renderPaymentMethods({ selector: "#toss-payment-method" });
        const agreementWidget = await widgets.renderAgreement({
          selector: "#toss-agreement",
        });
        if (cancelled) return;

        agreementWidget.on("agreementStatusChange", (status) => {
          console.log("[toss-debug] agreementStatusChange", status);
          setTossAgreementOk(status.agreedRequiredTerms);
        });

        widgetsRef.current = widgets;
        setWidgetsReady(true);
        console.log("[toss-debug] widgetsReady = true");
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

  // The test-phone discount (see lib/testPayment.ts) changes the amount
  // after the widget already rendered with the default price — keep the
  // widget's configured amount in sync whenever that phone number is typed.
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
    if (!tossAgreementOk) {
      return "결제 위젯의 필수 약관에 동의해주세요.";
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

    const reportId = localStorage.getItem(REPORT_ID_KEY);
    if (!reportId) {
      setError(
        "결제를 진행할 리포트를 찾을 수 없습니다. 처음부터 다시 진행해주세요.",
      );
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      // Read back on the success page after Toss redirects here — the
      // payment is only confirmed (and this password/phone saved)
      // server-side once Toss verifies the charge.
      sessionStorage.setItem(PENDING_PASSWORD_KEY, password);
      sessionStorage.setItem(PENDING_PHONE_KEY, phone);

      await widgets.requestPayment({
        orderId: reportId,
        orderName: "FACEMOOD 상세 리포트",
        customerMobilePhone: `${phonePrefix}${phoneMiddle}${phoneLast}`,
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail`,
      });
      // Browser navigates away to Toss's payment page here on success.
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "결제 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
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

        {/* Payment method — rendered inline by the Toss widget SDK */}
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

        {/* Agreement */}
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

        {/* Pay */}
        <section className="mt-6">
          <button
            type="button"
            onClick={startCheckout}
            disabled={
              !agreed ||
              !refundAgreed ||
              !widgetsReady ||
              !tossAgreementOk ||
              isSubmitting
            }
            className="flex w-full items-center justify-center rounded-full bg-black px-8 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting
              ? "결제 요청 중..."
              : `${REPORT_PRICE_KRW.toLocaleString()}원 결제하기`}
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
