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
    </div>
  );
}
