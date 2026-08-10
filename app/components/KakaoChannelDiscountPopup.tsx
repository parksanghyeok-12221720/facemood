"use client";

import Image from "next/image";
import Script from "next/script";
import { useState } from "react";
import { KAKAO_CHANNEL_DISCOUNT_KRW, KAKAO_CHANNEL_PUBLIC_ID } from "@/lib/kakaoChannel";

const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

// Pops up as soon as the checkout page loads (instead of waiting for the
// user to notice the inline KakaoChannelDiscount banner further down).
// Same underlying Kakao.Channel.addChannel() flow — see that component's
// comments for why this is a self-reported, not server-verified, discount.
// Promo image lives at public/kakao-channel-banner.png (aspect 4:3,
// landscape) — swap the file to change it. Note: the current source photo
// is portrait (1086x1448), so this crops it top/bottom by design per
// explicit request.
export default function KakaoChannelDiscountPopup({
  applied,
  eligible,
  onApplied,
}: {
  applied: boolean;
  // Whether the currently-selected product actually gets discounted (e.g.
  // false for the entry-level Basic tier / standalone option) — the popup
  // still shows either way, but the copy is honest about whether this
  // specific selection benefits.
  eligible: boolean;
  onApplied: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  if (!KAKAO_JS_KEY || (applied && eligible) || dismissed) return null;

  async function handleClick() {
    if (isOpening) return;
    if (!window.Kakao) return;

    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_JS_KEY!);
    }

    setIsOpening(true);
    try {
      await window.Kakao.Channel.addChannel({ channelPublicId: KAKAO_CHANNEL_PUBLIC_ID });
      onApplied();
      setDismissed(true);
    } catch {
      // Popup blocked or the user closed it without finishing — leave the
      // modal open so they can try again.
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
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-6">
        <div className="relative w-full max-w-xs overflow-hidden rounded-3xl bg-white p-6 text-center">
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="닫기"
            className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-sm text-white"
          >
            ✕
          </button>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
            <Image
              src="/kakao-channel-banner.png"
              alt="카카오 채널 추가 할인"
              fill
              priority
              sizes="320px"
              className="object-cover"
            />
          </div>

          <p className="mt-5 text-lg font-bold leading-snug text-black">
            카카오 채널 추가하고
            <br />
            {KAKAO_CHANNEL_DISCOUNT_KRW.toLocaleString()}원 할인받기
          </p>
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            {eligible
              ? "채널 추가 한 번이면 할인된 금액으로 바로 결제할 수 있어요."
              : "지금 선택한 상품은 할인 대상이 아니에요. 상위 상품 선택 시 할인이 적용돼요."}
          </p>

          <button
            type="button"
            onClick={handleClick}
            disabled={isOpening}
            className="mt-5 flex w-full items-center justify-center rounded-full bg-black px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isOpening ? "여는 중..." : eligible ? "채널 추가하고 할인받기" : "채널 추가하기"}
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="mt-3 text-xs text-gray-400 underline underline-offset-2"
          >
            나중에 할게요
          </button>
        </div>
      </div>
    </>
  );
}
