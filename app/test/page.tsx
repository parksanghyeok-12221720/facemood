"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Container from "@/app/components/Container";

type SelectStep = {
  type: "select";
  key: string;
  title: string;
  options: string[];
};

type PhotoOption = {
  key: string;
  title: string;
  subtitle: string;
  photo: string;
};

type PhotoStep = {
  type: "photo";
  key: string;
  title: string;
  subtitle: string;
  options: PhotoOption[];
  maxSelect: number;
  recommendLabel: string;
  recommendSubtitle: string;
  celebrityLabel: string;
  celebritySubtitle: string;
  celebrityPlaceholder: string;
};

type Step = SelectStep | PhotoStep;

const genderOptions = ["여성", "남성"];

const steps: Step[] = [
  {
    type: "select",
    key: "moodDirection",
    title: "현재 당신의 스타일은 무엇인가요?",
    options: [
      "청순하고 자연스러운 무드",
      "고급스럽고 도시적인 무드",
      "차분하고 시크한 무드",
      "러블리하고 부드러운 무드",
      "힙하고 트렌디한 무드",
      "아직 잘 모르겠어요",
    ],
  },
  {
    type: "photo",
    key: "preferredStyle",
    title: "선호하는 스타일이 있으신가요?",
    subtitle: "최대 3개까지 고를 수 있어요.",
    maxSelect: 3,
    recommendLabel: "아직 잘 모르겠어요. 추천해 주세요!",
    recommendSubtitle: "전문가가 회원님께 가장 잘 어울리는 무드를 찾아드릴게요",
    celebrityLabel: "닮고 싶은 연예인이 있다면 입력해주세요",
    celebritySubtitle: "스타일 무드 분석에 꼼꼼히 참고할게요",
    celebrityPlaceholder: "예) 장원영, 카리나, 한소희, 고윤정, 아이유 등",
    options: [
      {
        key: "lovely",
        title: "러블리",
        subtitle: "사랑스럽고 부드러운 무드",
        photo: "/test-style/lovely.png",
      },
      {
        key: "playful",
        title: "발랄함",
        subtitle: "밝고 생기있는 무드",
        photo: "/test-style/playful.png",
      },
      {
        key: "luxury",
        title: "고급스러움",
        subtitle: "우아하고 성숙한 무드",
        photo: "/test-style/luxury.png",
      },
      {
        key: "chic",
        title: "시크",
        subtitle: "세련되고 도시적인 무드",
        photo: "/test-style/chic.png",
      },
      {
        key: "pure",
        title: "청순",
        subtitle: "맑고 자연스러운 무드",
        photo: "/test-style/pure.png",
      },
      {
        key: "daily",
        title: "데일리",
        subtitle: "편안하고 무난한 무드",
        photo: "/test-style/daily.png",
      },
    ],
  },
  {
    type: "select",
    key: "purpose",
    title: "분석 목적은 무엇인가요?",
    options: [
      "소개팅",
      "데이트",
      "인스타 프로필",
      "출근/면접",
      "전체 이미지 개선",
    ],
  },
];

// Male version of the mood/style questions — the female options above
// (청순, 러블리, ...) don't apply to men. preferredStyle reuses the real
// archetype photos already shot for /detail-male's mood cards
// (/mood/cards-male/) rather than a placeholder, since they already fit.
const maleSteps: Step[] = [
  {
    type: "select",
    key: "moodDirection",
    title: "현재 당신의 스타일은 무엇인가요?",
    options: [
      "댄디하고 깔끔한 무드",
      "미니멀하고 담백한 무드",
      "시티보이 감성의 편안한 무드",
      "스트릿하고 자유분방한 무드",
      "클래식하고 포멀한 무드",
      "모던하고 시크한 무드",
      "아직 잘 모르겠어요",
    ],
  },
  {
    type: "photo",
    key: "preferredStyle",
    title: "선호하는 스타일이 있으신가요?",
    subtitle: "최대 3개까지 고를 수 있어요.",
    maxSelect: 3,
    recommendLabel: "아직 잘 모르겠어요. 추천해 주세요!",
    recommendSubtitle: "전문가가 회원님께 가장 잘 어울리는 무드를 찾아드릴게요",
    celebrityLabel: "닮고 싶은 연예인이 있다면 입력해주세요",
    celebritySubtitle: "스타일 무드 분석에 꼼꼼히 참고할게요",
    celebrityPlaceholder: "예) 차은우, 송강, 박서준, 안보현, 정해인 등",
    options: [
      {
        key: "dandy",
        title: "댄디",
        subtitle: "단정하고 세련된 무드",
        photo: "/mood/cards-male/댄디st.png",
      },
      {
        key: "minimal",
        title: "미니멀",
        subtitle: "담백하고 정돈된 무드",
        photo: "/mood/cards-male/미니멀st.png",
      },
      {
        key: "cityboy",
        title: "시티보이",
        subtitle: "편안하고 감각적인 무드",
        photo: "/mood/cards-male/시티보이st.png",
      },
      {
        key: "street",
        title: "스트릿",
        subtitle: "자유롭고 개성있는 무드",
        photo: "/mood/cards-male/스트릿st.png",
      },
      {
        key: "classic",
        title: "클래식",
        subtitle: "기본에 충실한 무드",
        photo: "/mood/cards-male/클래식st.png",
      },
      {
        key: "vintage",
        title: "빈티지",
        subtitle: "자연스럽고 개성있는 무드",
        photo: "/mood/cards-male/빈티지st.png",
      },
    ],
  },
  {
    type: "select",
    key: "purpose",
    title: "분석 목적은 무엇인가요?",
    options: [
      "소개팅",
      "데이트",
      "인스타 프로필",
      "출근/면접",
      "전체 이미지 개선",
    ],
  },
];

