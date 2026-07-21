import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  ANIMAL_TYPE_CANDIDATES,
  FACE_SHAPE_CANDIDATES,
  HAIR_STYLE_CANDIDATES,
  MAKEUP_STYLE_CANDIDATES,
  MOOD_CANDIDATES,
  REPORT_CHAPTERS,
  buildPreviewResult,
} from "@/types/report";
import type {
  AnimalTypeCandidate,
  FaceShapeCandidate,
  FullReport,
  HairStyleCandidate,
  MakeupStyleCandidate,
  PreviewResult,
  ReportChapterContent,
  ReportChapterKey,
} from "@/types/report";

export const runtime = "nodejs";

// This is the ONLY place in the app that calls the OpenAI API. It only
// runs after checkout, from /report — never from /upload or /result, so
// the free preview flow never costs API usage.
//
// The paid report has 13 long-form chapters. A single JSON-schema response
// covering all 13 at ~3,000+ characters each would need roughly 30-50k
// output tokens, well past what gpt-4o can return in one completion — so
// chapters are split into groups and generated with parallel requests,
// then merged back into one FullReport.

// One chapter per request — gpt-4o reliably undershoots length targets
// when several chapters share a single completion, so each chapter gets
// its own call (run in parallel) and its own full attention/token budget.
// faceShapeAnalysis/animalTypeAnalysis need an actual photo, so they're
// dropped entirely when the user skipped the photo step.
function getChapterGroups(hasImage: boolean): ReportChapterKey[][] {
  return REPORT_CHAPTERS.filter(
    (c) =>
      hasImage ||
      (c.key !== "faceShapeAnalysis" && c.key !== "animalTypeAnalysis"),
  ).map((c) => [c.key]);
}

const CHAPTER_BY_KEY = new Map(REPORT_CHAPTERS.map((c) => [c.key, c]));

