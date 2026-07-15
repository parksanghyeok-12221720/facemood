"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Container from "@/app/components/Container";

type Question = {
  key: string;
  title: string;
  options: string[];
};

const genderOptions = ["여성", "남성"];

const questions: Question[] = [
  {
    key: "moodDirection",
    title: "원하는 추구미는 어떤 쪽에 가까워요?",
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
    key: "wantToChange",
    title: "지금 내 이미지에서 가장 바꾸고 싶은 부분은 무엇인가요?",
    options: [
      "전체 분위기가 애매해 보여요",
      "사진마다 이미지가 달라 보여요",
      "옷이 나한테 잘 맞는지 모르겠어요",
      "메이크업이 어울리는지 모르겠어요",
      "헤어스타일이 고민이에요",
      "색감 선택이 어려워요",
    ],
  },
  {
    key: "usualStyle",
    title: "평소 스타일은 어떤 편인가요?",
    options: [
      "편한 캐주얼을 자주 입어요",
      "여성스럽고 단정한 스타일이 좋아요",
      "미니멀하고 깔끔한 스타일이 좋아요",
      "꾸민 느낌이 확실한 스타일이 좋아요",
      "아직 제 스타일을 잘 모르겠어요",
    ],
  },
  {
    key: "colorUsual",
    title: "평소 자주 입는 색감은 어떤 쪽인가요?",
    options: [
      "블랙/화이트/그레이",
      "베이지/브라운/아이보리",
      "핑크/라벤더/하늘색",
      "네이비/버건디/카키",
      "색을 잘 모르고 그냥 입어요",
    ],
  },
  {
    key: "personality",
    title: "평소 성격은 어떤 편인가요?",
    options: [
      "활발하고 에너지 넘치는 편이에요",
      "차분하고 조용한 편이에요",
      "여성스럽고 부드러운 편이에요",
      "털털하고 편안한 편이에요",
      "신중하고 세심한 편이에요",
      "그때그때 달라요",
    ],
  },
  {
    key: "colorMood",
    title: "원하는 컬러 분위기는 어떤 쪽인가요?",
    options: [
      "맑고 깨끗한 느낌",
      "부드럽고 여리한 느낌",
      "고급스럽고 차분한 느낌",
      "시크하고 선명한 느낌",
      "러블리하고 화사한 느낌",
    ],
  },
  {
    key: "makeupLevel",
    title: "메이크업은 평소 어느 정도로 하나요?",
    options: [
      "거의 안 하는 편이에요",
      "베이스와 립 정도만 해요",
      "데일리 메이크업은 하는 편이에요",
      "눈화장까지 신경 쓰는 편이에요",
      "분위기에 따라 진하게도 해요",
      "메이크업을 잘 몰라서 추천받고 싶어요",
    ],
  },
  {
    key: "hairConcern",
    title: "헤어스타일에서 가장 고민되는 부분은 무엇인가요?",
    options: [
      "앞머리를 낼지 말지 고민돼요",
      "머리 길이가 고민돼요",
      "펌을 해야 할지 모르겠어요",
      "염색 컬러가 고민돼요",
      "머리가 너무 평범해 보여요",
      "손질이 쉬운 스타일을 원해요",
    ],
  },
  {
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

const TOTAL_STEPS = questions.length + 1;

export default function TestPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const isProfileStep = step === 0;
  const question = !isProfileStep ? questions[step - 1] : undefined;
  const canSubmitProfile =
    name.trim() !== "" &&
    gender !== "" &&
    age.trim() !== "" &&
    height.trim() !== "" &&
    weight.trim() !== "";

  function handleProfileNext() {
    setStep(step + 1);
  }

  function handleSelect(option: string) {
    if (!question) return;
    const nextAnswers = { ...answers, [question.key]: option };
    setAnswers(nextAnswers);

    if (step + 1 < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      const result = {
        name,
        gender,
        age,
        height,
        weight,
        ...nextAnswers,
      };
      localStorage.setItem("facemood_test_answers", JSON.stringify(result));
      router.push("/upload");
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-violet-100 bg-white px-5 py-4 text-sm text-black placeholder:text-gray-400 outline-none focus:border-violet-300";

  return (
    <main className="flex min-h-screen flex-col justify-center bg-white py-16 text-black">
      <Container>
        <div>
          <p className="mb-2 text-xs text-gray-400">
            {step + 1} / {TOTAL_STEPS}
          </p>
          <div className="h-1 w-full overflow-hidden rounded-full bg-violet-100">
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
          question && (
            <>
              <h1 className="mt-10 text-xl font-bold leading-snug text-black">
                {question.title}
              </h1>

              <div className="mt-8 flex flex-col gap-3">
                {question.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className="w-full rounded-2xl border border-violet-100 bg-white px-5 py-4 text-left text-sm text-gray-700 transition-colors hover:border-violet-300 hover:bg-violet-50"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          )
        )}
      </Container>
    </main>
  );
}
