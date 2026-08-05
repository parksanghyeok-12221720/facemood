"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Container from "@/app/components/Container";
import MatchReportBody from "@/app/match/MatchReportBody";
import type { MatchFullReport } from "@/types/matchReport";

const ANSWERS_KEY = "facemood_match_answers";
const MY_PHOTO_KEY = "facemood_match_my_photo";
const PARTNER_PHOTO_KEY = "facemood_match_partner_photo";
const REPORT_ID_KEY = "facemood_match_report_id";
const FULL_REPORT_KEY = "facemood_match_full_report";
const BUNDLE_CREDIT_KEY = "facemood_match_bundle_id";

type MatchAnswers = { myName?: string; partnerName?: string };

function getIdParam(): string | null {
  return new URLSearchParams(window.location.search).get("id");
}

type FetchState =
  | { status: "loading" }
  | { status: "locked"; error?: string }
  | { status: "verifying" }
  | { status: "generating" }
  | { status: "error"; message: string }
  | {
      status: "done";
      report: MatchFullReport;
      myName: string;
      partnerName: string;
      myPhoto: string | null;
      partnerPhoto: string | null;
      bundle: boolean;
      bundleRedeemedReportId: string | null;
      reportId: string | null;
    };

const GENERATING_STAGES = [
  "두 분의 사진 속 분위기를 분석하고 있어요",
  "얼굴 무드와 첫인상 케미를 정리하고 있어요",
  "스타일·컬러·헤어 궁합을 정리하고 있어요",
  "데이트 장소와 사진 컨셉을 고르고 있어요",
  "리포트를 최종 정리하고 있어요",
];

function GeneratingState() {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(4);

  useEffect(() => {
    const stageTimer = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, GENERATING_STAGES.length - 1));
    }, 8000);
    const progressTimer = setInterval(() => {
      setProgress((p) => (p < 92 ? p + 1 : p));
    }, 900);
    return () => {
      clearInterval(stageTimer);
      clearInterval(progressTimer);
    };
  }, []);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#F7F3EC", color: "#2B2620" }}
    >
      <Container maxWidth="max-w-sm" className="flex flex-col items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#E4D2C3] border-t-[#1E2A3A]" />
        <div className="mt-6 w-full">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#E4D2C3]">
            <div
              className="h-full rounded-full bg-[#1E2A3A] transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold text-[#6F2A3A]">{progress}%</p>
        </div>
        <p className="mt-5 text-sm font-semibold">{GENERATING_STAGES[stageIndex]}</p>
        <p className="mt-1 text-xs text-[#8A8580]">보통 1분 정도 걸려요.</p>
        <div className="mt-5 w-full rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-xs font-bold text-red-500">⚠️ 화면을 나가지 마세요</p>
          <p className="mt-1 text-[11px] leading-relaxed text-red-400">
            지금 창을 닫으면 생성이 중단돼요. 완성될 때까지 이 화면을 유지해주세요.
          </p>
        </div>
      </Container>
    </main>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
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
      <Link href="/match/upload" className="mt-4 text-xs text-gray-400 underline">
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
      <Link href="/match/upload" className="mt-4 text-xs text-gray-400 underline">
        처음부터 다시 진행하기
      </Link>
    </main>
  );
}

async function requestFullReport(
  answers: Record<string, unknown>,
  myPhoto: string | null,
  partnerPhoto: string | null,
): Promise<MatchFullReport> {
  const response = await fetch("/api/generate-match-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers, myPhoto, partnerPhoto }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "리포트 생성에 실패했습니다.");
  }
  return data.report as MatchFullReport;
}

