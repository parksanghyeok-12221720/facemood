"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Container from "@/app/components/Container";
import DiscountCountdown from "@/app/components/DiscountCountdown";
import { MagazineHero, MagazineBody } from "@/app/result/MagazinePreview";
import {
  buildPreviewResult,
  mockPreviewResult,
  type PreviewResult,
} from "@/types/report";

const ANSWERS_KEY = "facemood_answers";
const PREVIEW_RESULT_KEY = "facemood_preview_result";
const REPORT_ID_KEY = "facemood_report_id";
const MOCK_MARKER = "__MOCK__";

function subscribeToAnswers(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getAnswersSnapshot() {
  // Dev convenience: visiting /result?mock=1 previews the mock data
  // without needing to go through /test and /upload first.
  if (window.location.search.includes("mock=1")) {
    return MOCK_MARKER;
  }
  return localStorage.getItem(ANSWERS_KEY);
}

function getServerAnswersSnapshot() {
  return null;
}

function subscribeToPreview(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getPreviewSnapshot() {
  return localStorage.getItem(PREVIEW_RESULT_KEY);
}

function getServerPreviewSnapshot() {
  return null;
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-3.5 w-3.5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="4.5"
        y="9"
        width="11"
        height="8"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={`h-3.5 w-3.5 shrink-0 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.5 10.5l3.5 3.5 7-8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const whyCards: { title: string; body: string }[] = [
  {
    title: "나에게 맞는 추구미를 먼저 찾기",
    body: "유행하는 스타일을 따라 하기 전에, 내 분위기와 자연스럽게 연결되는 추구미를 아는 것이 중요해요.",
  },
  {
    title: "헤어·메이크업·옷의 방향을 하나로 맞추기",
    body: "각각 예뻐 보이는 선택도 전체 분위기와 맞지 않으면 어색해질 수 있어요. FACEMOOD는 스타일 요소를 하나의 이미지 무드로 연결해줘요.",
  },
  {
    title: "첫인상에서 살아나는 포인트 확인하기",
    body: "처음 보이는 분위기는 헤어, 컬러, 메이크업, 옷의 조합에서 만들어져요. 내 사진상 첫인상 무드를 기준으로 살릴 포인트를 확인할 수 있어요.",
  },
];

const photoFactors = [
  "전체 이미지 분위기",
  "헤어 길이와 흐름",
  "메이크업 강도",
  "옷 색감과 실루엣",
  "사진 속 밝기와 컬러감",
];

const answerFactors = [
  "원하는 추구미",
  "피하고 싶은 이미지",
  "평소 스타일",
  "자주 입는 색감",
  "헤어 고민",
  "메이크업 습관",
  "분석 목적",
];

const detailChecklist = [
  "추천 추구미 상세 해석",
  "현재 이미지 무드 분석",
  "추천 원픽 컬러 팔레트",
  "피부톤에 좋은 색감",
  "헤어 길이·앞머리·볼륨",
  "베이스·아이·립 메이크업",
  "어울리는 옷 색감·실루엣",
  "데이트·인스타 이미지 전략",
  "최종 스타일 체크리스트",
  "사진상 얼굴형 분석",
  "사진상 동물상 분석",
];

// Generic teaser copy for the locked styling/hair/makeup cards — these
// describe what each section covers, not the user's actual (still paid)
// personalized hint, so they stay identical for every visitor.
const LOCKED_HINT_COPY: Record<"styling" | "hair" | "makeup", { caption: string; body: string }> = {
  styling: {
    caption: "스타일링 참고컷",
    body: "룩과 아이템의 방향을 정리했어요. 소재와 실루엣이 무드를 어떻게 살리는지 더 잘 이해할 수 있어요.",
  },
  hair: {
    caption: "헤어 참고컷",
    body: "지금 스타일링에서 얼굴을 감싸는 방식이 무드에 얼마나 영향을 주는지 알려드려요.",
  },
  makeup: {
    caption: "메이크업 참고컷",
    body: "지금 분위기와 잘 어울리는 포인트를 찾고 메이크업 방향을 확인할 수 있어요.",
  },
};

function FirstImpressionCounter() {
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(1);
  const rootRef = useRef<HTMLDivElement>(null);
  const isDone = count >= 3;

  // Only start counting once the counter actually scrolls into view —
  // this section sits near the bottom of a long page, so starting on
  // mount would finish before most users scroll down to see it.
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Loops 1 -> 2 -> 3 forever, holding on 3 (emphasized) for longer
  // than the 1 -> 2 -> 3 steps before resetting back to 1.
  useEffect(() => {
    if (!started) return;
    const delay = count >= 3 ? 3500 : 700;
    const timer = setTimeout(() => {
      setCount((c) => (c >= 3 ? 1 : c + 1));
    }, delay);
    return () => clearTimeout(timer);
  }, [started, count]);

  return (
    <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[var(--hairline)] bg-white" ref={rootRef}>
      {isDone && (
        <span className="absolute inset-0 rounded-full ring-4 ring-[var(--rose)]/30 animate-ping" />
      )}
      <span
        className={`relative text-2xl font-black transition-all duration-300 ${
          isDone ? "scale-125 text-[var(--rose-deep)]" : "scale-100 text-[var(--lavender-deep)]"
        }`}
      >
        {count}
      </span>
    </div>
  );
}

// Single-card stepper instead of a native horizontal scroll list — the
// scroll container's scrollbar was hidden for looks, but that left no
// visible way to tell there was a 3rd card to reach.
function MissionCarousel({ missions }: { missions: string[] }) {
  const [index, setIndex] = useState(0);

  function go(delta: number) {
    setIndex((prev) => (prev + delta + missions.length) % missions.length);
  }

  return (
    <div className="mt-5 flex flex-col items-center gap-4">
      <div
        key={index}
        className="w-full rounded-2xl border border-[var(--hairline)] bg-white p-5"
      >
        <span className="text-[22px] font-extrabold text-[var(--rose-tint)]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink)]">
          {missions[index]}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="이전 미션"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--hairline)] bg-white text-[var(--ink)]"
        >
          ‹
        </button>
        <div className="flex items-center gap-1.5">
          {missions.map((mission, i) => (
            <button
              key={mission}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}번째 미션으로 이동`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-[var(--rose-deep)]" : "w-1.5 bg-[var(--hairline)]"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="다음 미션"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--hairline)] bg-white text-[var(--ink)]"
        >
          ›
        </button>
      </div>
    </div>
  );
}

function EmptyResultState() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center text-black">
      <p className="text-sm font-semibold text-black">
        분석 결과가 없습니다. 다시 분석해주세요.
      </p>
      <Link
        href="/upload"
        className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
      >
        사진 업로드로 돌아가기
      </Link>
    </main>
  );
}

