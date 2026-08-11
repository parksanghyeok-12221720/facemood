"use client";

import { useEffect, useState } from "react";

const BASE_COUNT = 151;

// No real user photos — just abstract gradient circles, since this stack
// isn't standing in for actual people.
const AVATAR_GRADIENTS = [
  "from-violet-400 to-fuchsia-400",
  "from-amber-300 to-orange-400",
  "from-sky-300 to-blue-400",
  "from-rose-300 to-pink-400",
];

// Social-proof badge for the checkout pages. Ticks up by 1 at irregular
// intervals so it reads as "live" rather than obviously scripted — same
// cosmetic-only approach as AnalysisCounter on the homepage.
export default function TodayAnalysisCounter() {
  const [count, setCount] = useState(BASE_COUNT);

  useEffect(() => {
    let cancelled = false;

    function scheduleNext() {
      const delay = 4000 + Math.random() * 8000;
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
    <div className="mt-4 flex items-center gap-3 rounded-2xl bg-violet-50 px-4 py-3">
      <div className="flex shrink-0 -space-x-2">
        {AVATAR_GRADIENTS.map((gradient, i) => (
          <span
            key={i}
            className={`h-7 w-7 rounded-full border-2 border-white bg-gradient-to-br ${gradient}`}
          />
        ))}
      </div>
      <p className="text-xs leading-snug text-gray-700">
        오늘 나와 비슷한 고민을 가진{" "}
        <span className="font-extrabold text-violet-600">+{count}명</span>이
        분석을 시작했어요
      </p>
    </div>
  );
}
