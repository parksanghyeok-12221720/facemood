"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/app/components/Container";
import StarRating from "@/app/components/StarRating";

const ANSWERS_KEY = "facemood_match_answers";
const MY_PHOTO_KEY = "facemood_match_my_photo";
const PARTNER_PHOTO_KEY = "facemood_match_partner_photo";

type MatchAnswers = {
  myName?: string;
  partnerName?: string;
};

// This data never changes while the page is open, so subscribe is a no-op —
// useSyncExternalStore just gives us a hydration-safe way to read
// localStorage (server snapshot is null, client snapshot is the real value).
function subscribeNoop() {
  return () => {};
}

function getServerSnapshot() {
  return null;
}

// The 10 possible Mood Types the couple result can land on. Each needs a
// photo at /public/mood/match-types/{name}.png (exact name, e.g.
// "Soft City.png") — real photos are already in place for all 10.
const moodTypes = [
  { name: "Soft City" },
  { name: "Romantic Classic" },
  { name: "Modern Minimal" },
  { name: "Fresh Campus" },
  { name: "Chic Date" },
  { name: "Vintage Mood" },
  { name: "Quiet Luxury" },
  { name: "Cozy Natural" },
  { name: "Urban Elegant" },
  { name: "Soft Vintage" },
] as const;

// Which of the 10 types this example report landed on.
const featuredMoodType = {
  name: "Soft City" as (typeof moodTypes)[number]["name"],
  score: 89,
  summary: "차분한 무드와 도시적인 세련됨이 만나 균형 잡힌 분위기를 만들어내는 조합이에요.",
  keywords: ["Calm", "Urban", "Elegant", "Balanced", "Chic"],
};

// Style suggestions distinct from the couple's CURRENT Mood Type (section 01,
// photos at /mood/match-types/). This is a separate chapter with its own
// photos at /public/mood/match-recommend/{name}.png.
const recommendedMoods = [
  {
    name: "Romantic Classic",
    reason: "도시적인 무드에 부드러운 로맨틱 요소를 더하면 더 다채로운 분위기를 연출할 수 있어요.",
  },
  {
    name: "Vintage Mood",
    reason: "빈티지한 감성을 살리면 사진 찍을 때 훨씬 화보 같은 느낌을 낼 수 있어요.",
  },
  {
    name: "Cozy Natural",
    reason: "자연스럽고 편안한 무드를 더하면 데이트 사진에서 훨씬 친근한 분위기가 나와요.",
  },
];

const faceMoodHighlight = {
  pairLabel: "SOFT × CHIC",
  score: 89,
  bullets: [
    "함께 있을 때 만들어지는 분위기",
    "첫인상 조화",
    "서로의 이미지 시너지",
    "분위기 밸런스",
  ],
};

const faceMoodScores = [
  { label: "첫인상 조화", score: 90 },
  { label: "분위기 시너지", score: 88 },
];

const individualMoods = {
  my: { label: "차분한 시크", note: "정돈되고 차분한 분위기가 강하게 느껴져요." },
  partner: { label: "도시적인 세련됨", note: "깔끔하고 세련된 도시적 이미지가 느껴져요." },
};

// The 12 possible art-style types each person can be assigned. Photo at
// /public/mood/match-artstyle/{name}.png — real photos already in place.
const artStyleTypes = [
  { name: "강아지그림체" },
  { name: "고양이그림체" },
  { name: "모델그림체" },
  { name: "배우그림체" },
  { name: "빈티지그림체" },
  { name: "아이돌그림체" },
  { name: "여우그림체" },
  { name: "웹툰그림체" },
  { name: "일본감성그림체" },
  { name: "청순그림체" },
  { name: "토끼그림체" },
  { name: "하이틴그림체" },
] as const;

const artStyleChemistry = {
  myStyle: "청순그림체" as (typeof artStyleTypes)[number]["name"],
  partnerStyle: "모델그림체" as (typeof artStyleTypes)[number]["name"],
  together: "감성 드라마 무드",
};

// Photo per category at /public/mood/match-style/{label lowercase}.png
const styleCompat = [
  { label: "Casual", filled: 5 },
  { label: "Minimal", filled: 5 },
  { label: "Street", filled: 2 },
  { label: "Classic", filled: 4 },
  { label: "Formal", filled: 3 },
  { label: "Vintage", filled: 4 },
];