export default function ResultPage() {
  const answersRaw = useSyncExternalStore(
    subscribeToAnswers,
    getAnswersSnapshot,
    getServerAnswersSnapshot,
  );
  const personalizedRaw = useSyncExternalStore(
    subscribeToPreview,
    getPreviewSnapshot,
    getServerPreviewSnapshot,
  );

  const previewResult = useMemo<PreviewResult | null>(() => {
    if (!answersRaw) return null;
    if (answersRaw === MOCK_MARKER) return mockPreviewResult;

    // /loading already ran the personalized preview call and cached the
    // result here — use it directly instead of recomputing the rule-based
    // version. Falls back to buildPreviewResult (no OpenAI call) if that
    // never happened, e.g. this device skipped /loading.
    if (personalizedRaw) {
      try {
        return JSON.parse(personalizedRaw) as PreviewResult;
      } catch (error) {
        console.error(error);
      }
    }

    try {
      const answers = JSON.parse(answersRaw) as Record<string, unknown>;
      return buildPreviewResult(answers);
    } catch (error) {
      console.error(error);
      return null;
    }
  }, [answersRaw, personalizedRaw]);

  useEffect(() => {
    if (!previewResult) return;
    localStorage.setItem(PREVIEW_RESULT_KEY, JSON.stringify(previewResult));

    const reportId = localStorage.getItem(REPORT_ID_KEY);
    if (!reportId) return;
    fetch(`/api/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ previewResult }),
    }).catch(() => {
      console.warn("미리보기 결과 저장에 실패했습니다 (서버 연결 문제로 추정).");
    });
  }, [previewResult]);

  if (!previewResult) {
    return <EmptyResultState />;
  }

  const sortedMoodSync = [...previewResult.moodSync].sort(
    (a, b) => b.score - a.score,
  );

  const topMoodSync = sortedMoodSync.slice(0, 5);

  return (
    <main
      className="min-h-screen bg-white pb-28 pt-6 text-[var(--ink)]"
      style={
        {
          "--ink": "#1C1A1F",
          "--ink-soft": "#6E6570",
          "--rose": "#C96B82",
          "--rose-tint": "#FBE4EA",
          "--rose-deep": "#B65068",
          "--lavender": "#EDE7F8",
          "--lavender-deep": "#8A6FC9",
          "--hairline": "#F0E7EC",
          "--dark": "#17151C",
        } as React.CSSProperties
      }
    >
      <MagazineHero />

      {/* Header */}
      <Container className="flex items-center justify-between" maxWidth="max-w-md">
        <span className="text-[15px] font-extrabold tracking-tight text-[var(--ink)]">
          FACE<span className="text-[var(--rose)]">MOOD</span>
        </span>
        <span className="rounded-full border border-[var(--hairline)] px-3 py-1.5 text-[10.5px] font-semibold tracking-[0.1em] text-[var(--ink-soft)]">
          FREE PREVIEW
        </span>
      </Container>

      <Container className="mt-8 text-center">
        <span className="text-[11px] font-semibold tracking-[0.2em] text-[var(--rose)]">
          YOUR MOOD RESULT
        </span>
        <h1 className="mt-3 text-2xl font-extrabold leading-[1.35] text-[var(--ink)]">
          당신의 무드 결과가
          <br />
          나왔어요
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">
          업로드한 사진과 답변을 바탕으로
          <br />
          어울리는 추구미 방향을 간단히 정리했어요.
        </p>
      </Container>

      {/* Hero mood photo */}
      <Container className="mt-8">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px]">
          <Image
            src={previewResult.images.hero}
            alt="오늘의 무드컷"
            fill
            priority
            sizes="(min-width: 448px) 448px, 100vw"
            className="object-cover blur-[10px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/70" />
          <span className="absolute right-4 top-4 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--ink)] shadow-sm">
            무료 결과
          </span>
          <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--ink)] shadow-sm">
            <LockIcon />
          </span>
          <p className="absolute inset-x-4 bottom-4 text-[11px] font-semibold tracking-[0.08em] text-white/85">
            PHOTO 01 · TODAY&apos;S MOOD CUT
          </p>
        </div>
      </Container>

      {/* Main recommended mood + mood sync */}
      <Container className="mt-4">
        <div className="rounded-[28px] border border-[var(--hairline)] bg-white p-6 shadow-[0_18px_40px_-24px_rgba(120,90,130,0.25)]">
          <span className="inline-flex items-center rounded-full bg-[var(--rose-tint)] px-3 py-1.5 text-[11px] font-semibold text-[var(--rose-deep)]">
            추천 추구미
          </span>
          <h2 className="mt-4 text-[19px] font-extrabold leading-[1.5] text-[var(--ink)] break-keep">
            당신에게는{" "}
            <mark className="select-none rounded bg-[var(--rose-tint)] px-1.5 py-0.5 text-[var(--ink)] blur-[5px]">
              &lsquo;{previewResult.recommendedMood}&rsquo;
            </mark>{" "}
            무드가 잘 어울릴 가능성이 높아요
          </h2>
          {previewResult.subMood && (
            <p className="mt-2 text-[12.5px] font-semibold text-[var(--lavender-deep)]">
              {previewResult.subMood} 분위기도 함께 느껴져요
            </p>
          )}
          <p className="mt-3 whitespace-pre-line text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
            {previewResult.oneLineSummary}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {previewResult.tags.map((tag) => (
              <span
                key={tag}
                className="select-none rounded-full bg-[var(--rose-tint)] px-3 py-1 text-[11.5px] font-medium text-[var(--rose-deep)] blur-[4px]"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3.5 border-t border-[var(--hairline)] pt-5">
            {topMoodSync.map((item, index) => (
              <div key={item.mood} className="flex items-center gap-3">
                <span className="w-5 shrink-0 text-[11px] font-semibold text-[var(--ink-soft)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[13px]">
                    <span
                      className={`select-none blur-[5px] ${
                        index === 0 ? "font-bold text-[var(--ink)]" : "text-[var(--ink-soft)]"
                      }`}
                    >
                      {item.mood}
                    </span>
                    <span
                      className={
                        index === 0
                          ? "font-bold text-[var(--rose-deep)]"
                          : "text-[var(--ink-soft)]"
                      }
                    >
                      {item.score}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--hairline)]">
                    <div
                      className={`h-full rounded-full ${
                        index === 0 ? "bg-[var(--rose-deep)]" : "bg-[var(--rose-tint)]"
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[var(--ink)]/[0.05] px-4 py-2.5 text-[12px] font-medium text-[var(--ink-soft)]">
            <LockIcon />
            정확한 싱크로율은 상세 리포트에서 확인할 수 있어요
          </div>
        </div>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-[var(--ink-soft)]">
          무드 싱크로율은 사진과 답변을 바탕으로 한 스타일 방향 참고값입니다.
          외모 점수나 절대적인 평가는 아닙니다.
        </p>
      </Container>

      {/* Current vs target mood */}
      <Container className="mt-10">
        <span className="text-[11px] font-semibold tracking-[0.2em] text-[var(--lavender-deep)]">
          COMPARE
        </span>
        <h2 className="mt-1.5 text-[18px] font-extrabold text-[var(--ink)]">
          지금 이미지와 추구미의 차이
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[var(--hairline)] bg-white p-4">
            <p className="text-[11.5px] font-semibold text-[var(--ink-soft)]">
              현재 이미지에서 보이는 무드
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {previewResult.currentMood.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-2 text-[13px] text-[var(--ink)]"
                >
                  <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--ink-soft)]" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-[var(--lavender)] p-4">
            <p className="text-[11.5px] font-semibold text-[var(--lavender-deep)]">
              추구미에 가까워지는 포인트
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {previewResult.upgradePoints.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-2 text-[13px] text-[var(--ink)]"
                >
                  <CheckIcon className="text-[var(--lavender-deep)]" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* Color mood hint */}
      <Container className="mt-10">
        <span className="text-[11px] font-semibold tracking-[0.2em] text-[var(--lavender-deep)]">
          COLOR HINT
        </span>
        <h2 className="mt-1.5 text-[18px] font-extrabold text-[var(--ink)]">
          {previewResult.colorHint.title}
        </h2>
        <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
          사진 기준으로 보이는 색감 흐름을 바탕으로,
          <br />
          어울릴 가능성이 높은 컬러 방향을 간단히 정리했어요.
        </p>

        <div className="mt-5 rounded-[24px] bg-[var(--lavender)] p-6">
          <p className="select-none whitespace-pre-line text-[14.5px] leading-relaxed text-[var(--ink)] blur-[4px]">
            {previewResult.colorHint.summary} {previewResult.colorHint.description}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {previewResult.colorHint.palette.map((chip) => (
            <div
              key={chip.name}
              className="rounded-2xl border border-[var(--hairline)] bg-white p-3.5"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/5"
                style={{ backgroundColor: chip.hex }}
              />
              <p className="mt-2.5 text-[13.5px] font-bold text-[var(--ink)]">
                {chip.name}
              </p>
              <p className="mt-1 select-none text-[11.5px] leading-relaxed text-[var(--ink-soft)] blur-[3px]">
                {chip.description}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-[var(--ink-soft)]">
          {previewResult.colorHint.caution}
        </p>

        <div className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[var(--ink)]/[0.05] px-4 py-2.5 text-[12px] font-medium text-[var(--ink-soft)]">
          <LockIcon />
          자세한 컬러 진단은 상세 리포트에서 확인할 수 있어요
        </div>
      </Container>

      {/* Face shape / animal type — photo-based, so only shown when a
          photo was actually analyzed. */}
      {(previewResult.faceShapeType || previewResult.animalType) && (
        <Container className="mt-10">
          <h2 className="text-[18px] font-extrabold text-[var(--ink)]">
            사진상 얼굴형 · 동물상
          </h2>
          <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
            사진에서 느껴지는 인상을 참고로 분류해봤어요. 확정 진단이 아닌
            참고용 분류입니다.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {previewResult.faceShapeType && (
              <div className="rounded-2xl border border-[var(--hairline)] bg-white p-4 text-center">
                <p className="text-[11.5px] font-semibold text-[var(--ink-soft)]">얼굴형</p>
                <p className="mt-2 text-[17px] font-bold text-[var(--rose-deep)]">
                  {previewResult.faceShapeType}
                </p>
              </div>
            )}
            {previewResult.animalType && (
              <div className="rounded-2xl border border-[var(--hairline)] bg-white p-4 text-center">
                <p className="text-[11.5px] font-semibold text-[var(--ink-soft)]">동물상</p>
                <p className="mt-2 text-[17px] font-bold text-[var(--rose-deep)]">
                  {previewResult.animalType}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[var(--ink)]/[0.05] px-4 py-2.5 text-[12px] font-medium text-[var(--ink-soft)]">
            <LockIcon />
            자세한 분석과 활용법은 상세 리포트에서 확인할 수 있어요
          </div>
        </Container>
      )}

      {/* Today's style missions */}
      <Container className="mt-10">
        <span className="text-[11px] font-semibold tracking-[0.2em] text-[var(--rose)]">
          TRY TODAY
        </span>
        <h2 className="mt-1.5 text-[18px] font-extrabold text-[var(--ink)]">
          오늘 바로 해볼 수 있는 3가지
        </h2>
        <MissionCarousel missions={previewResult.missions} />
      </Container>

      {/* Preview locked — styling / hair / makeup */}
      <Container className="mt-10">
        <span className="text-[11px] font-semibold tracking-[0.2em] text-[var(--lavender-deep)]">
          PREVIEW LOCKED
        </span>
        <h2 className="mt-1.5 text-[18px] font-extrabold leading-snug text-[var(--ink)] break-keep">
          상세 리포트에서 더 구체적으로 확인할 수 있어요
        </h2>
        <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
          헤어·메이크업·컬러·스타일링을 언락하면 흐름을 더 자세히 확인할 수
          있어요.
        </p>

        <div className="mt-5 flex flex-col gap-3.5">
          {(["styling", "hair", "makeup"] as const).map((key) => {
            const hint = previewResult.hints[key];
            const locked = LOCKED_HINT_COPY[key];
            const hintImage =
              key === "styling" ? previewResult.images.hero : previewResult.images[key];
            return (
              <div
                key={key}
                className="overflow-hidden rounded-2xl border border-[var(--hairline)] bg-white"
              >
                <div className="relative aspect-[16/9] w-full bg-[var(--lavender)]">
                  <Image
                    src={hintImage}
                    alt={hint.title}
                    fill
                    sizes="(min-width: 448px) 448px, 100vw"
                    loading="eager"
                    className="object-cover blur-[8px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-[var(--ink)]/30 to-black/60" />
                  <span className="absolute inset-0 flex items-center justify-center text-[12px] font-medium text-white/85">
                    {locked.caption}
                  </span>
                  <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[var(--ink)] shadow-sm">
                    <LockIcon />
                  </span>
                </div>

                <div className="p-5">
                  <span className="text-[10.5px] font-semibold tracking-[0.08em] text-[var(--rose-deep)]">
                    PRO · 상세 리포트
                  </span>
                  <p className="mt-1.5 text-[15px] font-bold text-[var(--ink)]">
                    {hint.title}
                  </p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
                    {locked.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>

      {/* Why the detailed report matters */}
      <Container className="mt-10">
        <div className="flex flex-col divide-y divide-[var(--hairline)] overflow-hidden rounded-[28px] border border-[var(--hairline)] bg-white">
          <div className="flex flex-col items-center gap-4 bg-[var(--lavender)] p-8 text-center">
            <span className="text-[11px] font-semibold tracking-[0.2em] text-[var(--lavender-deep)]">
              FIRST IMPRESSION
            </span>
            <FirstImpressionCounter />
            <p className="text-[16px] font-extrabold text-[var(--ink)]">
              첫인상 3초 컷
            </p>
            <p className="text-[13px] leading-relaxed text-[var(--ink-soft)]">
              상대가 처음 느끼는 건 얼굴보다 전체 분위기예요. 내 사진상 무드가
              어떤 첫인상으로 남을 수 있는지 확인해보세요.
            </p>
          </div>

          <div className="flex items-start gap-4 p-6">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--rose-tint)] text-[11px] font-bold text-[var(--rose-deep)]">
              02
            </span>
            <div className="flex-1">
              <p className="text-[11px] font-semibold tracking-[0.15em] text-[var(--rose-deep)]">
                나에게 적합한 스타일링
              </p>
              <p className="mt-2 text-[14px] font-semibold leading-relaxed text-[var(--ink)]">
                예쁜 옷보다 중요한 건 내 분위기와 잘 맞는 옷이에요.
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
                컬러·실루엣·소재·아이템 방향으로 이미지를 더 자연스럽게 살리는
                스타일을 제안해요.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--rose-tint)] text-[11px] font-bold text-[var(--rose-deep)]">
              03
            </span>
            <div className="flex-1">
              <p className="text-[11px] font-semibold tracking-[0.15em] text-[var(--rose-deep)]">
                이성을 끌어당기는 추구미
              </p>
              <p className="mt-2 text-[14px] font-semibold leading-relaxed text-[var(--ink)]">
                강하게 꾸미는 것보다 나에게 맞는 무드를 정확히 아는 게 더
                중요해요.
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
                내 사진과 답변을 바탕으로 어떤 추구미가 더 매력적으로
                연결되는지 보여줘요.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--rose-tint)] text-[11px] font-bold text-[var(--rose-deep)]">
              04
            </span>
            <div className="flex-1">
              <p className="text-[11px] font-semibold tracking-[0.15em] text-[var(--rose-deep)]">
                분위기를 완성하는 디테일
              </p>
              <p className="mt-2 text-[14px] font-semibold leading-relaxed text-[var(--ink)]">
                헤어·메이크업·컬러 하나만 달라져도 느낌은 크게 달라져요.
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
                상세 리포트에서는 지금 나에게 딱 맞는 방향까지 구체적으로
                정리해요.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Why check with FACEMOOD first */}
      <Container className="mt-12">
        <span className="text-[11px] font-semibold tracking-[0.2em] text-[var(--lavender-deep)]">
          WHY FACEMOOD
        </span>
        <h2 className="mt-1.5 text-[18px] font-extrabold text-[var(--ink)]">
          왜 FACEMOOD로 먼저 확인해야 할까요?
        </h2>
        <p className="mt-3 text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
          스타일을 바꾸기 전에 중요한 건, 나에게 어떤 분위기가 자연스럽게
          어울리는지 아는 거예요.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {whyCards.map((card, index) => (
            <div
              key={card.title}
              className="rounded-2xl border border-[var(--hairline)] bg-white p-5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--lavender-deep)]/30 text-[11px] font-bold text-[var(--lavender-deep)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-3 text-[14px] font-semibold leading-snug text-[var(--ink)]">
                {card.title}
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-[var(--ink-soft)]">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </Container>

      <MagazineBody previewResult={previewResult} />

      {/* Analysis criteria */}
      <Container className="mt-12">
        <span className="text-[11px] font-semibold tracking-[0.2em] text-[var(--rose)]">
          HOW WE ANALYZE
        </span>
        <h2 className="mt-1.5 text-[18px] font-extrabold text-[var(--ink)]">
          FACEMOOD는 이런 기준으로 분석해요
        </h2>
        <p className="mt-3 text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
          사진 한 장으로 단정하지 않고, 사진에서 보이는 이미지 무드와
          사용자의 답변을 함께 참고합니다.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <div className="rounded-2xl border border-[var(--hairline)] bg-white p-5">
            <p className="text-[13.5px] font-semibold text-[var(--ink)]">
              사진에서 참고하는 요소
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {photoFactors.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-[var(--rose-tint)] px-3 py-1 text-[11.5px] font-medium text-[var(--rose-deep)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--hairline)] bg-white p-5">
            <p className="text-[13.5px] font-semibold text-[var(--ink)]">
              답변에서 참고하는 요소
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {answerFactors.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-[var(--lavender)] px-3 py-1 text-[11.5px] font-medium text-[var(--lavender-deep)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-5 text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
          FACEMOOD는 한 줄 결과만 보여주는 테스트가 아니에요. 이미지 무드,
          원하는 추구미, 평소 스타일 고민, 컬러·헤어·메이크업 답변을 함께
          참고해서 방향을 정리해드려요. 외모를 평가하는 방식이 아니라, 내
          분위기에 더 잘 맞는 스타일 방향을 제안해드려요.
        </p>
      </Container>

      {/* Not a rating */}
      <Container className="mt-10">
        <div className="rounded-2xl bg-[var(--lavender)] p-6">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-[var(--lavender-deep)]">
            NOT A RATING
          </span>
          <p className="mt-2.5 text-[13px] leading-relaxed text-[var(--ink)]">
            FACEMOOD는 얼굴 점수, 외모 등급, 단점 지적을 제공하지 않습니다.
            사진과 답변을 바탕으로 현재 이미지가 주는 분위기와, 원하는
            추구미에 가까워지는 스타일 방향만 제안합니다.
          </p>
        </div>
      </Container>

      {/* Detailed report teaser + final CTA */}
      <Container className="mt-8">
        <div className="rounded-[28px] bg-[var(--dark)] p-6">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-white/50">
            FULL REPORT
          </span>
          <h2 className="mt-2 text-[19px] font-extrabold leading-snug text-white break-keep">
            상세 리포트에서는
            <br />
            더 깊게 확인할 수 있어요
          </h2>
          <p className="mt-3 text-[12.5px] leading-relaxed text-white/60">
            무료 미리보기는 방향만 보여드려요. 상세 리포트에서는 컬러·헤어·
            메이크업·스타일링까지 약 8~12개 섹션으로 자세히 정리됩니다.
          </p>

          <ul className="mt-5 grid grid-cols-2 gap-2">
            {detailChecklist.map((item) => (
              <li
                key={item}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2.5 text-[11.5px] font-medium leading-snug text-white/85"
              >
                <LockIcon />
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-5 text-center text-[11px] leading-relaxed text-white/45">
            무료 미리보기는 방향만, 상세 리포트는 실행까지 보여드려요.
          </p>
        </div>
      </Container>

      {/* Floating CTA — stays pinned to the bottom of the viewport while
          scrolling through the preview. */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--hairline)] bg-white/95 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur">
        <Container>
          <DiscountCountdown />
          <Link
            href="/checkout"
            className="flex w-full items-center justify-center rounded-full bg-[var(--ink)] px-8 py-4 text-sm font-semibold text-white"
          >
            상세 리포트 보러가기
          </Link>
        </Container>
      </div>
    </main>
  );
}
