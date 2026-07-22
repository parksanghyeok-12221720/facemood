"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Button from "@/app/components/Button";
import Container from "@/app/components/Container";

const MAX_PHOTOS = 3;

function PhotoPolicyModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-t-3xl bg-neutral-900 sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-sm font-bold text-white">사진 처리방침</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-lg leading-none text-gray-400"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 text-xs leading-relaxed text-gray-300">
          <p>
            업로드한 사진은 FACEMOOD 이미지 무드 분석 리포트 생성을 위해서만
            사용됩니다.
          </p>
          <p className="mt-3">
            사진은 얼굴 분위기, 헤어, 메이크업, 컬러 방향을 분석하기 위한
            참고 자료로 활용되며, 외모 점수, 외모 등급, 신원 확인,
            생체인증, 마케팅 목적으로 사용되지 않습니다.
          </p>
          <p className="mt-3">
            사진은 리포트 생성 과정에서 AI 분석 시스템을 통해 처리될 수
            있습니다.
          </p>
          <p className="mt-3">
            업로드한 사진은 리포트 생성 후 자동 삭제되며, 서비스 오류 대응이
            필요한 경우에 한해 최대 7일간 보관 후 삭제될 수 있습니다.
          </p>
          <p className="mt-3">
            사진을 업로드하지 않아도 설문 답변을 기반으로 분석을 진행할 수
            있으며, 사진을 업로드하면 더 자세한 이미지 무드 분석이
            가능합니다.
          </p>
        </div>

        <div className="border-t border-white/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UploadPage() {
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [photoConsent, setPhotoConsent] = useState(false);
  const [showPhotoPolicy, setShowPhotoPolicy] = useState(false);
  const [consentError, setConsentError] = useState("");

  useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.url));
    };
  }, [photos]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setPhotos((prev) => {
      const available = MAX_PHOTOS - prev.length;
      const nextFiles = files.slice(0, available);
      const nextPhotos = nextFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
      return [...prev, ...nextPhotos];
    });

    event.target.value = "";
  }

  function handleRemove(index: number) {
    setPhotos((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((_, i) => i !== index);
    });
  }

  // Resizes to a max 1280px edge and re-encodes as JPEG before the photo
  // ever touches localStorage or the OpenAI vision call. Raw phone photos
  // (often 5-12MB) silently blew past localStorage's ~5-10MB quota — the
  // save was wrapped in a try/catch so it failed quietly, meaning the photo
  // never made it into the report generation call at all. A resized JPEG
  // is a few hundred KB, comfortably fits, and costs less in vision tokens
  // too since GPT-4o bills by image tile count.
  function resizeImageToDataUrl(
    file: File,
    maxDimension = 1280,
    quality = 0.85,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("이미지를 처리할 수 없습니다."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("이미지를 불러올 수 없습니다."));
      };
      img.src = objectUrl;
    });
  }

  function parseAnswers(raw: string | null): Record<string, unknown> {
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  // Persists the answers server-side so the report survives a cleared
  // localStorage. Best-effort: the free preview still works from
  // localStorage alone if this fails, so failures here are non-fatal.
  async function createReportRecord(answers: Record<string, unknown>) {
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!response.ok) return;
      const data = await response.json();
      if (data.id) localStorage.setItem("facemood_report_id", data.id);
    } catch {
      console.warn("리포트 저장에 실패했습니다 (서버 연결 문제로 추정).");
    }
  }

  async function handleSubmit() {
    // No OpenAI API call here — /upload only saves the answers and the
    // primary photo locally. AI analysis happens later, only in /report
    // after checkout, so browsing the free preview never costs API usage.
    if (isAnalyzing || photos.length === 0) return;

    if (!photoConsent) {
      setConsentError("사진 처리방침에 동의해주세요.");
      return;
    }
    setConsentError("");
    setIsAnalyzing(true);

    try {
      const savedAnswers = localStorage.getItem("facemood_test_answers");
      const imageDataUrl = await resizeImageToDataUrl(photos[0].file);

      localStorage.setItem("facemood_answers", savedAnswers ?? "{}");
      // Starting a fresh run — clear any report generated for a previous
      // set of answers so /result and /report always regenerate from what
      // was just submitted instead of silently reusing stale content.
      localStorage.removeItem("facemood_preview_result");
      localStorage.removeItem("facemood_full_report");

      try {
        localStorage.setItem("facemood_uploaded_image", imageDataUrl);
      } catch {
        // Photo may be too large for localStorage on some browsers.
        // Non-fatal: the rest of the flow still works without it.
        console.warn("사진을 로컬에 저장하지 못했습니다 (용량 제한).");
      }

      await createReportRecord(parseAnswers(savedAnswers));

      window.location.href = "/loading";
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "사진을 처리하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      alert(message);
      setIsAnalyzing(false);
    }
  }

  async function handleSkipPhoto() {
    if (isAnalyzing) return;
    setIsAnalyzing(true);

    try {
      const savedAnswers = localStorage.getItem("facemood_test_answers");
      localStorage.setItem("facemood_answers", savedAnswers ?? "{}");
      localStorage.removeItem("facemood_uploaded_image");
      // Starting a fresh run — clear any report generated for a previous
      // set of answers so /result and /report always regenerate from what
      // was just submitted instead of silently reusing stale content.
      localStorage.removeItem("facemood_preview_result");
      localStorage.removeItem("facemood_full_report");
      await createReportRecord(parseAnswers(savedAnswers));
      window.location.href = "/loading";
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "결과를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      alert(message);
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col justify-center py-16">
      <Container>
        <h1 className="text-xl font-semibold text-white">
          사진을 업로드해주세요
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-gray-400">
          정확한 평가가 아니라, 현재 이미지 분위기를 참고하기 위한 사진입니다.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          정면 셀카, 자연광 사진, 평소 스타일 사진을 추천해요.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {photos.map((photo, index) => (
            <div
              key={photo.url}
              className="relative aspect-square overflow-hidden rounded-xl border border-white/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={`업로드한 사진 ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => handleRemove(index)}
                disabled={isAnalyzing}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white disabled:opacity-50"
                aria-label="사진 삭제"
              >
                ✕
              </button>
            </div>
          ))}

          {photos.length < MAX_PHOTOS && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 text-xs text-gray-500 transition-colors hover:border-white/40">
              <span className="text-2xl">+</span>
              <span className="mt-1">
                {photos.length}/{MAX_PHOTOS}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={isAnalyzing}
              />
            </label>
          )}
        </div>

        <p className="mt-6 text-xs text-gray-600">
          사진은 외모 점수화에 사용되지 않습니다.
        </p>

        <div className="mt-6 flex items-start gap-2.5 text-xs leading-relaxed text-gray-400">
          <input
            id="photo-consent"
            type="checkbox"
            checked={photoConsent}
            onChange={(event) => {
              setPhotoConsent(event.target.checked);
              if (event.target.checked) setConsentError("");
            }}
            disabled={isAnalyzing}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-transparent accent-violet-400"
          />
          <label htmlFor="photo-consent" className="flex-1">
            (필수) 사진 처리방침에 동의합니다. 업로드한 사진은 이미지 분석
            목적으로만 사용되고 있습니다.{" "}
            <button
              type="button"
              onClick={() => setShowPhotoPolicy(true)}
              className="font-semibold text-violet-300 underline underline-offset-2"
            >
              자세히 보기
            </button>
          </label>
        </div>
        {consentError && (
          <p className="mt-2 text-xs text-red-400">{consentError}</p>
        )}

        <div className="mt-8">
          <Button
            onClick={handleSubmit}
            disabled={photos.length === 0 || isAnalyzing || !photoConsent}
          >
            {isAnalyzing ? "처리 중..." : "지금 바로 리포트 확인하기"}
          </Button>

          <div className="mt-3">
            <Button
              variant="dark"
              onClick={handleSkipPhoto}
              disabled={isAnalyzing}
            >
              사진 없이 결과 보기
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-gray-600">
            사진 없이 진행 시, 답변 기반으로만 분석되어 정확도가 낮아질 수 있어요.
          </p>
        </div>
      </Container>

      {showPhotoPolicy && (
        <PhotoPolicyModal onClose={() => setShowPhotoPolicy(false)} />
      )}
    </main>
  );
}
