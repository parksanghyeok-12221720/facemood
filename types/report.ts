export const MOOD_CANDIDATES = [
  "청순 자연형",
  "고급 도시형",
  "차분 시크형",
  "러블리 여리형",
  "힙 트렌디형",
  "러블리 힙형",
  "청순 에겐형",
  "일본 여주형",
] as const;

export type MoodCandidate = (typeof MOOD_CANDIDATES)[number];

// One illustrated "trading card" per mood for the free preview's share
// card (see ResultShareCard in app/result/page.tsx) — each image already
// has the mood name/tagline baked in, so the card just frames it.
export const MOOD_SHARE_IMAGES: Record<MoodCandidate, string> = {
  "청순 자연형": "/mood/share/청순자연형.png",
  "고급 도시형": "/mood/share/고급도시형.png",
  "차분 시크형": "/mood/share/차분시크형.png",
  "러블리 여리형": "/mood/share/러블리여리형.png",
  "힙 트렌디형": "/mood/share/힙트렌디형.png",
  "러블리 힙형": "/mood/share/러블리힙합형.png",
  "청순 에겐형": "/mood/share/청순에겐형.png",
  "일본 여주형": "/mood/share/일본여주형.png",
};

export const FACE_SHAPE_CANDIDATES = [
  "계란형",
  "원형",
  "역삼각형",
  "땅콩형",
  "하트형",
  "다이아몬드형",
] as const;

export type FaceShapeCandidate = (typeof FACE_SHAPE_CANDIDATES)[number];

export const ANIMAL_TYPE_CANDIDATES = [
  "강아지상",
  "사슴상",
  "토끼상",
  "고양이상",
  "다람쥐상",
  "곰돌이상",
  "호랑이상",
  "여우상",
  "수달상",
] as const;

export type AnimalTypeCandidate = (typeof ANIMAL_TYPE_CANDIDATES)[number];

// Reference images for the paid report's 얼굴형/동물상 chapters — drop a
// file at each path below (any of these missing just means that chapter
// renders without an image, same as before).
export const FACE_SHAPE_IMAGES: Record<FaceShapeCandidate, string> = {
  계란형: "/mood/faceshape/계란형.png",
  원형: "/mood/faceshape/원형.png",
  역삼각형: "/mood/faceshape/역삼각형.png",
  땅콩형: "/mood/faceshape/땅콩형.png",
  하트형: "/mood/faceshape/하트형.png",
  다이아몬드형: "/mood/faceshape/다이아몬드형.png",
};

export const ANIMAL_TYPE_IMAGES: Record<AnimalTypeCandidate, string> = {
  강아지상: "/mood/animaltype/강아지상.png",
  사슴상: "/mood/animaltype/사슴상.png",
  토끼상: "/mood/animaltype/토끼상.png",
  고양이상: "/mood/animaltype/고양이상.png",
  다람쥐상: "/mood/animaltype/다람쥐상.png",
  곰돌이상: "/mood/animaltype/곰돌이상.png",
  호랑이상: "/mood/animaltype/호랑이상.png",
  여우상: "/mood/animaltype/여우상.png",
  수달상: "/mood/animaltype/수달상.png",
};

export const HAIR_STYLE_CANDIDATES = [
  "샌드펌",
  "시스루뱅",
  "히피펌",
  "뱅드 보브",
  "S컬(지지컬)",
  "러블리 보브",
  "박스 보브",
  "슬릭 보브",
  "시스루 뱅 보브",
  "클라우드 보브",
  "텍스처 웨이브",
  "허쉬컷",
] as const;

export type HairStyleCandidate = (typeof HAIR_STYLE_CANDIDATES)[number];

// AI picks one of the names above for the hairGuide chapter's "type" field
// so the photo shown actually matches what the body text recommends,
// instead of a mood-indexed photo unrelated to that chapter's content.
export const HAIR_STYLE_IMAGES: Record<HairStyleCandidate, string> = {
  샌드펌: "/mood/hair/hair_샌드펌.png",
  시스루뱅: "/mood/hair/hair_시스루.png",
  히피펌: "/mood/hair/hair_히피펌.png",
  "뱅드 보브": "/mood/hair/hair_ 뱅드 보브.png",
  "S컬(지지컬)": "/mood/hair/hair_S컬(지지컬).png",
  "러블리 보브": "/mood/hair/hair_러블리보브.png",
  "박스 보브": "/mood/hair/hair_박스 보브.png",
  "슬릭 보브": "/mood/hair/hair_슬릭 보브.png",
  "시스루 뱅 보브": "/mood/hair/hair_시스루 뱅 보브.png",
  "클라우드 보브": "/mood/hair/hair_클라우드 보브.png",
  "텍스처 웨이브": "/mood/hair/hair_텍스처 웨이브.png",
  허쉬컷: "/mood/hair/hair_허쉬컷.png",
};

export const MAKEUP_STYLE_CANDIDATES = [
  "글로우 베이스",
  "라이트 레이어링 파운데이션",
  "절제된 컨투어",
  "은은한 스모키",
  "실버 포인트",
  "고스트 래시",
] as const;

export type MakeupStyleCandidate = (typeof MAKEUP_STYLE_CANDIDATES)[number];

export const MAKEUP_STYLE_IMAGES: Record<MakeupStyleCandidate, string> = {
  "글로우 베이스": "/mood/makeup/makeup_굴로우베이스.png",
  "라이트 레이어링 파운데이션":
    "/mood/makeup/션makeup_라이트 레이어링 파운데이.png",
  "절제된 컨투어": "/mood/makeup/makeup_절제된 컨투어.png",
  "은은한 스모키": "/mood/makeup/makeup_ 은은한 스모키.png",
  "실버 포인트": "/mood/makeup/makeup_실버포인트.png",
  "고스트 래시": "/mood/makeup/makeup_고스트 래시.png",
};

export type PreviewResult = {
  recommendedMood: string;
  subMood: string;
  oneLineSummary: string;
  tags: string[];
  moodSync: {
    mood: string;
    score: number;
  }[];
  colorHint: {
    title: string;
    summary: string;
    description: string;
    palette: {
      name: string;
      hex: string;
      description: string;
    }[];
    caution: string;
  };
  currentMood: string[];
  upgradePoints: string[];
  missions: string[];
  hints: {
    styling: {
      title: string;
      content: string;
    };
    hair: {
      title: string;
      content: string;
    };
    makeup: {
      title: string;
      content: string;
    };
  };
  lockedSections: string[];
  images: {
    hero: string;
    // Every "st" reference photo available for this mood — the paid
    // report cycles through these across its several hero-style chapters
    // instead of repeating the same single photo. Optional so reports
    // cached before this existed still render (falls back to `hero`).
    heroGallery?: string[];
    hair: string;
    makeup: string;
  };
  // Photo-based, so only set when a photo was uploaded (AI vision call) —
  // null for the rule-based fallback and the no-photo flow. The preview
  // only ever shows the type itself; the reasoning stays locked to the
  // paid report.
  faceShapeType: FaceShapeCandidate | null;
  animalType: AnimalTypeCandidate | null;
};

// Every reference photo prepared per mood in public/mood/cards. Moods
// with only one photo on disk just get a single-item list — the report
// still renders fine, it just can't vary that mood's hero image.
const MOOD_HERO_GALLERY: Record<MoodCandidate, string[]> = {
  "청순 자연형": [
    "/mood/cards/청순자연st.png",
    "/mood/cards/청순자연st2.png",
    "/mood/cards/청순자연st3.png",
    "/mood/cards/청순자연st4.png",
    "/mood/cards/청순자연st5.png",
  ],
  "고급 도시형": [
    "/mood/cards/고급도시st.png",
    "/mood/cards/고급도시st2.png",
    "/mood/cards/고급도시st3.png",
    "/mood/cards/고급도시st4.png",
    "/mood/cards/고급도시st5.png",
  ],
  "차분 시크형": [
    "/mood/cards/차분시크st.png",
    "/mood/cards/차분시크st2.png",
    "/mood/cards/차분시크st3.png",
    "/mood/cards/차분시크st4.png",
    "/mood/cards/차분시크st5.png",
    "/mood/cards/차분시크st6.png",
  ],
  "러블리 여리형": [
    "/mood/cards/러블리 여리st.png",
    "/mood/cards/러블리 여리st2.png",
    "/mood/cards/러블리 여리st3.png",
    "/mood/cards/러블리 여리st4.png",
    "/mood/cards/러블리 여리st5.png",
  ],
  "힙 트렌디형": [
    "/mood/cards/힙 트렌디st.png",
    "/mood/cards/힙 트렌디st2.png",
    "/mood/cards/힙 트렌디st3.png",
    "/mood/cards/힙 트렌디st4.png",
  ],
  "러블리 힙형": [
    "/mood/cards/러블리 힙st.png",
    "/mood/cards/러블리 힙st2.png",
    "/mood/cards/러블리 힙st3.png",
    "/mood/cards/러블리 힙st4.png",
    "/mood/cards/러블리 힙st5.png",
  ],
  "청순 에겐형": [
    "/mood/cards/청순 에겐st.png",
    "/mood/cards/청순 에겐st2.png",
    "/mood/cards/청순 에겐st3.png",
  ],
  "일본 여주형": [
    "/mood/cards/일본여주st.png",
    "/mood/cards/일본여주st2.png",
    "/mood/cards/일본여주st3.png",
    "/mood/cards/일본여주st4.png",
  ],
};

