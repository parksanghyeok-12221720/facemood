"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Container from "@/app/components/Container";

const TOTAL_STEPS = 7;

const RELATIONSHIP_OPTIONS = [
  "짝사랑 상대",
  "썸 타는 상대",
  "연인",
  "소개팅 상대",
  "친구",
  "기타 관계",
];

const UPLOAD_GUIDELINES = [
  "얼굴이 한 명만 나온 사진",
  "정면 또는 정면에 가까운 사진",
  "필터와 과도한 보정이 적은 사진",
  "모자·마스크·선글라스가 없는 사진",
  "밝은 곳에서 촬영한 사진",
];

const DESIRED_IMAGE_OPTIONS = [
  "편안하고 친근한",
  "설레고 매력적인",
  "귀엽고 사랑스러운",
  "세련되고 성숙한",
  "차분하고 신뢰감 있는",
  "신비롭고 궁금한",
  "자연스럽고 꾸밈없는",
];

const CURIOSITY_OPTIONS = [
  "처음 봤을 때 잘 어울려 보이는지",
  "서로 어떤 분위기를 더해주는지",
  "주변 사람에게 어떤 사이로 보이는지",
  "함께 사진을 찍으면 어떤 무드인지",
  "데이트할 때 어울리는 스타일",
  "상대에게 더 매력적으로 보이는 방법",
];

// Used only to adjust report tone/wording (e.g. how forward the copy reads) —
// never fed into any personality or emotional inference.
const RELATIONSHIP_STATUS_OPTIONS = [
  "아직 대화를 많이 하지 않았어요",
  "서로 조금씩 알아가는 중이에요",
  "자주 연락하고 만나는 사이예요",
  "이미 연애하고 있어요",
  "관계를 정의하기 어려워요",
  "답변하지 않을게요",
];

const SITUATION_OPTIONS = [
  "첫 만남",
  "소개팅",
  "데이트",
  "일상",
  "여행",
  "커플 사진",
  "특별한 기념일",
];

const STEP_COPY: { title: string; subtitle: string }[] = [
  { title: "분석할 두 사람 선택", subtitle: "누구와의 케미가 궁금한가요?" },
  { title: "사진 업로드", subtitle: "얼굴이 잘 보이는 사진 두 장을 준비해주세요." },
  { title: "표시 이름", subtitle: "리포트에서 어떻게 표시할까요?" },
  {
    title: "상대에게 보이고 싶은 이미지",
    subtitle: "그 사람에게 어떤 분위기로 보이고 싶나요? (최대 2개)",
  },
  {
    title: "두 사람의 분위기에서 궁금한 것",
    subtitle: "가장 궁금한 내용을 선택해주세요. (선택, 최대 2개)",
  },
  { title: "현재 관계의 분위기", subtitle: "현재 두 사람은 어떤 상태에 가까운가요?" },
  {
    title: "원하는 스타일 상황",
    subtitle: "어떤 상황에서의 케미가 궁금한가요? (복수 선택 가능)",
  },
];

type PhotoState = { file: File; url: string } | null;

function toggleInList(list: string[], value: string, max: number) {
  if (list.includes(value)) return list.filter((item) => item !== value);
  if (list.length >= max) return list;
  return [...list, value];
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div>
      <p
        className="text-[11px] font-semibold tracking-[0.15em]"
        style={{ color: "var(--match-burgundy)" }}
      >
        STEP {step} / {TOTAL_STEPS}
      </p>
      <div
        className="mt-2 h-1 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: "var(--match-beige)" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${(step / TOTAL_STEPS) * 100}%`,
            backgroundColor: "var(--match-navy)",
          }}
        />
      </div>
    </div>
  );
}

function OptionButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-2xl border px-4 py-3.5 text-left text-sm font-semibold transition-colors disabled:opacity-40"
      style={{
        backgroundColor: active ? "var(--match-navy)" : "white",
        borderColor: active ? "var(--match-navy)" : "var(--match-beige)",
        color: active ? "white" : "var(--match-ink)",
      }}
    >
      {label}
    </button>
  );
}

