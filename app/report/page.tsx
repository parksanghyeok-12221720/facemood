"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Container from "@/app/components/Container";
import {
  ANIMAL_TYPE_IMAGES,
  COLOR_REPORT_CHAPTERS,
  FACE_SHAPE_IMAGES,
  HAIR_REPORT_CHAPTERS,
  HAIR_STYLE_IMAGES,
  MAKEUP_REPORT_CHAPTERS,
  MAKEUP_STYLE_IMAGES,
  MALE_HAIR_STYLE_IMAGES,
  MALE_REPORT_CHAPTERS,
  REPORT_CHAPTERS,
  buildMalePreviewResult,
  buildPreviewResult,
} from "@/types/report";
import type {
  FullReport,
  HairStyleCandidate,
  MakeupStyleCandidate,
  MaleHairStyleCandidate,
  PreviewResult,
  ReportChapterContent,
  ReportChapterKey,
  ReportTierName,
} from "@/types/report";

const FULL_REPORT_KEY = "facemood_full_report";
const ANSWERS_KEY = "facemood_answers";
const IMAGE_KEY = "facemood_uploaded_image";
const PREVIEW_RESULT_KEY = "facemood_preview_result";
const REPORT_ID_KEY = "facemood_report_id";
const REPORT_TIER_KEY = "facemood_report_tier";

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
    const fallback =
      report.tier === "male" ? buildMalePreviewResult(answers) : buildPreviewResult(answers);
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

// Rough stages of what generate-report is actually doing, in the order
// those chapters tend to finish — purely cosmetic (there's no real
// progress channel from the server), but rotating through them keeps
// people reading instead of staring at a static spinner and bailing.
const GENERATING_STAGES = [
  "사진 속 이미지 무드를 분석하고 있어요",
  "어울리는 추구미 방향을 정리하고 있어요",
  "얼굴형·동물상 분석을 진행하고 있어요",
  "컬러 팔레트를 만들고 있어요",
  "헤어 스타일 방향을 정리하고 있어요",
  "메이크업 방향을 잡고 있어요",
  "스타일링 가이드를 정리하고 있어요",
  "리포트를 최종 정리하고 있어요",
];

