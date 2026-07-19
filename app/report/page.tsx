"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Container from "@/app/components/Container";
import { REPORT_CHAPTERS, buildPreviewResult } from "@/types/report";
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

// Reports saved before `images`/`colorHint` were added to FullReport
// (cached in localStorage or stored server-side) won't have them —
// backfill from the same rule-based preview data instead of crashing.
function ensureReportVisuals(report: FullReport): FullReport {
  if (report.images && report.colorHint) return report;

  try {
    const answersRaw = localStorage.getItem(ANSWERS_KEY);
    const answers = answersRaw
      ? (JSON.parse(answersRaw) as Record<string, unknown>)
      : {};
    const fallback = buildPreviewResult(answers);
    return {
      ...report,
      images: report.images ?? fallback.images,
      colorHint: report.colorHint ?? fallback.colorHint,
    };
  } catch (error) {
    console.error(error);
    return report;
  }
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

type ChapterVisual = "hero" | "hair" | "makeup" | "palette" | "typeBadge" | "none";

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
  faceShapeAnalysis: "typeBadge",
  animalTypeAnalysis: "typeBadge",
};

type ChapterBlock =
  | { type: "heading"; content: string }
  | { type: "paragraph"; content: string }
  | { type: "keywords"; items: string[] }
  | { type: "verdict"; content: string };

// A "핵심 키워드" heading's paragraph reads as a short comma/dot-separated
// list most of the time — but the AI doesn't always format it that
// cleanly. Only treat it as a keyword row when it actually looks like
// one (2+ short items); otherwise leave it as a normal paragraph rather
// than mangling a real sentence into fake "tags".
function splitToPills(text: string): string[] | null {
  const candidates = text
    .split(/[,、·/]|\s{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (candidates.length >= 2 && candidates.every((c) => c.length > 0 && c.length <= 16)) {
    return candidates;
  }
  return null;
}

// The AI often organizes a chapter's sub-topics with markdown-style
// "### 소제목" lines. Nothing in the app used to parse that, so the raw
// "###" showed up as literal text — this splits body text into heading
// vs. paragraph blocks so headings can render as actual sub-labels, then
// upgrades the "핵심 키워드" / "한 줄 총평" sections specifically into
// pill tags / a quote card.
function parseChapterBlocks(text: string): ChapterBlock[] {
  const rawBlocks: ChapterBlock[] = [];
  let paragraphLines: string[] = [];

  function flushParagraph() {
    const joined = paragraphLines.join(" ").trim();
    if (joined) rawBlocks.push({ type: "paragraph", content: joined });
    paragraphLines = [];
  }

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      continue;
    }
    const headingMatch = line.match(/^#{1,6}\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      rawBlocks.push({ type: "heading", content: headingMatch[1].trim() });
      continue;
    }
    paragraphLines.push(line);
  }
  flushParagraph();

  const blocks: ChapterBlock[] = [];
  for (let i = 0; i < rawBlocks.length; i++) {
    const block = rawBlocks[i];
    const next = rawBlocks[i + 1];

    if (block.type === "heading" && /키워드/.test(block.content) && next?.type === "paragraph") {
      const pills = splitToPills(next.content);
      if (pills) {
        blocks.push(block, { type: "keywords", items: pills });
        i++;
        continue;
      }
    }

    if (block.type === "heading" && /총평/.test(block.content) && next?.type === "paragraph") {
      blocks.push({ type: "verdict", content: next.content });
      i++;
      continue;
    }

    blocks.push(block);
  }

  return blocks;
}

// The AI is told not to use markdown, but occasionally still wraps a
// phrase in "**bold**" anyway — render those as actual emphasis instead
// of leaking literal asterisks into the text.
function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-[var(--ink)]">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

function ChapterBody({ text }: { text: string }) {
  const blocks = parseChapterBlocks(text);

  return (
    <div className="flex flex-col">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <span
              key={index}
              className="mb-2.5 mt-8 block text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[var(--plum-deep)] first:mt-0"
            >
              {renderInlineMarkdown(block.content)}
            </span>
          );
        }
        if (block.type === "keywords") {
          return (
            <div key={index} className="mb-6 flex flex-wrap gap-2">
              {block.items.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-[var(--plum-tint)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--plum-deep)]"
                >
                  {item}
                </span>
              ))}
            </div>
          );
        }
        if (block.type === "verdict") {
          return (
            <blockquote
              key={index}
              className="relative my-2 mb-7 rounded-sm border border-[var(--hairline)] bg-[var(--paper-raised)] px-7 py-6"
            >
              <span
                className="mb-1.5 block text-[40px] leading-none text-[var(--plum)] opacity-65"
                style={{ fontFamily: "'Noto Serif KR', serif" }}
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <p
                className="text-[16.5px] font-medium leading-[1.7] text-[var(--ink)]"
                style={{ fontFamily: "'Noto Serif KR', serif" }}
              >
                {renderInlineMarkdown(block.content)}
              </p>
              <cite
                className="mt-3.5 block text-[11px] not-italic tracking-[0.04em] text-[var(--ink-soft)]"
              >
                — 한 줄 총평
              </cite>
            </blockquote>
          );
        }
        return (
          <p
            key={index}
            className="mb-5 text-[15.5px] leading-[1.85] text-[var(--ink)] last:mb-0"
          >
            {renderInlineMarkdown(block.content)}
          </p>
        );
      })}
    </div>
  );
}

