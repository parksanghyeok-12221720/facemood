"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Container from "@/app/components/Container";

const steps = [
  "답변 분석 중",
  "사진 분위기 확인 중",
  "컬러 무드 정리 중",
  "추구미 방향 비교 중",
  "헤어 · 메이크업 · 패션 리포트 작성 중",
];

const messages = [
  "사진 속 전체 분위기를 확인하고 있어요.",
  "헤어와 메이크업의 무드를 정리하고 있어요.",
  "사진상 컬러 흐름을 참고하고 있어요.",
  "원하는 추구미와 현재 이미지의 차이를 비교하고 있어요.",
  "상세 리포트 문장을 다듬고 있어요.",
];

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-8 w-8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M31 6C21.6 6 14 13.6 14 23s7.6 17 17 17c2.3 0 4.5-.5 6.5-1.3-6.8-1.9-11.8-8.1-11.8-15.7S30.7 9.2 37.5 7.3C35.5 6.5 33.3 6 31 6Z"
        fill="currentColor"
      />
      <path
        d="M40 14l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2 1.2-3Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function LoadingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    // Purely a paced animation — /result computes its rule-based preview
    // locally, so there's nothing to fetch or wait on here. The free
    // preview never calls OpenAI; only the paid report does, after checkout.
    function advance(current: number) {
      if (cancelled) return;

      if (current >= 100) {
        timeoutId = setTimeout(() => {
          if (!cancelled) router.push("/result");
        }, 800);
        return;
      }

      // Random step size and random delay so the gauge fills at an
      // uneven pace instead of ticking forward on a fixed beat.
      const step = Math.min(100 - current, 3 + Math.random() * 8);
      const next = Math.min(100, current + step);
      setProgress(next);

      const delay = 350 + Math.random() * 550;
      timeoutId = setTimeout(() => advance(next), delay);
    }

    advance(0);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [router]);

  const segment = 100 / steps.length;
  const completedSteps = Math.min(steps.length, Math.floor(progress / segment));
  const activeMessage =
    messages[Math.min(messages.length - 1, Math.floor(progress / segment))];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center py-16">
      <Container className="flex flex-col items-center text-center">
        <p className="mb-10 text-sm tracking-[0.3em] text-gray-500">
          FACEMOOD
        </p>

        <div className="relative flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 animate-pulse rounded-full bg-violet-500/25 blur-2xl" />
          <div className="absolute inset-0 rounded-full border-2 border-violet-300/15 border-t-violet-300/70 animate-spin" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-violet-300/30 bg-[#0a0a0a] text-violet-200">
            <MoonIcon />
          </div>
        </div>

        <div className="relative mt-12 w-full">
          <div className="absolute inset-0 -z-10 rounded-3xl bg-violet-500/15 blur-2xl" />
          <div className="rounded-3xl border border-violet-400/20 bg-white/[0.03] p-8">
            <h1 className="text-lg font-semibold leading-snug text-white">
              무드 리포트를 작성하고 있어요
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              입력한 답변과 사진 속 분위기를 바탕으로
              <br />
              현재 이미지 무드와 컬러 방향을 정리하는 중이에요.
            </p>

            <ul className="mt-8 flex flex-col gap-3 text-left">
              {steps.map((label, index) => {
                const isDone = index < completedSteps;
                const isActive = index === completedSteps;
                return (
                  <li key={label} className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                        isDone
                          ? "border-violet-300 bg-violet-300 text-black"
                          : "border-white/15"
                      }`}
                    >
                      {isDone && "✓"}
                      {isActive && !isDone && (
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-300" />
                      )}
                    </span>
                    <span
                      className={`text-sm ${
                        isDone
                          ? "text-gray-300"
                          : isActive
                            ? "font-medium text-white"
                            : "text-gray-600"
                      }`}
                    >
                      {label}
                    </span>
                  </li>
                );
              })}
            </ul>

            <p className="mt-8 min-h-10 text-sm leading-relaxed text-violet-200">
              {activeMessage}
            </p>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                <span>리포트 작성 중</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-400 to-violet-200 transition-[width] duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-gray-600">
          FACEMOOD는 외모 점수화가 아닌 이미지 무드와 스타일 방향을
          분석합니다.
        </p>
      </Container>
    </main>
  );
}
