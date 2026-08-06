"use client";

import { useEffect, useState } from "react";

const BASE_COUNT = 69728;

// Live-activity ticker next to the "HOT" badge — same irregular-interval,
// always-increasing tick pattern as AnalysisCounter, just faster and with
// bigger, irregular jumps (2-3 at a time) so it reads as a busier live
// viewer count rather than a lifetime total. Purely cosmetic — not backed
// by a real viewer count.
export default function HotLiveCounter() {
  const [count, setCount] = useState(BASE_COUNT);

  useEffect(() => {
    let cancelled = false;

    function scheduleNext() {
      const delay = 500 + Math.random() * 1300;
      setTimeout(() => {
        if (cancelled) return;
        setCount((prev) => prev + (2 + Math.floor(Math.random() * 2)));
        scheduleNext();
      }, delay);
    }

    scheduleNext();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatted = count.toLocaleString();
  const lastDigit = formatted.slice(-1);
  const leadingDigits = formatted.slice(0, -1);

  return (
    <span className="inline-flex items-center gap-1 text-base font-extrabold tracking-tight text-orange-500 sm:text-lg">
      <span className="text-lg sm:text-xl">🔥</span>
      <span className="inline-flex items-baseline">
        {leadingDigits}
        <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden align-baseline">
          {/* Keyed on count so React remounts this span on every tick,
              replaying the CSS roll-down animation each time the ones
              digit changes — a small "odometer" flip instead of an
              instant swap. */}
          <span key={count} className="absolute inset-0 animate-digit-roll">
            {lastDigit}
          </span>
        </span>
      </span>
    </span>
  );
}
