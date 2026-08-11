"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Sub-items revealed by the "+" toggle on the 토탈 스타일 컨설팅 card —
// each jumps to its matching section on /detail (see the `chapters` anchor
// ids there). 퍼스널 컨설팅 has no dedicated section yet, so it lands on
// the page itself rather than a specific chapter.
const TOTAL_CONSULTING_ITEMS = [
  { label: "헤어 컨설팅", href: "/detail#section-hair" },
  { label: "메이크업 컨설팅", href: "/detail#section-makeup" },
  { label: "퍼스널 컨설팅", href: "/detail" },
  { label: "퍼스널 컬러", href: "/detail#section-color" },
];

function PlusIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-45" : ""}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Split out from the (server-rendered) homepage for the onClick handlers —
// each fires its own Meta Pixel custom event so the two funnels can be
// measured separately.
export default function ProductChoiceCards() {
  const [showAllProducts, setShowAllProducts] = useState(false);

  return (
    <div className="mt-5 flex flex-col gap-4">
      <div className="group relative overflow-hidden rounded-3xl">
        <Link
          href="/detail"
          onClick={() => window.fbq?.("trackCustom", "StartAnalysis")}
          className="block"
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

        <button
          type="button"
          onClick={() => setShowAllProducts((prev) => !prev)}
          aria-label={showAllProducts ? "전체 상품 닫기" : "전체 상품 보기"}
          aria-expanded={showAllProducts}
          className="absolute right-4 top-4 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-white"
        >
          <PlusIcon open={showAllProducts} />
        </button>

        {showAllProducts && (
          <>
            <button
              type="button"
              aria-label="전체 상품 닫기"
              onClick={() => setShowAllProducts(false)}
              className="fixed inset-0 z-30 cursor-default bg-transparent"
            />
            <div className="absolute right-4 top-14 z-40 w-44 overflow-hidden rounded-2xl bg-white p-1.5 shadow-xl">
              {TOTAL_CONSULTING_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setShowAllProducts(false)}
                  className="block rounded-xl px-3 py-2.5 text-xs font-semibold text-black hover:bg-violet-50"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

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
