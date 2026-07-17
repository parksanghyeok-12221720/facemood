"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Container from "@/app/components/Container";
import { REPORT_CHAPTERS } from "@/types/report";
import type {
  FullReport,
  PreviewResult,
  ReportChapterKey,
} from "@/types/report";

const FULL_REPORT_KEY = "facemood_full_report";
const ANSWERS_KEY = "facemood_answers";
const IMAGE_KEY = "facemood_uploaded_image";
const PREVIEW_RESULT_KEY = "facemood_preview_result";
const REPORT_ID_KEY = "facemood_report_id";

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

// Read directly (not via useSyncExternalStore/render state) — this only
// ever needs to be read inside effects/handlers, both of which run after
// mount, so there's no server/client snapshot to reconcile.
function getIdParam(): string | null {
  return new URLSearchParams(window.location.search).get("id");
}

type FetchState =
  | { status: "loading" }
  | { status: "locked"; error?: string }
  | { status: "verifying" }
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
        <br />
        (3~5분 정도 소요될 수 있습니다.)
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

function PasswordGate({
  error,
  isVerifying,
  onSubmit,
}: {
  error?: string;
  isVerifying: boolean;
  onSubmit: (password: string) => void;
}) {
  const [password, setPassword] = useState("");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center text-black">
      <p className="text-sm font-semibold text-black">
        비밀번호를 입력하면 리포트를 다시 볼 수 있어요.
      </p>
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="비밀번호"
        disabled={isVerifying}
        className="mt-5 w-full max-w-xs rounded-xl border border-violet-100 px-4 py-3 text-center text-sm text-black outline-none focus:border-violet-300"
      />
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      <button
        type="button"
        onClick={() => onSubmit(password)}
        disabled={isVerifying || password.length === 0}
        className="mt-5 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isVerifying ? "확인 중..." : "리포트 확인하기"}
      </button>
      <Link href="/upload" className="mt-4 text-xs text-gray-400 underline">
        처음부터 다시 진행하기
      </Link>
    </main>
  );
}

type ChapterVisual = "hero" | "hair" | "makeup" | "palette" | "none";

// Only 3 real photos exist (mood/hair/makeup), so images are reserved for
// the chapters they're actually relevant to rather than repeated on every
// single one — alternating with text-only cards keeps a visual rhythm
// instead of showing the same photo 13 times in a row.
const CHAPTER_VISUALS: Record<ReportChapterKey, ChapterVisual> = {
  finalSummary: "hero",
  currentImageMood: "none",
  gapAnalysis: "none",
  recommendedMoodDetail: "hero",
  firstImpression: "none",
  stylingGuide: "hero",
  hairGuide: "hair",
  makeupGuide: "makeup",
  colorMoodAnalysis: "palette",
  colorPalette: "palette",
  avoidStyles: "none",
  situationGuide: "none",
  finalChecklist: "none",
};

function ChapterBody({ text }: { text: string }) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-4">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="text-[15px] leading-[1.9] text-gray-800">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function PaletteGrid({ palette }: { palette: PreviewResult["colorHint"]["palette"] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {palette.map((chip) => (
        <div
          key={chip.name}
          className="rounded-2xl border border-violet-100 bg-violet-50/40 p-3"
        >
          <div className="flex items-center gap-2">
            <span
              className="h-9 w-9 shrink-0 rounded-full border border-black/5 shadow-sm"
              style={{ backgroundColor: chip.hex }}
            />
            <div>
              <p className="text-sm font-semibold text-black">{chip.name}</p>
              <p className="text-[10px] uppercase tracking-wide text-gray-400">
                {chip.hex}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            {chip.description}
          </p>
        </div>
      ))}
    </div>
  );
}

function ChapterCard({
  chapter,
  body,
  images,
  colorHint,
}: {
  chapter: (typeof REPORT_CHAPTERS)[number];
  body: string;
  images: PreviewResult["images"];
  colorHint: PreviewResult["colorHint"];
}) {
  const visual = CHAPTER_VISUALS[chapter.key];
  const imageSrc =
    visual === "hero" ? images.hero : visual === "hair" ? images.hair : visual === "makeup" ? images.makeup : null;
  const isFinal = chapter.key === "finalChecklist";

  return (
    <Container maxWidth="max-w-3xl" className="mt-8">
      <div
        className={`overflow-hidden rounded-3xl border shadow-sm ${
          isFinal
            ? "border-violet-200 bg-gradient-to-br from-violet-50 via-white to-violet-100 shadow-violet-100/60"
            : "border-violet-100 bg-white shadow-violet-100/40"
        }`}
      >
        {imageSrc && (
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={imageSrc}
              alt={chapter.title}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />
          </div>
        )}

        <div className="p-6">
          <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold tracking-[0.15em] text-violet-600">
            CHAPTER {chapter.number}
          </span>
          <h2 className="mt-4 text-lg font-bold leading-snug text-black">
            {chapter.title}
          </h2>

          {visual === "palette" && (
            <div className="mt-5">
              <PaletteGrid palette={colorHint.palette} />
            </div>
          )}

          <div className={visual === "palette" ? "mt-5" : "mt-4"}>
            <ChapterBody text={body} />
          </div>
        </div>
      </div>
    </Container>
  );
}

