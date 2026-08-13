"use client";

import { useEffect, useRef, useState } from "react";

const BASE_COUNT = 69728;

// Live-activity ticker next to the "HOT" badge — same always-increasing,
// irregular-interval tick pattern as AnalysisCounter, just faster and with
// bigger jumps so it reads as a busier live viewer count rather than a
// lifetime total. Purely cosmetic — not backed by a real viewer count.
//
// Every digit that actually changes between ticks gets the roll animation
// (not just the last one) — a fixed +2/+3 step used to only animate the
// ones place, so whenever a carry landed (e.g. 69,738 -> 69,740) the tens
// digit would instantly snap with no transition while the ones digit
// rolled smoothly, which read as a glitchy double-motion. Diffing the
// previous and next formatted strings position-by-position fixes that —
// carries now roll every affected digit together, like a real odometer.
export default function HotLiveCounter() {
  const [count, setCount] = useState(BASE_COUNT);
  const [prevFormatted, setPrevFormatted] = useState(BASE_COUNT.toLocaleString());
  const countRef = useRef(count);

  useEffect(() => {
    countRef.current = count;
  }, [count]);

  useEffect(() => {
    let cancelled = false;

    function scheduleNext() {
      // Wide, weighted-random delay/step so ticks don't read as a metronome
      // incrementing by a near-constant amount on a near-constant beat —
      // mostly quick small ticks, occasionally a longer pause or a bigger jump.
      const delay = 350 + Math.random() * 2800;
      setTimeout(() => {
        if (cancelled) return;

        const roll = Math.random();
        const step = roll < 0.45 ? 1 : roll < 0.75 ? 2 : roll < 0.93 ? 3 : roll < 0.99 ? 5 : 8;

        setPrevFormatted(countRef.current.toLocaleString());
        setCount((prev) => prev + step);

        scheduleNext();
      }, delay);
    }

    scheduleNext();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatted = count.toLocaleString();
  const prevPadded = prevFormatted.padStart(formatted.length, formatted[0]);

  return (
    <span className="inline-flex items-center gap-1 text-base font-extrabold tracking-tight text-orange-500 sm:text-lg">
      <span className="text-lg sm:text-xl">🔥</span>
      <span className="inline-flex items-baseline">
        {formatted.split("").map((char, index) => {
          const prevChar = prevPadded[index];
          if (char === prevChar) {
            return <span key={`d-${index}`}>{char}</span>;
          }
          return (
            <span
              key={`d-${index}-${count}`}
              className="relative inline-block h-[1em] w-[0.62em] overflow-hidden align-baseline"
            >
              <span className="absolute inset-0 animate-digit-roll-out" aria-hidden="true">
                {prevChar}
              </span>
              <span className="absolute inset-0 animate-digit-roll-in">{char}</span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