const HAIR_IMAGES = [
  "/mood/hair/hair1.png",
  "/mood/hair/hair2.png",
  "/mood/hair/hair_샌드펌.png",
  "/mood/hair/hair_시스루.png",
  "/mood/hair/hair_히피펌.png",
  "/mood/hair/hair_ 뱅드 보브.png",
  "/mood/hair/hair_S컬(지지컬).png",
  "/mood/hair/hair_러블리보브.png",
  "/mood/hair/hair_박스 보브.png",
  "/mood/hair/hair_슬릭 보브.png",
  "/mood/hair/hair_시스루 뱅 보브.png",
  "/mood/hair/hair_클라우드 보브.png",
  "/mood/hair/hair_텍스처 웨이브.png",
  "/mood/hair/hair_허쉬컷.png",
];

const MAKEUP_IMAGES = [
  "/mood/makeup/makeup1.png",
  "/mood/makeup/makeup2.png",
  "/mood/makeup/makeup3.png",
  "/mood/makeup/makeup4.png",
  "/mood/makeup/makeup5.png",
  "/mood/makeup/makeup_ 은은한 스모키.png",
  "/mood/makeup/makeup_고스트 래시.png",
  "/mood/makeup/makeup_굴로우베이스.png",
  "/mood/makeup/makeup_실버포인트.png",
  "/mood/makeup/makeup_절제된 컨투어.png",
  "/mood/makeup/션makeup_라이트 레이어링 파운데이.png",
];

// Combines the primary + sub mood into one index so the (now much larger)
// hair/makeup pools actually get used — indexing off the primary mood
// alone would only ever touch the first 8 entries.
function imagesForMood(
  mood: MoodCandidate,
  subMood: MoodCandidate,
): PreviewResult["images"] {
  const moodCount = MOOD_CANDIDATES.length;
  const combinedIndex =
    MOOD_CANDIDATES.indexOf(mood) * moodCount + MOOD_CANDIDATES.indexOf(subMood);
  const heroGallery = MOOD_HERO_GALLERY[mood];
  return {
    hero: heroGallery[0],
    heroGallery,
    hair: HAIR_IMAGES[combinedIndex % HAIR_IMAGES.length],
    makeup: MAKEUP_IMAGES[combinedIndex % MAKEUP_IMAGES.length],
  };
}

// Reference shape for local development. Only rendered when visiting
// /result?mock=1 — with no saved localStorage result and no mock flag,
// the page shows the empty state instead.
export const mockPreviewResult: PreviewResult = {
  recommendedMood: "청순 자연형",
  subMood: "러블리 여리형",
  oneLineSummary:
    "사진상으로는 편안하고 부드러운 이미지가 먼저 느껴져요. 여기에 자연스러운 헤어와 가벼운 메이크업을 더하면 맑고 깨끗한 분위기가 더 잘 살아날 수 있어요.",
  tags: ["#청순자연형", "#소프트컬러", "#내추럴메이크업", "#부드러운헤어"],
  moodSync: [
    { mood: "청순 자연형", score: 82 },
    { mood: "러블리 여리형", score: 68 },
    { mood: "고급 도시형", score: 54 },
    { mood: "차분 시크형", score: 41 },
    { mood: "힙 트렌디형", score: 32 },
  ],
  colorHint: {
    title: "사진상 컬러 무드 힌트",
    summary: "사진상으로는 밝고 부드러운 색감이 이미지를 더 맑게 보여줄 가능성이 높아요.",
    description:
      "아이보리, 소프트 핑크, 라이트 베이지처럼 밝고 깨끗한 색감은 현재 이미지의 부드러운 분위기를 더 자연스럽게 살려줄 수 있어요. 반대로 너무 탁하거나 강한 대비의 색감은 원하는 무드보다 무거워 보일 수 있습니다.",
    palette: [
      {
        name: "아이보리",
        hex: "#F7F1E5",
        description: "얼굴 분위기를 맑고 부드럽게 보여줄 수 있는 기본 컬러",
      },
      {
        name: "소프트 핑크",
        hex: "#F3C9D2",
        description: "러블리함과 생기를 자연스럽게 더해주는 컬러",
      },
      {
        name: "라이트 베이지",
        hex: "#E8D9C2",
        description: "부담 없이 따뜻하고 편안한 이미지를 만드는 컬러",
      },
      {
        name: "뮤트 라벤더",
        hex: "#C6B7DC",
        description: "은은하고 여리한 분위기를 더해주는 포인트 컬러",
      },
    ],
    caution:
      "사진상 컬러 무드 힌트는 확정적인 퍼스널컬러 진단이 아니라, 현재 사진의 조명과 색감 기준으로 제공되는 참고 의견입니다.",
  },
  currentMood: ["부드러움", "자연스러움", "편안함"],
  upgradePoints: ["조금 더 정돈된 헤어", "밝고 부드러운 컬러", "가벼운 메이크업"],
  missions: [
    "상의는 블랙보다 아이보리나 크림톤으로 바꿔보기",
    "립은 쨍한 컬러보다 소프트 핑크/로즈톤 써보기",
    "머리는 얼굴선을 살짝 감싸도록 자연스럽게 스타일링하기",
  ],
  hints: {
    styling: {
      title: "스타일링 힌트",
      content:
        "화이트, 아이보리, 연한 베이지처럼 밝고 부드러운 색감을 중심으로, 셔츠, 니트, 가디건처럼 자연스러운 실루엣의 아이템이 잘 맞을 수 있어요.",
    },
    hair: {
      title: "헤어 힌트",
      content:
        "너무 강한 컬보다 얼굴선을 부드럽게 감싸는 레이어드컷이나 자연스럽게 흐르는 웨이브가 현재 무드와 잘 어울릴 가능성이 높아요.",
    },
    makeup: {
      title: "메이크업 힌트",
      content:
        "진한 아이라인이나 과한 음영보다, 맑은 베이스, 자연스러운 눈매 강조, 소프트 핑크 계열 립이 부드러운 분위기를 살려줄 수 있어요.",
    },
  },
  lockedSections: [
    "추천 컬러 팔레트",
    "어울리는 옷 색감과 실루엣",
    "헤어 길이 · 앞머리 · 펌 방향",
    "베이스 · 아이 · 블러셔 · 립 메이크업",
    "피하면 좋은 스타일 방향",
    "인스타/데이트/면접용 이미지 전략",
    "퍼스널컬러 방향 힌트",
    "피하면 좋은 색감",
    "옷 색감 적용법",
    "헤어 컬러 방향",
  ],
  images: imagesForMood("청순 자연형", "러블리 여리형"),
  faceShapeType: "하트형",
  animalType: "사슴상",
};

// ---------------------------------------------------------------------------
// Paid full report — 13 numbered chapters, each a long-form write-up (title
// is fixed here so it always matches the 목차 exactly; the AI only writes
// the body text).
// ---------------------------------------------------------------------------

export type ReportChapterKey =
  | "finalSummary"
  | "currentImageMood"
  | "gapAnalysis"
  | "recommendedMoodDetail"
  | "firstImpression"
  | "stylingGuide"
  | "hairGuide"
  | "makeupGuide"
  | "colorMoodAnalysis"
  | "colorPalette"
  | "avoidStyles"
  | "situationGuide"
  | "finalChecklist"
  | "faceShapeAnalysis"
  | "animalTypeAnalysis"
  | "accessoryGuide"
  | "perfumeGuide";

// "male" is the single male-audience tier (no separate basic/premium split
// for men — see MALE_REPORT_CHAPTERS below). "hair"/"makeup"/"color" are the
// female single-item (단품) purchases — each a curated single-topic subset
// of REPORT_CHAPTERS (see HAIR_REPORT_CHAPTERS etc. below).
export type ReportTierName =
  | "basic"
  | "premium"
  | "male"
  | "hair"
  | "makeup"
  | "color";

