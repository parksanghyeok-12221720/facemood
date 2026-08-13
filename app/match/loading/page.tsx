"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Container from "@/app/components/Container";

const MY_PHOTO_KEY = "facemood_match_my_photo";
const PARTNER_PHOTO_KEY = "facemood_match_partner_photo";

const steps = [
  "관계와 사진 확인 중",
  "두 사람의 분위기 비교 중",
  "스타일 케미 정리 중",
  "커플 무드 매칭 중",
  "리포트 구성 중",
];

const messages = [
  "업로드한 두 장의 사진 속 분위기를 확인하고 있어요.",
  "두 사람의 첫인상과 이미지 톤을 비교하고 있어요.",
  "스타일, 컬러, 헤어 케미를 정리하고 있어요.",
  "함께 있을 때 만들어지는 커플 무드를 매칭하고 있어요.",
  "무드 궁합 리포트를 다듬고 있어요.",
];

function CirclesIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" xmlns="http://www.w3.org/2000/svg">
      <circle cx="19" cy="24" r="13" fill="var(--match-rose)" opacity="0.85" />
      <circle cx="29" cy="24" r="13" fill="var(--match-navy)" opacity="0.85" />
    </svg>
  );
}

export default function MatchLoadingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setPhotos(
        [localStorage.getItem(MY_PHOTO_KEY), localStorage.getItem(PARTNER_PHOTO_KEY)].filter(
          (photo): photo is string => Boolean(photo),
        ),
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    // Paced animation only — the preview page renders canned example
    // content locally, so there's nothing to actually wait on here.
    function advance(current: number) {
      if (cancelled) return;

      if (current >= 100) {
        timeoutId = setTimeout(() => {
          if (!cancelled) router.push("/match/result");
        }, 800);
        return;
      }

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
  const activeMessage = messages[Math.min(messages.length - 1, Math.floor(progress / segment))];

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center py-16"
      style={
        {
          "--match-ivory": "#F7F3EC",
          "--match-ink": "#2B2620",
          "--match-ink-soft": "#8A8580",
          "--match-navy": "#1E2A3A",
          "--match-rose": "#C9A0A0",
          "--match-burgundy": "#6F2A3A",
          "--match-beige": "#E4D2C3",
          backgroundColor: "var(--match-ivory)",
          color: "var(--match-ink)",
        } as React.CSSProperties
      }
    >
      {/* eslint-disable-next-line @next/next/no-page-custom-font -- scoped to this page only */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@500;600;700&display=swap"
      />

      <Container maxWidth="max-w-md" className="flex flex-col items-center text-center">
        <span
          className="mb-10 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.2em]"
          style={{ backgroundColor: "var(--match-navy)", color: "var(--match-ivory)" }}
        >
          FACEMOOD MATCH
        </span>

        {photos.length > 0 ? (
          <div className="flex flex-col items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide"
              style={{ backgroundColor: "var(--match-navy)", color: "var(--match-ivory)" }}
            >
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full"
                style={{ backgroundColor: "var(--match-rose)" }}
              />
              분석 중
            </span>
            <div className="flex items-center justify-center gap-3">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="relative h-48 w-36 overflow-hidden rounded-[22px] shadow-lg"
                  style={{ border: "1px solid var(--match-beige)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt={index === 0 ? "내 사진 분석 중" : "상대방 사진 분석 중"}
                    className="h-full w-full object-cover"
                  />

                  {/* Faint scan-grid overlay */}
                  <div
                    className="animate-scan-grid-pulse pointer-events-none absolute inset-0"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(30,42,58,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(30,42,58,0.45) 1px, transparent 1px)",
                      backgroundSize: "14px 14px",
                    }}
                  />

                  {/* Sweeping scan line */}
                  <div
                    className="animate-scan-sweep pointer-events-none absolute inset-x-0 h-8 -translate-y-1/2"
                    style={{
                      background:
                        "linear-gradient(to bottom, transparent, rgba(201,160,160,0.75), transparent)",
                    }}
                  />
                  <div
                    className="animate-scan-sweep pointer-events-none absolute inset-x-0 h-px -translate-y-1/2"
                    style={{
                      backgroundColor: "var(--match-rose)",
                      boxShadow: "0 0 10px 2px rgba(201,160,160,0.8)",
                    }}
                  />

                  {/* Scanner-viewfinder corner brackets */}
                  <div
                    className="pointer-events-none absolute left-2 top-2 h-4 w-4 rounded-tl-md border-l-2 border-t-2"
                    style={{ borderColor: "white" }}
                  />
                  <div
                    className="pointer-events-none absolute right-2 top-2 h-4 w-4 rounded-tr-md border-r-2 border-t-2"
                    style={{ borderColor: "white" }}
                  />
                  <div
                    className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 rounded-bl-md border-b-2 border-l-2"
                    style={{ borderColor: "white" }}
                  />
                  <div
                    className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 rounded-br-md border-b-2 border-r-2"
                    style={{ borderColor: "white" }}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative flex h-28 w-28 items-center justify-center">
            <div
              className="absolute inset-0 animate-pulse rounded-full blur-2xl"
              style={{ backgroundColor: "var(--match-rose)", opacity: 0.3 }}
            />
            <div
              className="absolute inset-0 animate-spin rounded-full border-2"
              style={{ borderColor: "var(--match-beige)", borderTopColor: "var(--match-navy)" }}
            />
            <div
              className="relative flex h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: "white", border: "1px solid var(--match-beige)" }}
            >
              <CirclesIcon />
            </div>
          </div>
        )}

        <div className="relative mt-12 w-full">
          <div
            className="rounded-3xl p-8"
            style={{ backgroundColor: "white", border: "1px solid var(--match-beige)" }}
          >
            <h1
              className="text-lg font-bold leading-snug"
              style={{ fontFamily: "'Noto Serif KR', serif" }}
            >
              무드 궁합 리포트를 만들고 있어요
            </h1>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
              두 사람의 사진과 답변을 바탕으로
              <br />
              커플 무드와 스타일 케미를 정리하는 중이에요.
            </p>

            <ul className="mt-8 flex flex-col gap-3 text-left">
              {steps.map((label, index) => {
                const isDone = index < completedSteps;
                const isActive = index === completedSteps;
                return (
                  <li key={label} className="flex items-center gap-3">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] text-white"
                      style={{
                        borderColor: isDone ? "var(--match-navy)" : "var(--match-beige)",
                        backgroundColor: isDone ? "var(--match-navy)" : "transparent",
                      }}
                    >
                      {isDone && "✓"}
                      {isActive && !isDone && (
                        <span
                          className="h-1.5 w-1.5 animate-pulse rounded-full"
                          style={{ backgroundColor: "var(--match-navy)" }}
                        />
                      )}
                    </span>
                    <span
                      className="text-sm"
                      style={{
                        color: isDone
                          ? "var(--match-ink-soft)"
                          : isActive
                            ? "var(--match-ink)"
                            : "var(--match-beige)",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {label}
                    </span>
                  </li>
                );
              })}
            </ul>

            <p className="mt-8 min-h-10 text-sm leading-relaxed" style={{ color: "var(--match-burgundy)" }}>
              {activeMessage}
            </p>

            <div className="mt-6">
              <div
                className="mb-2 flex items-center justify-between text-xs"
                style={{ color: "var(--match-ink-soft)" }}
              >
                <span>리포트 작성 중</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full"
                style={{ backgroundColor: "var(--match-beige)" }}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-500 ease-out"
                  style={{ width: `${progress}%`, backgroundColor: "var(--match-navy)" }}
                />
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-xs leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
          FACEMOOD Match는 시각적 분위기와 스타일 조화만 분석합니다.
        </p>
      </Container>
    </main>
  );
}