const TOTAL_STEPS = steps.length + 1;

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15 5l-7 7 7 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TestPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [wantsRecommendation, setWantsRecommendation] = useState(false);
  const [celebrityInput, setCelebrityInput] = useState("");

  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [genderPreset, setGenderPreset] = useState(false);
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("gender");
    if (param !== "여성" && param !== "남성") return;
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setGender(param);
      setGenderPreset(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Carries the /services single-item selection (?product=hair/makeup/color)
  // through to /checkout, which uses it to narrow its tier picker down to
  // just that item + Premium. A plain localStorage write, not React state —
  // /test itself doesn't render anything differently based on this. Clears
  // any stale value when arriving without the param (e.g. via /match/report's
  // generic /test link) so an old single-item selection can't leak into an
  // unrelated session and wrongly restrict /checkout later.
  useEffect(() => {
    const product = new URLSearchParams(window.location.search).get("product");
    if (product === "hair" || product === "makeup" || product === "color") {
      localStorage.setItem("facemood_selected_product", product);
    } else {
      localStorage.removeItem("facemood_selected_product");
    }
  }, []);

  const activeSteps = gender === "남성" ? maleSteps : steps;
  const isProfileStep = step === 0;
  const currentStep = !isProfileStep ? activeSteps[step - 1] : undefined;
  const canSubmitProfile =
    name.trim() !== "" &&
    gender !== "" &&
    age.trim() !== "" &&
    height.trim() !== "" &&
    weight.trim() !== "";

  function handleBack() {
    if (step === 0) {
      router.back();
      return;
    }
    setSelectedPhotos([]);
    setWantsRecommendation(false);
    setCelebrityInput("");
    setStep(step - 1);
  }

  function handleProfileNext() {
    setStep(step + 1);
  }

  function finalize(nextAnswers: Record<string, string>) {
    const result = { name, gender, age, height, weight, ...nextAnswers };
    localStorage.setItem("facemood_test_answers", JSON.stringify(result));
    router.push("/upload");
  }

  function commitAnswers(fragment: Record<string, string>) {
    const nextAnswers = { ...answers, ...fragment };
    setAnswers(nextAnswers);
    setSelectedPhotos([]);
    setWantsRecommendation(false);
    setCelebrityInput("");

    if (step + 1 < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      finalize(nextAnswers);
    }
  }

  function commitAnswer(key: string, value: string) {
    commitAnswers({ [key]: value });
  }

  function togglePhoto(optionKey: string, maxSelect: number) {
    setWantsRecommendation(false);
    setSelectedPhotos((prev) => {
      if (prev.includes(optionKey)) {
        return prev.filter((k) => k !== optionKey);
      }
      if (prev.length >= maxSelect) return prev;
      return [...prev, optionKey];
    });
  }

  function toggleRecommendation() {
    setSelectedPhotos([]);
    setWantsRecommendation((prev) => !prev);
  }

  function handlePhotoNext(photoStep: PhotoStep) {
    const styleValue = wantsRecommendation
      ? "아직 잘 모르겠어요 (전문가 추천 요청)"
      : photoStep.options
          .filter((option) => selectedPhotos.includes(option.key))
          .map((option) => option.title)
          .join(", ");

    const fragment: Record<string, string> = { [photoStep.key]: styleValue };
    if (celebrityInput.trim() !== "") {
      fragment.celebrityReference = celebrityInput.trim();
    }
    commitAnswers(fragment);
  }

  const inputClass =
    "w-full rounded-2xl border border-violet-100 bg-white px-5 py-4 text-sm text-black placeholder:text-gray-400 outline-none focus:border-violet-300";

  return (
    <main className="flex min-h-screen flex-col justify-center bg-white py-16 text-black">
      <Container>
        <div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              aria-label="뒤로"
              className="flex h-8 w-8 items-center justify-center text-gray-400"
            >
              <ChevronLeftIcon />
            </button>
            <p className="text-xs text-gray-400">
              {step + 1} / {TOTAL_STEPS}
            </p>
            <span className="h-8 w-8" />
          </div>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-violet-100">
            <div
              className="h-full rounded-full bg-black transition-all duration-300"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {isProfileStep ? (
          <>
            <h1 className="mt-10 text-xl font-bold leading-snug text-black">
              기본 정보를 알려주세요
            </h1>

            <div className="mt-8 flex flex-col gap-8">
              <div>
                <p className="mb-3 text-xs tracking-[0.2em] text-gray-500">
                  이름
                </p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 홍길동"
                  className={inputClass}
                />
              </div>

              {!genderPreset && (
                <div>
                  <p className="mb-3 text-xs tracking-[0.2em] text-gray-500">
                    성별
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {genderOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setGender(option)}
                        className={`rounded-2xl px-5 py-4 text-left text-sm font-medium transition-colors ${
                          gender === option
                            ? "bg-black text-white"
                            : "border border-violet-100 bg-white text-gray-600 hover:border-violet-300"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="mb-3 text-xs tracking-[0.2em] text-gray-500">
                  나이
                </p>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={99}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="예: 25"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-3 text-xs tracking-[0.2em] text-gray-500">
                    키 (cm)
                  </p>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={100}
                    max={250}
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="예: 165"
                    className={inputClass}
                  />
                </div>

                <div>
                  <p className="mb-3 text-xs tracking-[0.2em] text-gray-500">
                    몸무게 (kg)
                  </p>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={20}
                    max={200}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="예: 55"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="mt-10">
              <button
                type="button"
                onClick={handleProfileNext}
                disabled={!canSubmitProfile}
                className="flex w-full items-center justify-center rounded-full bg-black px-8 py-4 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              >
                다음
              </button>
            </div>
          </>
        ) : (
          currentStep && (
            <>
              <h1 className="mt-10 text-xl font-bold leading-snug text-black">
                {currentStep.title}
              </h1>

              {currentStep.type === "photo" && (
                <p className="mt-2 text-xs text-gray-400">
                  {currentStep.subtitle}
                </p>
              )}

              {currentStep.type === "select" ? (
                <div className="mt-8 flex flex-col gap-3">
                  {currentStep.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => commitAnswer(currentStep.key, option)}
                      className="w-full rounded-2xl border border-violet-100 bg-white px-5 py-4 text-left text-sm text-gray-700 transition-colors hover:border-violet-300 hover:bg-violet-50"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {currentStep.options.map((option) => {
                      const selected = selectedPhotos.includes(option.key);
                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => togglePhoto(option.key, currentStep.maxSelect)}
                          className={`relative overflow-hidden rounded-2xl border transition-colors ${
                            selected ? "border-violet-500" : "border-violet-100"
                          }`}
                        >
                          <div className="relative aspect-[1122/1402] w-full">
                            <Image
                              src={option.photo}
                              alt={option.title}
                              fill
                              sizes="180px"
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                            <span
                              className={`absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${
                                selected
                                  ? "border-violet-500 bg-violet-500 text-white"
                                  : "border-white/70 bg-white/20 text-transparent"
                              }`}
                            >
                              ✓
                            </span>
                          </div>
                          <div className="absolute inset-x-0 bottom-0 p-3 text-left">
                            <p className="text-sm font-bold text-white">
                              {option.title}
                            </p>
                            <p className="mt-0.5 text-[11px] text-white/75">
                              {option.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={toggleRecommendation}
                    className={`mt-4 flex w-full items-center gap-3 rounded-2xl border px-5 py-4 text-left transition-colors ${
                      wantsRecommendation
                        ? "border-violet-500 bg-violet-50"
                        : "border-violet-100 bg-white hover:border-violet-300"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                        wantsRecommendation
                          ? "border-violet-500 bg-violet-500 text-white"
                          : "border-violet-200 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-black">
                        {currentStep.recommendLabel}
                      </span>
                      <span className="mt-0.5 block text-xs text-gray-400">
                        {currentStep.recommendSubtitle}
                      </span>
                    </span>
                  </button>

                  <div className="mt-4 rounded-2xl border border-violet-100 bg-white px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-black">
                        {currentStep.celebrityLabel}
                      </span>
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-600">
                        선택
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {currentStep.celebritySubtitle}
                    </p>
                    <input
                      type="text"
                      value={celebrityInput}
                      onChange={(e) => setCelebrityInput(e.target.value)}
                      placeholder={currentStep.celebrityPlaceholder}
                      className="mt-3 w-full rounded-xl border border-violet-100 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none focus:border-violet-300"
                    />
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => handlePhotoNext(currentStep)}
                      disabled={selectedPhotos.length === 0 && !wantsRecommendation}
                      className="flex w-full items-center justify-center rounded-full bg-black px-8 py-4 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                    >
                      다음
                    </button>
                  </div>
                </>
              )}
            </>
          )
        )}
      </Container>
    </main>
  );
}