export const REPORT_CHAPTERS: {
  key: ReportChapterKey;
  number: string;
  title: string;
  tier: ReportTierName;
  points: string[];
}[] = [
  {
    key: "finalSummary",
    number: "01",
    title: "나에게 어울리는 추구미 최종 요약",
    tier: "basic",
    points: [
      "추천 추구미",
      "보조 무드",
      "전체 이미지 방향",
      "핵심 키워드",
      "한 줄 총평",
      "앞으로의 스타일 방향",
      "이 무드와 잘 어울리는 직업·업무 이미지 (직업을 단정하지 말고, 이 분위기가 잘 통하는 업무 환경이나 이미지를 가볍게 제안하는 정도로)",
    ],
  },
  {
    key: "currentImageMood",
    number: "02",
    title: "현재 이미지 무드 분석",
    tier: "basic",
    points: [
      "사진상으로 보이는 첫인상",
      "현재 이미지가 주는 분위기",
      "헤어, 메이크업, 옷 색감이 만드는 느낌",
      "현재 이미지에서 잘 살아나는 포인트",
      "전체적으로 어떤 무드에 가까운지",
    ],
  },
  {
    key: "faceShapeAnalysis",
    number: "03",
    title: "사진상 얼굴형 분석",
    tier: "basic",
    points: [
      `사진상으로 보이는 얼굴형 분류 (${FACE_SHAPE_CANDIDATES.join(" / ")} 중 하나)`,
      "이 얼굴형에서 자주 느껴지는 인상",
      "이 얼굴형과 잘 어울리는 헤어 라인 · 앞머리 방향",
      "이 얼굴형과 잘 어울리는 메이크업 음영 · 블러셔 위치",
      "이 얼굴형과 잘 어울리는 안경 · 귀걸이 방향",
      "확정적인 진단이 아니라는 안내",
    ],
  },
  {
    key: "gapAnalysis",
    number: "04",
    title: "원하는 추구미와 현재 이미지의 차이",
    tier: "basic",
    points: [
      "사용자가 원하는 추구미",
      "현재 이미지와 가까운 부분",
      "현재 이미지와 다른 부분",
      "원하는 추구미에 가까워지기 위해 조정하면 좋은 요소",
      "가장 먼저 바꿔보면 좋은 포인트",
    ],
  },
  {
    key: "hairGuide",
    number: "05",
    title: "헤어 스타일 방향",
    tier: "basic",
    points: [
      "추천 헤어 길이",
      "앞머리 유무",
      "펌/컬 방향",
      "헤어 컬러 방향",
      "현재 이미지와 어울릴 가능성이 높은 헤어",
      "피하면 좋은 헤어",
      "미용실에서 말하기 좋은 문장",
    ],
  },
  {
    key: "makeupGuide",
    number: "06",
    title: "메이크업 방향",
    tier: "basic",
    points: [
      "베이스 표현",
      "눈썹",
      "아이메이크업",
      "아이라인",
      "블러셔",
      "립 컬러",
      "추천 메이크업 강도",
      "피하면 좋은 메이크업",
      "데일리 메이크업 적용법",
    ],
  },
  {
    key: "colorPalette",
    number: "07",
    title: "추천 컬러 팔레트",
    tier: "basic",
    points: [
      "추천 컬러 5~7개",
      "각 컬러별 활용법",
      "상의에 쓰면 좋은 색",
      "립/블러셔에 쓰면 좋은 색",
      "포인트 컬러로 쓰면 좋은 색",
      "피하면 좋은 컬러 조합",
    ],
  },
  {
    key: "finalChecklist",
    number: "08",
    title: "최종 스타일 체크리스트",
    tier: "basic",
    points: [
      "오늘 바로 바꿔볼 것",
      "쇼핑할 때 확인할 것",
      "미용실에서 말할 것",
      "메이크업에서 바꿔볼 것",
      "사진 찍을 때 신경 쓸 것",
      "최종 한 줄 조언",
    ],
  },
  {
    key: "animalTypeAnalysis",
    number: "09",
    title: "사진상 동물상 분석",
    tier: "premium",
    points: [
      `사진상으로 보이는 동물상 분류 (${ANIMAL_TYPE_CANDIDATES.join(" / ")} 중 하나)`,
      "이 동물상이 주는 인상과 매력 포인트",
      "이 동물상과 잘 어울리는 스타일링 방향",
      "이 동물상과 잘 어울리는 헤어 · 메이크업 방향",
      "확정적인 진단이 아니라는 안내",
    ],
  },
  {
    key: "recommendedMoodDetail",
    number: "10",
    title: "추천 추구미 상세 해석",
    tier: "premium",
    points: [
      "추천 추구미가 어떤 분위기인지",
      "이 추구미가 사용자에게 잘 맞을 수 있는 이유",
      "이 무드를 완성하는 핵심 요소",
      "잘 맞는 컬러, 헤어, 메이크업, 패션 방향",
      "전체적인 이미지 전략",
    ],
  },
  {
    key: "firstImpression",
    number: "11",
    title: "이성이 봤을 때 첫인상 무드",
    tier: "premium",
    points: [
      "사진상으로 전달될 수 있는 첫인상",
      "이성이 처음 봤을 때 느낄 수 있는 분위기",
      "첫 3초 안에 남을 수 있는 이미지",
      "호감이 쌓이는 방식",
      "첫인상을 더 잘 살리는 방법",
    ],
  },
  {
    key: "stylingGuide",
    number: "12",
    title: "스타일링 세부 가이드",
    tier: "premium",
    points: [
      "추천 옷 색감",
      "추천 실루엣",
      "추천 소재",
      "키와 체형 정보를 참고한 옷 길이와 핏 (체형 지적이 아니라 비율 스타일링 조언으로)",
      "상의, 하의, 아우터, 신발, 가방 방향",
      "데일리룩 예시",
      "피하면 좋은 스타일링",
    ],
  },
  {
    key: "accessoryGuide",
    number: "13",
    title: "액세서리 스타일 가이드",
    tier: "premium",
    points: [
      "목걸이 · 귀걸이 등 포인트 아이템 방향",
      "시계 · 가방 같은 데일리 아이템 톤",
      "추구미에 맞는 골드 vs 실버 계열",
      "과하지 않게 포인트 주는 법",
    ],
  },
  {
    key: "perfumeGuide",
    number: "14",
    title: "향수 무드 추천",
    tier: "premium",
    points: [
      "추구미에 어울리는 향 계열 (플로럴 · 우디 · 머스크 등)",
      "상황별(데일리 · 데이트) 향 강도",
      "향수 뿌리는 위치 · 양 팁",
    ],
  },
  {
    key: "colorMoodAnalysis",
    number: "15",
    title: "사진상 컬러 무드 분석",
    tier: "premium",
    points: [
      "사진 기준으로 보이는 컬러 흐름",
      "밝기, 채도, 온도감, 선명도",
      "어울릴 가능성이 높은 컬러 방향",
      "조심하면 좋은 컬러 방향",
      "퍼스널컬러 확정 진단이 아니라는 안내",
      "옷, 메이크업, 헤어 컬러에 적용하는 방법",
    ],
  },
  {
    key: "avoidStyles",
    number: "16",
    title: "피하면 좋은 스타일 방향",
    tier: "premium",
    points: [
      "추천 추구미와 멀어질 수 있는 색감",
      "과하게 보일 수 있는 메이크업",
      "무드를 흐릴 수 있는 헤어",
      "어색해질 수 있는 옷 실루엣",
      "단점 지적이 아니라 원하는 분위기와 멀어질 수 있는 방향으로 부드럽게 설명",
    ],
  },
  {
    key: "situationGuide",
    number: "17",
    title: "상황별 이미지 전략",
    tier: "premium",
    points: [
      "소개팅/데이트",
      "인스타 프로필 사진",
      "데일리룩",
      "출근/면접",
      "친구 약속",
      "사진 찍는 날",
      "각 상황에서 어떤 옷, 헤어, 메이크업, 컬러를 선택하면 좋은지",
    ],
  },
];

// The three single-item (단품) purchases — each a curated, single-topic
// subset of REPORT_CHAPTERS, renumbered 01, 02, 03... so the TOC doesn't
// show gaps from the chapters that were dropped (e.g. a hair-only report
// showing "02, 05" instead of "01, 02"). Reuses REPORT_CHAPTERS' existing
// title/points as-is — no new copy needed, since /api/generate-report also
// adds a tier-specific system-prompt instruction telling the AI to stay
// strictly on that one topic and skip the others (several of the reused
// generic chapters, like currentImageMood, have points that casually
// mention 헤어/메이크업/컬러 together, so the prompt-level instruction is
// what actually keeps an off-topic mention out of, say, a hair-only report).
function buildSingleItemChapters(
  tier: "hair" | "makeup" | "color",
  keys: ReportChapterKey[],
) {
  return keys.map((key, index) => {
    const source = REPORT_CHAPTERS.find((c) => c.key === key)!;
    return {
      ...source,
      number: String(index + 1).padStart(2, "0"),
      tier,
    };
  });
}

export const HAIR_REPORT_CHAPTERS = buildSingleItemChapters("hair", [
  "finalSummary",
  "currentImageMood",
  "gapAnalysis",
  "hairGuide",
  "finalChecklist",
]);

export const MAKEUP_REPORT_CHAPTERS = buildSingleItemChapters("makeup", [
  "finalSummary",
  "currentImageMood",
  "gapAnalysis",
  "makeupGuide",
  "finalChecklist",
]);

export const COLOR_REPORT_CHAPTERS = buildSingleItemChapters("color", [
  "finalSummary",
  "currentImageMood",
  "gapAnalysis",
  "colorMoodAnalysis",
  "colorPalette",
  "stylingGuide",
  "avoidStyles",
  "accessoryGuide",
  "finalChecklist",
]);

