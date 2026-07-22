"use client";

import { useEffect, useState } from "react";

const BASE_COUNT = 42787;

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
    <p className="mt-4 text-xs text-gray-500">
      현재까지{" "}
      <span className="font-bold text-violet-600">
        {count.toLocaleString()}명
      </span>{" "}
      분석완료
    </p>
  );
}