function PhotoSlot({
  label,
  hint,
  photo,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  photo: PhotoState;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <p className="text-xs font-semibold" style={{ color: "var(--match-ink)" }}>
        {label}
      </p>
      <label
        className="relative flex aspect-[3/4] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed text-center"
        style={{
          borderColor: "var(--match-beige)",
          backgroundColor: photo ? "transparent" : "#FBF8F3",
        }}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.url} alt={label} className="h-full w-full object-cover" />
        ) : (
          <>
            <span className="text-2xl" style={{ color: "var(--match-rose)" }}>
              +
            </span>
            <span
              className="mt-1 px-3 text-[10.5px] leading-relaxed"
              style={{ color: "var(--match-ink-soft)" }}
            >
              {hint}
            </span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onChange}
          disabled={disabled}
        />
      </label>
    </div>
  );
}

// Resizes to a max 1280px edge and re-encodes as JPEG before it touches
// localStorage — mirrors app/upload/page.tsx's resize step so two full-size
// phone photos don't blow past the localStorage quota.
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

export default function MatchUploadPage() {
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [relationship, setRelationship] = useState<string | null>(null);

  const [myPhoto, setMyPhoto] = useState<PhotoState>(null);
  const [partnerPhoto, setPartnerPhoto] = useState<PhotoState>(null);
  const [consent, setConsent] = useState(false);

  const [myName, setMyName] = useState("");
  const [partnerName, setPartnerName] = useState("");

  const [desiredImages, setDesiredImages] = useState<string[]>([]);
  const [curiosities, setCuriosities] = useState<string[]>([]);
  const [relationshipStatus, setRelationshipStatus] = useState<string | null>(null);
  const [situations, setSituations] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      if (myPhoto) URL.revokeObjectURL(myPhoto.url);
      if (partnerPhoto) URL.revokeObjectURL(partnerPhoto.url);
    };
  }, [myPhoto, partnerPhoto]);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>, who: "me" | "partner") {
    const file = event.target.files?.[0];
    if (!file) return;
    const next = { file, url: URL.createObjectURL(file) };
    if (who === "me") {
      if (myPhoto) URL.revokeObjectURL(myPhoto.url);
      setMyPhoto(next);
    } else {
      if (partnerPhoto) URL.revokeObjectURL(partnerPhoto.url);
      setPartnerPhoto(next);
    }
    event.target.value = "";
  }

  function goBack() {
    setStepError("");
    if (step > 1) setStep((prev) => prev - 1);
  }

  async function goNext() {
    setStepError("");

    if (step === 1 && !relationship) {
      setStepError("관계를 선택해주세요.");
      return;
    }
    if (step === 2) {
      if (!myPhoto || !partnerPhoto) {
        setStepError("두 사람의 사진을 모두 올려주세요.");
        return;
      }
      if (!consent) {
        setStepError("상대방 사진 사용에 대한 동의가 필요해요.");
        return;
      }
    }
    if (step === 6 && !relationshipStatus) {
      setStepError("항목을 선택해주세요. (답변하지 않을게요도 선택 가능해요)");
      return;
    }

    if (step < TOTAL_STEPS) {
      setStep((prev) => prev + 1);
      return;
    }

    await handleSubmit();
  }

  async function handleSubmit() {
    if (!myPhoto || !partnerPhoto || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const [myPhotoDataUrl, partnerPhotoDataUrl] = await Promise.all([
        resizeImageToDataUrl(myPhoto.file),
        resizeImageToDataUrl(partnerPhoto.file),
      ]);

      const answers = {
        relationship,
        myName: myName.trim() || "나",
        partnerName: partnerName.trim() || "그 사람",
        desiredImages,
        curiosities,
        relationshipStatus,
        situations,
      };

      localStorage.setItem("facemood_match_answers", JSON.stringify(answers));
      try {
        localStorage.setItem("facemood_match_my_photo", myPhotoDataUrl);
        localStorage.setItem("facemood_match_partner_photo", partnerPhotoDataUrl);
      } catch {
        console.warn("사진을 로컬에 저장하지 못했습니다 (용량 제한).");
      }

      try {
        const response = await fetch("/api/match/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers,
            myPhoto: myPhotoDataUrl,
            partnerPhoto: partnerPhotoDataUrl,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.id) localStorage.setItem("facemood_match_report_id", data.id);
        }
      } catch {
        console.warn("리포트 저장에 실패했습니다 (서버 연결 문제로 추정).");
      }

      window.fbq?.("trackCustom", "MatchLead");
      window.location.href = "/match/loading";
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "사진을 처리하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const exampleMyName = myName.trim() || "민지";
  const examplePartnerName = partnerName.trim() || "현우";

  return (
    <main
      className="min-h-screen pb-24"
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

      <Container maxWidth="max-w-md" className="pt-10">
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.2em]"
          style={{ backgroundColor: "var(--match-navy)", color: "var(--match-ivory)" }}
        >
          FACEMOOD MATCH
        </span>

        <>
            <h1
              className="mt-5 text-xl font-bold"
              style={{ fontFamily: "'Noto Serif KR', serif" }}
            >
              {STEP_COPY[step - 1].title}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
              {STEP_COPY[step - 1].subtitle}
            </p>

            <div className="mt-6">
              <ProgressBar step={step} />
            </div>

            <div className="mt-6">
              {step === 1 && (
                <div className="flex flex-col gap-2.5">
                  {RELATIONSHIP_OPTIONS.map((option) => (
                    <OptionButton
                      key={option}
                      label={option}
                      active={relationship === option}
                      onClick={() => setRelationship(option)}
                    />
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-5">
                  <div className="flex gap-3">
                    <PhotoSlot
                      label="당신의 사진"
                      hint="얼굴이 선명하게 나온 정면 사진"
                      photo={myPhoto}
                      onChange={(event) => handlePhotoChange(event, "me")}
                      disabled={isSubmitting}
                    />
                    <PhotoSlot
                      label="상대방의 사진"
                      hint="동일하게 얼굴이 선명한 사진"
                      photo={partnerPhoto}
                      onChange={(event) => handlePhotoChange(event, "partner")}
                      disabled={isSubmitting}
                    />
                  </div>

                  <ul
                    className="flex flex-col gap-1.5 text-xs leading-relaxed"
                    style={{ color: "var(--match-ink-soft)" }}
                  >
                    {UPLOAD_GUIDELINES.map((item) => (
                      <li key={item} className="flex items-start gap-1.5">
                        <span>·</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <p
                    className="rounded-2xl p-4 text-[11px] leading-relaxed"
                    style={{ backgroundColor: "var(--match-beige)", color: "var(--match-ink)" }}
                  >
                    업로드한 두 장의 사진은 무드 궁합 리포트 생성을 위해서만
                    사용되며, 외모 평가나 신원 확인에는 사용되지 않아요.
                    분석이 끝나면 자동으로 삭제돼요.
                  </p>

                  <label className="flex items-start gap-2.5 text-xs leading-relaxed">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(event) => setConsent(event.target.checked)}
                      disabled={isSubmitting}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded"
                      style={{ accentColor: "var(--match-navy)" }}
                    />
                    <span style={{ color: "var(--match-ink)" }}>
                      상대방 사진을 업로드하고 분석에 사용하는 데 필요한 권한
                      또는 동의를 확인했습니다.
                    </span>
                  </label>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label
                      className="text-xs font-semibold"
                      style={{ color: "var(--match-ink)" }}
                    >
                      나
                    </label>
                    <input
                      type="text"
                      value={myName}
                      onChange={(event) => setMyName(event.target.value)}
                      placeholder="닉네임 입력 (예: 나, 민지, A)"
                      maxLength={12}
                      className="mt-1.5 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                      style={{ borderColor: "var(--match-beige)", backgroundColor: "white" }}
                    />
                  </div>
                  <div>
                    <label
                      className="text-xs font-semibold"
                      style={{ color: "var(--match-ink)" }}
                    >
                      상대
                    </label>
                    <input
                      type="text"
                      value={partnerName}
                      onChange={(event) => setPartnerName(event.target.value)}
                      placeholder="닉네임 입력 (예: 그 사람, 현우, B)"
                      maxLength={12}
                      className="mt-1.5 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                      style={{ borderColor: "var(--match-beige)", backgroundColor: "white" }}
                    />
                  </div>
                  <p className="text-[11px]" style={{ color: "var(--match-ink-soft)" }}>
                    실명 대신 닉네임을 추천해요.
                  </p>
                  <div
                    className="rounded-2xl p-4 text-xs leading-relaxed"
                    style={{ backgroundColor: "var(--match-beige)", color: "var(--match-burgundy)" }}
                  >
                    예시 문장 — {exampleMyName}님의 부드러운 이미지가{" "}
                    {examplePartnerName}님의 차분한 인상을 더욱 편안하게
                    만들어줍니다.
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="flex flex-col gap-2.5">
                  <p className="text-right text-[11px] font-semibold" style={{ color: "var(--match-burgundy)" }}>
                    {desiredImages.length}/2
                  </p>
                  {DESIRED_IMAGE_OPTIONS.map((option) => (
                    <OptionButton
                      key={option}
                      label={option}
                      active={desiredImages.includes(option)}
                      disabled={!desiredImages.includes(option) && desiredImages.length >= 2}
                      onClick={() => setDesiredImages((prev) => toggleInList(prev, option, 2))}
                    />
                  ))}
                </div>
              )}

              {step === 5 && (
                <div className="flex flex-col gap-2.5">
                  <p className="text-right text-[11px] font-semibold" style={{ color: "var(--match-burgundy)" }}>
                    {curiosities.length}/2
                  </p>
                  {CURIOSITY_OPTIONS.map((option) => (
                    <OptionButton
                      key={option}
                      label={option}
                      active={curiosities.includes(option)}
                      disabled={!curiosities.includes(option) && curiosities.length >= 2}
                      onClick={() => setCuriosities((prev) => toggleInList(prev, option, 2))}
                    />
                  ))}
                </div>
              )}

              {step === 6 && (
                <div className="flex flex-col gap-2.5">
                  {RELATIONSHIP_STATUS_OPTIONS.map((option) => (
                    <OptionButton
                      key={option}
                      label={option}
                      active={relationshipStatus === option}
                      onClick={() => setRelationshipStatus(option)}
                    />
                  ))}
                </div>
              )}

              {step === 7 && (
                <div className="flex flex-col gap-2.5">
                  {SITUATION_OPTIONS.map((option) => (
                    <OptionButton
                      key={option}
                      label={option}
                      active={situations.includes(option)}
                      onClick={() =>
                        setSituations((prev) => toggleInList(prev, option, SITUATION_OPTIONS.length))
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {stepError && (
              <p className="mt-4 text-xs" style={{ color: "var(--match-burgundy)" }}>
                {stepError}
              </p>
            )}

            <div className="mt-8 flex gap-2.5">
              {step > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  disabled={isSubmitting}
                  className="flex-1 rounded-full border px-6 py-3.5 text-sm font-semibold disabled:opacity-50"
                  style={{ borderColor: "var(--match-beige)", color: "var(--match-ink)" }}
                >
                  이전
                </button>
              )}
              <button
                type="button"
                onClick={goNext}
                disabled={isSubmitting}
                className="flex-[2] rounded-full px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: "var(--match-navy)" }}
              >
                {isSubmitting
                  ? "처리 중..."
                  : step === TOTAL_STEPS
                    ? "결과 만들기"
                    : "다음"}
              </button>
            </div>
          </>
      </Container>
    </main>
  );
}