// Ties each chapter's accent to a real color from this report's own
// palette (chapter 11 — 사진상 컬러 무드 분석) instead of a fixed color,
// so it stays correct for whichever mood/palette this particular user got.
function getChapterAccent(
  index: number,
  palette: PreviewResult["colorHint"]["palette"] | undefined,
): { hex: string; name: string } {
  if (!palette || palette.length === 0) {
    return { hex: "#6D4FC4", name: "플럼" };
  }
  const chip = palette[index % palette.length];
  return { hex: chip.hex, name: chip.name };
}

function chapterAnchorId(key: ReportChapterKey) {
  return `ch-${key}`;
}

function scrollToChapter(key: ReportChapterKey) {
  const el = document.getElementById(chapterAnchorId(key));
  if (!el) return;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  el.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });
}

function TableOfContents({
  chapters,
}: {
  chapters: (typeof REPORT_CHAPTERS)[number][];
}) {
  return (
    <Container className="mt-14">
      <h2
        className="text-[22px] font-semibold text-[var(--ink)]"
        style={{ fontFamily: "'Noto Serif KR', serif" }}
      >
        리포트 구성
      </h2>
      <p className="mb-6 mt-1.5 text-sm text-[var(--ink-soft)]">
        전체 {chapters.length}개 챕터로 이어집니다. 원하는 챕터를 눌러 바로
        이동할 수 있어요.
      </p>
      <nav className="border-t border-[var(--hairline)]" aria-label="리포트 챕터 목차">
        {chapters.map((chapter) => (
          <a
            key={chapter.key}
            href={`#${chapterAnchorId(chapter.key)}`}
            onClick={(event) => {
              event.preventDefault();
              scrollToChapter(chapter.key);
            }}
            className="flex flex-col gap-1 border-b border-[var(--hairline)] py-4 no-underline transition-colors hover:bg-[var(--plum-tint)]/40"
          >
            <div className="flex items-baseline gap-3">
              <span className="min-w-[26px] shrink-0 text-[13px] font-semibold text-[var(--plum)]">
                {chapter.number}
              </span>
              <span className="flex-1 break-keep text-[15px] font-medium leading-snug text-[var(--ink)]">
                {chapter.title}
              </span>
            </div>
            <span className="break-keep pl-[38px] text-xs text-[var(--ink-soft)]">
              {chapter.points.slice(0, 2).join(" · ")}
            </span>
          </a>
        ))}
      </nav>
    </Container>
  );
}

function PaletteGrid({ palette }: { palette: PreviewResult["colorHint"]["palette"] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {palette.map((chip) => (
        <div
          key={chip.name}
          className="rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] p-3"
        >
          <div className="flex items-center gap-2">
            <span
              className="h-9 w-9 shrink-0 rounded-full border border-black/5 shadow-sm"
              style={{ backgroundColor: chip.hex }}
            />
            <div>
              <p className="text-sm font-semibold text-[var(--ink)]">
                {chip.name}
              </p>
              <p
                className="text-[10px] tracking-wide text-[var(--ink-soft)]"
              >
                {chip.hex}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[var(--ink-soft)]">
            {chip.description}
          </p>
        </div>
      ))}
    </div>
  );
}

function MoodTag({ accent }: { accent: { hex: string; name: string } }) {
  return (
    <span
      className="mb-3.5 inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.04em] text-[var(--ink-soft)]"
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: accent.hex }}
        aria-hidden="true"
      />
      MOOD — {accent.name}
    </span>
  );
}