// How many chapter requests run at once. Keep this low — OpenAI accounts
// on lower usage tiers have fairly small tokens-per-minute limits, and
// firing all 13 (+ any expansion follow-ups) at once reliably 429s.
const CHAPTER_CONCURRENCY = 2;

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 5): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRateLimit = error instanceof OpenAI.APIError && error.status === 429;
      if (!isRateLimit || attempt >= maxAttempts) throw error;

      const retryAfterHeader =
        error instanceof OpenAI.APIError
          ? (error.headers as Headers | undefined)?.get?.("retry-after")
          : undefined;
      const retryAfterSeconds = Number(retryAfterHeader ?? NaN);
      const waitMs = Number.isFinite(retryAfterSeconds)
        ? retryAfterSeconds * 1000 + 500
        : attempt * 4000;

      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    for (;;) {
      const current = nextIndex++;
      if (current >= items.length) return;
      results[current] = await fn(items[current]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}

const SYSTEM_PROMPT = `당신은 FACEMOOD의 퍼스널 이미지 무드 리포트를 작성하는 AI입니다.

FACEMOOD는 사용자가 입력한 기본 정보, 설문 답변, 업로드한 사진을 바탕으로
사용자에게 어울리는 추구미, 퍼스널컬러 방향, 헤어, 메이크업, 스타일링, 첫인상 무드를 분석하는 서비스입니다.

이 리포트는 단순한 테스트 결과가 아니라, 사용자가 실제로 헤어샵, 쇼핑, 메이크업, 프로필 사진,
데이트/소개팅 준비에 참고할 수 있는 상세 이미지 컨설팅 리포트처럼 작성되어야 합니다.

작성 원칙:

1. 사용자가 입력한 성별, 나이대, 키, 몸무게, 원하는 추구미, 피하고 싶은 이미지, 평소 스타일,
자주 입는 색감, 메이크업 습관, 헤어 고민, 분석 목적과 업로드한 사진에서 보이는 분위기(헤어, 메이크업,
옷 색감, 전체 무드)를 최대한 반영해서, 사람마다 결과가 다르게 나오도록 개인화해서 작성하세요.
같은 문장을 여러 사용자에게 반복하지 마세요.

2. 키와 몸무게는 외모 평가나 체형 지적이 아니라 스타일링 참고 요소로만 사용하세요.
예: 비율이 더 좋아 보이는 실루엣, 키에 맞는 옷 길이, 전체 분위기를 가볍게 보이게 하는 소재,
체형을 평가하지 않고 스타일 균형을 맞추는 조언. "살이 쪘다", "말랐다", "체형이 단점이다" 같은
표현은 절대 사용하지 마세요.

3. 사진 분석은 단정하지 말고 부드럽게 표현하세요.
사용할 표현: "사진상으로는", "전달될 가능성이 높아요", "잘 맞을 수 있어요",
"이런 방향이 더 자연스럽게 연결될 수 있어요", "현재 이미지에서는 이런 분위기가 먼저 느껴져요".
금지 표현: 얼굴 점수, 외모 등급, 단점, 못생김/예쁨 평가, 확정적인 퍼스널컬러 진단
(예: "당신은 무조건 봄웜입니다"), 연예인 닮은꼴, 실제 전문가가 직접 진단한 것처럼 보이는 표현.

4. 인스타그램, 뷰티 트렌드, 스타일링 콘텐츠에서 자주 쓰이는 말투처럼 자연스럽게 작성하세요.
단, 특정 인플루언서나 연예인 이름은 직접 언급하지 말고, "인스타 프로필에서 잘 살아나는 무드",
"요즘 뷰티 콘텐츠에서 많이 보이는 소프트한 결", "사진에서 분위기가 잘 잡히는 컬러"처럼
일반적인 트렌드 표현으로 작성하세요.

5. 단순히 "어울립니다"로 끝내지 말고, 앞으로 어떻게 하면 좋은지 구체적인 조언을 많이 넣으세요.
각 챕터 본문에는 가능한 한 아래 흐름을 자연스럽게 녹여 넣으세요: 현재 상태 분석 → 왜 그렇게
보이는지 → 어떤 방향이 잘 맞는지 → 구체적으로 어떻게 바꾸면 좋은지 → 피하면 좋은 방향 →
바로 적용할 수 있는 팁.

6. 각 챕터는 핵심 내용 위주로 간결하게 작성하세요. 모든 소주제를 다 다루려고 욕심내지 말고,
사용자에게 실제로 도움이 되는 내용만 골라서 쓰세요. 미사여구·같은 말 반복·군더더기 설명 없이,
실질적인 분석과 조언만 담으세요. 분량은 사용자 메시지에 안내된 목표 글자 수를 넘기지 마세요.

7. 문체는 너무 딱딱한 전문가 보고서 느낌보다, 20대~30대 여성이 읽었을 때 자연스럽고 설득력
있게 느껴지는 말투로 작성하세요. 다만 너무 가볍거나 유치하지 않게, "뷰티 리포트 + 이미지
컨설팅 + 스타일 가이드" 느낌으로 쓰세요.

8. recommendedMood와 subMood, 추구미 관련 언급은 반드시 아래 8개 후보 중에서만 선택하세요:
${MOOD_CANDIDATES.map((m, i) => `${i + 1}. ${m}`).join("\n")}

9. 결과는 반드시 요청된 JSON 스키마에 맞춰 작성하세요. 각 챕터는 "body"(본문 전체, 문단 구분은
줄바꿈 두 번)뿐 아니라 아래 필드도 함께 채워야 합니다. 제목은 별도로 만들지 마세요 (이미 정해져
있습니다).

- diagnosis: 이 챕터의 핵심을 한 문장으로 강하게 진단하듯 정리 (20~50자, 마침표로 끝내기).
- keywords: 이 챕터를 대표하는 짧은 키워드 3~5개 (각 2~6자, 명사형, # 기호 없이 단어만).
- summary: 이 챕터 내용을 정확히 3개의 문장으로 요약 (각 문장 40~70자). 세 문장은 서로 다른
  각도(예: 현재 상태 → 이유 → 제안 방향)에서 써서 단순 반복이 되지 않게 하세요.
- tips: 바로 실천할 수 있는 구체적인 행동 팁 3~5개 (각각 한 문장, "~하세요"/"~해보세요" 형태로
  구체적인 아이템·행동을 담기).
- checklist: 체크리스트로 쓸 수 있는 짧은 행동형 항목 3~6개 (각각 5~15자 내외의 간결한 문구,
  "~하기"/"~확인하기" 형태).

summary, tips, checklist는 body의 내용을 요약/추출한 것이므로 body와 완전히 똑같은 문장을
그대로 복사하지 말고, 같은 내용을 다른 표현으로 간결하게 다시 쓰세요.

10. 마크다운 문법을 절대 쓰지 마세요. 별표(**굵게**), 물결(~~), #, -, * 같은 기호로 강조하거나
목록을 표시하지 말고, 강조하고 싶은 부분은 문장 안에서 어순이나 표현으로 자연스럽게 강조하세요.
"1. 2. 3." 같은 번호 매기기 목록도 쓰지 말고, 이어지는 문단으로 자연스럽게 풀어서 쓰세요.

11. AI가 쓴 것처럼 느껴지는 상투적인 표현과 구조를 피하세요. "종합적으로 고려해볼 때",
"다양한 요소들을 종합하여", "~라고 할 수 있습니다", "~하는 것이 중요합니다"로 문단을 반복해서
끝내는 습관, 모든 문단을 비슷한 길이·구조로 기계적으로 반복하는 것을 피하세요. 실제 친한 스타일
컨설턴트가 사용자 이름을 부르며 직접 조언해주듯이, 문장 길이에 변화를 주고 구체적인 관찰과
디테일(색, 아이템, 상황)로 채우세요. 정보가 없다고 "정보가 제공되지 않았지만"처럼 AI가 데이터
부족을 언급하는 듯한 문장도 쓰지 말고, 자연스럽게 일반적인 경향으로 이야기를 풀어가세요.`;

function buildChapterGuidance(keys: ReportChapterKey[]): string {
  return keys
    .map((key) => {
      const chapter = CHAPTER_BY_KEY.get(key)!;
      const bullets = chapter.points.map((p) => `  - ${p}`).join("\n");
      return `${chapter.number}. ${chapter.title}\n${bullets}`;
    })
    .join("\n\n");
}

function buildUserPrompt(
  answers: Record<string, unknown>,
  previewResult: PreviewResult | null,
  hasImage: boolean,
  group: ReportChapterKey[],
) {
  const answerLines = Object.entries(answers ?? {}).map(
    ([key, value]) => `- ${key}: ${String(value)}`,
  );

  const previewLines = previewResult
    ? [
        `무료 미리보기에서 안내된 추천 추구미: ${previewResult.recommendedMood}`,
        `무료 미리보기 서브 무드: ${previewResult.subMood}`,
      ]
    : [];

  return [
    "사용자가 테스트에서 선택한 답변(이름, 성별, 나이, 키, 몸무게, 직업 포함)은 다음과 같습니다:",
    answerLines.length > 0 ? answerLines.join("\n") : "(답변 없음)",
    "",
    ...previewLines,
    "",
    hasImage
      ? "사진이 첨부되어 있습니다. 사진에서 보이는 헤어, 메이크업, 옷 색감, 전체 분위기를 참고하세요."
      : "사진은 첨부되지 않았습니다. 답변 정보만으로 분석하세요.",
    "",
    "이번 응답에서는 아래 챕터의 body, diagnosis, keywords, summary, tips, checklist를",
    "모두 작성해주세요. body에는 아래 소주제 중 핵심적인 것만 골라 간결한 문장으로 다루세요.",
    "모든 소주제를 다 채우려고 늘어놓지 말고, 실제로 도움이 되는 내용만 담으세요.",
    "",
    "분량 요구사항 (반드시 지켜주세요):",
    "- 이 챕터의 body는 공백 포함 2,000~2,700자 내외로 작성하세요. 이 범위를 넘기지 마세요.",
    "- 미사여구나 같은 말 반복 없이, 핵심 정보와 바로 실행 가능한 조언 위주로만 쓰세요.",
    "- 모든 소주제를 다루려 하지 말고, 사용자에게 가장 중요한 내용 위주로 선별해서",
    "  짧고 명확한 문장으로 전달하세요.",
    "",
    buildChapterGuidance(group),
    ...(group.includes("faceShapeAnalysis") || group.includes("animalTypeAnalysis")
      ? [
          "",
          "얼굴형/동물상 챕터는 본문(body)과 별개로 \"type\" 필드에도 분류 결과를 넣어야",
          "합니다. type 값은 반드시 주어진 후보 목록 중 하나와 정확히 똑같은 문자열이어야",
          "하고, 본문 내용도 이 type과 일치해야 합니다.",
        ]
      : []),
    ...(group.includes("hairGuide")
      ? [
          "",
          "헤어 스타일 방향 챕터는 본문(body)과 별개로 \"type\" 필드에 이 챕터에서",
          "가장 핵심적으로 추천하는 헤어스타일 하나를 넣어야 합니다. type 값은 반드시",
          "주어진 후보 목록 중 하나와 정확히 똑같은 문자열이어야 하고, 본문에서 실제로",
          "추천하는 헤어스타일과 일치해야 합니다.",
        ]
      : []),
    ...(group.includes("makeupGuide")
      ? [
          "",
          "메이크업 가이드 챕터는 본문(body)과 별개로 \"type\" 필드에 이 챕터에서",
          "가장 핵심적으로 추천하는 메이크업 스타일 하나를 넣어야 합니다. type 값은",
          "반드시 주어진 후보 목록 중 하나와 정확히 똑같은 문자열이어야 하고, 본문에서",
          "실제로 추천하는 메이크업 스타일과 일치해야 합니다.",
        ]
      : []),
  ].join("\n");
}

const PREMIUM_LAYOUT_PROPERTIES = {
  body: { type: "string" },
  diagnosis: { type: "string" },
  keywords: {
    type: "array",
    items: { type: "string" },
    minItems: 3,
    maxItems: 5,
  },
  summary: {
    type: "array",
    items: { type: "string" },
    minItems: 3,
    maxItems: 3,
  },
  tips: {
    type: "array",
    items: { type: "string" },
    minItems: 3,
    maxItems: 5,
  },
  checklist: {
    type: "array",
    items: { type: "string" },
    minItems: 3,
    maxItems: 6,
  },
} as const;

const PREMIUM_LAYOUT_REQUIRED = [
  "body",
  "diagnosis",
  "keywords",
  "summary",
  "tips",
  "checklist",
];

function chapterSchema(key: ReportChapterKey) {
  if (key === "faceShapeAnalysis") {
    return {
      type: "object",
      additionalProperties: false,
      required: [...PREMIUM_LAYOUT_REQUIRED, "type"],
      properties: {
        ...PREMIUM_LAYOUT_PROPERTIES,
        type: { type: "string", enum: [...FACE_SHAPE_CANDIDATES] },
      },
    };
  }
  if (key === "animalTypeAnalysis") {
    return {
      type: "object",
      additionalProperties: false,
      required: [...PREMIUM_LAYOUT_REQUIRED, "type"],
      properties: {
        ...PREMIUM_LAYOUT_PROPERTIES,
        type: { type: "string", enum: [...ANIMAL_TYPE_CANDIDATES] },
      },
    };
  }
  if (key === "hairGuide") {
    return {
      type: "object",
      additionalProperties: false,
      required: [...PREMIUM_LAYOUT_REQUIRED, "type"],
      properties: {
        ...PREMIUM_LAYOUT_PROPERTIES,
        type: { type: "string", enum: [...HAIR_STYLE_CANDIDATES] },
      },
    };
  }
  if (key === "makeupGuide") {
    return {
      type: "object",
      additionalProperties: false,
      required: [...PREMIUM_LAYOUT_REQUIRED, "type"],
      properties: {
        ...PREMIUM_LAYOUT_PROPERTIES,
        type: { type: "string", enum: [...MAKEUP_STYLE_CANDIDATES] },
      },
    };
  }
  return {
    type: "object",
    additionalProperties: false,
    required: PREMIUM_LAYOUT_REQUIRED,
    properties: PREMIUM_LAYOUT_PROPERTIES,
  };
}

function buildGroupSchema(group: ReportChapterKey[]) {
  return {
    type: "object",
    additionalProperties: false,
    required: group,
    properties: Object.fromEntries(group.map((key) => [key, chapterSchema(key)])),
  } as const;
}

// Chapters target a 2,000-2,700자 body now (about a third shorter than
// the old 3,000-4,000자 target) — this floor only exists to catch a
// genuinely broken/near-empty response, not to pad normal concise
// output back up to some larger target.
const MIN_CHAPTER_CHARS = 1500;

async function expandChapterBody(
  client: OpenAI,
  key: ReportChapterKey,
  currentBody: string,
): Promise<string> {
  const chapter = CHAPTER_BY_KEY.get(key)!;

  const completion = await withRetry(() =>
    client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            `아래는 "${chapter.title}" 챕터 본문 초안인데 너무 짧습니다. 내용과 어조는 그대로`,
            "유지하면서, 핵심적인 이유·예시를 조금 더 추가해서 전체 분량을 공백 포함",
            "2,000~2,700자 정도로 만들어주세요. 미사여구나 반복으로 글자 수만 채우지 말고,",
            "간결하면서도 실질적인 정보로 채워주세요. 결과는 완성된 본문 텍스트만",
            "반환하세요 (JSON이나 따옴표 없이).",
            "",
            "--- 초안 ---",
            currentBody,
          ].join("\n"),
        },
      ],
      max_tokens: 3000,
    }),
  );

  const expanded = completion.choices[0]?.message?.content?.trim();
  return expanded && expanded.length > currentBody.length ? expanded : currentBody;
}

