"use client";

import { useEffect, useState } from "react";

const COUNTDOWN_KEY = "facemood_discount_deadline";
const DURATION_MS = 30 * 60 * 1000;
const REPORT_PRICE_KRW = 34900;
const ORIGINAL_PRICE_KRW = 79800;
const DISCOUNT_PERCENT = Math.round(
  ((ORIGINAL_PRICE_KRW - REPORT_PRICE_KRW) / ORIGINAL_PRICE_KRW) * 100,
);

// The deadline is pinned to sessionStorage on first read so navigating
// around the site (or refreshing) keeps counting down from the same
// moment instead of resetting back to 30:00 every time this mounts.
function getDeadline(): number {
  const now = Date.now();
  const stored = sessionStorage.getItem(COUNTDOWN_KEY);
  if (stored) {
    const deadline = Number(stored);
    if (Number.isFinite(deadline) && deadline > now) return deadline;
  }
  const deadline = now + DURATION_MS;
  sessionStorage.setItem(COUNTDOWN_KEY, String(deadline));
  return deadline;
}

export default function DiscountCountdown() {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    const deadline = getDeadline();
    const tick = () => setRemainingMs(Math.max(0, deadline - Date.now()));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Null on the very first client render (before sessionStorage is read) —
  // renders nothing rather than a flash of "30:00" that may not match.
  if (remainingMs === null || remainingMs <= 0) return null;

  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return (
    <div className="mb-4 flex animate-pulse items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-red-500 px-4 py-2.5 shadow-md shadow-rose-500/40">
      <span className="text-xs font-extrabold tracking-tight text-white">
        🔥 첫 방문 특별할인{" "}
        <span className="text-base font-black">{DISCOUNT_PERCENT}%</span>{" "}
        할인
      </span>
      <span className="rounded-md bg-white px-1.5 py-0.5 font-mono text-xs font-extrabold tabular-nums text-rose-600">
        {minutes}:{seconds}
      </span>
    </div>
  );
}
