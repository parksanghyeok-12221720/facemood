"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Container from "@/app/components/Container";
import type { FullReport, PreviewResult } from "@/types/report";

const FULL_REPORT_KEY = "facemood_full_report";
const ANSWERS_KEY = "facemood_answers";
const IMAGE_KEY = "facemood_uploaded_image";
const PREVIEW_RESULT_KEY = "facemood_preview_result";

function subscribeToFullReport(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getFullReportSnapshot() {
  return localStorage.getItem(FULL_REPORT_KEY);
}

function getServerFullReportSnapshot() {
  return null;
}

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; report: FullReport };

function GeneratingState() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center text-black">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-200 border-t-violet-500" />
      <p className="mt-5 text-sm font-semibold text-black">
        상세 리포트를 작성 중입니다...
      </p>
      <p className="mt-2 text-xs text-gray-400">
        사진과 답변을 바탕으로 스타일 방향을 정리하고 있어요. 잠시만
        기다려주세요.
      </p>
    </main>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center text-black">
      <p className="text-sm font-semibold text-black">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
      >
        다시 시도
      </button>
      <Link href="/upload" className="mt-4 text-xs text-gray-400 underline">
        처음부터 다시 진행하기
      </Link>
    </main>
  );
}

function SectionCard({
  label,
  title,
  children,
}: {
  label: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Container maxWidth="max-w-3xl" className="mt-10">
      <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold tracking-[0.15em] text-violet-600">
        {label}
      </span>
      {title && (
        <h2 className="mt-4 text-lg font-bold leading-snug text-black">
          {title}
        </h2>
      )}
      <div className={title ? "mt-4" : "mt-4"}>{children}</div>
    </Container>
  );
}

function LabeledRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-violet-50 py-3 last:border-b-0">
      <p className="text-xs font-semibold tracking-wide text-violet-500">
        {label}
      </p>
      <p className="text-sm leading-relaxed text-gray-700">{value}</p>
    </div>
  );
}