const styleNotes = [
  { label: "같이 입으면 좋은 스타일", value: "미니멀 톤온톤 세트업" },
  { label: "피해야 할 스타일", value: "과한 로고 플레이 아이템" },
  { label: "커플룩 방향", value: "캐주얼 베이스 + 포인트 컬러" },
];

const hairChemistry = { my: "레이어드", partner: "댄디", filled: 4 };

const colorCompat = [
  { name: "Beige", hex: "#D8C3A5", reason: "두 사람의 톤을 자연스럽게 이어주는 뉴트럴 베이스예요." },
  { name: "Olive", hex: "#7C7C4A", reason: "차분하면서도 개성 있는 무드를 더해줘요." },
  { name: "Cream", hex: "#F1E9D8", reason: "부드럽고 편안한 인상을 만들어줘요." },
  { name: "Navy", hex: "#2C3E50", reason: "세련되고 안정감 있는 포인트 컬러로 잘 어울려요." },
  { name: "Terracotta", hex: "#C57B57", reason: "두 사람의 웜톤을 살려주는 따뜻한 포인트예요." },
];

const itemCompat = [
  { label: "Silver", filled: 5 },
  { label: "Gold", filled: 2 },
  { label: "Denim", filled: 5 },
  { label: "Leather", filled: 4 },
];

const datePlaceCompat = [
  { label: "미술관", filled: 5 },
  { label: "카페", filled: 5 },
  { label: "놀이공원", filled: 3 },
  { label: "캠핑", filled: 4 },
];

const photoConceptTags = ["카페", "노을", "전시회", "여행", "필름카메라"];

const snsConceptCompat = [
  { label: "필름감성", filled: 5 },
  { label: "노을", filled: 4 },
  { label: "미러샷", filled: 5 },
  { label: "카페", filled: 5 },
];

const perfumeChemistry = { my: "Byredo", partner: "Le Labo", together: "Maison Margiela" };

const seasonCompat = [
  { label: "여름", filled: 5 },
  { label: "가을", filled: 5 },
  { label: "겨울", filled: 4 },
  { label: "봄", filled: 3 },
];

const moodKeywords = ["Calm", "Warm", "Classic", "Elegant", "Natural", "Vintage"];

const overallMoodScore = 91;
const overallPercentile = "상위 8%";

const testimonials = [
  { quote: "생각보다 결과가 너무 정확했어요." },
  { quote: "데이트 전에 같이 해봤는데 재밌었어요." },
  { quote: "우리 분위기를 이렇게 표현해주는 게 신기했어요." },
];

const faqItems = [
  { q: "사진은 삭제되나요?", a: "24시간 후 자동 삭제됩니다." },
  { q: "얼굴이 가려져도 되나요?", a: "정면 사진을 권장합니다." },
  { q: "커플만 가능한가요?", a: "썸, 짝사랑, 친구 모두 가능합니다." },
];

const includedItems = [
  "두 사람의 커플 무드 분석",
  "첫인상과 이미지 케미",
  "커플룩 및 데이트 스타일",
  "사진 콘셉트와 컬러",
  "커플 향기 조합",
  "공유용 커플 무드 카드",
];

