"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/app/components/Container";
import DiscountCountdownBar from "@/app/components/DiscountCountdownBar";
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

// Picked once per page load (not per render) so reloading the preview
// shows a different example, while useSyncExternalStore keeps the very
// first client render consistent with the server-rendered markup.
let cachedVariantIndex: number | null = null;
function getVariantIndexSnapshot() {
  if (cachedVariantIndex === null) {
    cachedVariantIndex = Math.floor(Math.random() * MOCK_REPORT_VARIANTS.length);
  }
  return cachedVariantIndex;
}
function getServerVariantIndexSnapshot() {
  return 0;
}

// Canned example content for the free preview — the real, personalized
// report is only generated after checkout (see /match/report), same
// policy as the main FACEMOOD product's /result vs /report split. Several
// variants exist so reloading the preview doesn't always show the exact
// same example (see pickRandomVariant below); the detail bodies are shown
// blurred/locked either way, so their exact wording matters less than the
// visible scores/labels varying.
const MOCK_REPORT_VARIANTS: MatchFullReport[] = [
  {
  pairLabel: "SOFT × CHIC",
  pairScore: 89,
  pairBullets: [
    "함께 있을 때 만들어지는 분위기",
    "첫인상 조화",
    "서로의 이미지 시너지",
    "분위기 밸런스",
  ],
  firstImpressionScore: 90,
  synergyScore: 88,
  firstImpressionBody:
    "각자의 사진을 따로 봤을 때, 한 분은 정돈되고 차분한 이미지가 강했고 다른 한 분은 도시적이고 세련된 인상이 두드러졌어요. 이 두 분위기는 방향은 다르지만 둘 다 '과하지 않은' 이미지라는 공통점이 있어서, 두 분이 함께 있을 때 어느 한쪽으로 치우치지 않고 자연스럽게 균형을 이뤄요. 첫인상 조화 점수가 90점으로 높게 나온 것도 이 지점 때문이에요 — 서로 다른 매력이지만 결이 부딪히지 않아서, 처음 보는 사람 입장에서도 두 분이 잘 어울리는 조합이라는 인상을 받기 쉬워요.\n\n분위기 시너지 점수도 88점으로 비슷한 이유로 높게 측정됐어요. 두 분이 나란히 있을 때 사진 속 시선 처리나 자세가 서로를 향해 자연스럽게 열려 있는 편이라, 어색하게 따로 노는 느낌보다는 한 장면 안에 자연스럽게 녹아드는 느낌이 강해요. 배경이나 소품에 기대지 않고 인물 자체의 실루엣과 표정만으로도 조화가 느껴지는 편이라, 어떤 장소에서 찍어도 두 분의 케미가 먼저 눈에 들어와요.\n\n다른 사람들 눈에는 두 분이 '따로 봐도 각자 멋있는데, 같이 있으면 더 잘 어울리는' 커플로 비칠 가능성이 높아요. 이런 첫인상은 소개팅이나 첫 만남처럼 짧은 시간에 인상을 남겨야 하는 자리에서 특히 유리하게 작용해요.",
  myArtStyle: "청순그림체",
  partnerArtStyle: "모델그림체",
  artStyleTogether: "감성 드라마 무드",
  artStyleBody:
    "얼굴 그림체는 사진에서 느껴지는 분위기를 그림체에 비유해서 표현한 재미있는 분류예요. 청순그림체는 자연스러움과 순한 인상을 강조하는 그림체이고, 모델그림체는 또렷한 이목구비와 완성도 있는 비율을 강조하는 그림체예요. 두 그림체가 만나면 잔잔한 일상 대사보다는 감정선이 살아있는 드라마 같은 무드가 만들어져요.\n\n이런 조합은 사진 한 장에서도 짧은 서사가 느껴진다는 점이 특징이에요. 한쪽은 편안하고 다정한 표정을, 다른 쪽은 정돈되고 세련된 표정을 자연스럽게 짓는 편이라, 나란히 섰을 때 화면 안에 대비와 조화가 동시에 생겨요. 이 대비가 오히려 두 분을 더 기억에 남는 조합으로 만들어줘요.\n\n이 조합을 프로필 사진이나 커플 화보에 활용한다면, 두 분이 각자의 장점을 살리는 각도와 표정을 유지하면서 톤(색감, 소품)만 맞춰주는 게 좋아요. 그림체 자체를 억지로 비슷하게 맞추려 하기보다, 지금처럼 서로 다른 매력을 각자 살려주는 방향이 이 조합의 진짜 강점이에요.",
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
  moodMatchBody:
    "두 분의 사진을 함께 놓고 봤을 때 가장 먼저 눈에 들어온 건 채도예요. 두 분 다 과하게 튀는 색보다 무채색과 뉴트럴 톤 위주로 스타일링을 하고 계셔서, 사진 전체의 톤이 자연스럽게 정돈돼 보였어요. 여기에 한 분은 차분하고 정돈된 인상이, 다른 한 분은 도시적이고 세련된 인상이 강하게 느껴져서, 두 무드가 만났을 때 서로를 깎아 먹지 않고 오히려 서로의 장점을 살려주는 조합이 나왔어요.\n\n특히 배경이나 소품보다 인물 자체의 실루엣이 깔끔하게 정리되어 있다는 점이 Soft City 타입으로 분류된 가장 큰 이유예요. 화려한 패턴이나 액세서리보다 핏과 라인 위주로 스타일링하는 경향이 사진 곳곳에서 드러났고, 이런 절제된 스타일링이 오히려 도시적인 세련미를 만들어내고 있어요.\n\nSoft City가 지금 두 분의 현재 무드라면, Romantic Classic·Vintage Mood·Cozy Natural은 같은 두 분이 다른 상황에서 시도해볼 만한 방향이에요. Romantic Classic은 지금의 도시적인 느낌에 부드러운 곡선과 따뜻한 색감을 더한 방향이라 기념일이나 소개팅에 잘 어울리고, Vintage Mood는 색감과 질감에 변화를 주는 방향이라 특별한 날 기록용 사진에 잘 맞아요. Cozy Natural은 오히려 힘을 빼는 방향이라 평소 데이트나 여행 사진에서 더 친근한 인상을 줄 수 있어요. 세 방향 모두 지금 스타일의 뼈대는 그대로 두고 살짝 변주하는 정도라 부담 없이 시도해보시길 추천해요.",
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
  moodboardBody:
    "스타일 궁합에서 가장 높은 점수를 받은 Casual과 Minimal, 그리고 어울리는 컬러 팔레트(베이지·올리브·크림·네이비·테라코타)를 함께 놓고 보면, 두 분에게 잘 맞는 방향은 '뉴트럴 베이스 위에 딱 하나의 포인트 컬러'예요. 옷장을 화려하게 채우기보다, 무채색과 베이지 계열을 기본 축으로 두고 테라코타나 네이비 같은 컬러를 스카프, 신발, 액세서리로 살짝만 더하는 방식이 지금의 캐주얼 베이스 + 포인트 컬러 방향과 정확히 맞아떨어져요.\n\n이렇게 조합하면 사진을 찍을 때 배경이 어디든 자연스럽게 톤이 맞아, 억지로 커플룩을 맞춘 티가 나지 않으면서도 함께 있을 때 훨씬 정돈되고 조화로운 그림이 완성돼요. 소재를 다르게 가져가는 것도 중요한 포인트예요 — 같은 컬러라도 니트와 셔츠처럼 질감을 다르게 섞으면 단조롭지 않으면서 은은한 통일감을 낼 수 있어요.",
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
  colorCompatBody:
    "다섯 가지 컬러 모두 두 분 사진에서 공통적으로 발견되는 웜 뉴트럴 베이스에서 출발했어요. 베이지와 크림은 피부 톤을 밝고 편안하게 보여주는 기본 컬러라 상의나 이너로 활용하기 좋고, 올리브는 여기에 차분한 개성을 더해주는 서브 컬러예요. 네이비와 테라코타는 포인트로 쓰기 좋은 컬러인데, 특히 두 분의 사진에서 반복적으로 관찰된 무채색 베이스 위에 이 두 컬러를 매치하면 화면이 훨씬 생기 있어 보여요.\n\n반대로 형광톤이나 원색 계열, 과한 로고 플레이 아이템은 지금의 정돈된 무드와 부딪히기 쉬워서 피하는 걸 추천해요. 색을 더하고 싶을 때는 원색보다 지금 팔레트 안에서 채도만 살짝 높이는 정도로 조절하면, 튀지 않으면서도 화사한 느낌을 낼 수 있어요.",
  styleCompatBody:
    "스타일 궁합에서는 Casual과 Minimal이 나란히 최고점을 받았어요. 두 분 모두 과한 장식보다 핏과 소재감으로 승부하는 스타일을 선호하시는 편이라, 실제로 옷을 맞춰 입을 때도 무늬나 로고보다 컬러와 실루엣을 맞추는 방향이 훨씬 잘 어울려요. 반대로 Street 항목이 낮게 나온 건 두 분 다 레이어드나 오버사이즈보다는 정돈된 핏을 선호하시기 때문인데, 이건 단점이 아니라 두 분의 스타일 정체성이 뚜렷하다는 뜻이에요.\n\n같이 입으면 좋은 스타일로 미니멀 톤온톤 세트업을 추천드린 이유도 여기 있어요. 색을 하나로 통일하면 자칫 밋밋해 보일 수 있는데, 소재를 다르게 가져가면(예: 니트 + 셔츠) 단조롭지 않으면서도 커플룩 티가 과하게 나지 않는 은은한 매칭이 가능해요.\n\n헤어 궁합에서는 레이어드와 댄디 스타일이 만나 안정적인 조화를 이루고 있어요(헤어 궁합 4/5). 둘 다 자연스러운 흐름을 살리는 스타일이라 서로 부딪히지 않고, 사진에서도 각자의 개성이 살아있으면서 전체적으로는 정돈된 인상을 줘요.\n\n아이템 궁합에서는 Silver와 Denim이 5점 만점으로 가장 높게 나왔어요. 골드 액세서리보다 실버 톤이 두 분의 뉴트럴한 무드와 더 잘 어울리고, 데님은 캐주얼과 미니멀을 자연스럽게 이어주는 소재라 데일리룩에 활용하기 좋아요.",
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
  myPerfume: "우디 머스크 향",
  partnerPerfume: "시트러스 그린 향",
  togetherPerfume: "우디 시트러스 향",
  seasonCompat: [
    { label: "여름", filled: 5 },
    { label: "가을", filled: 5 },
    { label: "겨울", filled: 4 },
    { label: "봄", filled: 3 },
  ],
  dateSnsBody:
    "데이트 장소 궁합에서 미술관과 카페가 나란히 높은 점수를 받은 건, 두 분의 스타일이 요란한 배경보다 정돈된 공간에서 오히려 돋보이는 타입이기 때문이에요. 반대로 놀이공원처럼 배경이 화려하고 동선이 많은 곳에서는 지금의 차분한 무드가 상대적으로 묻힐 수 있어서 조금 낮게 나왔어요. 사진을 예쁘게 남기고 싶다면 미술관이나 조용한 카페 골목처럼 여백이 있는 공간을 우선순위로 잡아보세요.\n\n사진 컨셉에서는 카페, 노을, 전시회, 여행, 필름카메라 다섯 가지를 추천드렸어요. 특히 필름카메라와 노을 조합은 SNS 컨셉 궁합에서도 높은 점수가 나왔는데, 정돈된 실루엣에 따뜻한 광량이 더해지면 사진 특유의 분위기가 배가되기 때문이에요. 미러샷 역시 점수가 높게 나왔는데, 이는 두 분의 자세와 시선 처리가 자연스러워서 정면보다 오히려 비스듬한 구도에서 매력이 더 잘 살기 때문이에요.\n\n계절 궁합에서는 여름과 가을이 가장 높게 나왔는데, 두 분의 톤이 선명한 계절광보다는 은은하게 퍼지는 빛과 잘 어울리기 때문이에요. 봄처럼 파스텔 톤이 강한 계절보다는, 여름의 청량함이나 가을의 차분한 색감이 두 분의 무드를 더 살려줄 거예요.",
  perfumeBody:
    "우디 머스크 향은 차분하고 정돈된 인상을 은은하게 뒷받침해주는 향으로, 지금의 정돈된 이미지와 잘 맞아요. 시트러스 그린 향은 여기에 산뜻함을 더해서, 도시적인 세련됨이 자칫 차갑게 느껴지지 않도록 균형을 잡아줘요. 두 향 모두 무겁지 않고 은은하게 퍼지는 계열이라, 가까이 있을 때 부담스럽지 않으면서도 분위기 있는 인상을 남길 수 있어요.\n\n함께일 때는 우디와 시트러스가 섞이면서 '깔끔하지만 차갑지 않은' 무드가 완성돼요. 데이트할 때는 우디 계열을 조금 더 진하게, 그린 시트러스 계열을 가볍게 겹치면 두 분이 나란히 있을 때 향이 서로를 해치지 않고 자연스럽게 섞여요. 향수는 손목보다 옷깃이나 머리카락 끝에 살짝 뿌리면 은은하게 오래 남아 지금의 절제된 스타일링과도 잘 어울려요.",
  overallMoodScore: 91,
  overallPercentile: "상위 8%",
  moodKeywords: ["Calm", "Warm", "Classic", "Elegant", "Natural", "Vintage"],
  finalBody:
    "전체적으로 봤을 때 두 분은 각자의 개성을 지키면서도 함께 있을 때 자연스럽게 균형을 이루는, 꽤 드문 조합이에요. Soft City라는 무드 타입 자체가 '과하지 않게 세련된' 방향인데, 두 분 모두 이 결을 스타일뿐 아니라 표정과 자세에서도 자연스럽게 갖고 계세요. 그래서 종합 Mood Score도 91점으로 높게 나왔고, 이는 지금까지 분석한 프로필 중 상위 8%에 해당하는 수치예요.\n\n분위기 키워드로 뽑힌 Calm, Warm, Classic, Elegant, Natural, Vintage는 언뜻 보면 서로 다른 결처럼 보이지만, 실제로는 '차분함'이라는 큰 줄기 안에서 조금씩 다른 온도를 가진 단어들이에요. 이 키워드들을 그대로 공유 카드나 SNS 소개 문구에 활용하셔도 좋고, 데이트룩이나 사진 컨셉을 정할 때 참고 단어로 써보셔도 좋아요.\n\n이 리포트는 두 분의 사진과 답변을 바탕으로 시각적인 분위기와 스타일 조화만 분석한 결과이고, 실제 관계의 좋고 나쁨이나 미래를 예측하는 내용은 담고 있지 않아요. 대신 지금 두 분이 사진으로, 스타일로, 그리고 함께 보내는 순간들로 어떤 이미지를 만들어갈 수 있는지에 대한 참고 자료로 편하게 봐주시면 좋겠어요.",
  },
  {
    pairLabel: "VINTAGE × ROMANCE",
    pairScore: 85,
    pairBullets: [
      "빈티지한 색감이 만드는 무드",
      "닮은 듯 다른 두 분위기",
      "사진에서 살아나는 케미",
      "은은한 로맨틱 밸런스",
    ],
    firstImpressionScore: 86,
    synergyScore: 84,
    firstImpressionBody:
      "각자의 사진을 보면 한 분은 로맨틱하고 부드러운 인상이, 다른 한 분은 차분하고 정돈된 인상이 강하게 느껴져요. 두 분위기 모두 '과하지 않은 따뜻함'이라는 공통점이 있어서 자연스럽게 어우러지고, 이 지점이 첫인상 조화 점수가 86점으로 높게 나온 이유예요. 방향은 다르지만 온도가 비슷해서, 처음 보는 사람도 두 분을 자연스럽게 한 쌍으로 인식하기 쉬워요.\n\n분위기 시너지 점수도 84점으로 준수하게 나왔어요. 두 분 다 사진 속에서 힘을 빼고 편안한 자세를 취하는 편이라, 나란히 있을 때 뻣뻣하거나 어색한 느낌 없이 자연스러운 장면이 만들어져요. 특히 시선을 정면보다 살짝 비껴 두는 경향이 공통적으로 보여서, 이게 두 분 사진 특유의 잔잔한 필름 감성으로 이어지고 있어요.\n\n다른 사람들 눈에는 두 분이 오래 함께한 듯한, 편안하면서도 은은하게 다정한 인상으로 비칠 가능성이 높아요.",
    myArtStyle: "빈티지그림체",
    partnerArtStyle: "일본감성그림체",
    artStyleTogether: "노스탤지어 감성 무드",
    artStyleBody:
      "빈티지그림체는 색감과 질감에서 오는 아날로그적인 분위기를 강조하는 그림체이고, 일본감성그림체는 잔잔하고 담백한 톤, 영화적인 정서를 강조하는 그림체예요. 두 그림체 모두 화려함보다 '분위기'로 승부한다는 공통점이 있어서, 이 둘이 만나면 사진 한 장이 짧은 이야기처럼 느껴지는 노스탤지어 감성 무드가 완성돼요.\n\n이 조합의 강점은 배경이나 조명이 완벽하지 않아도 두 분의 표정과 색감만으로 충분히 그림이 된다는 점이에요. 실제로 필름 카메라나 자연광 촬영과 특히 잘 맞는 조합이라, 스튜디오보다 골목길이나 카페 같은 일상적인 공간에서 오히려 매력이 잘 살아나요.\n\n이 그림체 케미를 살리고 싶다면 사진을 너무 밝고 선명하게 보정하기보다, 채도를 살짝 낮추고 따뜻한 톤을 유지하는 편이 좋아요. 두 그림체가 원래 가진 '바랜 듯한' 감성을 인위적으로 지우지 않는 게 이 조합의 매력을 가장 잘 살리는 방법이에요.",
    moodTypeName: "Vintage Mood",
    moodTypeScore: 85,
    moodTypeSummary:
      "빈티지한 색감과 은은한 로맨틱 무드가 만나 화보 같은 분위기를 만들어내는 조합이에요.",
    moodTypeKeywords: ["Vintage", "Romantic", "Warm", "Soft", "Nostalgic"],
    recommendedMoods: [
      { name: "Quiet Luxury", reason: "차분한 럭셔리 무드를 더하면 사진이 한층 더 고급스러워 보여요." },
      { name: "Fresh Campus", reason: "산뜻한 분위기를 더하면 평소 데이트에서 훨씬 편안한 느낌을 줄 수 있어요." },
      { name: "Chic Date", reason: "톤을 살짝 정돈하면 특별한 자리에서 세련된 인상을 줄 수 있어요." },
    ],
    moodMatchBody:
      "두 분 사진에서 공통적으로 느껴지는 건 채도가 살짝 낮춰진 듯한 따뜻한 톤이에요. 선명하고 쨍한 색보다 바랜 듯한 색감을 자연스럽게 선호하시는 편이라, 사진 전체에 잔잔한 필름 감성이 묻어나요. 여기에 한 분의 로맨틱한 분위기와 다른 한 분의 차분한 분위기가 만나면서, 너무 달콤하지도 너무 건조하지도 않은 균형이 만들어졌어요.\n\n이런 조합은 사진으로 남길 때 특히 매력이 살아나요. 필름 카메라나 자연광 위주의 촬영과 잘 맞고, 배경이 화려하지 않아도 두 분의 표정과 분위기만으로 충분히 그림이 되는 타입이에요.\n\n지금의 빈티지 로맨스 무드에 살짝 변화를 주고 싶다면 Quiet Luxury·Fresh Campus·Chic Date를 참고해보세요. Quiet Luxury는 지금의 따뜻한 톤에 절제된 무게감을 더한 방향이라 특별한 자리에 잘 어울리고, Fresh Campus는 반대로 힘을 뺀 편안한 방향이라 일상 데이트에 잘 맞아요. Chic Date는 지금의 로맨틱함을 유지하면서 실루엣만 조금 더 정돈하는 방향이라, 부담 없이 시도해볼 수 있어요.",
    styleCompat: [
      { label: "Casual", filled: 4 },
      { label: "Minimal", filled: 3 },
      { label: "Street", filled: 2 },
      { label: "Classic", filled: 5 },
      { label: "Formal", filled: 3 },
      { label: "Vintage", filled: 5 },
    ],
    styleGoodNote: "빈티지 니트 + 클래식 소재 매치",
    styleAvoidNote: "형광 톤의 스포티한 아이템",
    coupleLookDirection: "웜톤 베이스 + 클래식 실루엣",
    moodboardBody:
      "스타일 궁합에서 가장 높은 Classic·Vintage 점수와, 어울리는 컬러 팔레트(러스트·크림·올리브·머스타드·브라운)를 함께 보면 두 분에게 맞는 방향은 뚜렷해요 — 웜톤 베이스 위에 클래식한 실루엣을 유지하는 거예요. 크림이나 브라운 같은 뉴트럴 톤을 기본으로 깔고, 러스트나 머스타드처럼 채도 있는 컬러는 니트나 액세서리로 포인트만 주는 방식이 가장 자연스러워요.\n\n실루엣은 트렌디한 오버사이즈보다 몸에 잘 맞는 클래식한 핏을 유지하는 편이 이 무드보드와 어울려요. 여기에 골드 계열 액세서리를 살짝 더하면, 두 분의 빈티지한 색감과 만나 특별한 자리에서도 화보 같은 완성도를 낼 수 있어요.",
    myHair: "웨이브 롱",
    partnerHair: "미디움 레이어드",
    hairTogetherScore: 4,
    colorCompat: [
      { name: "Rust", hex: "#B5583A", reason: "따뜻한 톤을 살려주는 포인트 컬러예요." },
      { name: "Cream", hex: "#F1E6D3", reason: "부드러운 무드를 만들어주는 베이스 컬러예요." },
      { name: "Olive", hex: "#7C7C4A", reason: "차분하면서도 빈티지한 느낌을 더해줘요." },
      { name: "Mustard", hex: "#C9A24B", reason: "은은한 포인트로 활용하면 화보 같은 느낌을 줘요." },
      { name: "Brown", hex: "#5C4433", reason: "두 분의 톤을 자연스럽게 이어주는 컬러예요." },
    ],
    colorCompatBody:
      "다섯 컬러 모두 두 분 사진에서 반복적으로 관찰된 웜톤을 기준으로 골랐어요. 크림과 브라운은 베이스로 쓰기 좋은 컬러라 이너나 아우터에 활용하면 안정적이고, 러스트와 머스타드는 포인트로 쓸 때 사진에서 특히 눈에 띄는 컬러예요. 올리브는 이 둘을 자연스럽게 이어주는 중간 톤 역할을 해요.\n\n반대로 형광 톤이나 채도가 쨍한 스포티 컬러는 지금의 웜톤 무드와 부딪혀서 피하는 게 좋아요. 컬러를 고를 때 '선명함'보다 '깊이감'을 기준으로 생각하시면 이 팔레트를 실패 없이 활용하실 수 있어요.",
    itemCompat: [
      { label: "Silver", filled: 2 },
      { label: "Gold", filled: 5 },
      { label: "Denim", filled: 3 },
      { label: "Leather", filled: 5 },
    ],
    styleCompatBody:
      "스타일 궁합에서는 Classic과 Vintage가 나란히 최고점을 받았어요. 두 분 모두 유행을 빠르게 따라가기보다 시간이 지나도 질리지 않는 스타일을 선호하시는 편이에요. 반대로 Street 항목이 낮게 나온 건 두 분 다 캐주얼한 레이어드보다 정돈된 실루엣을 선호하시기 때문이에요.\n\n헤어 궁합에서는 웨이브 롱과 미디움 레이어드가 만나 부드러운 흐름을 만들어요(헤어 궁합 4/5). 두 헤어스타일 모두 자연스러운 웨이브감을 살리는 편이라, 사진에서 잔잔한 움직임이 느껴지는 인상을 줘요.\n\n아이템 궁합에서는 Gold와 Leather가 5점 만점을 받았어요. 실버보다 골드 액세서리가 지금의 웜톤과 훨씬 잘 어울리고, 레더 소재는 클래식한 실루엣에 무게감을 더해줘서 빈티지 무드를 한층 살려줘요.",
    datePlaceCompat: [
      { label: "빈티지 카페", filled: 5 },
      { label: "서점", filled: 5 },
      { label: "놀이공원", filled: 2 },
      { label: "전시회", filled: 4 },
    ],
    photoConceptTags: ["필름카메라", "골목길", "서점", "노을", "빈티지 소품"],
    snsConceptCompat: [
      { label: "필름감성", filled: 5 },
      { label: "골목 스냅", filled: 5 },
      { label: "인물 클로즈업", filled: 4 },
      { label: "노을", filled: 4 },
    ],
    myPerfume: "앰버 바닐라 향",
    partnerPerfume: "우디 스파이시 향",
    togetherPerfume: "앰버 우디 향",
    seasonCompat: [
      { label: "가을", filled: 5 },
      { label: "겨울", filled: 4 },
      { label: "여름", filled: 3 },
      { label: "봄", filled: 3 },
    ],
    dateSnsBody:
      "데이트 장소 궁합에서는 빈티지 카페와 서점이 가장 높은 점수를 받았어요. 요란한 배경보다 조용하고 정돈된 공간에서 두 분의 무드가 더 잘 살아나기 때문이에요. 사진 컨셉으로는 필름카메라, 골목길, 서점, 노을, 빈티지 소품을 추천드려요. 특히 필름카메라와 골목 스냅 조합은 SNS 컨셉 궁합에서도 5점 만점이 나왔는데, 정돈되지 않은 듯한 자연스러운 구도가 오히려 두 분의 감성을 잘 담아내기 때문이에요.\n\n계절 궁합에서는 가을과 겨울이 가장 높게 나왔는데, 두 분의 톤이 따뜻하고 깊은 계절광과 특히 잘 어울리기 때문이에요.",
    perfumeBody:
      "앰버 바닐라 향은 따뜻하고 포근한 인상을 더해주는 향으로, 지금의 로맨틱한 무드와 자연스럽게 어울려요. 우디 스파이시 향은 여기에 무게감을 더해서, 전체적인 분위기가 너무 달콤한 쪽으로만 흐르지 않게 균형을 잡아줘요. 두 향 모두 겨울철에 특히 잘 어울리는 계열이라, 지금 계절 궁합에서 가을·겨울이 높게 나온 것과도 결이 맞아요.\n\n함께일 때는 앰버와 우디가 섞이면서 깊이감 있는 무드가 완성돼요. 실내 데이트나 저녁 약속처럼 조명이 은은한 자리에서 이 조합이 특히 잘 느껴지고, 향수는 진하게 여러 번 뿌리기보다 옷에 한 번, 손목에 살짝 한 번 정도로 절제해서 쓰는 게 지금의 차분한 무드와 더 잘 맞아요.",
    overallMoodScore: 88,
    overallPercentile: "상위 12%",
    moodKeywords: ["Vintage", "Warm", "Romantic", "Classic", "Nostalgic", "Soft"],
    finalBody:
      "전체적으로 두 분은 트렌드보다 시간이 지나도 변하지 않는 분위기를 자연스럽게 지향하고 계세요. 그래서 종합 Mood Score도 88점으로 높게 나왔고, 이는 상위 12%에 해당하는 수치예요.\n\n분위기 키워드로 뽑힌 Vintage, Warm, Romantic, Classic, Nostalgic, Soft는 모두 '따뜻함'이라는 큰 줄기 안에 있는 단어들이에요. 데이트룩이나 사진 컨셉을 정할 때 참고해보세요.\n\n이 리포트는 두 분의 사진과 답변을 바탕으로 시각적인 분위기와 스타일 조화만 분석한 결과예요. 지금처럼 색감과 분위기를 자연스럽게 유지하시면서, 위에서 안내한 컬러와 스타일 방향을 하나씩 더해가시면 두 분만의 무드가 더 뚜렷해질 거예요.",
  },
  {
    pairLabel: "COZY × NATURAL",
    pairScore: 87,
    pairBullets: [
      "편안하고 자연스러운 분위기",
      "서로를 편하게 만드는 케미",
      "꾸미지 않은 듯한 자연스러움",
      "따뜻한 무드 밸런스",
    ],
    firstImpressionScore: 89,
    synergyScore: 90,
    firstImpressionBody:
      "각자의 사진을 보면 두 분 모두 힘을 뺀 편안한 인상이 강하게 느껴져요. 방향이 비슷해서 함께 있을 때 어색함 없이 자연스럽게 녹아드는 편이라, 분위기 시너지 점수가 90점으로 특히 높게 나왔어요. 억지로 포즈를 맞추기보다 있는 그대로의 모습이 자연스럽게 어우러지는 타입이라, 함께 찍은 사진일수록 편안한 매력이 더 잘 드러나요.\n\n첫인상 조화 점수도 89점으로 높게 나왔는데, 두 분 다 표정이나 눈빛에서 여유가 느껴진다는 공통점이 이 점수의 근거예요. 각 잡힌 자세보다 자연스러운 몸짓과 미소가 자주 보이는 편이라, 함께 있을 때 서로를 편안하게 만들어주는 케미가 사진에서도 그대로 전해져요.\n\n다른 사람들 눈에는 두 분이 오래 알고 지낸 듯 편안하고, 억지스러움이 전혀 없는 친근한 커플로 비칠 가능성이 높아요.",
    myArtStyle: "토끼그림체",
    partnerArtStyle: "청순그림체",
    artStyleTogether: "포근한 데일리 무드",
    artStyleBody:
      "토끼그림체는 부드럽고 친근한 인상을, 청순그림체는 자연스럽고 순한 인상을 강조하는 그림체예요. 두 그림체 모두 화려함이나 완성도보다 '편안함'을 앞세우는 결이라, 이 둘이 만나면 특별한 연출 없이도 포근한 데일리 무드가 자연스럽게 완성돼요.\n\n이 조합의 강점은 꾸미지 않아도 매력이 살아난다는 점이에요. 스튜디오 촬영보다 일상 속 스냅사진에서 오히려 그림체 궁합이 잘 드러나고, 표정 관리를 억지로 하지 않아도 두 분 특유의 편안한 분위기가 사진에 그대로 담겨요.\n\n이 케미를 활용하고 싶다면 정형화된 포즈보다 대화하거나 웃는 순간을 그대로 담는 방식을 추천해요. 두 그림체 모두 '자연스러움'이 핵심이라, 과하게 세팅된 연출은 오히려 이 조합의 매력을 반감시킬 수 있어요.",
    moodTypeName: "Cozy Natural",
    moodTypeScore: 87,
    moodTypeSummary:
      "편안하고 자연스러운 무드가 만나 꾸미지 않아도 잘 어울리는 조합을 만들어내요.",
    moodTypeKeywords: ["Cozy", "Natural", "Warm", "Easy", "Friendly"],
    recommendedMoods: [
      { name: "Fresh Campus", reason: "산뜻함을 더하면 나들이나 여행 사진에서 훨씬 생기 있어 보여요." },
      { name: "Soft Vintage", reason: "은은한 빈티지 톤을 더하면 사진이 조금 더 감성적으로 보여요." },
      { name: "Urban Elegant", reason: "정돈된 포인트를 더하면 특별한 자리에서도 잘 어울려요." },
    ],
    moodMatchBody:
      "두 분의 사진에서 공통적으로 느껴지는 건 힘을 뺀 자연스러움이에요. 과한 보정이나 완벽하게 세팅된 스타일링보다, 편안하고 꾸미지 않은 듯한 분위기를 자연스럽게 선호하시는 편이에요. 이런 무드는 함께 있을 때 오히려 더 잘 어울려서, 사진 속에서 서로가 편안해 보이는 인상을 줘요. 일상적인 순간을 담은 사진일수록 이 조합의 매력이 잘 살아나는 편이에요.\n\n지금의 편안한 무드에 변주를 주고 싶다면 Fresh Campus·Soft Vintage·Urban Elegant를 참고해보세요. Fresh Campus는 지금의 자연스러움에 산뜻함을 더한 방향이라 나들이나 여행에 잘 어울리고, Soft Vintage는 색감에 변화를 주는 방향이라 사진을 감성적으로 남기고 싶을 때 추천해요. Urban Elegant는 지금과는 결이 다른 정돈된 방향이라, 특별한 자리에서 시도해보면 좋아요.",
    styleCompat: [
      { label: "Casual", filled: 5 },
      { label: "Minimal", filled: 4 },
      { label: "Street", filled: 3 },
      { label: "Classic", filled: 2 },
      { label: "Formal", filled: 1 },
      { label: "Vintage", filled: 3 },
    ],
    styleGoodNote: "편안한 니트 + 데님 조합",
    styleAvoidNote: "각 잡힌 포멀 슈트 스타일",
    coupleLookDirection: "뉴트럴 톤 + 편안한 소재",
    moodboardBody:
      "스타일 궁합에서 가장 높은 Casual 점수와, 어울리는 컬러 팔레트(베이지·세이지·크림·브라운·화이트)를 함께 보면 두 분에게 맞는 방향은 명확해요 — 뉴트럴 톤을 기본으로 하고, 소재를 편안하게 가져가는 거예요. 화이트나 크림 같은 밝은 톤을 베이스로 두고, 세이지나 브라운을 아우터나 신발로 살짝 더하면 화사하면서도 편안한 인상을 낼 수 있어요.\n\n실루엣은 딱 맞는 핏보다 살짝 여유 있는 핏이 이 조합과 더 잘 어울려요. 데님과 니트를 기본 축으로 두고, 액세서리는 최소화하는 편이 두 분의 자연스러운 매력을 가장 잘 살려줘요.",
    myHair: "자연스러운 웨이브",
    partnerHair: "레이어드 컷",
    hairTogetherScore: 5,
    colorCompat: [
      { name: "Beige", hex: "#DFCBB0", reason: "편안한 무드를 살려주는 뉴트럴 컬러예요." },
      { name: "Sage", hex: "#9CAF88", reason: "자연스러운 느낌을 더해주는 컬러예요." },
      { name: "Cream", hex: "#F1E9D8", reason: "따뜻하고 부드러운 인상을 줘요." },
      { name: "Brown", hex: "#8B6F53", reason: "안정감 있는 포인트 컬러예요." },
      { name: "White", hex: "#F5F3EF", reason: "깨끗하고 편안한 베이스를 만들어줘요." },
    ],
    colorCompatBody:
      "다섯 컬러 모두 두 분의 편안한 무드를 해치지 않는 뉴트럴 계열로 골랐어요. 화이트와 크림은 베이스로 쓰기 좋은 밝은 톤이라 이너나 셔츠에 활용하면 좋고, 베이지와 브라운은 여기에 온기를 더해주는 컬러예요. 세이지는 이 조합에 자연스러운 포인트를 주는 역할을 해요.\n\n반대로 각 잡힌 포멀 슈트처럼 딱딱한 스타일이나 진한 원색은 지금의 편안한 무드와는 결이 달라서 피하는 게 좋아요. 컬러를 고를 때 '꾸민 티'보다 '자연스러움'을 기준으로 삼으시면 이 팔레트를 편하게 활용하실 수 있어요.",
    itemCompat: [
      { label: "Silver", filled: 3 },
      { label: "Gold", filled: 3 },
      { label: "Denim", filled: 5 },
      { label: "Leather", filled: 3 },
    ],
    styleCompatBody:
      "스타일 궁합에서는 Casual이 가장 높은 점수를 받았어요. 두 분 모두 편안한 핏과 소재를 자연스럽게 선호하시는 편이라, 데님과 니트 위주의 코디가 특히 잘 어울려요. 반대로 Formal 항목이 낮게 나온 건 두 분 다 각 잡힌 스타일보다 편안한 실루엣을 선호하시기 때문이에요.\n\n헤어 궁합에서는 자연스러운 웨이브와 레이어드 컷이 만나 부드러운 흐름을 만들어요(헤어 궁합 5/5). 두 헤어스타일 모두 힘을 뺀 스타일링이라, 사진에서도 억지스럽지 않은 편안한 인상을 줘요.\n\n아이템 궁합에서는 Denim이 5점 만점으로 가장 높게 나왔어요. 실버와 골드는 비슷한 점수라 취향에 따라 골라도 무방하지만, 데님만큼은 두 분의 데일리룩에 꼭 넣어보시길 추천해요.",
    datePlaceCompat: [
      { label: "공원", filled: 5 },
      { label: "카페", filled: 5 },
      { label: "놀이공원", filled: 4 },
      { label: "미술관", filled: 3 },
    ],
    photoConceptTags: ["공원", "피크닉", "카페", "여행", "일상 스냅"],
    snsConceptCompat: [
      { label: "일상 스냅", filled: 5 },
      { label: "자연광", filled: 5 },
      { label: "카페", filled: 4 },
      { label: "피크닉", filled: 5 },
    ],
    myPerfume: "화이트 머스크 향",
    partnerPerfume: "그린 플로럴 향",
    togetherPerfume: "코튼 머스크 향",
    seasonCompat: [
      { label: "봄", filled: 5 },
      { label: "여름", filled: 4 },
      { label: "가을", filled: 4 },
      { label: "겨울", filled: 3 },
    ],
    dateSnsBody:
      "데이트 장소 궁합에서는 공원과 카페가 가장 높은 점수를 받았어요. 편안하고 자연스러운 공간에서 두 분의 무드가 가장 잘 살아나기 때문이에요. 사진 컨셉으로는 공원, 피크닉, 카페, 여행, 일상 스냅을 추천드려요. SNS 프로필 궁합에서는 일상 스냅과 자연광이 나란히 5점 만점을 받았는데, 인위적인 연출보다 자연스러운 순간이 두 분의 매력을 훨씬 잘 담아내기 때문이에요.\n\n계절 궁합에서는 봄이 가장 높게 나왔는데, 두 분의 편안한 톤이 화사하고 산뜻한 봄빛과 특히 잘 어울리기 때문이에요.",
    perfumeBody:
      "화이트 머스크 향은 깨끗하고 은은한 인상을 주는 향으로, 지금의 편안하고 꾸미지 않은 무드와 잘 어울려요. 그린 플로럴 향은 여기에 산뜻함을 더해서, 전체적인 분위기가 밋밋해지지 않도록 생기를 불어넣어줘요. 두 향 모두 무겁지 않은 계열이라 봄이나 여름철 데이트에 특히 잘 맞아요.\n\n함께일 때는 화이트 머스크와 그린이 섞이면서 코튼처럼 포근하고 깨끗한 무드가 완성돼요. 공원이나 카페처럼 자연광이 있는 야외에서 이 조합이 특히 잘 어울리고, 향수는 진하게 뿌리기보다 옷과 머리카락에 가볍게 스치듯 뿌리는 정도가 지금의 편안한 무드와 잘 맞아요.",
    overallMoodScore: 90,
    overallPercentile: "상위 9%",
    moodKeywords: ["Cozy", "Natural", "Warm", "Friendly", "Easy", "Soft"],
    finalBody:
      "전체적으로 두 분은 꾸미지 않아도 자연스럽게 잘 어울리는, 편안한 케미를 가진 조합이에요. 그래서 종합 Mood Score도 90점으로 높게 나왔고, 이는 상위 9%에 해당하는 수치예요.\n\n분위기 키워드로 뽑힌 Cozy, Natural, Warm, Friendly, Easy, Soft는 모두 '편안함'이라는 큰 줄기 안에 있는 단어들이에요. 데이트룩이나 사진 컨셉을 정할 때 참고해보세요.\n\n이 리포트는 두 분의 사진과 답변을 바탕으로 시각적인 분위기와 스타일 조화만 분석한 결과예요. 지금의 편안한 매력을 억지로 바꾸려 하기보다, 위에서 안내한 컬러와 장소를 하나씩 더해가시면 두 분만의 무드가 더 자연스럽게 완성될 거예요.",
  },
];

