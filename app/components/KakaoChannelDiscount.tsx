"use client";

import Script from "next/script";
import { useState } from "react";
import { KAKAO_CHANNEL_DISCOUNT_KRW, KAKAO_CHANNEL_PUBLIC_ID } from "@/lib/kakaoChannel";

const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Channel: {
        addChannel: (options: { channelPublicId: string }) => Promise<void>;
      };
    };
  }
}

// Checkout-page promo: opens Kakao's own "채널 추가" popup via the Channel
// JS SDK. There's no way to confirm from the client alone that the user
// actually finished adding the channel inside that popup (would need full
// Kakao OAuth login for a server-verifiable check) — this treats "the
// popup flow ran" as good enough, same trust level as a coupon code, and
// leaves the actual discounted-amount bookkeeping to the parent checkout
// page (this component only renders the button and reports back via
// onApplied).
export default function KakaoChannelDiscount({
  applied,
  eligible,
  onApplied,
}: {
  applied: boolean;
  // Whether the currently-selected product actually gets discounted (e.g.
  // false for the entry-level Basic tier / standalone option) — when
  // false, this never shows the "적용 완료" success state even if applied
  // is true, since claiming a discount that isn't reflected in the price
  // would be misleading.
  eligible: boolean;
  onApplied: () => void;
}) {
  const [isOpening, setIsOpening] = useState(false);
  const showApplied = applied && eligible;

  if (!KAKAO_JS_KEY) return null;

  async function handleClick() {
    if (isOpening || showApplied) return;
    if (!window.Kakao) return;

    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_JS_KEY!);
    }

    setIsOpening(true);
    try {
      await window.Kakao.Channel.addChannel({ channelPublicId: KAKAO_CHANNEL_PUBLIC_ID });
      onApplied();
    } catch {
      // Popup blocked or the user closed it without finishing — just let
      // them try again, no error state needed for an optional discount.
    } finally {
      setIsOpening(false);
    }
  }

  return (
    <>
      <Script
        id="kakao-sdk"
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
        strategy="afterInteractive"
      />
      <div
        className={`flex items-center gap-3 rounded-2xl border p-4 ${
          showApplied
            ? "border-violet-200 bg-violet-50"
            : "border-yellow-200 bg-yellow-50"
        }`}
      >
        <span className="text-2xl" aria-hidden="true">
          {showApplied ? "✅" : "💬"}
        </span>
        <div className="flex-1">
          <p className="text-sm font-bold text-black">
            {showApplied
              ? `카카오 채널 추가 할인 적용 완료 (-${KAKAO_CHANNEL_DISCOUNT_KRW.toLocaleString()}원)`
              : "카카오 채널 추가하고 즉시 할인받기"}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {showApplied
              ? "할인된 금액으로 결제가 진행돼요."
              : eligible
                ? `채널 추가 한 번이면 ${KAKAO_CHANNEL_DISCOUNT_KRW.toLocaleString()}원 할인이 바로 적용돼요.`
                : `이 상품은 할인 대상이 아니에요. 상위 상품 선택 시 ${KAKAO_CHANNEL_DISCOUNT_KRW.toLocaleString()}원 할인이 적용돼요.`}
          </p>
        </div>
        {!showApplied && (
          <button
            type="button"
            onClick={handleClick}
            disabled={isOpening}
            className="shrink-0 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {isOpening ? "여는 중..." : "채널 추가"}
          </button>
        )}
      </div>
    </>
  );
}
