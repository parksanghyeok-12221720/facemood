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
import {
  buildPreviewResult,
  mockPreviewResult,
  type PreviewResult,
} from "@/types/report";

const ANSWERS_KEY = "facemood_answers";
const PREVIEW_RESULT_KEY = "facemood_preview_result";
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

const previewImages = [
  { label: "추구미 예시", src: "/mood/cards/청순자연st.png" },
  { label: "헤어 예시", src: "/mood/hair/hair1.png" },
  { label: "메이크업 예시", src: "/mood/makeup/makeup1.png" },
];

const hintImages: Record<"styling" | "hair" | "makeup", string> = {
  styling: "/mood/sikeu.jpg",
  hair: "/mood/hair/hair1.png",
  makeup: "/mood/makeup/makeup1.png",
};

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

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-3.5 w-3.5 shrink-0"
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
  "원하는 추구미와 현재 이미지의 차이",
  "추천 컬러 팔레트",
  "피하면 좋은 색감",
  "헤어 길이 · 앞머리 · 펌 방향",
  "베이스 · 아이 · 블러셔 · 립 메이크업",
  "어울리는 옷 색감과 실루엣",
  "소개팅·데이트·인스타용 이미지 전략",
  "최종 스타일 체크리스트",
];

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
    <div
      ref={rootRef}
      className="relative flex h-16 w-16 items-center justify-center rounded-full border border-violet-100 bg-violet-50"
    >
      {isDone && (
        <span className="absolute inset-0 rounded-full ring-4 ring-violet-300/60 animate-ping" />
      )}
      <span
        className={`relative text-2xl font-black transition-all duration-300 ${
          isDone ? "scale-125 text-violet-600" : "scale-100 text-violet-400"
        }`}
      >
        {count}
      </span>
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

  // Rule-based only — no OpenAI call. See buildPreviewResult in types/report.ts.
  const previewResult = useMemo<PreviewResult | null>(() => {
    if (!answersRaw) return null;
    if (answersRaw === MOCK_MARKER) return mockPreviewResult;
    try {
      const answers = JSON.parse(answersRaw) as Record<string, unknown>;
      return buildPreviewResult(answers);
    } catch (error) {
      console.error(error);
      return null;
    }
  }, [answersRaw]);

  useEffect(() => {
    if (previewResult) {
      localStorage.setItem(PREVIEW_RESULT_KEY, JSON.stringify(previewResult));
    }
  }, [previewResult]);

  if (!previewResult) {
    return <EmptyResultState />;
  }

  const sortedMoodSync = [...previewResult.moodSync].sort(
    (a, b) => b.score - a.score,
  );

  return (
    <main className="min-h-screen bg-white pb-16 pt-10 text-black">
      {/* Header */}
      <Container className="text-center">
        <Link
          href="/detail"
          className="text-sm font-bold tracking-[0.3em] text-violet-600"
        >
          FACEMOOD
        </Link>
        <h1 className="mt-4 text-xl font-bold leading-snug text-black">
          당신의 무드 결과가 나왔어요
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          업로드한 사진과 답변을 바탕으로
          <br />
          어울리는 추구미 방향을 간단히 정리했어요.
        </p>
      </Container>

      {/* Main recommended mood */}
      <Container className="mt-8">
        <div className="overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-violet-100">
          <div className="relative aspect-[4/5] w-full">
            <Image
              src="/mood/cheongsun.jpg"
              alt="추구미 예시"
              fill
              priority
              sizes="(min-width: 448px) 448px, 100vw"
              className="object-cover blur-sm"
            />
            <div className="absolute inset-0 bg-black/5" />
          </div>

          <div className="p-6">
            <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.15em] text-violet-500 shadow-sm">
              추천 추구미
            </span>
            <p className="mt-4 text-lg font-bold leading-snug text-black">
              당신에게는 &lsquo;{previewResult.recommendedMood}&rsquo; 무드가
              <br />
              잘 어울릴 가능성이 높아요.
            </p>
            {previewResult.subMood && (
              <p className="mt-1 text-xs font-medium text-violet-500">
                {previewResult.subMood} 분위기도 함께 느껴져요
              </p>
            )}
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">
              {previewResult.oneLineSummary}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {previewResult.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-medium text-violet-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* Mood sync rate */}
      <Container className="mt-10">
        <h2 className="text-base font-bold text-black">무드 싱크로율</h2>
        <div className="mt-5 flex flex-col gap-4">
          {sortedMoodSync.map((item, index) => (
            <div key={item.mood}>
              <div className="flex items-center justify-between text-sm">
                <span
                  className={
                    index === 0
                      ? "font-semibold text-black"
                      : "text-gray-500"
                  }
                >
                  {item.mood}
                </span>
                <span
                  className={
                    index === 0
                      ? "font-semibold text-violet-600"
                      : "text-gray-400"
                  }
                >
                  {item.score}%
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-violet-50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-400 to-violet-500"
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-gray-400">
          무드 싱크로율은 사진과 답변을 바탕으로 한 스타일 방향 참고값입니다.
          외모 점수나 절대적인 평가는 아닙니다.
        </p>
      </Container>

      {/* Current vs target mood */}
      <Container className="mt-10">
        <h2 className="text-base font-bold text-black">
          지금 이미지와 추구미의 차이
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-violet-100 bg-white p-4">
            <p className="text-xs font-semibold text-gray-500">
              현재 이미지에서 보이는 무드
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {previewResult.currentMood.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <span className="h-1 w-1 shrink-0 rounded-full bg-gray-400" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
            <p className="text-xs font-semibold text-violet-600">
              원하는 추구미에 가까워지는 포인트
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {previewResult.upgradePoints.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-2 text-sm text-violet-800"
                >
                  <span className="h-1 w-1 shrink-0 rounded-full bg-violet-400" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* Color mood hint */}
      <Container className="mt-10">
        <h2 className="text-base font-bold text-black">
          {previewResult.colorHint.title}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          사진 기준으로 보이는 색감 흐름을 바탕으로,
          <br />
          어울릴 가능성이 높은 컬러 방향을 간단히 정리했어요.
        </p>

        <div className="mt-5 rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-violet-100 p-6">
          <p className="whitespace-pre-line text-base font-bold leading-snug text-black">
            {previewResult.colorHint.summary}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            {previewResult.colorHint.description}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {previewResult.colorHint.palette.map((chip) => (
              <div
                key={chip.name}
                className="rounded-2xl border border-violet-100 bg-white p-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-8 w-8 shrink-0 rounded-full border border-black/5"
                    style={{ backgroundColor: chip.hex }}
                  />
                  <p className="text-sm font-semibold text-black">
                    {chip.name}
                  </p>
                </div>
                <p className="mt-2 select-none text-xs leading-relaxed text-gray-400 blur-[2px]">
                  {chip.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-gray-400">
          {previewResult.colorHint.caution}
        </p>

        <div className="mt-4 rounded-2xl border border-dashed border-violet-200 bg-violet-50/30 p-4 text-center">
          <p className="flex items-center justify-center gap-1.5 text-xs font-medium leading-relaxed text-violet-600">
            <LockIcon />
            자세한 사항은 상세 리포트에서 확인할 수 있습니다.
          </p>
        </div>
      </Container>

      {/* Today's style missions */}
      <Container className="mt-10">
        <h2 className="text-base font-bold text-black">
          오늘 바로 해볼 수 있는 3가지
        </h2>
        <div className="mt-5 flex flex-col gap-3">
          {previewResult.missions.map((mission, index) => (
            <div
              key={mission}
              className="flex items-center gap-4 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm shadow-violet-100/60"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500 text-sm font-bold text-white">
                {index + 1}
              </span>
              <p className="text-sm leading-relaxed text-gray-700">
                {mission}
              </p>
            </div>
          ))}
        </div>
      </Container>

      {/* Free hints */}
      <Container className="mt-10">
        <div className="flex flex-col gap-3">
          {(["styling", "hair", "makeup"] as const).map((key) => {
            const hint = previewResult.hints[key];
            return (
              <div
                key={key}
                className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm shadow-violet-100/60"
              >
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={hintImages[key]}
                    alt={hint.title}
                    fill
                    sizes="(min-width: 448px) 448px, 100vw"
                    loading="eager"
                    className="object-cover blur-md"
                  />
                  <div className="absolute inset-0 bg-black/10" />
                  <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-violet-500 shadow-sm">
                    <LockIcon />
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-sm font-semibold text-black">
                    {hint.title}
                  </p>
                  <p className="mt-2 select-none text-sm leading-relaxed text-gray-500 blur-[3px]">
                    {hint.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>

      {/* Locked detailed report */}
      <Container className="mt-10">
        <h2 className="text-base font-bold text-black">
          상세 리포트에서 더 구체적으로 확인할 수 있어요
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          무료 미리보기에서는 전체 방향만 보여드려요. 상세 리포트에서는
          실제로 어떤 컬러, 헤어, 메이크업, 스타일링을 선택하면 좋을지 더
          자세히 확인할 수 있어요.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {previewImages.map((preview) => (
            <div
              key={preview.label}
              className="relative aspect-square overflow-hidden rounded-2xl border border-violet-100"
            >
              <Image
                src={preview.src}
                alt={preview.label}
                fill
                sizes="120px"
                loading="eager"
                className="scale-110 object-cover blur-md"
              />
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-violet-500 shadow-sm">
                  <LockIcon />
                </span>
              </div>
              <p className="absolute inset-x-0 bottom-2 text-center text-[10px] font-semibold text-white drop-shadow">
                {preview.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-violet-200 bg-violet-50/30 p-5">
          <div className="flex flex-col gap-4">
            {previewResult.lockedSections.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-violet-400 shadow-sm">
                  <LockIcon />
                </span>
                <p className="text-sm font-medium leading-snug text-gray-400 blur-[1.5px] select-none">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* Why the detailed report matters */}
      <Container className="mt-10">
        <div className="flex flex-col divide-y divide-violet-100 overflow-hidden rounded-3xl border border-violet-100 bg-white">
          <div className="flex flex-col items-center gap-4 bg-gradient-to-b from-violet-50/70 to-white p-8 text-center">
            <p className="text-xl font-extrabold leading-snug text-black">
              첫인상 <span className="text-violet-600">3초 컷</span>
            </p>
            <FirstImpressionCounter />
            <p className="text-sm leading-relaxed text-gray-600">
              상대가 처음 느끼는 건
              <br />
              얼굴보다 전체 분위기예요.
              <br />
              내 사진상 무드가 어떤 첫인상으로 남을 수 있는지 확인해보세요.
            </p>
          </div>

          <div className="flex items-start gap-4 p-6">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-violet-200 text-xs font-bold text-violet-500">
              02
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold tracking-[0.2em] text-violet-500">
                나에게 적합한 스타일링
              </p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-black">
                예쁜 옷보다 중요한 건
                <br />
                내 분위기와 잘 맞는 옷이에요.
              </p>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                컬러, 실루엣, 소재, 아이템 방향을 통해
                <br />
                내 이미지가 더 자연스럽게 살아나는 스타일을 제안해요.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-violet-200 text-xs font-bold text-violet-500">
              03
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold tracking-[0.2em] text-violet-500">
                이성을 끌어당기는 추구미
              </p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-black">
                강하게 꾸미는 것보다
                <br />
                나에게 맞는 무드를 정확히 아는 게 더 중요해요.
              </p>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                FACEMOOD는 내 사진과 답변을 바탕으로
                <br />
                어떤 추구미가 더 매력적으로 연결될 수 있는지 보여줘요.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-violet-200 text-xs font-bold text-violet-500">
              04
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold tracking-[0.2em] text-violet-500">
                분위기를 완성하는 디테일
              </p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-black">
                헤어, 메이크업, 컬러 하나만 달라져도
                <br />
                사람이 주는 느낌은 크게 달라질 수 있어요.
              </p>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                상세 리포트에서는 첫인상을 더 잘 살리는
                <br />
                헤어·메이크업·컬러 방향까지 구체적으로 정리해요.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Why check with FACEMOOD first */}
      <Container className="mt-12">
        <h2 className="text-base font-bold text-black">
          왜 FACEMOOD로 먼저 확인해야 할까요?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          스타일을 바꾸기 전에 중요한 건 나에게 어떤 분위기가 자연스럽게
          어울리는지 아는 거예요.
          <br />
          FACEMOOD는 사진과 답변을 바탕으로 내 이미지에 맞는 추구미, 컬러,
          헤어, 메이크업 방향을 정리해줘요.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {whyCards.map((card, index) => (
            <div
              key={card.title}
              className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm shadow-violet-100/40"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 text-xs font-bold text-violet-500">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-3 text-sm font-semibold leading-snug text-black">
                {card.title}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </Container>

      {/* Analysis criteria */}
      <Container className="mt-12">
        <h2 className="text-base font-bold text-black">
          FACEMOOD는 이런 기준으로 분석해요
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          사진 한 장으로 단정하지 않고, 사진에서 보이는 이미지 무드와
          사용자의 답변을 함께 참고합니다.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-violet-100 bg-white p-5">
            <p className="text-sm font-semibold text-black">
              사진에서 참고하는 요소
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {photoFactors.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-xs leading-relaxed text-gray-600"
                >
                  <span className="h-1 w-1 shrink-0 rounded-full bg-violet-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-violet-100 bg-white p-5">
            <p className="text-sm font-semibold text-black">
              답변에서 참고하는 요소
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {answerFactors.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-xs leading-relaxed text-gray-600"
                >
                  <span className="h-1 w-1 shrink-0 rounded-full bg-violet-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* Not a fun test */}
      <Container className="mt-12">
        <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-violet-50 p-6">
          <h2 className="text-base font-bold leading-snug text-black">
            단순한 재미 테스트가 아니라, 스타일 분석 흐름을 바탕으로
            구성했어요
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            FACEMOOD는 한 줄 결과만 보여주는 테스트가 아닙니다. 사진상으로
            보이는 이미지 무드, 사용자가 선택한 추구미, 평소 스타일 고민,
            컬러와 헤어·메이크업 답변을 함께 참고해 현재 이미지와 원하는
            분위기 사이의 차이를 정리합니다.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            결과는 외모를 평가하는 방식이 아니라, 내 분위기를 더 잘 살리기
            위한 스타일 방향으로 제공됩니다.
          </p>
        </div>
      </Container>

      {/* Not appearance scoring */}
      <Container className="mt-8">
        <div className="rounded-3xl border border-violet-100 bg-white p-6">
          <h2 className="text-base font-bold text-black">
            외모 평가가 아닌 이미지 무드 분석
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            FACEMOOD는 얼굴 점수, 외모 등급, 단점 지적을 제공하지 않습니다.
            <br />
            사진과 답변을 바탕으로 현재 이미지가 주는 분위기와 원하는
            추구미에 가까워지는 스타일 방향만 제안합니다.
          </p>
        </div>
      </Container>

      {/* Detailed report teaser + final CTA */}
      <Container className="mt-10">
        <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-violet-100 p-6">
          <h2 className="text-base font-bold text-black">
            상세 리포트에서는 더 깊게 확인할 수 있어요
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            무료 미리보기는 방향만 보여드려요.
            <br />
            상세 리포트에서는 약 8~12개 섹션으로 컬러, 헤어, 메이크업,
            스타일링, 상황별 이미지 전략까지 자세히 정리됩니다.
          </p>

          <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {detailChecklist.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs font-medium leading-snug text-violet-700"
              >
                <CheckIcon />
                {item}
              </li>
            ))}
          </ul>

          <Link
            href="/checkout"
            className="mt-6 flex w-full items-center justify-center rounded-full bg-black px-8 py-4 text-sm font-semibold text-white"
          >
            내 상세 리포트 확인하기
          </Link>
          <p className="mt-3 text-center text-xs leading-relaxed text-gray-500">
            무료 미리보기는 방향만, 상세 리포트는 실행 가이드까지 보여드려요.
          </p>
        </div>
      </Container>
    </main>
  );
}