const testimonials = [
  {
    name: "민지**",
    quote: "심심해서 남친이랑 해봤는데 생각보다 결과가 자세해서 둘 다 놀랐어요",
  },
  {
    name: "so**89",
    quote: "데이트 전에 같이 해봤는데 은근 재밌더라구요 ㅋㅋ 분위기 궁합 얘기하면서 놀았어요",
  },
  {
    name: "지은*",
    quote: "우리 둘 분위기를 이런 식으로 표현해주는 게 신기했어요 사진도 딱 취향저격",
  },
  {
    name: "yebin**",
    quote: "서로 상대방한테 어떤 이미지로 보이는지 몰랐는데 알게 돼서 좋았어요",
  },
  {
    name: "j**woo",
    quote: "커플룩 맨날 고민이었는데 추천해준 컬러 조합이 진짜 잘 맞아서 참고 많이 했어요",
  },
  {
    name: "하늘**",
    quote: "반신반의하면서 눌러봤는데 은근히 몰입해서 끝까지 다 봤네요",
  },
  {
    name: "min**k",
    quote: "사진 컨셉 추천이 저희 스타일이랑 잘 맞아서 좀 놀랐어요",
  },
  {
    name: "채원*",
    quote: "결과 캡처해서 단톡방에 자랑했어요 ㅋㅋㅋ",
  },
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

  // Random per page load (not per render) so reloading the preview shows a
  // different example instead of always the same one.
  const variantIndex = useSyncExternalStore(
    subscribeNoop,
    getVariantIndexSnapshot,
    getServerVariantIndexSnapshot,
  );
  const mockReport = MOCK_REPORT_VARIANTS[variantIndex];

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
          // Restored the original warm brown/cream editorial palette — the
          // violet/white FACEMOOD-matching version was tried and reverted
          // per user feedback (the brown tone read better for Match).
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
            style={{ backgroundColor: "var(--match-beige)", color: "var(--match-burgundy)" }}
          >
            FACEMOOD MATCH · PREVIEW
          </span>

          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="relative aspect-[3/4] w-28 overflow-hidden rounded-3xl">
              {myPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={myPhoto} alt={myName} className="h-full w-full object-cover" />
              ) : (
                <Image src="/mood/cards/청순자연st.png" alt={myName} fill className="object-cover" />
              )}
            </div>
            <span className="text-lg font-bold" style={{ color: "var(--match-rose)" }}>
              ×
            </span>
            <div className="relative aspect-[3/4] w-28 overflow-hidden rounded-3xl">
              {partnerPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={partnerPhoto} alt={partnerName} className="h-full w-full object-cover" />
              ) : (
                <Image src="/mood/cards/고급도시st.png" alt={partnerName} fill className="object-cover" />
              )}
            </div>
          </div>

          <h1
            className="mt-5 text-lg font-bold leading-snug"
            style={{ fontFamily: "'Noto Serif KR', serif" }}
          >
            {headline}
          </h1>

          <div className="mt-6 flex flex-col items-center">
            <p
              className="text-5xl font-bold leading-none"
              style={{ fontFamily: "'Noto Serif KR', serif" }}
            >
              {mockReport.pairScore}%
            </p>
            <div className="mt-3">
              <StarRating filled={mockReport.pairScore / 20} />
            </div>
            <span
              className="mt-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold text-white"
              style={{ backgroundColor: "var(--match-navy)" }}
            >
              {mockReport.overallPercentile}
            </span>
          </div>

          <p
            className="mx-auto mt-6 max-w-sm text-base font-semibold leading-relaxed"
            style={{ fontFamily: "'Noto Serif KR', serif" }}
          >
            &ldquo;{mockReport.moodTypeSummary}&rdquo;
          </p>

          <div
            className="mx-auto mt-5 flex max-w-xs flex-wrap items-center justify-center gap-x-3 gap-y-1.5"
            style={{ color: "var(--match-ink-soft)" }}
          >
            {mockReport.pairBullets.map((bullet) => (
              <span key={bullet} className="text-[11px] leading-relaxed">
                · {bullet}
              </span>
            ))}
          </div>

          <p className="mx-auto mt-5 max-w-xs text-[11px] leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
            지금 보시는 리포트는 예시 구성이에요. 실제 결제 후에는 두 분의
            사진과 답변으로 직접 분석한 리포트를 받아보실 수 있어요.
          </p>
        </Container>
      </div>

      <Container maxWidth="max-w-3xl">
        <MatchReportBody report={mockReport} myName={myName} partnerName={partnerName} locked />
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

        <div className="relative mt-5 h-72 overflow-hidden marquee-fade-vertical">
          <div
            className="animate-marquee-vertical flex flex-col gap-3"
            style={{ animationDuration: `${testimonials.length * 3}s` }}
          >
            {[...testimonials, ...testimonials].map((review, index) => (
              <div
                key={`${review.quote}-${index}`}
                className="rounded-[20px] p-5"
                style={{ backgroundColor: "white", border: "1px solid var(--match-beige)" }}
              >
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--match-rose)" }}>★★★★★</span>
                  <span className="text-xs font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                    {review.name}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed">&ldquo;{review.quote}&rdquo;</p>
              </div>
            ))}
          </div>
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
        <div className="rounded-[28px] p-6 text-center text-white" style={{ backgroundColor: "var(--match-navy)" }}>
          <p className="text-base font-bold leading-relaxed" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            우리 커플 무드 리포트,
            <br />
            지금 바로 받아보세요.
          </p>

          <ul className="mx-auto mt-5 flex w-fit flex-col gap-2 text-left text-xs text-white/80">
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

      {/* Sticky bottom CTA — stays visible while scrolling through the preview */}
      <DiscountCountdownBar
        href="/match/checkout"
        ctaLabel="리포트 받기"
        darkColor="#1E2A3A"
        gradientFrom="#C9A0A0"
        gradientTo="#6F2A3A"
      />
    </main>
  );
}