// The male report — same overall depth as the female Premium report, minus
// the dedicated makeupGuide chapter (dropped entirely) and with the
// makeup-adjacent bullets inside the remaining chapters swapped for a
// male-appropriate equivalent (코디, 헤어라인/수염, 액세서리, ...). There's
// no separate basic/premium split for men, so every chapter here is tier
// "male" and numbered 01-16 (see /api/generate-report and /report, which
// both branch on tier === "male" to use this list instead of
// REPORT_CHAPTERS).
export const MALE_REPORT_CHAPTERS: {
  key: ReportChapterKey;
  number: string;
  title: string;
  tier: ReportTierName;
  points: string[];
}[] = [
  {
    key: "finalSummary",
    number: "01",
    title: "나에게 어울리는 추구미 최종 요약",
    tier: "male",
    points: [
      "추천 추구미",
      "보조 무드",
      "전체 이미지 방향",
      "핵심 키워드",
      "한 줄 총평",
      "앞으로의 스타일 방향",
      "이 무드와 잘 어울리는 직업·업무 이미지 (직업을 단정하지 말고, 이 분위기가 잘 통하는 업무 환경이나 이미지를 가볍게 제안하는 정도로)",
    ],
  },
  {
    key: "currentImageMood",
    number: "02",
    title: "현재 이미지 무드 분석",
    tier: "male",
    points: [
      "사진상으로 보이는 첫인상",
      "현재 이미지가 주는 분위기",
      "헤어, 코디, 옷 색감이 만드는 느낌",
      "현재 이미지에서 잘 살아나는 포인트",
      "전체적으로 어떤 무드에 가까운지",
    ],
  },
  {
    key: "faceShapeAnalysis",
    number: "03",
    title: "사진상 얼굴형 분석",
    tier: "male",
    points: [
      `사진상으로 보이는 얼굴형 분류 (${FACE_SHAPE_CANDIDATES.join(" / ")} 중 하나)`,
      "이 얼굴형에서 자주 느껴지는 인상",
      "이 얼굴형과 잘 어울리는 헤어 라인 · 앞머리 방향",
      "이 얼굴형과 잘 어울리는 수염 · 헤어라인 정리 방향",
      "이 얼굴형과 잘 어울리는 안경 방향",
      "확정적인 진단이 아니라는 안내",
    ],
  },
  {
    key: "gapAnalysis",
    number: "04",
    title: "원하는 추구미와 현재 이미지의 차이",
    tier: "male",
    points: [
      "사용자가 원하는 추구미",
      "현재 이미지와 가까운 부분",
      "현재 이미지와 다른 부분",
      "원하는 추구미에 가까워지기 위해 조정하면 좋은 요소",
      "가장 먼저 바꿔보면 좋은 포인트",
    ],
  },
  {
    key: "hairGuide",
    number: "05",
    title: "헤어 스타일 방향",
    tier: "male",
    points: [
      "추천 헤어 길이",
      "앞머리 유무",
      "펌/컬 방향",
      "헤어 컬러 방향",
      "현재 이미지와 어울릴 가능성이 높은 헤어",
      "피하면 좋은 헤어",
      "미용실에서 말하기 좋은 문장",
    ],
  },
  {
    key: "colorPalette",
    number: "06",
    title: "추천 컬러 팔레트",
    tier: "male",
    points: [
      "추천 컬러 5~7개",
      "각 컬러별 활용법",
      "상의에 쓰면 좋은 색",
      "포인트 아이템에 쓰면 좋은 색",
      "아우터에 쓰면 좋은 색",
      "피하면 좋은 컬러 조합",
    ],
  },
  {
    key: "finalChecklist",
    number: "07",
    title: "최종 스타일 체크리스트",
    tier: "male",
    points: [
      "오늘 바로 바꿔볼 것",
      "쇼핑할 때 확인할 것",
      "미용실에서 말할 것",
      "코디에서 바꿔볼 것",
      "사진 찍을 때 신경 쓸 것",
      "최종 한 줄 조언",
    ],
  },
  {
    key: "animalTypeAnalysis",
    number: "08",
    title: "사진상 동물상 분석",
    tier: "male",
    points: [
      `사진상으로 보이는 동물상 분류 (${ANIMAL_TYPE_CANDIDATES.join(" / ")} 중 하나)`,
      "이 동물상이 주는 인상과 매력 포인트",
      "이 동물상과 잘 어울리는 스타일링 방향",
      "이 동물상과 잘 어울리는 헤어 · 스타일링 방향",
      "확정적인 진단이 아니라는 안내",
    ],
  },
  {
    key: "recommendedMoodDetail",
    number: "09",
    title: "추천 추구미 상세 해석",
    tier: "male",
    points: [
      "추천 추구미가 어떤 분위기인지",
      "이 추구미가 사용자에게 잘 맞을 수 있는 이유",
      "이 무드를 완성하는 핵심 요소",
      "잘 맞는 컬러, 헤어, 코디, 패션 방향",
      "전체적인 이미지 전략",
    ],
  },
  {
    key: "firstImpression",
    number: "10",
    title: "이성이 봤을 때 첫인상 무드",
    tier: "male",
    points: [
      "사진상으로 전달될 수 있는 첫인상",
      "이성이 처음 봤을 때 느낄 수 있는 분위기",
      "첫 3초 안에 남을 수 있는 이미지",
      "호감이 쌓이는 방식",
      "첫인상을 더 잘 살리는 방법",
    ],
  },
  {
    key: "stylingGuide",
    number: "11",
    title: "스타일링 세부 가이드",
    tier: "male",
    points: [
      "추천 옷 색감",
      "추천 실루엣",
      "추천 소재",
      "키와 체형 정보를 참고한 옷 길이와 핏 (체형 지적이 아니라 비율 스타일링 조언으로)",
      "상의, 하의, 아우터, 신발, 가방 방향",
      "데일리룩 예시",
      "피하면 좋은 스타일링",
    ],
  },
  {
    key: "accessoryGuide",
    number: "12",
    title: "액세서리 스타일 가이드",
    tier: "male",
    points: [
      "시계 · 목걸이 등 포인트 아이템 방향",
      "가방 같은 데일리 아이템 톤",
      "추구미에 맞는 골드 vs 실버 계열",
      "과하지 않게 포인트 주는 법",
    ],
  },
  {
    key: "perfumeGuide",
    number: "13",
    title: "향수 무드 추천",
    tier: "male",
    points: [
      "추구미에 어울리는 향 계열 (플로럴 · 우디 · 머스크 등)",
      "상황별(데일리 · 데이트) 향 강도",
      "향수 뿌리는 위치 · 양 팁",
    ],
  },
  {
    key: "colorMoodAnalysis",
    number: "14",
    title: "사진상 컬러 무드 분석",
    tier: "male",
    points: [
      "사진 기준으로 보이는 컬러 흐름",
      "밝기, 채도, 온도감, 선명도",
      "어울릴 가능성이 높은 컬러 방향",
      "조심하면 좋은 컬러 방향",
      "퍼스널컬러 확정 진단이 아니라는 안내",
      "옷, 헤어 컬러, 액세서리에 적용하는 방법",
    ],
  },
  {
    key: "avoidStyles",
    number: "15",
    title: "피하면 좋은 스타일 방향",
    tier: "male",
    points: [
      "추천 추구미와 멀어질 수 있는 색감",
      "과하게 보일 수 있는 액세서리·포인트",
      "무드를 흐릴 수 있는 헤어",
      "어색해질 수 있는 옷 실루엣",
      "단점 지적이 아니라 원하는 분위기와 멀어질 수 있는 방향으로 부드럽게 설명",
    ],
  },
  {
    key: "situationGuide",
    number: "16",
    title: "상황별 이미지 전략",
    tier: "male",
    points: [
      "소개팅/데이트",
      "인스타 프로필 사진",
      "데일리룩",
      "출근/면접",
      "친구 약속",
      "사진 찍는 날",
      "각 상황에서 어떤 옷, 헤어, 컬러를 선택하면 좋은지",
    ],
  },
];

// diagnosis/keywords/summary/tips/checklist are the premium-layout
// fields added on top of the original long-form "body" — optional so
// reports generated before this layout existed still render (renderer
// falls back to showing just the body in that case).
export type ReportChapterContent = {
  body: string;
  diagnosis?: string;
  keywords?: string[];
  summary?: string[];
  tips?: string[];
  checklist?: string[];
};

export type FullReport = {
  // Optional, not required — faceShapeAnalysis/animalTypeAnalysis only
  // exist when a photo was uploaded, and older cached reports (saved
  // before a given chapter/field existed) won't have every key either.
  // Renderers must check before reading a chapter.
  [K in ReportChapterKey]?: ReportChapterContent;
} & {
  // Reused as-is from the free preview (same rule-based mood images +
  // color palette) rather than re-derived or AI-generated, so the paid
  // report visually matches the preview and costs nothing extra.
  images: PreviewResult["images"];
  colorHint: PreviewResult["colorHint"];
  faceShapeType?: FaceShapeCandidate | null;
  animalType?: AnimalTypeCandidate | null;
  hairStyleType?: HairStyleCandidate | MaleHairStyleCandidate | null;
  makeupStyleType?: MakeupStyleCandidate | null;
  // Which chapter list generated this report — /report uses this to pick
  // REPORT_CHAPTERS vs MALE_REPORT_CHAPTERS for the TOC/section numbering.
  // Missing on reports generated before this field existed; treated as
  // non-male (REPORT_CHAPTERS) in that case.
  tier?: ReportTierName;
};

// ---------------------------------------------------------------------------
// Rule-based free-preview generator (no OpenAI call — see /result).
// ---------------------------------------------------------------------------

type MoodProfile = {
  subMood: MoodCandidate;
  tags: string[];
  oneLineSummary: string;
  currentMood: string[];
  upgradePoints: string[];
  colorHint: PreviewResult["colorHint"];
};