function TagList({ items, tone = "neutral" }: { items: string[]; tone?: "neutral" | "avoid" }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            tone === "avoid"
              ? "border-gray-200 bg-gray-50 text-gray-500"
              : "border-violet-200 bg-violet-50 text-violet-700"
          }`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function ReportPage() {
  const cachedReportRaw = useSyncExternalStore(
    subscribeToFullReport,
    getFullReportSnapshot,
    getServerFullReportSnapshot,
  );

  const [fetchState, setFetchState] = useState<FetchState>({
    status: "loading",
  });
  const [retryTrigger, setRetryTrigger] = useState(0);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // Already have a saved report — nothing to fetch.
    if (cachedReportRaw) return;
    // Guard against React Strict Mode's dev double-invoke firing this twice.
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    let cancelled = false;

    async function run() {
      // Push everything below past a microtask boundary so no setState call
      // in this effect is ever synchronous relative to the effect body.
      await Promise.resolve();

      const answersRaw = localStorage.getItem(ANSWERS_KEY);
      if (!answersRaw) {
        if (!cancelled) {
          setFetchState({
            status: "error",
            message: "저장된 답변이 없습니다. 처음부터 다시 진행해주세요.",
          });
        }
        return;
      }

      const imageDataUrl = localStorage.getItem(IMAGE_KEY);
      const previewRaw = localStorage.getItem(PREVIEW_RESULT_KEY);

      try {
        const response = await fetch("/api/generate-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: JSON.parse(answersRaw) as Record<string, unknown>,
            imageDataUrl: imageDataUrl ?? null,
            previewResult: previewRaw
              ? (JSON.parse(previewRaw) as PreviewResult)
              : null,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "리포트 생성에 실패했습니다.");
        }

        localStorage.setItem(FULL_REPORT_KEY, JSON.stringify(data.report));
        if (!cancelled) {
          setFetchState({ status: "done", report: data.report });
        }
      } catch (error) {
        if (!cancelled) {
          setFetchState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "리포트 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          });
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [cachedReportRaw, retryTrigger]);

  function handleRetry() {
    hasStartedRef.current = false;
    setFetchState({ status: "loading" });
    setRetryTrigger((n) => n + 1);
  }

  let report: FullReport | null = null;
  if (cachedReportRaw) {
    try {
      report = JSON.parse(cachedReportRaw) as FullReport;
    } catch (error) {
      console.error(error);
    }
  } else if (fetchState.status === "done") {
    report = fetchState.report;
  }

  if (!report) {
    if (fetchState.status === "error") {
      return <ErrorState message={fetchState.message} onRetry={handleRetry} />;
    }
    return <GeneratingState />;
  }

  return (
    <main className="min-h-screen bg-white pb-16 pt-10 text-black">
      <Container className="text-center">
        <p className="text-sm font-bold tracking-[0.3em] text-violet-600">
          FACEMOOD
        </p>
        <h1 className="mt-4 text-xl font-bold leading-snug text-black">
          상세 스타일 리포트
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          이미지 컨설팅 관점에서 정리한 스타일 분석 흐름이에요.
          <br />
          사진과 답변을 바탕으로 한 참고용 리포트입니다.
        </p>
      </Container>

      {/* 1. 최종 추천 추구미 요약 */}
      <Container maxWidth="max-w-3xl" className="mt-8">
        <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-violet-100 p-6">
          <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.15em] text-violet-500 shadow-sm">
            최종 추천 추구미
          </span>
          <p className="mt-4 text-lg font-bold leading-snug text-black">
            &lsquo;{report.summary.recommendedMood}&rsquo; 무드가 잘 어울릴
            가능성이 높아요.
          </p>
          <p className="mt-1 text-xs font-medium text-violet-500">
            {report.summary.subMood} 분위기도 함께 참고하면 좋아요.
          </p>
          <div className="mt-4">
            <TagList items={report.summary.keywords} />
          </div>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-700">
            {report.summary.finalAdvice}
          </p>
        </div>
      </Container>

      {/* 2. 현재 이미지 무드 분석 */}
      <SectionCard label="CURRENT MOOD" title={report.currentImageMood.title}>
        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
          {report.currentImageMood.content}
        </p>
      </SectionCard>

      {/* 3. 원하는 추구미와 현재 이미지의 차이 */}
      <SectionCard label="GAP ANALYSIS" title={report.gapAnalysis.title}>
        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
          {report.gapAnalysis.content}
        </p>
      </SectionCard>

      {/* 4. 스타일링 세부 가이드 */}
      <SectionCard label="STYLING" title={report.styling.title}>
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-violet-500">
              추천 컬러
            </p>
            <TagList items={report.styling.colors} />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-violet-500">
              추천 실루엣
            </p>
            <TagList items={report.styling.silhouettes} />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-violet-500">
              추천 아이템
            </p>
            <TagList items={report.styling.items} />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500">
              피하면 좋은 방향
            </p>
            <TagList items={report.styling.avoid} tone="avoid" />
          </div>
        </div>
      </SectionCard>

      {/* 5. 헤어 세부 가이드 */}
      <SectionCard label="HAIR" title={report.hair.title}>
        <div className="rounded-2xl border border-violet-100 bg-white">
          <div className="px-4">
            <LabeledRow label="기장" value={report.hair.length} />
            <LabeledRow label="앞머리" value={report.hair.bangs} />
            <LabeledRow label="펌" value={report.hair.perm} />
            <LabeledRow label="컬러" value={report.hair.color} />
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
          <p className="text-xs font-semibold text-violet-600">
            미용실에서 이렇게 말해보세요
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-700">
            &ldquo;{report.hair.salonScript}&rdquo;
          </p>
        </div>
      </SectionCard>

      {/* 6. 메이크업 세부 가이드 */}
      <SectionCard label="MAKEUP" title="메이크업 세부 가이드">
        <div className="rounded-2xl border border-violet-100 bg-white px-4">
          <LabeledRow label="베이스" value={report.makeup.base} />
          <LabeledRow label="눈썹" value={report.makeup.eyebrow} />
          <LabeledRow label="아이메이크업" value={report.makeup.eye} />
          <LabeledRow label="블러셔" value={report.makeup.blush} />
          <LabeledRow label="립" value={report.makeup.lip} />
        </div>
      </SectionCard>

      {/* 7. 사진상 컬러 무드 분석 */}
      <SectionCard label="COLOR MOOD" title={report.colorMood.title}>
        <p className="text-sm leading-relaxed text-gray-700">
          {report.colorMood.tone}
        </p>
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold tracking-wide text-violet-500">
            추천 컬러 팔레트
          </p>
          <TagList items={report.colorMood.recommendedPalette} />
        </div>
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500">
            피하면 좋은 컬러
          </p>
          <TagList items={report.colorMood.avoidColors} tone="avoid" />
        </div>
        <p className="mt-4 text-xs leading-relaxed text-gray-400">
          {report.colorMood.notice}
        </p>
      </SectionCard>

      {/* 8. 상황별 이미지 전략 */}
      <SectionCard label="SITUATION GUIDE" title="상황별 이미지 전략">
        <div className="rounded-2xl border border-violet-100 bg-white px-4">
          <LabeledRow label="데이트" value={report.situationGuide.dating} />
          <LabeledRow
            label="인스타 프로필"
            value={report.situationGuide.instagram}
          />
          <LabeledRow label="데일리" value={report.situationGuide.daily} />
          <LabeledRow
            label="출근 · 면접"
            value={report.situationGuide.interview}
          />
        </div>
      </SectionCard>

      {/* 9. 최종 체크리스트 */}
      <SectionCard label="CHECKLIST" title="최종 체크리스트">
        <ul className="flex flex-col gap-3">
          {report.finalChecklist.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-white p-4 text-sm leading-relaxed text-gray-700"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </SectionCard>

      <Container className="mt-10">
        <p className="text-center text-xs leading-relaxed text-gray-400">
          FACEMOOD는 외모 점수화 없이, 이미지 무드와 스타일 방향만
          분석합니다. 퍼스널컬러는 조명과 카메라 보정에 따라 달라질 수 있어
          확정 진단이 아닌 참고 의견으로 제공됩니다.
        </p>
      </Container>
    </main>
  );
}
