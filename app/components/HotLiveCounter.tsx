"use client";

import { useEffect, useState } from "react";

const BASE_COUNT = 69728;

// Live-activity ticker next to the "HOT" badge — same irregular-interval,
// always-increasing tick pattern as AnalysisCounter, just smaller
// magnitude/steps so it reads as a real-time viewer count rather than a
// lifetime total. Purely cosmetic — not backed by a real viewer count.
export default function HotLiveCounter() {
  const [count, setCount] = useState(BASE_COUNT);

  useEffect(() => {
    let cancelled = false;

    function scheduleNext() {
      const delay = 1800 + Math.random() * 4200;
      setTimeout(() => {
        if (cancelled) return;
        setCount((prev) => prev + 1);
        scheduleNext();
      }, delay);
    }

    scheduleNext();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <span className="inline-flex items-center gap-1 text-base font-extrabold tracking-tight text-orange-500 sm:text-lg">
      <span className="text-lg sm:text-xl">🔥</span>
      {count.toLocaleString()}
    </span>
  );
}