function ChapterCard({
  chapter,
  body,
  images,
  colorHint,
  typeValue,
  accent,
}: {
  chapter: (typeof REPORT_CHAPTERS)[number];
  body: string;
  images: PreviewResult["images"] | undefined;
  colorHint: PreviewResult["colorHint"] | undefined;
  typeValue?: string | null;
  accent: { hex: string; name: string };
}) {
  const visual = CHAPTER_VISUALS[chapter.key];
  const imageSrc =
    visual === "hero" ? images?.hero : visual === "hair" ? images?.hair : visual === "makeup" ? images?.makeup : null;
  const isFinal = chapter.key === "finalChecklist";

  return (
    <Container
      id={chapterAnchorId(chapter.key)}
      maxWidth="max-w-3xl"
      className="mt-8 scroll-mt-6"
    >
      <div
        className={`overflow-hidden rounded-md border shadow-sm ${
          isFinal
            ? "border-[var(--plum-tint)] bg-[var(--plum-tint)] shadow-none"
            : "border-[var(--hairline)] bg-[var(--paper-raised)] shadow-none"
        }`}
      >
        {imageSrc && (
          <div className="relative aspect-[4/5] w-full bg-[var(--plum-tint)] sm:aspect-[16/10]">
            <Image
              src={imageSrc}
              alt={chapter.title}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-contain"
            />
          </div>
        )}

        <div
          className="p-6 pl-[22px]"
          style={{ borderLeft: `3px solid ${accent.hex}` }}
        >
          <MoodTag accent={accent} />
          <span
            className="block text-[12px] font-semibold tracking-[0.08em] text-[var(--plum)]"
          >
            CHAPTER {chapter.number}
          </span>
          <h2
            className="mt-2.5 text-[clamp(22px,3vw,26px)] font-semibold leading-[1.35] tracking-[-0.005em] text-[var(--ink)] break-keep"
            style={{ fontFamily: "'Noto Serif KR', serif" }}
          >
            {chapter.title}
          </h2>

          {visual === "palette" && colorHint?.palette && (
            <div className="mt-5">
              <PaletteGrid palette={colorHint.palette} />
            </div>
          )}

          {visual === "typeBadge" && typeValue && (
            <div className="mt-5 rounded-md border border-[var(--hairline)] bg-[var(--plum-tint)] p-5 text-center">
              <p
                className="text-xs font-semibold tracking-[0.08em] text-[var(--plum-deep)]"
              >
                사진상 분석 결과
              </p>
              <p
                className="mt-2 text-2xl font-bold text-[var(--plum-deep)]"
                style={{ fontFamily: "'Noto Serif KR', serif" }}
              >
                {typeValue}
              </p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">
                에 가까운 인상으로 보여요
              </p>
            </div>
          )}

          <div className={visual === "palette" || visual === "typeBadge" ? "mt-6" : "mt-5"}>
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

  if (report) {
    report = ensureReportVisuals(report);
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

  // faceShapeAnalysis/animalTypeAnalysis are skipped entirely when no
  // photo was uploaded, and older cached reports may predate a given
  // chapter — filter once and reuse for both the TOC and the chapter list.
  const visibleChapters = REPORT_CHAPTERS.filter((c) => Boolean(report[c.key]));

  return (
    <main
      className="min-h-screen pb-16 pt-10"
      style={
        {
          "--ink": "#1C1B22",
          "--ink-soft": "#4B4854",
          "--paper": "#FAF9F6",
          "--paper-raised": "#FFFFFF",
          "--hairline": "#E7E2D9",
          "--plum": "#6D4FC4",
          "--plum-deep": "#4A3380",
          "--plum-tint": "#F1EDFB",
          backgroundColor: "var(--paper)",
          color: "var(--ink)",
          fontFamily:
            "'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
        } as React.CSSProperties
      }
    >
      {/* eslint-disable-next-line @next/next/no-page-custom-font -- scoped to
          this page only; the rest of the app doesn't use these fonts. */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css"
      />

      <Container className="text-center">
        <p
          className="text-[13px] font-semibold tracking-[0.14em] text-[var(--plum-deep)]"
        >
          FACEMOOD
        </p>
        <h1
          className="mt-4 text-2xl font-bold leading-snug text-[var(--ink)]"
          style={{ fontFamily: "'Noto Serif KR', serif" }}
        >
          상세 스타일 리포트
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">
          이미지 컨설팅 관점에서 정리한 스타일 분석 흐름이에요.
          <br />
          사진과 답변을 바탕으로 한 참고용 리포트입니다.
        </p>
      </Container>

      <TableOfContents chapters={visibleChapters} />

      {visibleChapters.map((chapter, index) => {
        const chapterData = report[chapter.key]!;
        const accent = getChapterAccent(index, report.colorHint?.palette);

        const typeValue =
          chapter.key === "faceShapeAnalysis"
            ? report.faceShapeType
            : chapter.key === "animalTypeAnalysis"
              ? report.animalType
              : undefined;

        return (
          <ChapterCard
            key={chapter.key}
            chapter={chapter}
            body={chapterData.body}
            images={report.images}
            colorHint={report.colorHint}
            typeValue={typeValue}
            accent={accent}
          />
        );
      })}

      <Container className="mt-10">
        <p className="text-center text-xs leading-relaxed text-[var(--ink-soft)]">
          FACEMOOD는 외모 점수화 없이, 이미지 무드와 스타일 방향만
          분석합니다. 퍼스널컬러는 조명과 카메라 보정에 따라 달라질 수 있어
          확정 진단이 아닌 참고 의견으로 제공됩니다.
        </p>
      </Container>

      <style jsx>{`
        a:focus-visible,
        button:focus-visible {
          outline: 2px solid var(--plum);
          outline-offset: 3px;
          border-radius: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.001ms !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>
    </main>
  );
}
