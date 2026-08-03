"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/app/components/Container";
import StarRating from "@/app/components/StarRating";
import MatchReportBody from "@/app/match/MatchReportBody";
import type { MatchFullReport } from "@/types/matchReport";

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

// Canned example content for the free preview — the real, personalized
// report is only generated after checkout (see /match/report), same
// policy as the main FACEMOOD product's /result vs /report split.
const MOCK_REPORT: MatchFullReport = {
  pairLabel: "SOFT × CHIC",
  pairScore: 89,
  pairBullets: [
    "함께 있을 때 만들어지는 분위기",
    "첫인상 조화",
    "서로의 이미지 시너지",
    "분위기 밸런스",
  ],
  moodTypeName: "Soft City",
  moodTypeScore: 89,
  moodTypeSummary:
    "차분한 무드와 도시적인 세련됨이 만나 균형 잡힌 분위기를 만들어내는 조합이에요.",
  moodTypeKeywords: ["Calm", "Urban", "Elegant", "Balanced", "Chic"],
  recommendedMoods: [
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
  ],
  myMoodLabel: "차분한 시크",
  myMoodNote: "정돈되고 차분한 분위기가 강하게 느껴져요.",
  partnerMoodLabel: "도시적인 세련됨",
  partnerMoodNote: "깔끔하고 세련된 도시적 이미지가 느껴져요.",
  firstImpressionScore: 90,
  synergyScore: 88,
  myArtStyle: "청순그림체",
  partnerArtStyle: "모델그림체",
  artStyleTogether: "감성 드라마 무드",
  styleCompat: [
    { label: "Casual", filled: 5 },
    { label: "Minimal", filled: 5 },
    { label: "Street", filled: 2 },
    { label: "Classic", filled: 4 },
    { label: "Formal", filled: 3 },
    { label: "Vintage", filled: 4 },
  ],
  styleGoodNote: "미니멀 톤온톤 세트업",
  styleAvoidNote: "과한 로고 플레이 아이템",
  coupleLookDirection: "캐주얼 베이스 + 포인트 컬러",
  myHair: "레이어드",
  partnerHair: "댄디",
  hairTogetherScore: 4,
  colorCompat: [
    { name: "Beige", hex: "#D8C3A5", reason: "두 사람의 톤을 자연스럽게 이어주는 뉴트럴 베이스예요." },
    { name: "Olive", hex: "#7C7C4A", reason: "차분하면서도 개성 있는 무드를 더해줘요." },
    { name: "Cream", hex: "#F1E9D8", reason: "부드럽고 편안한 인상을 만들어줘요." },
    { name: "Navy", hex: "#2C3E50", reason: "세련되고 안정감 있는 포인트 컬러로 잘 어울려요." },
    { name: "Terracotta", hex: "#C57B57", reason: "두 사람의 웜톤을 살려주는 따뜻한 포인트예요." },
  ],
  itemCompat: [
    { label: "Silver", filled: 5 },
    { label: "Gold", filled: 2 },
    { label: "Denim", filled: 5 },
    { label: "Leather", filled: 4 },
  ],
  datePlaceCompat: [
    { label: "미술관", filled: 5 },
    { label: "카페", filled: 5 },
    { label: "놀이공원", filled: 3 },
    { label: "캠핑", filled: 4 },
  ],
  photoConceptTags: ["카페", "노을", "전시회", "여행", "필름카메라"],
  snsConceptCompat: [
    { label: "필름감성", filled: 5 },
    { label: "노을", filled: 4 },
    { label: "미러샷", filled: 5 },
    { label: "카페", filled: 5 },
  ],
  myPerfume: "Byredo",
  partnerPerfume: "Le Labo",
  togetherPerfume: "Maison Margiela",
  seasonCompat: [
    { label: "여름", filled: 5 },
    { label: "가을", filled: 5 },
    { label: "겨울", filled: 4 },
    { label: "봄", filled: 3 },
  ],
  overallMoodScore: 91,
  overallPercentile: "상위 8%",
  moodKeywords: ["Calm", "Warm", "Classic", "Elegant", "Natural", "Vintage"],
};

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
                {MOCK_REPORT.pairLabel}
              </p>
              <p className="text-xl font-bold" style={{ color: "var(--match-burgundy)" }}>
                {MOCK_REPORT.pairScore}%
              </p>
            </div>
            <StarRating filled={MOCK_REPORT.pairScore / 20} />
            <ul className="mt-3 flex flex-col gap-1.5">
              {MOCK_REPORT.pairBullets.map((bullet) => (
                <li key={bullet} className="text-xs leading-relaxed" style={{ color: "var(--match-ink)" }}>
                  · {bullet}
                </li>
              ))}
            </ul>
          </div>

          <p className="mx-auto mt-4 max-w-xs text-[11px] leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
            지금 보시는 리포트는 예시 구성이에요. 실제 결제 후에는 두 분의
            사진과 답변으로 직접 분석한 리포트를 받아보실 수 있어요.
          </p>
        </Container>
      </div>

      <Container maxWidth="max-w-3xl">
        <MatchReportBody report={MOCK_REPORT} myName={myName} partnerName={partnerName} />
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

      {/* Final CTA */}
      <Container maxWidth="max-w-3xl" className="mt-12">
        <div className="rounded-[28px] p-7 text-center text-white" style={{ backgroundColor: "var(--match-navy)" }}>
          <p className="text-base font-bold leading-relaxed" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            우리 커플 무드 리포트,
            <br />
            지금 바로 받아보세요.
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
            href="/match/checkout"
            className="mt-6 inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-semibold"
            style={{ backgroundColor: "var(--match-ivory)", color: "var(--match-navy)" }}
          >
            리포트 받기
          </Link>
        </div>
      </Container>
    </main>
  );
}