const MOOD_PROFILES: Record<MoodCandidate, MoodProfile> = {
  "청순 자연형": {
    subMood: "러블리 여리형",
    tags: ["#청순자연형", "#소프트컬러", "#내추럴메이크업", "#부드러운헤어"],
    oneLineSummary:
      "사진상으로는 편안하고 부드러운 이미지가 먼저 느껴져요. 여기에 자연스러운 헤어와 가벼운 메이크업을 더하면 맑고 깨끗한 분위기가 더 잘 살아날 수 있어요.",
    currentMood: ["부드러움", "자연스러움", "편안함"],
    upgradePoints: ["조금 더 정돈된 헤어", "밝고 부드러운 컬러", "가벼운 메이크업"],
    colorHint: {
      title: "사진상 컬러 무드 힌트",
      summary:
        "사진상으로는 밝고 부드러운 색감이 이미지를 더 맑게 보여줄 가능성이 높아요.",
      description:
        "아이보리, 소프트 핑크, 라이트 베이지처럼 밝고 깨끗한 색감은 현재 이미지의 부드러운 분위기를 더 자연스럽게 살려줄 수 있어요. 반대로 너무 탁하거나 강한 대비의 색감은 원하는 무드보다 무거워 보일 수 있습니다.",
      palette: [
        { name: "아이보리", hex: "#F7F1E5", description: "얼굴 분위기를 맑고 부드럽게 보여줄 수 있는 기본 컬러" },
        { name: "소프트 핑크", hex: "#F3C9D2", description: "러블리함과 생기를 자연스럽게 더해주는 컬러" },
        { name: "라이트 베이지", hex: "#E8D9C2", description: "부담 없이 따뜻하고 편안한 이미지를 만드는 컬러" },
        { name: "뮤트 라벤더", hex: "#C6B7DC", description: "은은하고 여리한 분위기를 더해주는 포인트 컬러" },
      ],
      caution:
        "사진상 컬러 무드 힌트는 확정적인 퍼스널컬러 진단이 아니라, 현재 사진의 조명과 색감 기준으로 제공되는 참고 의견입니다.",
    },
  },
  "고급 도시형": {
    subMood: "차분 시크형",
    tags: ["#고급도시형", "#모던컬러", "#클린메이크업", "#슬릭헤어"],
    oneLineSummary:
      "사진상으로는 정돈되고 세련된 분위기가 먼저 느껴져요. 낮은 채도와 깔끔한 실루엣을 더하면 도시적인 무드가 더 살아날 수 있어요.",
    currentMood: ["단정함", "깔끔함", "차분함"],
    upgradePoints: ["슬릭한 헤어스타일링", "낮은 채도 컬러", "미니멀한 메이크업"],
    colorHint: {
      title: "사진상 컬러 무드 힌트",
      summary: "사진상으로는 무채색에 가까운 톤이 이미지를 더 세련되게 보여줄 가능성이 높아요.",
      description:
        "그레이지, 화이트, 딥네이비처럼 정돈된 톤은 현재 이미지의 세련된 분위기를 더 살려줄 수 있어요. 반대로 너무 화사하거나 채도 높은 색감은 원하는 무드보다 가벼워 보일 수 있습니다.",
      palette: [
        { name: "그레이지", hex: "#B9B0A8", description: "차분하고 정돈된 인상을 만드는 컬러" },
        { name: "화이트", hex: "#F5F5F3", description: "깔끔하고 미니멀한 분위기를 더하는 컬러" },
        { name: "딥 네이비", hex: "#2F3A4C", description: "세련되고 신뢰감 있는 분위기를 만드는 컬러" },
        { name: "차콜", hex: "#4A4A4A", description: "도시적인 무게감을 더해주는 포인트 컬러" },
      ],
      caution:
        "사진상 컬러 무드 힌트는 확정적인 퍼스널컬러 진단이 아니라, 현재 사진의 조명과 색감 기준으로 제공되는 참고 의견입니다.",
    },
  },
  "차분 시크형": {
    subMood: "고급 도시형",
    tags: ["#차분시크형", "#무채색톤", "#딥메이크업", "#스트레이트헤어"],
    oneLineSummary:
      "사진상으로는 차분하고 무게감 있는 분위기가 먼저 느껴져요. 무채색 톤과 또렷한 포인트를 더하면 시크한 무드가 더 살아날 수 있어요.",
    currentMood: ["차분함", "시크함", "절제됨"],
    upgradePoints: ["또렷한 눈매 강조", "무채색 아이템", "정돈된 스트레이트 헤어"],
    colorHint: {
      title: "사진상 컬러 무드 힌트",
      summary: "사진상으로는 깊고 차분한 색감이 이미지를 더 시크하게 보여줄 가능성이 높아요.",
      description:
        "블랙, 차콜 그레이, 딥 버건디처럼 무게감 있는 색감은 현재 이미지의 차분한 분위기를 더 살려줄 수 있어요. 반대로 너무 밝고 파스텔 톤인 색감은 원하는 무드보다 가벼워 보일 수 있습니다.",
      palette: [
        { name: "블랙", hex: "#1C1C1C", description: "또렷하고 절제된 인상을 만드는 컬러" },
        { name: "차콜 그레이", hex: "#4A4A4A", description: "차분하고 무게감 있는 분위기를 더하는 컬러" },
        { name: "딥 버건디", hex: "#5C2A3A", description: "시크한 포인트를 더해주는 컬러" },
        { name: "스틸 블루", hex: "#4C5C6C", description: "차갑고 세련된 인상을 더하는 컬러" },
      ],
      caution:
        "사진상 컬러 무드 힌트는 확정적인 퍼스널컬러 진단이 아니라, 현재 사진의 조명과 색감 기준으로 제공되는 참고 의견입니다.",
    },
  },
  "러블리 여리형": {
    subMood: "청순 에겐형",
    tags: ["#러블리여리형", "#핑크컬러", "#글로시메이크업", "#웨이브헤어"],
    oneLineSummary:
      "사진상으로는 부드럽고 사랑스러운 분위기가 먼저 느껴져요. 은은한 광과 파스텔 톤을 더하면 러블리한 무드가 더 살아날 수 있어요.",
    currentMood: ["사랑스러움", "여림", "포근함"],
    upgradePoints: ["볼륨감 있는 웨이브", "파스텔 컬러", "촉촉한 광채 메이크업"],
    colorHint: {
      title: "사진상 컬러 무드 힌트",
      summary: "사진상으로는 파스텔에 가까운 색감이 이미지를 더 사랑스럽게 보여줄 가능성이 높아요.",
      description:
        "베이비 핑크, 피치, 라일락처럼 부드러운 색감은 현재 이미지의 사랑스러운 분위기를 더 살려줄 수 있어요. 반대로 너무 어둡거나 무채색인 색감은 원하는 무드보다 차가워 보일 수 있습니다.",
      palette: [
        { name: "베이비 핑크", hex: "#F6CBD6", description: "사랑스럽고 화사한 인상을 만드는 컬러" },
        { name: "피치", hex: "#F3C6A6", description: "포근하고 생기 있는 분위기를 더하는 컬러" },
        { name: "라일락", hex: "#D9C6E8", description: "은은하고 여린 무드를 더해주는 컬러" },
        { name: "크림", hex: "#F5EBDA", description: "부드럽고 편안한 인상을 만드는 컬러" },
      ],
      caution:
        "사진상 컬러 무드 힌트는 확정적인 퍼스널컬러 진단이 아니라, 현재 사진의 조명과 색감 기준으로 제공되는 참고 의견입니다.",
    },
  },
  "힙 트렌디형": {
    subMood: "러블리 힙형",
    tags: ["#힙트렌디형", "#볼드컬러", "#포인트메이크업", "#텍스처헤어"],
    oneLineSummary:
      "사진상으로는 개성 있고 트렌디한 분위기가 먼저 느껴져요. 볼드한 포인트와 독특한 실루엣을 더하면 힙한 무드가 더 살아날 수 있어요.",
    currentMood: ["개성 있음", "트렌디함", "자유분방함"],
    upgradePoints: ["텍스처가 살아있는 헤어", "볼드한 컬러 포인트", "그런지한 메이크업"],
    colorHint: {
      title: "사진상 컬러 무드 힌트",
      summary: "사진상으로는 대비가 또렷한 색감이 이미지를 더 개성 있게 보여줄 가능성이 높아요.",
      description:
        "블랙, 카키, 버건디에 포인트 컬러를 더한 조합은 현재 이미지의 트렌디한 분위기를 더 살려줄 수 있어요. 반대로 너무 무난하고 톤이 밋밋한 색감은 원하는 무드보다 심심해 보일 수 있습니다.",
      palette: [
        { name: "블랙", hex: "#1C1C1C", description: "힙한 무드의 기본이 되는 컬러" },
        { name: "카키", hex: "#6B6B4A", description: "개성 있는 분위기를 더하는 컬러" },
        { name: "버건디", hex: "#6B2A3A", description: "볼드한 포인트를 만드는 컬러" },
        { name: "실버", hex: "#B9BEC2", description: "트렌디한 메탈릭 포인트를 더하는 컬러" },
      ],
      caution:
        "사진상 컬러 무드 힌트는 확정적인 퍼스널컬러 진단이 아니라, 현재 사진의 조명과 색감 기준으로 제공되는 참고 의견입니다.",
    },
  },
  "러블리 힙형": {
    subMood: "힙 트렌디형",
    tags: ["#러블리힙형", "#믹스매치컬러", "#러블리포인트", "#볼륨헤어"],
    oneLineSummary:
      "사진상으로는 사랑스러움과 트렌디함이 함께 느껴져요. 러블리한 컬러에 힙한 아이템을 믹스하면 개성 있는 무드가 더 살아날 수 있어요.",
    currentMood: ["사랑스러움", "개성", "발랄함"],
    upgradePoints: ["믹스 매치 스타일링", "포인트 컬러 활용", "볼륨감 있는 헤어"],
    colorHint: {
      title: "사진상 컬러 무드 힌트",
      summary: "사진상으로는 핑크와 블랙의 조합이 이미지를 더 개성 있게 보여줄 가능성이 높아요.",
      description:
        "핑크 컬러에 블랙, 실버 같은 힙한 톤을 믹스하면 현재 이미지의 사랑스러우면서도 개성 있는 분위기를 더 살려줄 수 있어요. 반대로 한 가지 톤으로만 정리된 색감은 원하는 무드보다 밋밋해 보일 수 있습니다.",
      palette: [
        { name: "핫핑크", hex: "#D9789C", description: "러블리하면서도 힙한 포인트를 만드는 컬러" },
        { name: "블랙", hex: "#1C1C1C", description: "믹스 매치의 중심이 되는 컬러" },
        { name: "실버", hex: "#B9BEC2", description: "트렌디한 메탈릭 포인트를 더하는 컬러" },
        { name: "딥 퍼플", hex: "#5C4A6B", description: "은은하면서도 개성 있는 분위기를 더하는 컬러" },
      ],
      caution:
        "사진상 컬러 무드 힌트는 확정적인 퍼스널컬러 진단이 아니라, 현재 사진의 조명과 색감 기준으로 제공되는 참고 의견입니다.",
    },
  },
  "청순 에겐형": {
    subMood: "러블리 여리형",
    tags: ["#청순에겐형", "#뽀얀톤", "#무쌍메이크업", "#자연스러운헤어"],
    oneLineSummary:
      "사진상으로는 여리여리하고 순수한 분위기가 먼저 느껴져요. 뽀얀 피부 표현과 부드러운 라인을 더하면 특유의 분위기가 더 살아날 수 있어요.",
    currentMood: ["여림", "순수함", "청초함"],
    upgradePoints: ["자연스러운 헤어라인", "뽀얀 베이스 표현", "은은한 립 컬러"],
    colorHint: {
      title: "사진상 컬러 무드 힌트",
      summary: "사진상으로는 뽀얀 화이트 톤이 이미지를 더 순수하게 보여줄 가능성이 높아요.",
      description:
        "화이트, 라이트 핑크, 베이지처럼 맑은 색감은 현재 이미지의 여리여리한 분위기를 더 살려줄 수 있어요. 반대로 너무 어둡거나 채도 높은 색감은 원하는 무드보다 세 보일 수 있습니다.",
      palette: [
        { name: "화이트", hex: "#F7F5F2", description: "맑고 순수한 인상을 만드는 컬러" },
        { name: "라이트 핑크", hex: "#F3D6DD", description: "여리여리한 분위기를 더하는 컬러" },
        { name: "베이지", hex: "#E8DCC8", description: "부드럽고 편안한 톤을 더하는 컬러" },
        { name: "소프트 라벤더", hex: "#DCD0EA", description: "은은한 포인트를 더해주는 컬러" },
      ],
      caution:
        "사진상 컬러 무드 힌트는 확정적인 퍼스널컬러 진단이 아니라, 현재 사진의 조명과 색감 기준으로 제공되는 참고 의견입니다.",
    },
  },
  "일본 여주형": {
    subMood: "청순 자연형",
    tags: ["#일본여주형", "#웜톤무드", "#자연스러운메이크업", "#차분한헤어"],
    oneLineSummary:
      "사진상으로는 잔잔하고 감성적인 분위기가 먼저 느껴져요. 은은한 웜톤과 자연스러운 표정을 더하면 영화 속 주인공 같은 무드가 더 살아날 수 있어요.",
    currentMood: ["잔잔함", "감성적", "자연스러움"],
    upgradePoints: ["차분한 헤어스타일링", "웜톤 메이크업", "내추럴한 컬러 코디"],
    colorHint: {
      title: "사진상 컬러 무드 힌트",
      summary: "사진상으로는 은은한 웜톤이 이미지를 더 감성적으로 보여줄 가능성이 높아요.",
      description:
        "웜 베이지, 브라운, 코랄처럼 따뜻한 색감은 현재 이미지의 잔잔한 분위기를 더 살려줄 수 있어요. 반대로 너무 차갑고 쨍한 색감은 원하는 무드보다 튀어 보일 수 있습니다.",
      palette: [
        { name: "웜 베이지", hex: "#E4D3B8", description: "따뜻하고 자연스러운 인상을 만드는 컬러" },
        { name: "브라운", hex: "#8A5A3C", description: "차분하고 감성적인 분위기를 더하는 컬러" },
        { name: "코랄", hex: "#E8A98C", description: "은은한 생기를 더해주는 컬러" },
        { name: "아이보리", hex: "#F2E9D8", description: "부드럽고 맑은 톤을 더하는 컬러" },
      ],
      caution:
        "사진상 컬러 무드 힌트는 확정적인 퍼스널컬러 진단이 아니라, 현재 사진의 조명과 색감 기준으로 제공되는 참고 의견입니다.",
    },
  },
};

