"use client";

import Image from "next/image";
import Link from "next/link";

// Split out from the (server-rendered) homepage for the onClick handlers —
// each fires its own Meta Pixel custom event so the two funnels can be
// measured separately.
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
            alt="나만의 추구미 찾기"
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
          <p className="text-lg font-bold text-white">나만의 추구미 찾기</p>
          <p className="mt-1 text-xs leading-relaxed text-white/80">
            내 얼굴에 어울리는 헤어·메이크업·스타일 분석
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
