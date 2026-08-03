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
  moodTypeBody:
    "두 분의 사진을 함께 놓고 봤을 때 가장 먼저 눈에 들어온 건 채도예요. 두 분 다 과하게 튀는 색보다 무채색과 뉴트럴 톤 위주로 스타일링을 하고 계셔서, 사진 전체의 톤이 자연스럽게 정돈돼 보였어요. 여기에 한 분은 차분하고 정돈된 인상이, 다른 한 분은 도시적이고 세련된 인상이 강하게 느껴져서, 두 무드가 만났을 때 서로를 깎아 먹지 않고 오히려 서로의 장점을 살려주는 조합이 나왔어요.\n\n특히 배경이나 소품보다 인물 자체의 실루엣이 깔끔하게 정리되어 있다는 점이 Soft City 타입으로 분류된 가장 큰 이유예요. 화려한 패턴이나 액세서리보다 핏과 라인 위주로 스타일링하는 경향이 사진 곳곳에서 드러났고, 이런 절제된 스타일링이 오히려 도시적인 세련미를 만들어내고 있어요.\n\n다만 두 분의 톤이 너무 비슷한 방향으로만 흐르면 사진이 조금 밋밋해 보일 수 있어서, 아래 스타일 궁합과 컬러 궁합에서 안내해드리는 포인트 컬러를 살짝만 더해주시는 걸 추천해요. 그러면 지금의 차분한 매력은 그대로 유지하면서도 사진에서 훨씬 생기 있는 느낌을 낼 수 있을 거예요.",
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
  recommendedMoodsBody:
    "Soft City가 지금 두 분의 현재 무드라면, 아래 세 가지는 같은 두 분이 다른 상황에서 시도해볼 만한 방향이에요. Romantic Classic은 지금의 도시적인 느낌에 부드러운 곡선과 따뜻한 색감을 더한 방향이라, 기념일이나 소개팅처럼 조금 더 다정한 인상을 주고 싶은 자리에 잘 어울려요. 지금 스타일의 뼈대는 그대로 두고 액세서리나 헤어 정도만 바꿔도 충분히 낼 수 있는 무드예요.\n\nVintage Mood는 색감과 질감 쪽에서 변화를 주는 방향이에요. 사진 보정이나 필름 카메라 컨셉과 잘 맞아서, 특별한 날 기록용 사진을 남기고 싶을 때 추천해요. 지금처럼 깔끔한 실루엣에 살짝 바랜 듯한 톤만 얹어도 화보 같은 느낌이 나요.\n\nCozy Natural은 앞의 두 방향과 달리 오히려 힘을 빼는 쪽이에요. 지금의 정돈된 무드가 계속되면 자칫 거리감 있게 보일 수 있는데, 자연스러운 헤어와 편안한 소재를 더하면 평소 데이트나 여행 사진에서 훨씬 친근하고 편안한 인상을 줄 수 있어요. 세 방향 모두 지금의 스타일을 버리는 게 아니라 상황에 맞게 살짝 변주하는 정도라, 부담 없이 하나씩 시도해보시길 추천해요.",
  myMoodLabel: "차분한 시크",
  myMoodNote: "정돈되고 차분한 분위기가 강하게 느껴져요.",
  partnerMoodLabel: "도시적인 세련됨",
  partnerMoodNote: "깔끔하고 세련된 도시적 이미지가 느껴져요.",
  firstImpressionScore: 90,
  synergyScore: 88,
  myArtStyle: "청순그림체",
  partnerArtStyle: "모델그림체",
  artStyleTogether: "감성 드라마 무드",
  part1Body:
    "각자의 사진을 따로 봤을 때, 한 분은 정돈되고 차분한 이미지가 강했고 다른 한 분은 도시적이고 세련된 인상이 두드러졌어요. 이 두 분위기는 방향은 다르지만 둘 다 '과하지 않은' 이미지라는 공통점이 있어서, 두 분이 함께 있을 때 어느 한쪽으로 치우치지 않고 자연스럽게 균형을 이뤄요. 첫인상 조화 점수가 높게 나온 것도 이 지점 때문이에요 — 서로 다른 매력이지만 결이 부딪히지 않아서, 처음 보는 사람 입장에서도 두 분이 잘 어울리는 조합이라는 인상을 받기 쉬워요.\n\n분위기 시너지 점수 역시 비슷한 이유로 높게 측정됐어요. 두 분이 나란히 있을 때 사진 속 시선 처리나 자세가 서로를 향해 자연스럽게 열려 있는 편이라, 어색하게 따로 노는 느낌보다는 한 장면 안에 자연스럽게 녹아드는 느낌이 강해요.\n\n얼굴 그림체 케미에서는 조금 다른 각도로 봤어요. 청순그림체와 모델그림체는 각각 '자연스러움'과 '완성도'를 강조하는 그림체라, 이 둘이 만나면 잔잔한 대사보다는 감정선이 살아있는 드라마 같은 무드가 만들어져요. 사진 한 장으로도 짧은 서사가 느껴지는 조합이라, 커플 화보나 프로필 사진에 이 조합을 활용하면 훨씬 인상적인 결과를 얻을 수 있어요.",
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
  part2Body:
    "스타일 궁합에서는 Casual과 Minimal이 나란히 최고점을 받았어요. 두 분 모두 과한 장식보다 핏과 소재감으로 승부하는 스타일을 선호하시는 편이라, 실제로 옷을 맞춰 입을 때도 무늬나 로고보다 컬러와 실루엣을 맞추는 방향이 훨씬 잘 어울려요. 반대로 Street 항목이 낮게 나온 건 두 분 다 레이어드나 오버사이즈보다는 정돈된 핏을 선호하시기 때문인데, 이건 단점이 아니라 두 분의 스타일 정체성이 뚜렷하다는 뜻이에요.\n\n같이 입으면 좋은 스타일로 미니멀 톤온톤 세트업을 추천드린 이유도 여기 있어요. 색을 하나로 통일하면 자칫 밋밋해 보일 수 있는데, 소재를 다르게 가져가면(예: 니트 + 셔츠) 단조롭지 않으면서도 커플룩 티가 과하게 나지 않는 은은한 매칭이 가능해요.\n\n헤어 궁합에서는 레이어드와 댄디 스타일이 만나 안정적인 조화를 이루고 있어요. 둘 다 자연스러운 흐름을 살리는 스타일이라 서로 부딪히지 않고, 사진에서도 각자의 개성이 살아있으면서 전체적으로는 정돈된 인상을 줘요.\n\n컬러 궁합에서 안내해드린 베이지·올리브·크림·네이비·테라코타는 모두 두 분의 웜톤 베이스를 살려주는 컬러예요. 특히 테라코타는 포인트로만 살짝 써도 사진 전체에 온기를 더해주니, 데이트룩 코디할 때 스카프나 액세서리로 활용해보시길 추천해요.",
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
  part3Body:
    "데이트 장소 궁합에서 미술관과 카페가 나란히 높은 점수를 받은 건, 두 분의 스타일이 요란한 배경보다 정돈된 공간에서 오히려 돋보이는 타입이기 때문이에요. 반대로 놀이공원처럼 배경이 화려하고 동선이 많은 곳에서는 지금의 차분한 무드가 상대적으로 묻힐 수 있어서 조금 낮게 나왔어요. 사진을 예쁘게 남기고 싶다면 미술관이나 조용한 카페 골목처럼 여백이 있는 공간을 우선순위로 잡아보세요.\n\n사진 컨셉에서는 카페, 노을, 전시회, 여행, 필름카메라 다섯 가지를 추천드렸어요. 특히 필름카메라와 노을 조합은 SNS 컨셉 궁합에서도 높은 점수가 나왔는데, 정돈된 실루엣에 따뜻한 광량이 더해지면 사진 특유의 분위기가 배가되기 때문이에요. 미러샷 역시 점수가 높게 나왔는데, 이는 두 분의 자세와 시선 처리가 자연스러워서 정면보다 오히려 비스듬한 구도에서 매력이 더 잘 살기 때문이에요.\n\n향기 조합은 각자의 개성과 두 분이 함께 있을 때의 무드를 모두 고려해서 추천해드렸어요. 계절 궁합에서는 여름과 가을이 가장 높게 나왔는데, 두 분의 톤이 선명한 계절광보다는 은은하게 퍼지는 빛과 잘 어울리기 때문이에요. 봄처럼 파스텔 톤이 강한 계절보다는, 여름의 청량함이나 가을의 차분한 색감이 두 분의 무드를 더 살려줄 거예요.",
  overallMoodScore: 91,
  overallPercentile: "상위 8%",
  moodKeywords: ["Calm", "Warm", "Classic", "Elegant", "Natural", "Vintage"],
  part4Body:
    "전체적으로 봤을 때 두 분은 각자의 개성을 지키면서도 함께 있을 때 자연스럽게 균형을 이루는, 꽤 드문 조합이에요. Soft City라는 무드 타입 자체가 '과하지 않게 세련된' 방향인데, 두 분 모두 이 결을 스타일뿐 아니라 표정과 자세에서도 자연스럽게 갖고 계세요. 그래서 종합 Mood Score도 91점으로 높게 나왔고, 이는 지금까지 분석한 프로필 중 상위 8%에 해당하는 수치예요.\n\n분위기 키워드로 뽑힌 Calm, Warm, Classic, Elegant, Natural, Vintage는 언뜻 보면 서로 다른 결처럼 보이지만, 실제로는 '차분함'이라는 큰 줄기 안에서 조금씩 다른 온도를 가진 단어들이에요. 이 키워드들을 그대로 공유 카드나 SNS 소개 문구에 활용하셔도 좋고, 데이트룩이나 사진 컨셉을 정할 때 참고 단어로 써보셔도 좋아요.\n\n이 리포트는 두 분의 사진과 답변을 바탕으로 시각적인 분위기와 스타일 조화만 분석한 결과이고, 실제 관계의 좋고 나쁨이나 미래를 예측하는 내용은 담고 있지 않아요. 대신 지금 두 분이 사진으로, 스타일로, 그리고 함께 보내는 순간들로 어떤 이미지를 만들어갈 수 있는지에 대한 참고 자료로 편하게 봐주시면 좋겠어요.",
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