const SHARED_MISSIONS = [
  "상의는 무채색보다 아이보리나 크림톤으로 바꿔보기",
  "립은 쨍한 컬러보다 오늘의 추구미에 맞는 톤으로 써보기",
  "머리는 얼굴선을 살짝 감싸도록 자연스럽게 스타일링하기",
];

const SHARED_HINTS: PreviewResult["hints"] = {
  styling: {
    title: "스타일링 힌트",
    content:
      "밝고 자연스러운 색감을 중심으로, 소재와 실루엣이 부드러운 아이템이 오늘의 추구미와 잘 맞을 수 있어요.",
  },
  hair: {
    title: "헤어 힌트",
    content:
      "너무 강한 스타일링보다 얼굴선을 자연스럽게 감싸는 방향이 현재 무드와 잘 어울릴 가능성이 높아요.",
  },
  makeup: {
    title: "메이크업 힌트",
    content:
      "과한 음영보다 맑은 베이스와 포인트를 살린 메이크업이 원하는 분위기를 더 잘 살려줄 수 있어요.",
  },
};

const SHARED_LOCKED_SECTIONS = [
  "추천 컬러 팔레트",
  "어울리는 옷 색감과 실루엣",
  "헤어 길이 · 앞머리 · 펌 방향",
  "베이스 · 아이 · 블러셔 · 립 메이크업",
  "피하면 좋은 스타일 방향",
  "인스타/데이트/면접용 이미지 전략",
  "퍼스널컬러 방향 힌트",
  "피하면 좋은 색감",
  "옷 색감 적용법",
  "헤어 컬러 방향",
  "사진상 얼굴형 분석",
  "사진상 동물상 분석",
];

function pickRecommendedMood(answers: Record<string, unknown>): MoodCandidate {
  const raw = String(answers?.["moodDirection"] ?? "");
  if (raw.includes("청순")) return "청순 자연형";
  if (raw.includes("도시")) return "고급 도시형";
  if (raw.includes("시크")) return "차분 시크형";
  if (raw.includes("러블리")) return "러블리 여리형";
  if (raw.includes("힙")) return "힙 트렌디형";
  return "청순 자연형";
}

/**
 * Builds a PreviewResult from the user's test answers using fixed rules —
 * no OpenAI call. Used by /result so the free preview never costs API usage.
 */
export function buildPreviewResult(
  answers: Record<string, unknown>,
): PreviewResult {
  const recommendedMood = pickRecommendedMood(answers);
  const profile = MOOD_PROFILES[recommendedMood];

  const others = MOOD_CANDIDATES.filter(
    (mood) => mood !== recommendedMood && mood !== profile.subMood,
  );
  const order: MoodCandidate[] = [recommendedMood, profile.subMood, ...others];
  const scores = [84, 71, 63, 55, 47, 40, 35, 30];
  const moodSync = order.map((mood, index) => ({
    mood,
    score: scores[index] ?? 30,
  }));

  return {
    recommendedMood,
    subMood: profile.subMood,
    oneLineSummary: profile.oneLineSummary,
    tags: profile.tags,
    moodSync,
    colorHint: profile.colorHint,
    currentMood: profile.currentMood,
    upgradePoints: profile.upgradePoints,
    missions: SHARED_MISSIONS,
    hints: SHARED_HINTS,
    lockedSections: SHARED_LOCKED_SECTIONS,
    images: imagesForMood(recommendedMood, profile.subMood),
    // The free preview never analyzes the photo (no OpenAI call), so it
    // has no way to classify face shape/animal type — only the paid
    // report (after checkout) fills these in.
    faceShapeType: null,
    animalType: null,
  };
}

// ---------------------------------------------------------------------------
// Male report visuals — a parallel system to MOOD_CANDIDATES/MOOD_PROFILES
// above. Male users answer a completely different moodDirection question
// (see app/test's maleSteps) and skip the free preview entirely, but the
// paid report still needs mood-matched hero/hair photos and a
// male-appropriate color hint. Reusing buildPreviewResult() for male tier
// was the bug that made every male report render with female content and
// photos: pickRecommendedMood() never matched any male answer string, so
// it silently fell back to "청순 자연형" every time.
// ---------------------------------------------------------------------------