function persistFullReportToServer(reportId: string | null, fullReport: MatchFullReport) {
  if (!reportId) return;
  fetch(`/api/match/reports/${reportId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullReport }),
  }).catch(() => {
    console.warn("리포트 저장에 실패했습니다 (서버 연결 문제로 추정).");
  });
}

export default function MatchReportPage() {
  const [fetchState, setFetchState] = useState<FetchState>({ status: "loading" });
  const [retryTrigger, setRetryTrigger] = useState(0);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    let cancelled = false;

    async function run() {
      await Promise.resolve();

      const answersRaw = localStorage.getItem(ANSWERS_KEY);
      const idParam = getIdParam();
      const cachedReportRaw = localStorage.getItem(FULL_REPORT_KEY);

      if (cachedReportRaw && answersRaw) {
        const answers = JSON.parse(answersRaw) as MatchAnswers;
        if (!cancelled) {
          setFetchState({
            status: "done",
            report: JSON.parse(cachedReportRaw) as MatchFullReport,
            myName: answers.myName || "나",
            partnerName: answers.partnerName || "그 사람",
            myPhoto: localStorage.getItem(MY_PHOTO_KEY),
            partnerPhoto: localStorage.getItem(PARTNER_PHOTO_KEY),
            bundle: false,
            bundleRedeemedReportId: null,
            reportId: localStorage.getItem(REPORT_ID_KEY) ?? idParam,
          });
        }
        return;
      }

      if (!answersRaw) {
        if (cancelled) return;
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

      const answers = JSON.parse(answersRaw) as MatchAnswers;
      const myPhoto = localStorage.getItem(MY_PHOTO_KEY);
      const partnerPhoto = localStorage.getItem(PARTNER_PHOTO_KEY);
      const reportId = localStorage.getItem(REPORT_ID_KEY) ?? idParam;

      if (!cancelled) setFetchState({ status: "generating" });

      try {
        const report = await requestFullReport(answers, myPhoto, partnerPhoto);
        localStorage.setItem(FULL_REPORT_KEY, JSON.stringify(report));
        persistFullReportToServer(reportId, report);
        if (!cancelled) {
          setFetchState({
            status: "done",
            report,
            myName: answers.myName || "나",
            partnerName: answers.partnerName || "그 사람",
            myPhoto,
            partnerPhoto,
            bundle: false,
            bundleRedeemedReportId: null,
            reportId,
          });
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
  }, [retryTrigger]);

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
      const response = await fetch(`/api/match/reports/${idParam}/verify`, {
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

      const answers = (data.answers ?? {}) as MatchAnswers;
      localStorage.setItem(REPORT_ID_KEY, idParam);
      localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
      if (data.myPhoto) localStorage.setItem(MY_PHOTO_KEY, data.myPhoto);
      if (data.partnerPhoto) localStorage.setItem(PARTNER_PHOTO_KEY, data.partnerPhoto);
      if (data.bundle) localStorage.setItem(BUNDLE_CREDIT_KEY, idParam);

      if (data.fullReport) {
        localStorage.setItem(FULL_REPORT_KEY, JSON.stringify(data.fullReport));
        setFetchState({
          status: "done",
          report: data.fullReport,
          myName: answers.myName || "나",
          partnerName: answers.partnerName || "그 사람",
          myPhoto: data.myPhoto ?? null,
          partnerPhoto: data.partnerPhoto ?? null,
          bundle: !!data.bundle,
          bundleRedeemedReportId: data.bundleRedeemedReportId ?? null,
          reportId: idParam,
        });
        return;
      }

      setFetchState({ status: "generating" });
      try {
        const report = await requestFullReport(answers, data.myPhoto ?? null, data.partnerPhoto ?? null);
        localStorage.setItem(FULL_REPORT_KEY, JSON.stringify(report));
        persistFullReportToServer(idParam, report);
        setFetchState({
          status: "done",
          report,
          myName: answers.myName || "나",
          partnerName: answers.partnerName || "그 사람",
          myPhoto: data.myPhoto ?? null,
          partnerPhoto: data.partnerPhoto ?? null,
          bundle: !!data.bundle,
          bundleRedeemedReportId: data.bundleRedeemedReportId ?? null,
          reportId: idParam,
        });
      } catch (error) {
        setFetchState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "리포트 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        });
      }
    } catch {
      setFetchState({
        status: "locked",
        error: "비밀번호 확인 중 오류가 발생했습니다.",
      });
    }
  }

  if (fetchState.status === "loading" || fetchState.status === "generating") {
    return <GeneratingState />;
  }
  if (fetchState.status === "locked") {
    return (
      <PasswordGate
        error={fetchState.error}
        isVerifying={false}
        onSubmit={handleVerifyPassword}
      />
    );
  }
  if (fetchState.status === "verifying") {
    return <PasswordGate isVerifying onSubmit={() => {}} />;
  }
  if (fetchState.status === "error") {
    return <ErrorState message={fetchState.message} onRetry={handleRetry} />;
  }

  const { report, myName, partnerName, myPhoto, partnerPhoto, bundle, bundleRedeemedReportId } =
    fetchState;
  const headline = `${myName}님과 ${partnerName}님의 무드 궁합`;

  return (
    <main
      className="min-h-screen pb-24"
      style={
        {
          // Kept in sync with /match/result's palette (see comment there) —
          // both pages render the same MatchReportBody, so their CSS vars
          // must match or the paid page would look inconsistent.
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

      <div className="pb-10 pt-14 text-center">
        <Container maxWidth="max-w-3xl">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.2em]"
            style={{ backgroundColor: "var(--match-navy)", color: "var(--match-ivory)" }}
          >
            FACEMOOD MATCH
          </span>

          <div className="mt-6 flex items-center justify-center gap-3">
            <div
              className="relative h-16 w-16 overflow-hidden rounded-full"
              style={{ border: "2px solid var(--match-navy)" }}
            >
              {myPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={myPhoto} alt={myName} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <span className="text-xl" style={{ color: "var(--match-rose)" }}>
              ×
            </span>
            <div
              className="relative h-16 w-16 overflow-hidden rounded-full"
              style={{ border: "2px solid var(--match-navy)" }}
            >
              {partnerPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={partnerPhoto} alt={partnerName} className="h-full w-full object-cover" />
              ) : null}
            </div>
          </div>

          <h1 className="mt-5 text-xl font-bold leading-snug" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            {headline}
          </h1>
        </Container>
      </div>

      {bundle && !bundleRedeemedReportId && (
        <Container maxWidth="max-w-3xl" className="mb-8">
          <div
            className="rounded-[24px] p-6 text-center"
            style={{ backgroundColor: "white", border: "1px solid var(--match-beige)" }}
          >
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
              style={{ backgroundColor: "var(--match-burgundy)" }}
            >
              번들 혜택
            </span>
            <p className="mt-3 text-sm font-bold">FACEMOOD Premium 리포트 무료 이용권</p>
            <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
              간단한 설문과 본인 사진으로 나만의 FACEMOOD Premium 리포트도
              무료로 받아보실 수 있어요.
            </p>
            <Link
              href="/test"
              className="mt-4 inline-flex items-center justify-center rounded-full px-6 py-3 text-xs font-semibold text-white"
              style={{ backgroundColor: "var(--match-navy)" }}
            >
              지금 사용하기
            </Link>
          </div>
        </Container>
      )}

      <Container maxWidth="max-w-3xl">
        <MatchReportBody report={report} myName={myName} partnerName={partnerName} />
      </Container>

      <Container maxWidth="max-w-3xl" className="mt-12">
        <div className="rounded-[28px] p-7 text-center text-white" style={{ backgroundColor: "var(--match-navy)" }}>
          <p className="text-base font-bold leading-relaxed" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            우리만의 커플 무드,
            <br />
            잘 확인하셨나요?
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-semibold"
            style={{ backgroundColor: "var(--match-ivory)", color: "var(--match-navy)" }}
          >
            홈으로 돌아가기
          </Link>
        </div>
      </Container>
    </main>
  );
}
