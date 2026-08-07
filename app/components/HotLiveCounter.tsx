"use client";

import { useEffect, useRef, useState } from "react";

const BASE_COUNT = 69728;
// Must match the CSS animation-duration for .animate-digit-roll-in/-out in
// globals.css — used to know when it's safe to drop the outgoing digit.
const ROLL_MS = 380;

// Live-activity ticker next to the "HOT" badge — same irregular-interval,
// always-increasing tick pattern as AnalysisCounter, just faster and with
// bigger, irregular jumps (2-3 at a time) so it reads as a busier live
// viewer count rather than a lifetime total. Purely cosmetic — not backed
// by a real viewer count.
export default function HotLiveCounter() {
  const [count, setCount] = useState(BASE_COUNT);
  const [outgoingDigit, setOutgoingDigit] = useState<string | null>(null);
  const countRef = useRef(count);

  useEffect(() => {
    countRef.current = count;
  }, [count]);

  useEffect(() => {
    let cancelled = false;
    let cleanupTimer: ReturnType<typeof setTimeout>;

    function scheduleNext() {
      const delay = 500 + Math.random() * 1300;
      setTimeout(() => {
        if (cancelled) return;
        // Capture the digit that's about to be replaced so it can animate
        // out (rising away) at the same time the new one rises in —
        // without this, the old digit would just vanish instantly while
        // only the new one moved, which read as a jerky cut rather than
        // one continuous motion.
        setOutgoingDigit(countRef.current.toLocaleString().slice(-1));
        setCount((prev) => prev + (2 + Math.floor(Math.random() * 2)));

        clearTimeout(cleanupTimer);
        cleanupTimer = setTimeout(() => {
          if (!cancelled) setOutgoingDigit(null);
        }, ROLL_MS);

        scheduleNext();
      }, delay);
    }

    scheduleNext();
    return () => {
      cancelled = true;
      clearTimeout(cleanupTimer);
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
          {outgoingDigit !== null && (
            <span className="absolute inset-0 animate-digit-roll-out" aria-hidden="true">
              {outgoingDigit}
            </span>
          )}
          <span key={count} className="absolute inset-0 animate-digit-roll-in">
            {lastDigit}
          </span>
        </span>
      </span>
    </span>
  );
}