export const MALE_MOOD_CANDIDATES = [
  "댄디",
  "미니멀",
  "시티보이",
  "스트릿",
  "클래식",
  "모던",
] as const;

export type MaleMoodCandidate = (typeof MALE_MOOD_CANDIDATES)[number];

export const MALE_HAIR_STYLE_CANDIDATES = [
  "가르마펌",
  "시스루펌",
  "빈티지펌",
  "세미리프컷",
  "슬릭댄디컷",
  "슬릭백",
  "소프트레이어컷",
  "포마드 리젠트",
  "셀릭컷",
  "포인펌",
  "시스루포인펌",
  "히피펌",
  "스왈로펌",
  "빈티지펌2",
  "세미리프펌",
  "텍스처컷",
  "미디엄울프컷",
  "시스루댄디컷",
] as const;

export type MaleHairStyleCandidate = (typeof MALE_HAIR_STYLE_CANDIDATES)[number];

// AI picks one of the names above for the male hairGuide chapter's "type"
// field — same mechanism as the female HAIR_STYLE_IMAGES.
export const MALE_HAIR_STYLE_IMAGES: Record<MaleHairStyleCandidate, string> = {
  가르마펌: "/mood/hair-male/가르마펌.png",
  시스루펌: "/mood/hair-male/시스루펌.png",
  빈티지펌: "/mood/hair-male/빈티지펌.png",
  세미리프컷: "/mood/hair-male/세미리프컷.png",
  슬릭댄디컷: "/mood/hair-male/슬릭댄디컷.png",
  슬릭백: "/mood/hair-male/슬릭백.png",
  소프트레이어컷: "/mood/hair-male/소프트레이어컷.png",
  "포마드 리젠트": "/mood/hair-male/포마드 리젠트.png",
  셀릭컷: "/mood/hair-male/셀릭컷.png",
  포인펌: "/mood/hair-male/포인펌.png",
  시스루포인펌: "/mood/hair-male/시스루포인펌.png",
  히피펌: "/mood/hair-male/히피펌.png",
  스왈로펌: "/mood/hair-male/스왈로펌.png",
  빈티지펌2: "/mood/hair-male/빈티지펌2.png",
  세미리프펌: "/mood/hair-male/세미리프펌.png",
  텍스처컷: "/mood/hair-male/텍스처컷.png",
  미디엄울프컷: "/mood/hair-male/미디엄울프컷.png",
  시스루댄디컷: "/mood/hair-male/시스루댄디컷.png",
};

// Every reference photo prepared per male mood in public/mood/cards-male —
// same 12-photo set used by /detail-male's mood cards, paired up two per
// mood so the report's several hero-style chapters can vary the photo
// instead of repeating the same one.
const MALE_MOOD_HERO_GALLERY: Record<MaleMoodCandidate, string[]> = {
  댄디: ["/mood/cards-male/댄디st.png", "/mood/cards-male/남친룩st.png"],
  미니멀: [
    "/mood/cards-male/미니멀st.png",
    "/mood/cards-male/콰이어트 럭셔리st.png",
  ],
  시티보이: ["/mood/cards-male/시티보이st.png", "/mood/cards-male/소년미st.png"],
  스트릿: ["/mood/cards-male/스트릿st.png", "/mood/cards-male/아이돌st.png"],
  클래식: [
    "/mood/cards-male/클래식st.png",
    "/mood/cards-male/너드_프레피st.png",
  ],
  모던: ["/mood/cards-male/모드st.png", "/mood/cards-male/빈티지st.png"],
};

const MALE_HAIR_IMAGES = Object.values(MALE_HAIR_STYLE_IMAGES);

function imagesForMaleMood(
  mood: MaleMoodCandidate,
  subMood: MaleMoodCandidate,
): PreviewResult["images"] {
  const moodCount = MALE_MOOD_CANDIDATES.length;
  const combinedIndex =
    MALE_MOOD_CANDIDATES.indexOf(mood) * moodCount +
    MALE_MOOD_CANDIDATES.indexOf(subMood);
  const heroGallery = MALE_MOOD_HERO_GALLERY[mood];
  return {
    hero: heroGallery[0],
    heroGallery,
    hair: MALE_HAIR_IMAGES[combinedIndex % MALE_HAIR_IMAGES.length],
    // Male reports never include a makeupGuide chapter, so this is never
    // actually read — left empty rather than pointing at an unrelated photo.
    makeup: "",
  };
}

const MALE_COLOR_CAUTION =
  "사진상 컬러 무드 힌트는 확정적인 퍼스널컬러 진단이 아니라, 현재 사진의 조명과 색감 기준으로 제공되는 참고 의견입니다.";

type MaleMoodProfile = {
  subMood: MaleMoodCandidate;
  tags: string[];
  oneLineSummary: string;
  currentMood: string[];
  upgradePoints: string[];
  colorHint: PreviewResult["colorHint"];
};

