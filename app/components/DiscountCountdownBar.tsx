"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMsUntilMidnight } from "@/lib/discount";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export default function DiscountCountdownBar({
  href,
  ctaLabel,
  darkColor,
  gradientFrom,
  gradientTo,
}: {
  href: string;
  ctaLabel: string;
  darkColor: string;
  gradientFrom: string;
  gradientTo: string;
}) {
  // Deferred to client-only — the deadline is computed from the visitor's
  // own local time, so an SSR-rendered value would almost always mismatch
  // the client's first tick and trigger a hydration warning.
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    // First tick happens asynchronously via the interval itself rather than
    // a synchronous setState call here, per this codebase's
    // react-hooks/set-state-in-effect convention (see AnalysisCounter.tsx).
    const id = setInterval(() => setRemainingMs(getMsUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-4 py-3">
      <div className="mx-auto flex max-w-md overflow-hidden rounded-2xl shadow-lg">
        <div
          className="flex flex-col items-center justify-center px-4 py-3"
          style={{ backgroundColor: darkColor }}
        >
          <span className="text-[9px] font-medium text-white/70">
            할인 혜택 마감까지
          </span>
          <span className="text-sm font-bold tabular-nums text-white">
            {remainingMs === null ? "--:--:--" : formatCountdown(remainingMs)}
          </span>
        </div>
        <Link
          href={href}
          className="flex flex-1 items-center justify-center px-6 py-3 text-sm font-bold text-white"
          style={{
            background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
          }}
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
