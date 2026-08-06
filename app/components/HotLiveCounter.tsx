"use client";

import { useEffect, useState } from "react";

const BASE_COUNT = 1482;

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
    <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-500">
      🔥 {count.toLocaleString()}
    </span>
  );
}