function GeneratingState() {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(4);

  useEffect(() => {
    // Rotates roughly once every ~13s and creeps the bar toward 92%
    // (never claims 100% until the real content actually swaps in) —
    // paced for the typical ~100s generation time without promising an
    // exact number that won't match reality.
    const stageTimer = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, GENERATING_STAGES.length - 1));
    }, 13000);
    const progressTimer = setInterval(() => {
      setProgress((p) => (p < 92 ? p + 1 : p));
    }, 1300);
    return () => {
      clearInterval(stageTimer);
      clearInterval(progressTimer);
    };
  }, []);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#FAF6EF", color: "#1A1613" }}
    >
      <Container maxWidth="max-w-sm" className="flex flex-col items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#F2ECFA] border-t-[#4E2A82]" />

        <div className="mt-6 w-full">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#F2ECFA]">
            <div
              className="h-full rounded-full bg-[#4E2A82] transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold text-[#4E2A82]">
            {progress}%
          </p>
        </div>

        <p className="mt-5 text-sm font-semibold">
          {GENERATING_STAGES[stageIndex]}
        </p>
        <p className="mt-1 text-xs text-[#726B62]">보통 1~2분 정도 걸려요.</p>

        <div className="mt-6 w-full rounded-[12px] border border-red-100 bg-red-50 px-4 py-3.5">
          <p className="text-xs font-bold text-red-500">화면을 나가지 마세요</p>
          <p className="mt-1 text-[11px] leading-relaxed text-red-400">
            지금 창을 닫거나 다른 화면으로 이동하면 생성이 중단되고
            <br />
            지금까지 진행된 내용이 사라져요. 완성될 때까지 이 화면을
            <br />
            유지해주세요.
          </p>
        </div>
      </Container>
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
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#FAF6EF", color: "#1A1613" }}
    >
      <p className="text-sm font-semibold">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 flex h-[52px] items-center justify-center rounded-[12px] bg-[#4E2A82] px-8 text-sm font-semibold text-white transition-colors hover:bg-[#3A1F63]"
      >
        다시 시도
      </button>
      <Link href="/upload" className="mt-4 text-xs text-[#726B62] underline">
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
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#FAF6EF", color: "#1A1613" }}
    >
      <p className="text-sm font-semibold">
        비밀번호를 입력하면 리포트를 다시 볼 수 있어요.
      </p>
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="비밀번호"
        disabled={isVerifying}
        className="mt-5 h-[52px] w-full max-w-xs rounded-[12px] border border-[#E4DACB] px-4 text-center text-sm outline-none focus:border-[#4E2A82]"
      />
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      <button
        type="button"
        onClick={() => onSubmit(password)}
        disabled={isVerifying || password.length === 0}
        className="mt-5 flex h-[52px] items-center justify-center rounded-[12px] bg-[#4E2A82] px-8 text-sm font-semibold text-white transition-colors hover:bg-[#3A1F63] disabled:opacity-50"
      >
        {isVerifying ? "확인 중..." : "리포트 확인하기"}
      </button>
      <Link href="/upload" className="mt-4 text-xs text-[#726B62] underline">
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
  accessoryGuide: "none",
  perfumeGuide: "none",
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

// Renders the first paragraph's opening character oversized and floated,
// like a magazine feature's drop cap — the rest of that paragraph flows
// around it normally. Splitting on the raw character (not the
// markdown-rendered output) keeps this simple; **bold** markers essentially
// never open a paragraph in practice, so this doesn't need to handle that.
function DropCapParagraph({ text }: { text: string }) {
  const firstChar = text.slice(0, 1);
  const rest = text.slice(1);
  return (
    <p className="mb-5 text-[16.5px] leading-[1.85] text-[var(--ink)] last:mb-0">
      <span
        className="float-left mr-2.5 mt-1 text-[54px] font-semibold leading-[0.78]"
        style={{ fontFamily: "'Noto Serif KR', serif", color: "var(--plum)" }}
      >
        {firstChar}
      </span>
      {renderInlineMarkdown(rest)}
    </p>
  );
}

function ChapterBody({ text }: { text: string }) {
  const blocks = parseChapterBlocks(text);
  const firstParagraphIndex = blocks.findIndex((b) => b.type === "paragraph");

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
              className="relative my-2 mb-7 rounded-[12px] border border-[var(--hairline)] bg-[var(--paper-raised)] px-7 py-6"
            >
              <span className="block text-[10.5px] font-semibold italic tracking-[0.04em] text-[var(--ink-soft)]">
                Consultant&apos;s Note
              </span>
              <p
                className="mt-3 text-[17px] font-medium leading-[1.7] text-[var(--ink)]"
                style={{ fontFamily: "'Noto Serif KR', serif" }}
              >
                {renderInlineMarkdown(block.content)}
              </p>
            </blockquote>
          );
        }
        if (index === firstParagraphIndex) {
          return <DropCapParagraph key={index} text={block.content} />;
        }
        return (
          <p
            key={index}
            className="mb-5 text-[16.5px] leading-[1.85] text-[var(--ink)] last:mb-0"
          >
            {renderInlineMarkdown(block.content)}
          </p>
        );
      })}
    </div>
  );
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
    <Container maxWidth="max-w-4xl" className="reveal mt-20">
      <div className="flex items-baseline justify-between border-b-2 border-[var(--ink)] pb-4">
        <div>
          <span className="block text-[11px] font-semibold tracking-[0.2em] text-[var(--brass)]">
            CONTENTS
          </span>
          <h2
            className="mt-1.5 text-[30px] font-semibold leading-tight text-[var(--ink)]"
            style={{ fontFamily: "'Noto Serif KR', serif" }}
          >
            리포트 목차
          </h2>
        </div>
        <span className="hidden shrink-0 text-[12px] tracking-[0.1em] text-[var(--ink-soft)] sm:block">
          전체 {chapters.length}개 챕터
        </span>
      </div>
      <p className="mb-2 mt-3 text-[14px] leading-relaxed text-[var(--ink-soft)]">
        원하는 챕터를 눌러 바로 이동할 수 있어요.
      </p>
      <nav aria-label="리포트 챕터 목차">
        {chapters.map((chapter) => (
          <a
            key={chapter.key}
            href={`#${chapterAnchorId(chapter.key)}`}
            onClick={(event) => {
              event.preventDefault();
              scrollToChapter(chapter.key);
            }}
            className="group flex items-baseline gap-4 border-b border-[var(--hairline)] py-4 no-underline transition-colors hover:bg-[var(--plum-tint)]/40"
          >
            <span
              className="w-[40px] shrink-0 text-[22px] font-semibold leading-none text-[var(--plum)]"
              style={{ fontFamily: "'Noto Serif KR', serif" }}
            >
              {chapter.number}
            </span>
            <span className="flex-1 break-keep text-[15.5px] font-medium leading-snug text-[var(--ink)]">
              {chapter.title}
            </span>
            <span
              className="mx-1 hidden flex-1 border-b border-dotted border-[var(--hairline)] translate-y-[-4px] sm:block"
              aria-hidden="true"
            />
            <span className="hidden shrink-0 max-w-[220px] break-keep text-right text-[12px] text-[var(--ink-soft)] sm:block">
              {chapter.points.slice(0, 1).join("")}
            </span>
            <span
              className="shrink-0 text-[var(--brass)] opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            >
              →
            </span>
          </a>
        ))}
      </nav>
    </Container>
  );
}

