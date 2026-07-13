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
};

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
};

export type FullReport = {
  summary: {
    recommendedMood: string;
    subMood: string;
    keywords: string[];
    finalAdvice: string;
  };
  currentImageMood: {
    title: string;
    content: string;
  };
  gapAnalysis: {
    title: string;
    content: string;
  };
  styling: {
    title: string;
    colors: string[];
    silhouettes: string[];
    items: string[];
    avoid: string[];
  };
  hair: {
    title: string;
    length: string;
    bangs: string;
    perm: string;
    color: string;
    salonScript: string;
  };
  makeup: {
    base: string;
    eyebrow: string;
    eye: string;
    blush: string;
    lip: string;
  };
  colorMood: {
    title: string;
    tone: string;
    recommendedPalette: string[];
    avoidColors: string[];
    notice: string;
  };
  situationGuide: {
    dating: string;
    instagram: string;
    daily: string;
    interview: string;
  };
  finalChecklist: string[];
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
  };
}