function PartLabel({ part, title }: { part: string; title: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span
        className="text-[11px] font-bold tracking-[0.15em]"
        style={{ color: "var(--match-rose)" }}
      >
        {part}
      </span>
      <h2 className="text-lg font-bold leading-snug" style={{ fontFamily: "'Noto Serif KR', serif" }}>
        {title}
      </h2>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[24px] p-6 ${className}`}
      style={{ backgroundColor: "white", border: "1px solid var(--match-beige)" }}
    >
      {children}
    </div>
  );
}

function ScoreRow({ label, filled }: { label: string; filled: number }) {
  return (
    <div className="flex items-center justify-between text-xs font-semibold">
      <span>{label}</span>
      <StarRating filled={filled} />
    </div>
  );
}

function PhotoScoreRow({
  label,
  filled,
  photo,
}: {
  label: string;
  filled: number;
  photo: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl">
        <Image src={photo} alt={label} fill className="object-cover" />
      </div>
      <div className="flex flex-1 items-center justify-between text-xs font-semibold">
        <span>{label}</span>
        <StarRating filled={filled} />
      </div>
    </div>
  );
}

export default function MatchResultPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const rawAnswers = useSyncExternalStore(
    subscribeNoop,
    () => localStorage.getItem(ANSWERS_KEY),
    getServerSnapshot,
  );
  const myPhoto = useSyncExternalStore(
    subscribeNoop,
    () => localStorage.getItem(MY_PHOTO_KEY),
    getServerSnapshot,
  );
  const partnerPhoto = useSyncExternalStore(
    subscribeNoop,
    () => localStorage.getItem(PARTNER_PHOTO_KEY),
    getServerSnapshot,
  );

  const answers: MatchAnswers = useMemo(() => {
    if (!rawAnswers) return {};
    try {
      return JSON.parse(rawAnswers);
    } catch {
      return {};
    }
  }, [rawAnswers]);

  const hasNames = Boolean(answers.myName && answers.partnerName);
  const myName = answers.myName || "나";
  const partnerName = answers.partnerName || "그 사람";
  const headline = hasNames ? `${myName}님과 ${partnerName}님의 무드 궁합` : "우리의 무드 궁합";

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

      {/* Hero */}
      <div className="pb-10 pt-14 text-center">
        <Container maxWidth="max-w-3xl">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.2em]"
            style={{ backgroundColor: "var(--match-navy)", color: "var(--match-ivory)" }}
          >
            FACEMOOD MATCH · PREVIEW
          </span>

          <div className="mt-6 flex items-center justify-center gap-3">
            <div
              className="relative h-16 w-16 overflow-hidden rounded-full"
              style={{ border: "2px solid var(--match-navy)" }}
            >
              {myPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={myPhoto} alt={myName} className="h-full w-full object-cover" />
              ) : (
                <Image src="/mood/cards/청순자연st.png" alt={myName} fill className="object-cover" />
              )}
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
              ) : (
                <Image src="/mood/cards/고급도시st.png" alt={partnerName} fill className="object-cover" />
              )}
            </div>
          </div>

          <h1
            className="mt-5 text-xl font-bold leading-snug"
            style={{ fontFamily: "'Noto Serif KR', serif" }}
          >
            {headline}
          </h1>

          <div
            className="mx-auto mt-6 max-w-sm rounded-[28px] p-6 text-left shadow-sm"
            style={{ backgroundColor: "var(--match-beige)" }}
          >
            <span className="text-[10px] font-semibold tracking-[0.2em]" style={{ color: "var(--match-burgundy)" }}>
              얼굴 무드 궁합
            </span>
            <div className="mt-2 flex items-end justify-between">
              <p className="text-2xl font-bold" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                {faceMoodHighlight.pairLabel}
              </p>
              <p className="text-xl font-bold" style={{ color: "var(--match-burgundy)" }}>
                {faceMoodHighlight.score}%
              </p>
            </div>
            <StarRating filled={faceMoodHighlight.score / 20} />
            <ul className="mt-3 flex flex-col gap-1.5">
              {faceMoodHighlight.bullets.map((bullet) => (
                <li key={bullet} className="text-xs leading-relaxed" style={{ color: "var(--match-ink)" }}>
                  · {bullet}
                </li>
              ))}
            </ul>
          </div>

          <p className="mx-auto mt-4 max-w-xs text-[11px] leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
            지금 보시는 리포트는 예시 구성이에요. 실제 사진 분석 기능은
            준비 중이며, 완성되는 대로 알려드릴게요.
          </p>
        </Container>
      </div>

      {/* 01. Mood Type */}
      <Container maxWidth="max-w-3xl" className="mt-4">
        <PartLabel part="01" title="우리의 Mood Type" />
        <div className="mt-5">
          <Card>
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl">
              <Image
                src={`/mood/match-types/${featuredMoodType.name}.png`}
                alt={featuredMoodType.name}
                fill
                className="object-cover"
              />
              <div
                className="absolute inset-x-0 bottom-0 px-5 py-4"
                style={{ background: "linear-gradient(to top, rgba(30,42,58,0.85), transparent)" }}
              >
                <p
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: "'Noto Serif KR', serif" }}
                >
                  {featuredMoodType.name}
                </p>
                <p className="text-xs font-semibold text-white/80">
                  Mood Score {featuredMoodType.score}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed">{featuredMoodType.summary}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {featuredMoodType.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full px-2.5 py-1 text-[10.5px] font-medium"
                  style={{ backgroundColor: "var(--match-beige)", color: "var(--match-burgundy)" }}
                >
                  {keyword}
                </span>
              ))}
            </div>
          </Card>
          <p className="mt-3 text-[11px] leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
            그 외 나올 수 있는 Mood Type —{" "}
            {moodTypes
              .filter((type) => type.name !== featuredMoodType.name)
              .map((type) => type.name)
              .join(" · ")}
          </p>
        </div>
      </Container>

      {/* 02. Recommended moods */}
      <Container maxWidth="max-w-3xl" className="mt-10">
        <PartLabel part="02" title="잘 어울리는 추천 무드" />
        <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
          지금 무드에 더해보면 좋은 다른 방향이에요.
        </p>
      </Container>

      <div className="mt-5 -mx-6 overflow-x-auto px-6">
        <div className="flex w-max gap-3">
          {recommendedMoods.map((mood) => (
            <div
              key={mood.name}
              className="w-48 shrink-0 overflow-hidden rounded-2xl"
              style={{ backgroundColor: "white", border: "1px solid var(--match-beige)" }}
            >
              <div className="relative aspect-[3/2] w-full">
                <Image
                  src={`/mood/match-recommend/${mood.name}.png`}
                  alt={mood.name}
                  fill
                  className="object-cover"
                />
                <div
                  className="absolute inset-x-0 bottom-0 px-3 py-2.5"
                  style={{ background: "linear-gradient(to top, rgba(30,42,58,0.85), transparent)" }}
                >
                  <p
                    className="text-sm font-bold text-white"
                    style={{ fontFamily: "'Noto Serif KR', serif" }}
                  >
                    {mood.name}
                  </p>
                </div>
              </div>
              <p className="px-3 py-3 text-[11px] leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
                {mood.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* PART 1 */}
      <Container maxWidth="max-w-3xl" className="mt-10">
        <PartLabel part="PART 1" title="얼굴 무드 분석" />
        <div className="mt-5 flex flex-col gap-3">
          <Card>
            <p className="text-sm font-bold">각자의 현재 이미지 무드</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                  {myName}
                </p>
                <p className="mt-1 text-sm font-bold">{individualMoods.my.label}</p>
                <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
                  {individualMoods.my.note}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                  {partnerName}
                </p>
                <p className="mt-1 text-sm font-bold">{individualMoods.partner.label}</p>
                <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
                  {individualMoods.partner.note}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-4">
              {faceMoodScores.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>{item.label}</span>
                    <span className="flex items-center gap-2">
                      <StarRating filled={item.score / 20} />
                      <span style={{ color: "var(--match-burgundy)" }}>{item.score}</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--match-beige)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.score}%`, backgroundColor: "var(--match-rose)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
              style={{ backgroundColor: "var(--match-burgundy)" }}
            >
              NEW
            </span>
            <p className="mt-3 text-sm font-bold">얼굴 그림체 케미</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 text-center">
                <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl">
                  <Image
                    src={`/mood/match-artstyle/${artStyleChemistry.myStyle}.png`}
                    alt={`${myName} - ${artStyleChemistry.myStyle}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="mt-2 text-xs font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                  {myName}
                </p>
                <p className="text-sm font-bold">{artStyleChemistry.myStyle}</p>
              </div>
              <span style={{ color: "var(--match-rose)" }}>→</span>
              <div className="flex-1 text-center">
                <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl">
                  <Image
                    src={`/mood/match-artstyle/${artStyleChemistry.partnerStyle}.png`}
                    alt={`${partnerName} - ${artStyleChemistry.partnerStyle}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="mt-2 text-xs font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                  {partnerName}
                </p>
                <p className="text-sm font-bold">{artStyleChemistry.partnerStyle}</p>
              </div>
            </div>
            <div
              className="mt-3 rounded-2xl p-3 text-center text-xs font-semibold"
              style={{ backgroundColor: "var(--match-beige)", color: "var(--match-burgundy)" }}
            >
              Together — {artStyleChemistry.together}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
              그 외 나올 수 있는 그림체 —{" "}
              {artStyleTypes
                .filter(
                  (type) =>
                    type.name !== artStyleChemistry.myStyle &&
                    type.name !== artStyleChemistry.partnerStyle,
                )
                .map((type) => type.name)
                .join(" · ")}
            </p>
          </Card>
        </div>
      </Container>

      {/* PART 2 */}
      <Container maxWidth="max-w-3xl" className="mt-10">
        <PartLabel part="PART 2" title="스타일 분석" />
        <div className="mt-5 flex flex-col gap-3">
          <Card>
            <p className="text-sm font-bold">스타일 궁합</p>
            <div className="mt-3 flex flex-col gap-3">
              {styleCompat.map((item) => (
                <PhotoScoreRow
                  key={item.label}
                  label={item.label}
                  filled={item.filled}
                  photo={`/mood/match-style/${item.label.toLowerCase()}.png`}
                />
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2 border-t pt-3" style={{ borderColor: "var(--match-beige)" }}>
              {styleNotes.map((note) => (
                <p key={note.label} className="text-[11px] leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
                  <span className="font-semibold" style={{ color: "var(--match-ink)" }}>
                    {note.label}
                  </span>{" "}
                  — {note.value}
                </p>
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-sm font-bold">헤어 궁합</p>
            <div className="mt-3 flex items-center justify-between text-center text-xs">
              <div className="flex-1">
                <p className="font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                  {myName}
                </p>
                <p className="mt-1 font-bold">{hairChemistry.my}</p>
              </div>
              <span className="px-2" style={{ color: "var(--match-rose)" }}>
                →
              </span>
              <div className="flex-1">
                <p className="font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                  {partnerName}
                </p>
                <p className="mt-1 font-bold">{hairChemistry.partner}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold">
              <span>Together</span>
              <StarRating filled={hairChemistry.filled} />
            </div>
          </Card>

          <Card>
            <p className="text-sm font-bold">컬러 궁합</p>
            <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
              두 사람이 함께 있을 때 가장 잘 어울리는 메인 컬러 5가지예요.
            </p>
            <div className="mt-3 flex flex-col gap-2.5">
              {colorCompat.map((color) => (
                <div key={color.name} className="flex items-start gap-2.5">
                  <span
                    className="mt-0.5 h-5 w-5 shrink-0 rounded-full"
                    style={{ backgroundColor: color.hex, border: "1px solid var(--match-beige)" }}
                  />
                  <div>
                    <p className="text-xs font-bold">{color.name}</p>
                    <p className="text-[11px] leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
                      {color.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-sm font-bold">코디 궁합</p>
            <div className="mt-3 flex flex-col gap-2.5">
              {itemCompat.map((item) => (
                <ScoreRow key={item.label} label={item.label} filled={item.filled} />
              ))}
            </div>
          </Card>
        </div>
      </Container>

      {/* PART 3 */}
      <Container maxWidth="max-w-3xl" className="mt-10">
        <PartLabel part="PART 3" title="무드 라이프" />
        <div className="mt-5 flex flex-col gap-3">
          <Card>
            <p className="text-sm font-bold">데이트 장소 궁합</p>
            <div className="mt-3 flex flex-col gap-2.5">
              {datePlaceCompat.map((item) => (
                <ScoreRow key={item.label} label={item.label} filled={item.filled} />
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-sm font-bold">사진 컨셉 궁합</p>
            <p className="mt-2 text-xs" style={{ color: "var(--match-ink-soft)" }}>
              둘이 사진 찍으면 가장 잘 나오는 분위기
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {photoConceptTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2.5 py-1 text-[10.5px] font-medium"
                  style={{ backgroundColor: "var(--match-beige)", color: "var(--match-burgundy)" }}
                >
                  #{tag}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2.5 border-t pt-3" style={{ borderColor: "var(--match-beige)" }}>
              {snsConceptCompat.map((item) => (
                <ScoreRow key={item.label} label={item.label} filled={item.filled} />
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-sm font-bold">향기 조합</p>
            <div className="mt-3 flex items-center justify-between text-center text-xs">
              <div className="flex-1">
                <p className="font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                  {myName}
                </p>
                <p className="mt-1 font-bold">{perfumeChemistry.my}</p>
              </div>
              <span className="px-1" style={{ color: "var(--match-rose)" }}>
                →
              </span>
              <div className="flex-1">
                <p className="font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                  {partnerName}
                </p>
                <p className="mt-1 font-bold">{perfumeChemistry.partner}</p>
              </div>
              <span className="px-1" style={{ color: "var(--match-rose)" }}>
                →
              </span>
              <div className="flex-1">
                <p className="font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                  Together
                </p>
                <p className="mt-1 font-bold">{perfumeChemistry.together}</p>
              </div>
            </div>
          </Card>

          <Card>
            <p className="text-sm font-bold">계절 궁합</p>
            <div className="mt-3 flex flex-col gap-2.5">
              {seasonCompat.map((item) => (
                <ScoreRow key={item.label} label={item.label} filled={item.filled} />
              ))}
            </div>
          </Card>
        </div>
      </Container>

      {/* PART 4 */}
      <Container maxWidth="max-w-3xl" className="mt-10">
        <PartLabel part="PART 4" title="공유 리포트" />
        <div className="mt-5 flex flex-col gap-3">
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">종합 Mood Score</p>
              <span
                className="rounded-full px-3 py-1 text-[11px] font-bold text-white"
                style={{ backgroundColor: "var(--match-navy)" }}
              >
                {overallPercentile}
              </span>
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-3xl font-bold" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                {overallMoodScore}
              </span>
              <span className="pb-1 text-xs" style={{ color: "var(--match-ink-soft)" }}>
                / 100
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--match-beige)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${overallMoodScore}%`, backgroundColor: "var(--match-navy)" }}
              />
            </div>
          </Card>

          <Card>
            <p className="text-sm font-bold">분위기 키워드 궁합</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {moodKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full px-2.5 py-1 text-[10.5px] font-medium"
                  style={{ backgroundColor: "var(--match-beige)", color: "var(--match-burgundy)" }}
                >
                  {keyword}
                </span>
              ))}
            </div>
          </Card>

          <div
            className="mx-auto w-full max-w-[220px] overflow-hidden rounded-[24px] shadow-sm"
            style={{ backgroundColor: "white", border: "1px solid var(--match-beige)" }}
          >
            <div className="relative aspect-[4/5] w-full">
              <Image src="/mood/cards/고급도시st.png" alt="공유 카드" fill className="object-cover" />
              <div
                className="absolute inset-x-0 bottom-0 px-4 py-3"
                style={{ background: "linear-gradient(to top, rgba(30,42,58,0.85), transparent)" }}
              >
                <p className="text-sm font-bold text-white">{faceMoodHighlight.pairLabel}</p>
                <p className="text-[11px] font-semibold text-white/80">
                  Mood Chemistry {faceMoodHighlight.score}%
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled
            className="mx-auto flex w-full max-w-[220px] items-center justify-center rounded-full px-6 py-3 text-xs font-semibold opacity-50"
            style={{ backgroundColor: "var(--match-beige)", color: "var(--match-burgundy)" }}
          >
            공유하기 (준비 중)
          </button>
        </div>
      </Container>

      {/* Review */}
      <Container maxWidth="max-w-3xl" className="mt-12">
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.2em]"
          style={{ backgroundColor: "var(--match-beige)", color: "var(--match-burgundy)" }}
        >
          REVIEW
        </span>
        <h2
          className="mt-4 text-lg font-bold leading-snug"
          style={{ fontFamily: "'Noto Serif KR', serif" }}
        >
          먼저 경험한 분들의 이야기
        </h2>

        <div className="mt-5 flex flex-col gap-3">
          {testimonials.map((review) => (
            <div
              key={review.quote}
              className="rounded-[20px] p-5"
              style={{ backgroundColor: "white", border: "1px solid var(--match-beige)" }}
            >
              <span style={{ color: "var(--match-rose)" }}>★★★★★</span>
              <p className="mt-2 text-sm leading-relaxed">&ldquo;{review.quote}&rdquo;</p>
            </div>
          ))}
        </div>
      </Container>

      {/* FAQ */}
      <Container maxWidth="max-w-3xl" className="mt-12">
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.2em]"
          style={{ backgroundColor: "var(--match-beige)", color: "var(--match-burgundy)" }}
        >
          FAQ
        </span>
        <h2
          className="mt-4 text-lg font-bold leading-snug"
          style={{ fontFamily: "'Noto Serif KR', serif" }}
        >
          자주 묻는 질문
        </h2>

        <div className="mt-5 flex flex-col gap-2.5">
          {faqItems.map((item, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={item.q}
                className="rounded-2xl px-5 py-4"
                style={{ backgroundColor: "white", border: "1px solid var(--match-beige)" }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="flex w-full items-center justify-between text-left text-sm font-semibold"
                >
                  <span>Q. {item.q}</span>
                  <span style={{ color: "var(--match-ink-soft)" }}>{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <p
                    className="mt-2.5 text-xs leading-relaxed"
                    style={{ color: "var(--match-ink-soft)" }}
                  >
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Container>

      {/* Final note */}
      <Container maxWidth="max-w-3xl" className="mt-12">
        <div className="rounded-[28px] p-7 text-center text-white" style={{ backgroundColor: "var(--match-navy)" }}>
          <p className="text-base font-bold leading-relaxed" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            실제 사진으로 분석하는 기능은
            <br />
            곧 열릴 예정이에요.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-white/70">
            완성되면 이런 내용을 모두 받아보실 수 있어요.
          </p>

          <ul className="mt-5 flex flex-col gap-2 text-left text-xs text-white/80">
            {includedItems.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span
                  className="h-1 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: "var(--match-rose)" }}
                />
                {item}
              </li>
            ))}
          </ul>

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