// A "color story" swatch strip — large blocks of flat color in a row like
// a magazine's paint/palette feature, instead of small icon-sized circles.
function PaletteGrid({ palette }: { palette: PreviewResult["colorHint"]["palette"] }) {
  return (
    <div className="flex flex-col gap-px overflow-hidden rounded-[4px] border border-[var(--hairline)] sm:flex-row">
      {palette.map((chip) => (
        <div key={chip.name} className="flex flex-1 flex-col bg-[var(--paper-raised)]">
          <div
            className="h-16 w-full sm:h-24"
            style={{ backgroundColor: chip.hex }}
            aria-hidden="true"
          />
          <div className="p-3.5">
            <p className="text-[13.5px] font-semibold text-[var(--ink)]">
              {chip.name}
            </p>
            <p className="mt-0.5 text-[10px] tracking-[0.08em] text-[var(--ink-soft)]">
              {chip.hex.toUpperCase()}
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-[var(--ink-soft)]">
              {chip.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// English eyebrow + Korean subhead, consulting-book style — each section
// label gets a small uppercase English tag above the Korean text instead
// of just the Korean alone.
const SECTION_EYEBROWS: Record<string, string> = {
  "자세한 분석": "DETAILED ANALYSIS",
  "바로 적용 팁": "QUICK TIPS",
  체크리스트: "CHECKLIST",
};

function SectionLabel({ children }: { children: string }) {
  const eyebrow = SECTION_EYEBROWS[children];
  return (
    <div className="mb-4 flex items-center gap-3">
      <div>
        {eyebrow && (
          <span className="block text-[10.5px] font-semibold tracking-[0.2em] text-[var(--brass)]">
            {eyebrow}
          </span>
        )}
        <span className="mt-0.5 block text-[13.5px] font-semibold text-[var(--plum-deep)]">
          {children}
        </span>
      </div>
      <span className="h-px flex-1 bg-[var(--hairline)]" aria-hidden="true" />
    </div>
  );
}

function Divider() {
  return <div className="my-8 h-px bg-[var(--hairline)]" aria-hidden="true" />;
}

// The one-line "diagnosis" — rendered as an editorial pull-quote (oversized
// serif, giant ghost quotation mark) instead of a plum info box, so the
// verdict reads like a magazine callout rather than a UI alert.
function DiagnosisLine({ text }: { text: string }) {
  return (
    <div className="relative mt-7 border-l-2 border-[var(--plum)] py-1 pl-6">
      <span
        className="pointer-events-none absolute -left-2 -top-5 select-none text-[64px] leading-none text-[var(--plum)]/15"
        style={{ fontFamily: "'Noto Serif KR', serif" }}
        aria-hidden="true"
      >
        &ldquo;
      </span>
      <p
        className="relative text-[20px] font-medium leading-[1.5] text-[var(--ink)] break-keep sm:text-[22px]"
        style={{ fontFamily: "'Noto Serif KR', serif" }}
      >
        {renderInlineMarkdown(text)}
      </p>
    </div>
  );
}

function KeywordPills({ items }: { items: string[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="border border-[var(--plum)]/30 px-3 py-1.5 text-[12.5px] font-medium tracking-[0.02em] text-[var(--plum-deep)]"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

// The "3-line summary" card — a skimmable TL;DR before the reader dives
// into the full detailed-analysis section below it.
function SummaryCard({ lines }: { lines: string[] }) {
  return (
    <div className="mt-4 rounded-[12px] border border-[var(--hairline)] bg-[var(--paper-raised)] p-5">
      <ol className="flex flex-col gap-3">
        {lines.map((line, index) => (
          <li key={index} className="flex items-start gap-3.5">
            <span
              className="w-4 shrink-0 text-[15px] font-semibold leading-[1.6] text-[var(--brass)]"
              style={{ fontFamily: "'Noto Serif KR', serif" }}
            >
              {index + 1}
            </span>
            <p className="text-[14.5px] leading-[1.6] text-[var(--ink)] break-keep">
              {renderInlineMarkdown(line)}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function TipsList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2.5">
          <span
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--plum)] text-[10px] font-bold text-white"
            aria-hidden="true"
          >
            ✓
          </span>
          <p className="text-[14.5px] leading-[1.6] text-[var(--ink)] break-keep">
            {renderInlineMarkdown(item)}
          </p>
        </li>
      ))}
    </ul>
  );
}

function ChecklistBlock({ items }: { items: string[] }) {
  return (
    <div className="rounded-[12px] border border-dashed border-[var(--plum)] p-4">
      <ul className="flex flex-col gap-2.5">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2.5">
            <span
              className="h-4 w-4 shrink-0 rounded border-[1.5px] border-[var(--plum)]"
              aria-hidden="true"
            />
            <p className="text-[14px] leading-[1.5] text-[var(--ink)] break-keep">
              {renderInlineMarkdown(item)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChapterCard({
  chapter,
  content,
  images,
  colorHint,
  typeValue,
  styleTypeValue,
  heroPickIndex,
  isReversed,
}: {
  chapter: (typeof REPORT_CHAPTERS)[number];
  content: ReportChapterContent;
  images: PreviewResult["images"] | undefined;
  colorHint: PreviewResult["colorHint"] | undefined;
  typeValue?: string | null;
  styleTypeValue?: HairStyleCandidate | MaleHairStyleCandidate | MakeupStyleCandidate | null;
  heroPickIndex: number;
  // Alternates which side the photo sits on for photo-led spreads, purely
  // for visual rhythm — flips every time a photo chapter comes up (see the
  // photoSpreadCounter in the parent map), not tied to chapter.number.
  isReversed: boolean;
}) {
  const visual = CHAPTER_VISUALS[chapter.key];
  // Several chapters share the "hero" visual — cycle through every "st"
  // photo prepared for this mood instead of repeating the same one, so
  // the report doesn't look like it recycled a single stock shot.
  const heroGallery = images?.heroGallery;
  const heroImage =
    heroGallery && heroGallery.length > 0
      ? heroGallery[heroPickIndex % heroGallery.length]
      : images?.hero;
  // Hair/makeup photos are picked to match what the chapter's body text
  // actually recommends (via the AI-chosen styleTypeValue) rather than a
  // mood-indexed photo unrelated to that chapter's content. Falls back to
  // the old mood-indexed image for reports generated before this existed.
  const imageSrc =
    visual === "hero"
      ? heroImage
      : visual === "hair"
        ? (styleTypeValue &&
            (HAIR_STYLE_IMAGES[styleTypeValue as HairStyleCandidate] ||
              MALE_HAIR_STYLE_IMAGES[styleTypeValue as MaleHairStyleCandidate])) ||
          images?.hair
        : visual === "makeup"
          ? (styleTypeValue &&
              MAKEUP_STYLE_IMAGES[styleTypeValue as MakeupStyleCandidate]) ||
            images?.makeup
          : null;
  // 얼굴형/동물상 챕터는 별도 배너 이미지 대신 "사진상 분석 결과" 배지
  // 안에 작은 원형 이미지로 넣어서, 카드 상단에 따로 떠 있지 않고
  // 텍스트와 한 덩어리로 보이게 한다.
  const typeImageSrc =
    visual === "typeBadge" && typeValue
      ? chapter.key === "faceShapeAnalysis"
        ? FACE_SHAPE_IMAGES[typeValue as keyof typeof FACE_SHAPE_IMAGES]
        : ANIMAL_TYPE_IMAGES[typeValue as keyof typeof ANIMAL_TYPE_IMAGES]
      : null;
  const isFinal = chapter.key === "finalChecklist";
  // A big side-by-side photo spread only for the chapters that actually
  // have a meaningful hero/hair/makeup photo — everything else (roughly
  // 12 of 17 chapters) reads as a text-forward editorial page instead, so
  // the report doesn't overpromise photography it doesn't have.
  const hasBigPhoto = Boolean(imageSrc) && (visual === "hero" || visual === "hair" || visual === "makeup");

  const textBlocks = (
    <>
      {content.diagnosis && <DiagnosisLine text={content.diagnosis} />}
      {content.keywords && content.keywords.length > 0 && (
        <KeywordPills items={content.keywords} />
      )}
      {content.summary && content.summary.length > 0 && (
        <SummaryCard lines={content.summary} />
      )}
    </>
  );

  return (
    <Container
      id={chapterAnchorId(chapter.key)}
      maxWidth="max-w-4xl"
      className="reveal mt-20 scroll-mt-6"
    >
      <div
        className={`relative border-t-2 pt-7 ${isFinal ? "border-[var(--plum)]" : "border-[var(--ink)]"}`}
      >
        {/* Oversized ghost numeral — the report's recurring signature
            device, doing the job photography can't on the ~12 chapters
            that don't have a dedicated image. */}
        <span
          className="pointer-events-none absolute -top-2 right-0 select-none text-[92px] font-semibold leading-none text-[var(--plum)] opacity-[0.07] sm:-top-4 sm:text-[136px]"
          style={{ fontFamily: "'Noto Serif KR', serif" }}
          aria-hidden="true"
        >
          {chapter.number}
        </span>

        <div className="relative">
          <span className="block text-[11px] font-semibold tracking-[0.2em] text-[var(--brass)]">
            CHAPTER {chapter.number}
          </span>
          <h2
            className="mt-2.5 max-w-2xl text-[30px] font-semibold leading-[1.28] tracking-[-0.005em] text-[var(--ink)] break-keep sm:text-[38px]"
            style={{ fontFamily: "'Noto Serif KR', serif" }}
          >
            {chapter.title}
          </h2>
        </div>

        {hasBigPhoto ? (
          <div
            className={`relative mt-8 flex flex-col gap-8 md:flex-row md:items-start ${
              isReversed ? "md:flex-row-reverse" : ""
            }`}
          >
            <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden md:w-[42%]">
              <Image
                src={imageSrc!}
                alt={chapter.title}
                fill
                sizes="(min-width: 768px) 42vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">{textBlocks}</div>
          </div>
        ) : (
          <div className="relative mt-7 max-w-2xl">
            {visual === "palette" && colorHint?.palette && (
              <div className="mb-6">
                <PaletteGrid palette={colorHint.palette} />
              </div>
            )}

            {visual === "typeBadge" && typeValue && (
              <div className="mb-6 flex items-center gap-4 border border-[var(--hairline)] bg-[var(--paper-raised)] p-5">
                {typeImageSrc && (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={typeImageSrc}
                      alt={typeValue}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--brass)]">
                    사진상 분석 결과
                  </p>
                  <p
                    className="mt-1 text-[26px] font-bold leading-tight text-[var(--plum-deep)]"
                    style={{ fontFamily: "'Noto Serif KR', serif" }}
                  >
                    {typeValue}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
                    에 가까운 인상으로 보여요
                  </p>
                </div>
              </div>
            )}

            {textBlocks}
          </div>
        )}

        <div className="relative mt-2 max-w-2xl">
          <Divider />
          <div>
            <SectionLabel>자세한 분석</SectionLabel>
            <ChapterBody text={content.body} />
          </div>

          {content.tips && content.tips.length > 0 && (
            <>
              <Divider />
              <div>
                <SectionLabel>바로 적용 팁</SectionLabel>
                <TipsList items={content.tips} />
              </div>
            </>
          )}

          {content.checklist && content.checklist.length > 0 && (
            <>
              <Divider />
              <div>
                <SectionLabel>체크리스트</SectionLabel>
                <ChecklistBlock items={content.checklist} />
              </div>
            </>
          )}
        </div>
      </div>
    </Container>
  );
}

async function requestFullReport(
  answers: Record<string, unknown>,
  imageDataUrl: string | null,
  previewResult: PreviewResult | null,
  tier: ReportTierName,
): Promise<FullReport> {
  const response = await fetch("/api/generate-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers, imageDataUrl, previewResult, tier }),
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
      const storedTier = localStorage.getItem(REPORT_TIER_KEY);
      const tier: ReportTierName =
        storedTier === "basic" ? "basic" : storedTier === "male" ? "male" : "premium";

      try {
        const report = await requestFullReport(
          JSON.parse(answersRaw) as Record<string, unknown>,
          imageDataUrl,
          previewRaw ? (JSON.parse(previewRaw) as PreviewResult) : null,
          tier,
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
        data.tier === "basic" ? "basic" : data.tier === "male" ? "male" : "premium",
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

  // Fades + slides each chapter into view the first time it scrolls into
  // the viewport (see .reveal / .reveal-visible in globals.css) — same
  // one-time-entrance pattern as /detail. Re-queries whenever `report`
  // changes since the TOC/chapter cards only exist in the DOM once the
  // report has actually loaded.
  useEffect(() => {
    if (!report) return;
    const elements = Array.from(document.querySelectorAll(".reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [report]);

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

  // Male reports were generated from MALE_REPORT_CHAPTERS (no makeupGuide,
  // renumbered 01-16) — use that list for the TOC/numbering instead of the
  // female REPORT_CHAPTERS, or the male report would render with a gap
  // where 06 used to be. faceShapeAnalysis/animalTypeAnalysis are skipped
  // entirely when no photo was uploaded, and older cached reports may
  // predate a given chapter — filter once and reuse for both the TOC and
  // the chapter list.
  const chapterList =
    report.tier === "male"
      ? MALE_REPORT_CHAPTERS
      : report.tier === "hair"
        ? HAIR_REPORT_CHAPTERS
        : report.tier === "makeup"
          ? MAKEUP_REPORT_CHAPTERS
          : report.tier === "color"
            ? COLOR_REPORT_CHAPTERS
            : REPORT_CHAPTERS;
  const visibleChapters = chapterList.filter((c) => Boolean(report[c.key]));

  return (
    <main
      className="min-h-screen pb-16 pt-8"
      style={
        {
          "--ink": "#1A1613",
          "--ink-soft": "#726B62",
          "--paper": "#FAF6EF",
          "--paper-raised": "#FFFFFF",
          "--hairline": "#E4DACB",
          "--plum": "#4E2A82",
          "--plum-deep": "#3A1F63",
          "--plum-tint": "#F2ECFA",
          "--brass": "#A9803D",
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

      {/* Cover — a magazine issue front page instead of a plain centered
          title block: masthead strip, then the mood's own hero photo with
          the report title set as a cover line over it. */}
      <Container maxWidth="max-w-4xl">
        <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-3">
          <span className="text-[12px] font-bold tracking-[0.22em] text-[var(--ink)]">
            FACEMOOD
          </span>
          <span className="text-[11px] font-semibold tracking-[0.16em] text-[var(--brass)]">
            STYLE REPORT
          </span>
        </div>

        <div className="relative mt-6 aspect-[4/5] w-full overflow-hidden sm:aspect-[16/9]">
          {report.images?.hero && (
            <>
              <Image
                src={report.images.hero}
                alt=""
                fill
                priority
                sizes="(min-width: 896px) 896px, 100vw"
                className="object-cover object-top"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"
                aria-hidden="true"
              />
            </>
          )}
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <span className="block text-[11px] font-semibold tracking-[0.2em] text-white/75">
              PERSONAL STYLE ISSUE
            </span>
            <h1
              className="mt-2 max-w-lg text-[36px] font-bold leading-[1.15] text-white break-keep sm:text-[54px]"
              style={{ fontFamily: "'Noto Serif KR', serif" }}
            >
              상세 스타일 리포트
            </h1>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-lg text-center text-[14.5px] leading-relaxed text-[var(--ink-soft)]">
          이미지 컨설팅 관점에서 정리한 스타일 분석 흐름이에요.
          <br />
          사진과 답변을 바탕으로 한 참고용 리포트입니다.
        </p>
      </Container>

      <TableOfContents chapters={visibleChapters} />

      {(() => {
        // Assigns each "hero"-visual chapter its own position in the mood's
        // photo gallery (0, 1, 2, ...) so ChapterCard can cycle through
        // them instead of every one of these chapters showing photo #1.
        let heroCounter = 0;
        // Separately counts every chapter that gets a big side-by-side
        // photo spread (hero/hair/makeup) so ChapterCard can alternate
        // which side the photo sits on for visual rhythm.
        let photoSpreadCounter = 0;
        return visibleChapters.map((chapter) => {
          const chapterData = report[chapter.key]!;

          const typeValue =
            chapter.key === "faceShapeAnalysis"
              ? report.faceShapeType
              : chapter.key === "animalTypeAnalysis"
                ? report.animalType
                : undefined;

          const styleTypeValue =
            chapter.key === "hairGuide"
              ? report.hairStyleType
              : chapter.key === "makeupGuide"
                ? report.makeupStyleType
                : undefined;

          const visual = CHAPTER_VISUALS[chapter.key];
          const heroPickIndex = visual === "hero" ? heroCounter++ : 0;
          const isReversed =
            (visual === "hero" || visual === "hair" || visual === "makeup") &&
            photoSpreadCounter++ % 2 === 1;

          return (
            <ChapterCard
              key={chapter.key}
              chapter={chapter}
              content={chapterData}
              images={report.images}
              colorHint={report.colorHint}
              typeValue={typeValue}
              styleTypeValue={styleTypeValue}
              heroPickIndex={heroPickIndex}
              isReversed={isReversed}
            />
          );
        });
      })()}

      <Container className="mt-12">
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