// Broader than FullReport's per-chapter shape — the two classification
// chapters also carry a `type` (their pick from the enum-constrained
// candidate list), extracted separately after generation rather than
// stored on the chapter itself.
type RawChapterResult = ReportChapterContent & { type?: string };

async function generateChapterGroup(
  client: OpenAI,
  group: ReportChapterKey[],
  answers: Record<string, unknown>,
  previewResult: PreviewResult | null,
  imageDataUrl: string | null,
): Promise<Partial<Record<ReportChapterKey, RawChapterResult>>> {
  const userContent: (
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  )[] = [
    {
      type: "text",
      text: buildUserPrompt(answers, previewResult, !!imageDataUrl, group),
    },
  ];

  if (imageDataUrl) {
    userContent.push({ type: "image_url", image_url: { url: imageDataUrl } });
  }

  const completion = await withRetry(() =>
    client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      max_tokens: 4000,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: `report_chapters_${group.join("_")}`,
          strict: true,
          schema: buildGroupSchema(group),
        },
      },
    }),
  );

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI 응답을 받지 못했습니다.");
  }

  const parsed = JSON.parse(content) as Partial<
    Record<ReportChapterKey, RawChapterResult>
  >;

  await Promise.all(
    group.map(async (key) => {
      const chapter = parsed[key];
      if (chapter && chapter.body.length < MIN_CHAPTER_CHARS) {
        chapter.body = await expandChapterBody(client, key, chapter.body);
      }
    }),
  );

  return parsed;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "서버에 OPENAI_API_KEY가 설정되어 있지 않습니다." },
      { status: 500 },
    );
  }

  let body: {
    answers?: Record<string, unknown>;
    imageDataUrl?: string | null;
    previewResult?: PreviewResult | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "요청 형식을 읽을 수 없습니다." },
      { status: 400 },
    );
  }

  const answers = body.answers ?? {};
  const imageDataUrl = body.imageDataUrl ?? null;
  const previewResult = body.previewResult ?? null;

  const client = new OpenAI({ apiKey });

  try {
    const groups = getChapterGroups(!!imageDataUrl);
    const groupResults = await mapWithConcurrency(
      groups,
      CHAPTER_CONCURRENCY,
      (group) =>
        generateChapterGroup(client, group, answers, previewResult, imageDataUrl),
    );

    const merged = groupResults.reduce(
      (acc, group) => ({ ...acc, ...group }),
      {} as Partial<Record<ReportChapterKey, RawChapterResult>>,
    );

    // The classification chapters' `type` pick is surfaced separately
    // below, not stored on the chapter itself — everything else carries
    // straight through to the stored chapter content.
    const chapters: Partial<FullReport> = {};
    for (const key of Object.keys(merged) as ReportChapterKey[]) {
      const chapter = merged[key];
      if (chapter) {
        chapters[key] = {
          body: chapter.body,
          diagnosis: chapter.diagnosis,
          keywords: chapter.keywords,
          summary: chapter.summary,
          tips: chapter.tips,
          checklist: chapter.checklist,
        };
      }
    }

    // Reuse the same rule-based mood images + color palette as the free
    // preview instead of asking the AI to pick them — no extra cost, and
    // guarantees the paid report visually matches what the user already
    // saw. Falls back to a fresh rule-based computation if the client
    // didn't send its personalized preview along.
    const visuals = previewResult ?? buildPreviewResult(answers);

    const report: FullReport = {
      ...chapters,
      images: visuals.images,
      colorHint: visuals.colorHint,
      faceShapeType:
        (merged.faceShapeAnalysis?.type as FaceShapeCandidate | undefined) ??
        visuals.faceShapeType ??
        null,
      animalType:
        (merged.animalTypeAnalysis?.type as AnimalTypeCandidate | undefined) ??
        visuals.animalType ??
        null,
      hairStyleType:
        (merged.hairGuide?.type as HairStyleCandidate | undefined) ?? null,
      makeupStyleType:
        (merged.makeupGuide?.type as MakeupStyleCandidate | undefined) ?? null,
    };

    return NextResponse.json({ report });
  } catch (error) {
    console.error("generate-report failed", error);

    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        return NextResponse.json(
          {
            error:
              "OpenAI API 사용량 한도에 도달했습니다. OpenAI 계정의 결제/쿼터 설정을 확인해주세요.",
          },
          { status: 502 },
        );
      }
      if (error.status === 401) {
        return NextResponse.json(
          { error: "OpenAI API 키가 올바르지 않습니다." },
          { status: 502 },
        );
      }
    }

    return NextResponse.json(
      { error: "리포트 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    );
  }
}
