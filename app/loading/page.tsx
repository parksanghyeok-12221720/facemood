"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

// Male copy skips makeup entirely, per the male-audience content rule used
// throughout the rest of the site (코디/헤어 대신 메이크업 언급 없음).
const maleSteps = [
  "답변 분석 중",
  "사진 분위기 확인 중",
  "컬러 무드 정리 중",
  "추구미 방향 비교 중",
  "헤어 · 코디 · 스타일 리포트 작성 중",
];

const maleMessages = [
  "사진 속 전체 분위기를 확인하고 있어요.",
  "헤어와 스타일의 무드를 정리하고 있어요.",
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
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [isMale, setIsMale] = useState(false);
  // Gender is detected asynchronously (see effect below) but the redirect
  // at the end of the progress animation needs the latest value without
  // restarting the animation, so it's mirrored into a ref.
  const isMaleRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setUploadedPhoto(localStorage.getItem("facemood_uploaded_image"));
      try {
        const answers = JSON.parse(localStorage.getItem("facemood_answers") ?? "{}");
        const male = answers.gender === "남성";
        isMaleRef.current = male;
        setIsMale(male);
      } catch {
        isMaleRef.current = false;
        setIsMale(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    // Purely a paced animation — /result computes its rule-based preview
    // locally, so there's nothing to fetch or wait on here. The free
    // preview never calls OpenAI; only the paid report does, after checkout.
    // 남성 답변자는 무료 미리보기가 없으므로 이 애니메이션이 끝나면
    // /checkout-male로, 그 외에는 기존대로 /result로 보낸다.
    function advance(current: number) {
      if (cancelled) return;

      if (current >= 100) {
        timeoutId = setTimeout(() => {
          if (!cancelled) {
            router.push(isMaleRef.current ? "/checkout-male" : "/result");
          }
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

  const activeSteps = isMale ? maleSteps : steps;
  const activeMessages = isMale ? maleMessages : messages;
  const segment = 100 / activeSteps.length;
  const completedSteps = Math.min(activeSteps.length, Math.floor(progress / segment));
  const activeMessage =
    activeMessages[Math.min(activeMessages.length - 1, Math.floor(progress / segment))];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white py-16 text-black">
      <Container className="flex flex-col items-center text-center">
        <p className="mb-10 text-sm font-bold tracking-[0.2em] text-violet-600">
          FACEMOOD
        </p>

        {uploadedPhoto ? (
          <div className="relative h-96 w-72 overflow-hidden rounded-[28px] border border-violet-200 shadow-lg shadow-violet-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={uploadedPhoto}
              alt="분석 중인 사진"
              className="h-full w-full object-cover"
            />

            {/* Faint scan-grid overlay to sell the "AI reading the photo" feel */}
            <div
              className="animate-scan-grid-pulse pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)",
                backgroundSize: "16px 16px",
              }}
            />

            {/* Sweeping scan line */}
            <div className="animate-scan-sweep pointer-events-none absolute inset-x-0 h-10 -translate-y-1/2 bg-gradient-to-b from-transparent via-violet-300/70 to-transparent" />
            <div className="animate-scan-sweep pointer-events-none absolute inset-x-0 h-px -translate-y-1/2 bg-violet-400 shadow-[0_0_10px_2px_rgba(139,92,246,0.8)]" />

            {/* Scanner-viewfinder corner brackets */}
            <div className="pointer-events-none absolute left-2 top-2 h-5 w-5 rounded-tl-md border-l-2 border-t-2 border-white/90" />
            <div className="pointer-events-none absolute right-2 top-2 h-5 w-5 rounded-tr-md border-r-2 border-t-2 border-white/90" />
            <div className="pointer-events-none absolute bottom-2 left-2 h-5 w-5 rounded-bl-md border-b-2 border-l-2 border-white/90" />
            <div className="pointer-events-none absolute bottom-2 right-2 h-5 w-5 rounded-br-md border-b-2 border-r-2 border-white/90" />

            <div className="pointer-events-none absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-300" />
              <span className="text-[10px] font-semibold tracking-wide text-white">
                분석 중
              </span>
            </div>
          </div>
        ) : (
          <div className="relative flex h-28 w-28 items-center justify-center">
            <div className="absolute inset-0 animate-pulse rounded-full bg-violet-200/50 blur-2xl" />
            <div className="absolute inset-0 rounded-full border-2 border-violet-100 border-t-violet-500 animate-spin" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-violet-200 bg-violet-50 text-violet-600">
              <MoonIcon />
            </div>
          </div>
        )}

        <div className="relative mt-12 w-full">
          <div className="absolute inset-0 -z-10 rounded-3xl bg-violet-100/50 blur-2xl" />
          <div className="rounded-3xl border border-violet-100 bg-white p-8 shadow-sm shadow-violet-100/60">
            <h1 className="text-lg font-bold leading-snug text-black">
              무드 리포트를 작성하고 있어요
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              입력한 답변과 사진 속 분위기를 바탕으로
              <br />
              현재 이미지 무드와 컬러 방향을 정리하는 중이에요.
            </p>

            <ul className="mt-8 flex flex-col gap-3 text-left">
              {activeSteps.map((label, index) => {
                const isDone = index < completedSteps;
                const isActive = index === completedSteps;
                return (
                  <li key={label} className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                        isDone
                          ? "border-violet-500 bg-violet-500 text-white"
                          : "border-violet-100"
                      }`}
                    >
                      {isDone && "✓"}
                      {isActive && !isDone && (
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500" />
                      )}
                    </span>
                    <span
                      className={`text-sm ${
                        isDone
                          ? "text-gray-400"
                          : isActive
                            ? "font-semibold text-black"
                            : "text-gray-300"
                      }`}
                    >
                      {label}
                    </span>
                  </li>
                );
              })}
            </ul>

            <p className="mt-8 min-h-10 text-sm leading-relaxed text-violet-600">
              {activeMessage}
            </p>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
                <span>리포트 작성 중</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-violet-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-[width] duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-gray-400">
          FACEMOOD는 외모 점수화가 아닌 이미지 무드와 스타일 방향을
          분석합니다.
        </p>
      </Container>
    </main>
  );
}
