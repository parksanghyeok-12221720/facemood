"use client";

import Link from "next/link";

// Split out from the (server-rendered) homepage for the onClick handlers —
// each fires its own Meta Pixel custom event so the two funnels can be
// measured separately.
export default function ProductChoiceCards() {
  return (
    <div className="flex w-full flex-col gap-3">
      <Link
        href="/detail"
        onClick={() => window.fbq?.("trackCustom", "StartAnalysis")}
        className="rounded-2xl border-2 border-violet-500 bg-white px-6 py-5 text-left shadow-sm shadow-violet-100"
      >
        <span className="inline-flex items-center rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white">
          FACEMOOD
        </span>
        <p className="mt-2.5 text-base font-bold text-black">
          나만의 추구미 찾기
        </p>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          내 얼굴에 어울리는 헤어·메이크업·스타일 분석
        </p>
      </Link>

      <Link
        href="/match"
        onClick={() => window.fbq?.("trackCustom", "StartMatch")}
        className="rounded-2xl border-2 border-violet-500 bg-white px-6 py-5 text-left shadow-sm shadow-violet-100"
      >
        <span className="inline-flex items-center rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white">
          FACEMOOD MATCH — FOR TWO
        </span>
        <p className="mt-2.5 text-base font-bold text-black">
          그 사람과의 무드궁합
        </p>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          두 사람의 얼굴 무드와 커플 케미 분석
        </p>
      </Link>
    </div>
  );
}