const MALE_MOOD_PROFILES: Record<MaleMoodCandidate, MaleMoodProfile> = {
  댄디: {
    subMood: "클래식",
    tags: ["#댄디", "#클린컬러", "#단정헤어", "#포인트아이템"],
    oneLineSummary:
      "사진상으로는 단정하고 깔끔한 인상이 먼저 느껴져요. 정돈된 헤어와 클린한 컬러를 더하면 댄디한 무드가 더 살아날 수 있어요.",
    currentMood: ["단정함", "깔끔함", "차분함"],
    upgradePoints: ["조금 더 정돈된 헤어라인", "무채색 중심의 클린한 컬러", "슬림한 핏의 아우터"],
    colorHint: {
      title: "사진상 컬러 무드 힌트",
      summary: "사진상으로는 정돈된 톤이 이미지를 더 단정하게 보여줄 가능성이 높아요.",
      description:
        "네이비, 화이트, 카멜처럼 정돈된 톤은 현재 이미지의 단정한 분위기를 더 살려줄 수 있어요. 반대로 너무 화려하거나 채도 높은 색감은 원하는 무드보다 산만해 보일 수 있습니다.",
      palette: [
        { name: "네이비", hex: "#2F3A4C", description: "단정하고 신뢰감 있는 인상을 만드는 컬러" },
        { name: "화이트", hex: "#F5F5F3", description: "깔끔하고 정돈된 분위기를 더하는 컬러" },
        { name: "카멜", hex: "#B08A5A", description: "부드럽고 따뜻한 무게감을 더하는 컬러" },
        { name: "차콜", hex: "#4A4A4A", description: "차분하고 세련된 포인트를 더하는 컬러" },
      ],
      caution: MALE_COLOR_CAUTION,
    },
  },
  미니멀: {
    subMood: "모던",
    tags: ["#미니멀", "#뉴트럴톤", "#담백한핏", "#슬릭헤어"],
    oneLineSummary:
      "사진상으로는 담백하고 절제된 분위기가 먼저 느껴져요. 불필요한 디테일을 덜어내면 미니멀한 무드가 더 살아날 수 있어요.",
    currentMood: ["담백함", "절제됨", "차분함"],
    upgradePoints: ["로고·패턴 없는 기본 아이템", "뉴트럴 톤 배색", "슬릭하게 정리한 헤어"],
    colorHint: {
      title: "사진상 컬러 무드 힌트",
      summary: "사진상으로는 무채색에 가까운 톤이 이미지를 더 담백하게 보여줄 가능성이 높아요.",
      description:
        "그레이지, 화이트, 베이지처럼 무채색에 가까운 톤은 현재 이미지의 담백한 분위기를 더 살려줄 수 있어요. 반대로 패턴이 많거나 채도 높은 색감은 원하는 무드보다 복잡해 보일 수 있습니다.",
      palette: [
        { name: "그레이지", hex: "#B9B0A8", description: "절제되고 담백한 인상을 만드는 컬러" },
        { name: "화이트", hex: "#F5F5F3", description: "깨끗하고 미니멀한 분위기를 더하는 컬러" },
        { name: "베이지", hex: "#D8CBB8", description: "편안하고 자연스러운 톤을 더하는 컬러" },
        { name: "블랙", hex: "#1C1C1C", description: "무게감 있는 포인트를 더하는 컬러" },
      ],
      caution: MALE_COLOR_CAUTION,
    },
  },
  시티보이: {
    subMood: "스트릿",
    tags: ["#시티보이", "#레이어드", "#여유핏", "#감각적무드"],
    oneLineSummary:
      "사진상으로는 편안하면서도 감각적인 분위기가 먼저 느껴져요. 여유로운 실루엣을 더하면 시티보이 무드가 더 살아날 수 있어요.",
    currentMood: ["편안함", "감각적임", "여유로움"],
    upgradePoints: ["레이어드 스타일링", "뉴트럴 톤 코디", "자연스러운 텍스처 헤어"],
    colorHint: {
      title: "사진상 컬러 무드 힌트",
      summary: "사진상으로는 자연스러운 톤이 이미지를 더 편안하게 보여줄 가능성이 높아요.",
      description:
        "카키, 브라운, 아이보리처럼 자연스러운 톤은 현재 이미지의 편안한 분위기를 더 살려줄 수 있어요. 반대로 너무 각지고 딱딱한 색 조합은 원하는 무드보다 경직돼 보일 수 있습니다.",
      palette: [
        { name: "카키", hex: "#6B6B4A", description: "편안하고 감각적인 인상을 만드는 컬러" },
        { name: "브라운", hex: "#8A5A3C", description: "따뜻하고 자연스러운 분위기를 더하는 컬러" },
        { name: "아이보리", hex: "#F2E9D8", description: "부드럽고 편안한 톤을 더하는 컬러" },
        { name: "그레이", hex: "#8C8C8C", description: "차분한 균형감을 더하는 컬러" },
      ],
      caution: MALE_COLOR_CAUTION,
    },
  },
  스트릿: {
    subMood: "시티보이",
    tags: ["#스트릿", "#오버핏", "#포인트아이템", "#자유분방"],
    oneLineSummary:
      "사진상으로는 자유롭고 개성 있는 분위기가 먼저 느껴져요. 오버핏 실루엣과 포인트 아이템을 더하면 스트릿 무드가 더 살아날 수 있어요.",
    currentMood: ["개성 있음", "자유분방함", "트렌디함"],
    upgradePoints: ["오버핏 아이템 활용", "포인트 컬러 매치", "볼륨감 있는 헤어 스타일링"],
    colorHint: {
      title: "사진상 컬러 무드 힌트",
      summary: "사진상으로는 대비가 또렷한 색감이 이미지를 더 개성 있게 보여줄 가능성이 높아요.",
      description:
        "블랙, 카키에 포인트 컬러를 더한 조합은 현재 이미지의 개성 있는 분위기를 더 살려줄 수 있어요. 반대로 너무 무난하고 톤이 밋밋한 색감은 원하는 무드보다 심심해 보일 수 있습니다.",
      palette: [
        { name: "블랙", hex: "#1C1C1C", description: "개성 있는 무드의 기본이 되는 컬러" },
        { name: "카키", hex: "#6B6B4A", description: "자유로운 분위기를 더하는 컬러" },
        { name: "오렌지", hex: "#D97B3F", description: "볼드한 포인트를 만드는 컬러" },
        { name: "화이트", hex: "#F5F5F3", description: "전체 톤을 정리해주는 컬러" },
      ],
      caution: MALE_COLOR_CAUTION,
    },
  },
  클래식: {
    subMood: "댄디",
    tags: ["#클래식", "#포멀무드", "#기본템", "#남성적인분위기"],
    oneLineSummary:
      "사진상으로는 단정하고 포멀한 분위기가 먼저 느껴져요. 기본에 충실한 아이템을 더하면 클래식한 무드가 더 살아날 수 있어요.",
    currentMood: ["단정함", "신뢰감", "차분함"],
    upgradePoints: ["셔츠·재킷 중심의 코디", "정갈하게 정리한 헤어라인", "무게감 있는 다크톤 컬러"],
    colorHint: {
      title: "사진상 컬러 무드 힌트",
      summary: "사진상으로는 무게감 있는 톤이 이미지를 더 단정하게 보여줄 가능성이 높아요.",
      description:
        "네이비, 차콜, 화이트처럼 무게감 있는 톤은 현재 이미지의 단정한 분위기를 더 살려줄 수 있어요. 반대로 너무 화사하거나 캐주얼한 색감은 원하는 무드보다 가벼워 보일 수 있습니다.",
      palette: [
        { name: "네이비", hex: "#2F3A4C", description: "포멀하고 신뢰감 있는 인상을 만드는 컬러" },
        { name: "차콜", hex: "#4A4A4A", description: "단정하고 무게감 있는 분위기를 더하는 컬러" },
        { name: "화이트", hex: "#F5F5F3", description: "깔끔한 대비를 만드는 컬러" },
        { name: "버건디", hex: "#5C2A3A", description: "고급스러운 포인트를 더하는 컬러" },
      ],
      caution: MALE_COLOR_CAUTION,
    },
  },
  모던: {
    subMood: "미니멀",
    tags: ["#모던", "#무채색톤", "#날렵한실루엣", "#시크한무드"],
    oneLineSummary:
      "사진상으로는 날렵하고 시크한 분위기가 먼저 느껴져요. 무채색 톤과 슬림한 실루엣을 더하면 모던한 무드가 더 살아날 수 있어요.",
    currentMood: ["시크함", "세련됨", "절제됨"],
    upgradePoints: ["블랙 중심의 무채색 코디", "슬림한 실루엣", "슬릭하게 정리한 헤어"],
    colorHint: {
      title: "사진상 컬러 무드 힌트",
      summary: "사진상으로는 무채색 계열이 이미지를 더 시크하게 보여줄 가능성이 높아요.",
      description:
        "블랙, 차콜, 실버처럼 무채색 계열의 톤은 현재 이미지의 시크한 분위기를 더 살려줄 수 있어요. 반대로 너무 밝고 따뜻한 색감은 원하는 무드보다 부드러워 보일 수 있습니다.",
      palette: [
        { name: "블랙", hex: "#1C1C1C", description: "시크한 무드의 기본이 되는 컬러" },
        { name: "차콜", hex: "#4A4A4A", description: "절제된 무게감을 더하는 컬러" },
        { name: "실버", hex: "#B9BEC2", description: "날렵하고 세련된 포인트를 더하는 컬러" },
        { name: "화이트", hex: "#F5F5F3", description: "깔끔한 대비를 만드는 컬러" },
      ],
      caution: MALE_COLOR_CAUTION,
    },
  },
};

const SHARED_MALE_MISSIONS = [
  "상의는 무채색 위주로 깔끔하게 정리해보기",
  "액세서리는 톤을 하나로 맞춰서 과하지 않게 매치해보기",
  "머리는 이마와 헤어라인이 정리되도록 스타일링하기",
];

const SHARED_MALE_HINTS: PreviewResult["hints"] = {
  styling: {
    title: "스타일링 힌트",
    content:
      "무채색과 뉴트럴 톤을 중심으로, 핏이 정돈된 아이템이 오늘의 추구미와 잘 맞을 수 있어요.",
  },
  hair: {
    title: "헤어 힌트",
    content:
      "이마 라인과 옆머리를 깔끔하게 정리하는 방향이 현재 무드와 잘 어울릴 가능성이 높아요.",
  },
  makeup: {
    // 남성 리포트에는 메이크업 챕터가 없지만 PreviewResult.hints는 3개
    // 필드 모두 필수라 그루밍 팁으로 대체 — 어차피 male 리포트 렌더러는
    // 이 필드를 읽지 않는다 (makeupGuide 챕터 자체가 생성되지 않음).
    title: "그루밍 힌트",
    content:
      "과하지 않은 피부 정돈과 눈썹 정리 정도로도 전체 인상이 훨씬 깔끔해질 수 있어요.",
  },
};

const SHARED_MALE_LOCKED_SECTIONS = [
  "추천 컬러 팔레트",
  "어울리는 옷 색감과 실루엣",
  "헤어 길이 · 헤어라인 · 펌 방향",
  "액세서리 스타일 방향",
  "피하면 좋은 스타일 방향",
  "인스타/데이트/면접용 이미지 전략",
  "퍼스널컬러 방향 힌트",
  "피하면 좋은 색감",
  "옷 색감 적용법",
  "헤어 컬러 방향",
  "사진상 얼굴형 분석",
  "사진상 동물상 분석",
];

function pickMaleRecommendedMood(
  answers: Record<string, unknown>,
): MaleMoodCandidate {
  const raw = String(answers?.["moodDirection"] ?? "");
  if (raw.includes("댄디")) return "댄디";
  if (raw.includes("미니멀")) return "미니멀";
  if (raw.includes("시티보이")) return "시티보이";
  if (raw.includes("스트릿")) return "스트릿";
  if (raw.includes("클래식")) return "클래식";
  if (raw.includes("모던")) return "모던";
  return "댄디";
}

/**
 * Male-tier equivalent of buildPreviewResult() — used by /api/generate-report
 * as the visuals fallback when no client-side previewResult was sent (always
 * the case for male tier, since male users skip /result entirely).
 */
export function buildMalePreviewResult(
  answers: Record<string, unknown>,
): PreviewResult {
  const recommendedMood = pickMaleRecommendedMood(answers);
  const profile = MALE_MOOD_PROFILES[recommendedMood];

  const others = MALE_MOOD_CANDIDATES.filter(
    (mood) => mood !== recommendedMood && mood !== profile.subMood,
  );
  const order: MaleMoodCandidate[] = [recommendedMood, profile.subMood, ...others];
  const scores = [84, 71, 63, 55, 47, 40];
  const moodSync = order.map((mood, index) => ({
    mood,
    score: scores[index] ?? 30,
  }));

  return {
    recommendedMood,
    subMood: profile.subMood,
    oneLineSummary: profile.oneLineSummary,
    tags: profile.tags,
    moodSync,
    colorHint: profile.colorHint,
    currentMood: profile.currentMood,
    upgradePoints: profile.upgradePoints,
    missions: SHARED_MALE_MISSIONS,
    hints: SHARED_MALE_HINTS,
    lockedSections: SHARED_MALE_LOCKED_SECTIONS,
    images: imagesForMaleMood(recommendedMood, profile.subMood),
    faceShapeType: null,
    animalType: null,
  };
}
