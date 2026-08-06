"use client";

import { useEffect, useState } from "react";

const BASE_COUNT = 22917;

// Social-proof ticker under the CTA button. Ticks up by 1-2 at irregular
// intervals (not a fixed timer) so it reads as "live" rather than obviously
// scripted. Purely cosmetic — not backed by a real analysis count.
export default function AnalysisCounter() {
  const [count, setCount] = useState(BASE_COUNT);

  useEffect(() => {
    let cancelled = false;

    function scheduleNext() {
      const delay = 2500 + Math.random() * 5500;
      setTimeout(() => {
        if (cancelled) return;
        setCount((prev) => prev + (Math.random() < 0.5 ? 1 : 2));
        scheduleNext();
      }, delay);
    }

    scheduleNext();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mt-4 flex items-center justify-center gap-1.5 rounded-full bg-violet-50 px-4 py-2.5">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
      </span>
      <p className="text-xs font-semibold text-gray-600">
        현재까지{" "}
        <span className="text-base font-extrabold text-violet-600">
          {count.toLocaleString()}명
        </span>{" "}
        분석완료
      </p>
    </div>
  );
}
