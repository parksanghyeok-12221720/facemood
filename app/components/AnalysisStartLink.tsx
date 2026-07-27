"use client";

import Link from "next/link";

// Split out from the (server-rendered) homepage just for this onClick —
// fires a Meta Pixel custom event when someone clicks into the funnel.
export default function AnalysisStartLink() {
  return (
    <Link
      href="/detail"
      onClick={() => window.fbq?.("trackCustom", "StartAnalysis")}
      className="flex w-full items-center justify-center rounded-full bg-black px-8 py-4 text-sm font-semibold text-white"
    >
      분석 시작하기
    </Link>
  );
}
