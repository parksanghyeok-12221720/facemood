"use client";

import { useEffect, useState } from "react";
import { getMsUntilMidnight } from "@/lib/discount";

const REPORT_PRICE_KRW = 34900;
const ORIGINAL_PRICE_KRW = 79800;
const DISCOUNT_PERCENT = Math.round(
  ((ORIGINAL_PRICE_KRW - REPORT_PRICE_KRW) / ORIGINAL_PRICE_KRW) * 100,
);

// Counts down to the next local midnight — a real, recurring "today only"
// deadline (same one DiscountCountdownBar uses), not a per-session timer
// that would quietly reset back to a fresh 30:00 on every visit.
export default function DiscountCountdown() {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemainingMs(getMsUntilMidnight());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  if (remainingMs === null) return null;

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return (
    <div className="mb-4 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-red-500 px-4 py-2.5 shadow-md shadow-rose-500/40">
      <span className="text-xs font-extrabold tracking-tight text-white">
        오늘의 특별할인 <span className="text-base font-black">{DISCOUNT_PERCENT}%</span>
      </span>
      <span className="rounded-md bg-white px-1.5 py-0.5 font-mono text-xs font-extrabold tabular-nums text-rose-600">
        {hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`}
      </span>
    </div>
  );
}
