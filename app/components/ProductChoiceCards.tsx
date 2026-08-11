"use client";

import Image from "next/image";
import Link from "next/link";

// Split out from the (server-rendered) homepage for the onClick handler —
// fires a Meta Pixel custom event to measure the funnel.
export default function ProductChoiceCards() {
  return (
    <div className="mt-5 flex flex-col gap-4">
      <Link
        href="/detail"
        onClick={() => window.fbq?.("trackCustom", "StartAnalysis")}
        className="group relative block overflow-hidden rounded-3xl"
      >
        <div className="relative aspect-[4/3] w-full">
          <Image
            src="/home-card-mood.png"
            alt="토탈 스타일 컨설팅"
            fill
            sizes="(max-width: 480px) 100vw, 448px"
            className="object-cover transition-transform duration-300 group-active:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-lg font-bold text-white">토탈 스타일 컨설팅</p>
          <p className="mt-1 text-xs leading-relaxed text-white/80">
            내 얼굴에 어울리는 헤어·메이크업·스타일 분석
          </p>
        </div>
      </Link>

      {/* Male version — links to /detail same as the main card for now,
          since there's no male-specific landing page yet even though
          /test itself already asks for and adapts to gender. */}
      <Link
        href="/detail"
        onClick={() => window.fbq?.("trackCustom", "StartAnalysis")}
        className="group relative block overflow-hidden rounded-3xl"
      >
        <div className="relative aspect-[4/3] w-full">
          <Image
            src="/home-card-mood-male.png"
            alt="토탈 스타일 컨설팅 (남성)"
            fill
            sizes="(max-width: 480px) 100vw, 448px"
            className="object-cover transition-transform duration-300 group-active:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        </div>
        <span className="absolute right-4 top-4 rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-bold text-white">
          NEW
        </span>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-lg font-bold text-white">토탈 스타일 컨설팅 (남성)</p>
          <p className="mt-1 text-xs leading-relaxed text-white/80">
            헤어·퍼스널컬러·코디 추천
          </p>
        </div>
      </Link>

      <Link
        href="/match/upload"
        onClick={() => window.fbq?.("trackCustom", "StartMatch")}
        className="group relative block overflow-hidden rounded-3xl"
      >
        <div className="relative aspect-[4/3] w-full">
          <Image
            src="/home-card-match.png"
            alt="그 사람과의 무드궁합"
            fill
            sizes="(max-width: 480px) 100vw, 448px"
            className="object-cover transition-transform duration-300 group-active:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        </div>
        <span className="absolute right-4 top-4 rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-bold text-white">
          NEW
        </span>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-lg font-bold text-white">그 사람과의 무드궁합</p>
          <p className="mt-1 text-xs leading-relaxed text-white/80">
            두 사람의 얼굴 무드와 커플 케미 분석
          </p>
        </div>
      </Link>
    </div>
  );
}
