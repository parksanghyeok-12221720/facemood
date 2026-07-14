"use client";

import { useState } from "react";
import { ANONYMOUS, loadTossPayments } from "@tosspayments/tosspayments-sdk";
import Container from "@/app/components/Container";

const REPORT_ID_KEY = "facemood_report_id";
const PENDING_PASSWORD_KEY = "facemood_pending_password";
const REPORT_PRICE_KRW = 9900;

const includedItems: { text: string; accent?: boolean }[] = [
  { text: "현재 이미지 무드 분석" },
  { text: "추구미 유형 정리" },
  { text: "헤어 추천" },
  { text: "메이크업 방향" },
  { text: "패션 실루엣" },
  { text: "피해야 할 스타일" },
  { text: "사진 포즈 추천" },
  { text: "사진상 컬러 무드 분석", accent: true },
  { text: "추천 컬러 팔레트", accent: true },
  { text: "헤어 컬러 방향", accent: true },
  { text: "메이크업 색조 추천", accent: true },
  { text: "패션 색감 추천", accent: true },
  { text: "피하면 좋은 컬러감", accent: true },
  { text: "베이스 메이크업 방향", accent: true },
  { text: "눈썹 스타일", accent: true },
  { text: "아이메이크업 강도", accent: true },
  { text: "블러셔 위치와 색감", accent: true },
  { text: "립 컬러 추천", accent: true },
  { text: "피하면 좋은 메이크업 방향", accent: true },
];

export default function CheckoutPage() {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function startCheckout() {
    if (isSubmitting) return;

    if (password.length < 4) {
      setError("비밀번호는 4자 이상 입력해주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호가 서로 일치하지 않아요.");
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
      // Read back on the success page after Toss redirects here — the
      // payment is only confirmed (and this password saved) server-side
      // once Toss verifies the charge.
      sessionStorage.setItem(PENDING_PASSWORD_KEY, password);

      const tossPayments = await loadTossPayments(clientKey);
      const payment = tossPayments.payment({ customerKey: ANONYMOUS });

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

  return (
    <main className="flex min-h-screen flex-col justify-center bg-white py-16 text-black">
      <Container>
        <h1 className="text-xl font-bold text-black">상세 리포트</h1>

        <div className="mt-8 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm shadow-violet-100/60">
          <p className="text-xs tracking-[0.2em] text-violet-500">런칭가</p>
          <p className="mt-2 text-3xl font-bold text-black">9,900원</p>

          <div className="mt-8 border-t border-violet-100 pt-6">
            <p className="text-xs tracking-[0.2em] text-violet-500">
              포함 내용
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {includedItems.map((item) => (
                <li
                  key={item.text}
                  className={`flex items-center gap-3 text-sm ${
                    item.accent ? "text-violet-700" : "text-gray-600"
                  }`}
                >
                  <span
                    className={`h-1 w-1 shrink-0 rounded-full ${
                      item.accent ? "bg-violet-400" : "bg-gray-400"
                    }`}
                  />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm shadow-violet-100/60">
          <p className="text-xs tracking-[0.2em] text-violet-500">
            다시보기용 비밀번호 설정
          </p>
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            나중에 이 리포트 링크로 다시 접속할 때 필요해요.
          </p>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호 (4자 이상)"
            disabled={isSubmitting}
            className="mt-4 w-full rounded-xl border border-violet-100 px-4 py-3 text-sm text-black outline-none focus:border-violet-300"
          />
          <input
            type="password"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            placeholder="비밀번호 확인"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl border border-violet-100 px-4 py-3 text-sm text-black outline-none focus:border-violet-300"
          />
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>

        <div className="mt-10">
          <button
            onClick={startCheckout}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-full bg-black px-8 py-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isSubmitting ? "결제창 여는 중..." : "9,900원으로 상세 리포트 보기"}
          </button>
          <p className="mt-3 text-center text-xs text-gray-400">
            토스페이먼츠 결제창으로 이동합니다.
          </p>
        </div>
      </Container>
    </main>
  );
}
