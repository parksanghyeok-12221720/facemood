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

export type MatchFullReport = {
  // Hero
  pairLabel: string;
  pairScore: number;
  pairBullets: string[];

  // 01. Mood Type
  moodTypeName: MoodTypeCandidate;
  moodTypeScore: number;
  moodTypeSummary: string;
  moodTypeKeywords: string[];

  // 02. Recommended moods (2-3 other types worth exploring)
  recommendedMoods: { name: MoodTypeCandidate; reason: string }[];

  // PART 1. 얼굴 무드 분석
  myMoodLabel: string;
  myMoodNote: string;
  partnerMoodLabel: string;
  partnerMoodNote: string;
  firstImpressionScore: number;
  synergyScore: number;
  myArtStyle: ArtStyleCandidate;
  partnerArtStyle: ArtStyleCandidate;
  artStyleTogether: string;

  // PART 2. 스타일 분석
  styleCompat: FilledScore[];
  styleGoodNote: string;
  styleAvoidNote: string;
  coupleLookDirection: string;
  myHair: string;
  partnerHair: string;
  hairTogetherScore: number;
  colorCompat: { name: string; hex: string; reason: string }[];
  itemCompat: FilledScore[];

  // PART 3. 무드 라이프
  datePlaceCompat: FilledScore[];
  photoConceptTags: string[];
  snsConceptCompat: FilledScore[];
  myPerfume: string;
  partnerPerfume: string;
  togetherPerfume: string;
  seasonCompat: FilledScore[];

  // PART 4. 공유 리포트
  overallMoodScore: number;
  overallPercentile: string;
  moodKeywords: string[];
};