async function requestFullReport(
  answers: Record<string, unknown>,
  imageDataUrl: string | null,
  previewResult: PreviewResult | null,
): Promise<FullReport> {
  const response = await fetch("/api/generate-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers, imageDataUrl, previewResult }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "리포트 생성에 실패했습니다.");
  }
  return data.report as FullReport;
}

function persistFullReportToServer(
  reportId: string | null,
  fullReport: FullReport,
) {
  if (!reportId) return;
  fetch(`/api/reports/${reportId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullReport }),
  }).catch(() => {
    console.warn("상세 리포트 저장에 실패했습니다 (서버 연결 문제로 추정).");
  });
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
      const idParam = getIdParam();
      if (!answersRaw) {
        if (cancelled) return;
        // No local data on this device — if the link carries a report id,
        // let the user unlock it with the password they set at checkout
        // instead of just failing.
        if (idParam) {
          setFetchState({ status: "locked" });
        } else {
          setFetchState({
            status: "error",
            message: "저장된 답변이 없습니다. 처음부터 다시 진행해주세요.",
          });
        }
        return;
      }

      const imageDataUrl = localStorage.getItem(IMAGE_KEY);
      const previewRaw = localStorage.getItem(PREVIEW_RESULT_KEY);
      const reportId = localStorage.getItem(REPORT_ID_KEY) ?? idParam;

      try {
        const report = await requestFullReport(
          JSON.parse(answersRaw) as Record<string, unknown>,
          imageDataUrl,
          previewRaw ? (JSON.parse(previewRaw) as PreviewResult) : null,
        );

        localStorage.setItem(FULL_REPORT_KEY, JSON.stringify(report));
        persistFullReportToServer(reportId, report);
        if (!cancelled) {
          setFetchState({ status: "done", report });
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

  async function handleVerifyPassword(password: string) {
    const idParam = getIdParam();
    if (!idParam) return;
    setFetchState({ status: "verifying" });

    try {
      const response = await fetch(`/api/reports/${idParam}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setFetchState({
          status: "locked",
          error: data.error ?? "비밀번호가 올바르지 않습니다.",
        });
        return;
      }

      localStorage.setItem(REPORT_ID_KEY, idParam);
      localStorage.setItem(ANSWERS_KEY, JSON.stringify(data.answers ?? {}));
      if (data.previewResult) {
        localStorage.setItem(
          PREVIEW_RESULT_KEY,
          JSON.stringify(data.previewResult),
        );
      }

      if (data.fullReport) {
        localStorage.setItem(
          FULL_REPORT_KEY,
          JSON.stringify(data.fullReport),
        );
        setFetchState({ status: "done", report: data.fullReport });
        return;
      }

      // No stored report yet (shouldn't normally happen once paid) —
      // regenerate. The original photo isn't kept server-side, so this
      // pass runs without it.
      const report = await requestFullReport(
        data.answers ?? {},
        null,
        data.previewResult ?? null,
      );
      localStorage.setItem(FULL_REPORT_KEY, JSON.stringify(report));
      persistFullReportToServer(idParam, report);
      setFetchState({ status: "done", report });
    } catch (error) {
      setFetchState({
        status: "locked",
        error:
          error instanceof Error
            ? error.message
            : "확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      });
    }
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
    if (fetchState.status === "locked" || fetchState.status === "verifying") {
      return (
        <PasswordGate
          error={fetchState.status === "locked" ? fetchState.error : undefined}
          isVerifying={fetchState.status === "verifying"}
          onSubmit={handleVerifyPassword}
        />
      );
    }
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

      {REPORT_CHAPTERS.map((chapter) => (
        <ChapterCard
          key={chapter.key}
          chapter={chapter}
          body={report[chapter.key].body}
          images={report.images}
          colorHint={report.colorHint}
        />
      ))}

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
