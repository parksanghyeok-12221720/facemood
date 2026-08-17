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
    <p className="mb-2.5 text-center text-[12px] font-semibold text-rose-600">
      오늘의 특별할인 <span className="font-extrabold">{DISCOUNT_PERCENT}%</span>
      <span className="ml-1.5 font-mono tabular-nums text-rose-500">
        {" "}
        · {hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`}
      </span>
    </p>
  );
}
