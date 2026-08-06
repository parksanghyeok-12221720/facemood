// The 10 possible couple Mood Types — photo at
// /public/mood/match-types/{name}.png (real photos already in place).
export const MOOD_TYPE_CANDIDATES = [
  "Soft City",
  "Romantic Classic",
  "Modern Minimal",
  "Fresh Campus",
  "Chic Date",
  "Vintage Mood",
  "Quiet Luxury",
  "Cozy Natural",
  "Urban Elegant",
  "Soft Vintage",
] as const;
export type MoodTypeCandidate = (typeof MOOD_TYPE_CANDIDATES)[number];

// The 12 possible art-style types — photo at
// /public/mood/match-artstyle/{name}.png (real photos already in place).
export const ART_STYLE_CANDIDATES = [
  "강아지그림체",
  "고양이그림체",
  "모델그림체",
  "배우그림체",
  "빈티지그림체",
  "아이돌그림체",
  "여우그림체",
  "웹툰그림체",
  "일본감성그림체",
  "청순그림체",
  "토끼그림체",
  "하이틴그림체",
] as const;
export type ArtStyleCandidate = (typeof ART_STYLE_CANDIDATES)[number];

// The 6 style categories — photo at
// /public/mood/match-style/{name lowercase}.png (real photos already in place).
export const STYLE_CANDIDATES = [
  "Casual",
  "Minimal",
  "Street",
  "Classic",
  "Formal",
  "Vintage",
] as const;
export type StyleCandidate = (typeof STYLE_CANDIDATES)[number];

export type FilledScore = { label: string; filled: number };

// Each numbered chapter below matches, 1:1 and in the same order, the 01-09
// PartLabel sections rendered by MatchReportBody.tsx (and the free preview
// at /match/result) — same "one long-form body per TOC chapter" shape as
// the main FACEMOOD product's REPORT_CHAPTERS (see types/report.ts).
export type MatchFullReport = {
  // Hero
  pairLabel: string;
  pairScore: number;
  pairBullets: string[];

  // 01. 첫인상 분석
  firstImpressionScore: number;
  synergyScore: number;
  firstImpressionBody: string;

  // 02. 얼굴 그림체 궁합
  myArtStyle: ArtStyleCandidate;
  partnerArtStyle: ArtStyleCandidate;
  artStyleTogether: string;
  artStyleBody: string;

  // 03. 무드 궁합
  moodTypeName: MoodTypeCandidate;
  moodTypeScore: number;
  moodTypeSummary: string;
  moodTypeKeywords: string[];
  recommendedMoods: { name: MoodTypeCandidate; reason: string }[];
  moodMatchBody: string;

  // 04. 스타일 궁합
  styleCompat: FilledScore[];
  styleGoodNote: string;
  myHair: string;
  partnerHair: string;
  hairTogetherScore: number;
  itemCompat: FilledScore[];
  styleCompatBody: string;

  // 05. 이런 방향으로 스타일을 맞추면
  coupleLookDirection: string;
  moodboardBody: string;

  // 06. 데이트 스타일 & SNS
  datePlaceCompat: FilledScore[];
  photoConceptTags: string[];
  snsConceptCompat: FilledScore[];
  seasonCompat: FilledScore[];
  dateSnsBody: string;

  // 07. 컬러 궁합
  colorCompat: { name: string; hex: string; reason: string }[];
  styleAvoidNote: string;
  colorCompatBody: string;

  // 08. 향수 궁합
  myPerfume: string;
  partnerPerfume: string;
  togetherPerfume: string;
  perfumeBody: string;

  // 09. 총평
  overallMoodScore: number;
  overallPercentile: string;
  moodKeywords: string[];
  finalBody: string;
};
