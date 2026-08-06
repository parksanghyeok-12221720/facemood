import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  ART_STYLE_CANDIDATES,
  MOOD_TYPE_CANDIDATES,
  STYLE_CANDIDATES,
} from "@/types/matchReport";
import type { MatchFullReport } from "@/types/matchReport";

export const runtime = "nodejs";

// The only place in the app that calls OpenAI for FACEMOOD Match. Only
// ever called from /match/report, after checkout — the free preview
// (/match/result) always shows canned example content instead, same
// policy as the main FACEMOOD product's /result vs /report split.
//
// Same two-phase architecture as the main FACEMOOD product's
// /api/generate-report: one call produces the short structured fields
// (scores, labels, enums), then each of the report's 9 numbered chapters
// (matching MatchReportBody.tsx's 01-09 PartLabel sections, in the same
// order) gets its own dedicated call for its long-form body. Splitting the
// bodies into separate per-chapter calls — instead of asking for all 9 in
// one completion — is what actually gets the model to hit the 1,000자+
// target reliably instead of undershooting.

const SYSTEM_PROMPT = `당신은 FACEMOOD Match의 커플 무드 궁합 리포트를 작성하는 AI입니다.

FACEMOOD Match는 두 사람이 업로드한 사진과 답변을 바탕으로, 두 사람이 함께 있을 때 만들어지는
시각적 분위기와 스타일 조화를 분석하는 서비스입니다.

작성 원칙:

1. 오직 시각적 분위기, 스타일, 컬러, 이미지 조화만 다루세요. 실제 관계의 궁합, 성격 궁합,
갈등 가능성, 결혼 가능성, 이별 가능성처럼 사진과 답변만으로 알 수 없는 내용은 절대 다루지 마세요.

2. 사용자가 입력한 관계 유형(짝사랑/썸/연인/소개팅/친구 등), 현재 관계 상태, 원하는 이미지,
궁금해하는 항목, 원하는 상황을 최대한 반영해서 개인화하세요. 관계 상태가 "아직 대화를 많이
하지 않았어요"처럼 초기 단계라면 과도하게 친밀한 톤으로 단정짓지 말고, 이미 연애 중이라면
좀 더 편안한 톤으로 써도 됩니다.

3. 사진 분석은 단정적이지 않게, 부드러운 표현을 쓰세요. "사진상으로는", "이런 분위기가 느껴져요",
"~와 잘 어울릴 수 있어요" 같은 표현을 사용하고, 외모 점수·등급·평가 표현은 쓰지 마세요.

4. 모든 항목은 반드시 주어진 스키마와 후보 목록 안에서만 선택하세요. 새로운 이름을 만들어내지
마세요 (사진 리소스가 정해진 이름으로만 준비되어 있습니다).

5. 마크다운 문법(별표, #, - 등)을 쓰지 말고, 자연스러운 문장으로만 작성하세요.

6. 모든 텍스트는 한국어로 작성하세요. 애매하거나 두루뭉술한 표현("느낌이 좋아요", "잘 어울려요"
같은 말만 반복하는 것) 대신, 무엇을, 왜, 어떻게 그렇게 봤는지 구체적인 근거와 예시를 명확하게
써서 내용이 분명하게 읽히도록 하세요. 같은 표현을 여러 챕터에서 반복하지 마세요.

7. 각 챕터 본문은 공백 포함 1,000~1,300자 분량으로, 문단 구분(줄바꿈 두 번)을 섞어가며
작성하세요. 단순히 점수나 라벨을 나열하지 말고, 왜 그렇게 분석했는지, 사진과 답변에서 어떤
부분이 근거가 되었는지, 두 사람에게 구체적으로 어떤 의미와 활용법이 있는지 명확한 문장으로
풀어서 설명하세요. 미사여구나 같은 문장 반복으로 글자 수만 채우지 말고, 실질적인 내용으로
채우세요.`;

const FILLED_SCORE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["label", "filled"],
  properties: {
    label: { type: "string" },
    filled: { type: "integer" },
  },
} as const;

// ---------------------------------------------------------------------------
// Phase 1 — structured fields (scores, labels, enums). Short enough that a
// single completion reliably returns everything in full.
// ---------------------------------------------------------------------------

const STRUCTURED_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "pairLabel",
    "pairScore",
    "pairBullets",
    "firstImpressionScore",
    "synergyScore",
    "myArtStyle",
    "partnerArtStyle",
    "artStyleTogether",
    "moodTypeName",
    "moodTypeScore",
    "moodTypeSummary",
    "moodTypeKeywords",
    "recommendedMoods",
    "styleCompat",
    "styleGoodNote",
    "myHair",
    "partnerHair",
    "hairTogetherScore",
    "itemCompat",
    "coupleLookDirection",
    "datePlaceCompat",
    "photoConceptTags",
    "snsConceptCompat",
    "seasonCompat",
    "colorCompat",
    "styleAvoidNote",
    "myPerfume",
    "partnerPerfume",
    "togetherPerfume",
    "overallMoodScore",
    "overallPercentile",
    "moodKeywords",
  ],
  properties: {
    pairLabel: { type: "string" },
    pairScore: { type: "integer" },
    pairBullets: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
    firstImpressionScore: { type: "integer" },
    synergyScore: { type: "integer" },
    myArtStyle: { type: "string", enum: [...ART_STYLE_CANDIDATES] },
    partnerArtStyle: { type: "string", enum: [...ART_STYLE_CANDIDATES] },
    artStyleTogether: { type: "string" },
    moodTypeName: { type: "string", enum: [...MOOD_TYPE_CANDIDATES] },
    moodTypeScore: { type: "integer" },
    moodTypeSummary: { type: "string" },
    moodTypeKeywords: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 5 },
    recommendedMoods: {
      type: "array",
      minItems: 2,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "reason"],
        properties: {
          name: { type: "string", enum: [...MOOD_TYPE_CANDIDATES] },
          reason: { type: "string" },
        },
      },
    },
    styleCompat: { type: "array", items: FILLED_SCORE_SCHEMA, minItems: 6, maxItems: 6 },
    styleGoodNote: { type: "string" },
    myHair: { type: "string" },
    partnerHair: { type: "string" },
    hairTogetherScore: { type: "integer" },
    itemCompat: { type: "array", items: FILLED_SCORE_SCHEMA, minItems: 4, maxItems: 4 },
    coupleLookDirection: { type: "string" },
    datePlaceCompat: { type: "array", items: FILLED_SCORE_SCHEMA, minItems: 4, maxItems: 4 },
    photoConceptTags: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 5 },
    snsConceptCompat: { type: "array", items: FILLED_SCORE_SCHEMA, minItems: 4, maxItems: 4 },
    seasonCompat: { type: "array", items: FILLED_SCORE_SCHEMA, minItems: 4, maxItems: 4 },
    colorCompat: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "hex", "reason"],
        properties: {
          name: { type: "string" },
          hex: { type: "string" },
          reason: { type: "string" },
        },
      },
    },
    styleAvoidNote: { type: "string" },
    myPerfume: { type: "string" },
    partnerPerfume: { type: "string" },
    togetherPerfume: { type: "string" },
    overallMoodScore: { type: "integer" },
    overallPercentile: { type: "string" },
    moodKeywords: { type: "array", items: { type: "string" }, minItems: 6, maxItems: 6 },
  },
} as const;

type StructuredFields = Omit<
  MatchFullReport,
  | "firstImpressionBody"
  | "artStyleBody"
  | "moodMatchBody"
  | "styleCompatBody"
  | "moodboardBody"
  | "dateSnsBody"
  | "colorCompatBody"
  | "perfumeBody"
  | "finalBody"
>;

function buildStructuredPrompt(answers: Record<string, unknown>): string {
  const answerLines = Object.entries(answers ?? {}).map(
    ([key, value]) => `- ${key}: ${JSON.stringify(value)}`,
  );

  return [
    "두 사람이 입력한 정보는 다음과 같습니다:",
    answerLines.length > 0 ? answerLines.join("\n") : "(입력 정보 없음)",
    "",
    "첫 번째 첨부 사진은 'myPhoto' (본인), 두 번째 첨부 사진은 'partnerPhoto' (상대방)입니다.",
    "두 사진에서 보이는 분위기, 스타일, 헤어 등을 참고해서 각 필드를 채워주세요.",
    "",
    `moodTypeName과 recommendedMoods[].name은 다음 10개 중에서만 선택하세요: ${MOOD_TYPE_CANDIDATES.join(", ")}`,
    "recommendedMoods는 moodTypeName과 겹치지 않는 2~3개를 추천하세요.",
    "",
    `myArtStyle, partnerArtStyle은 다음 12개 중에서만 선택하세요 (서로 다른 것으로): ${ART_STYLE_CANDIDATES.join(", ")}`,
    "",
    `styleCompat은 다음 6개 카테고리를 이 순서 그대로, 각각 filled(1~5)와 함께 포함하세요: ${STYLE_CANDIDATES.join(", ")}`,
    "",
    "itemCompat은 Silver, Gold, Denim, Leather 4개를 이 순서로 포함하세요.",
    "seasonCompat은 여름, 가을, 겨울, 봄 4개를 이 순서로 포함하세요.",
    "datePlaceCompat, snsConceptCompat은 각각 어울리는 장소/컨셉 4개를 자유롭게 정해서 filled(1~5)와 함께 작성하세요.",
    "colorCompat은 어울리는 메인 컬러 5개를 각각 name, hex(#으로 시작하는 6자리 코드), reason과 함께 작성하세요.",
    "photoConceptTags는 사진 찍기 좋은 장소/컨셉 키워드 5개를 작성하세요.",
    "myPerfume, partnerPerfume, togetherPerfume은 특정 브랜드나 제품명(예: Byredo, Jo Malone,",
    "Le Labo)을 절대 쓰지 말고, '우디 머스크 향', '시트러스 그린 향'처럼 향의 계열과 인상을",
    "설명하는 향 추천 표현으로만 작성하세요.",
    "moodKeywords는 두 사람의 분위기를 나타내는 영어 단어 6개를 작성하세요 (예: Calm, Warm 등 형태).",
    "overallPercentile은 '상위 N%' 형태로 작성하세요.",
    "",
    "이 응답에는 본문(body) 텍스트는 포함하지 마세요 — 점수, 라벨, 목록 같은 짧은 구조화된",
    "값만 채워주세요. 각 챕터의 상세 본문은 이어지는 별도 요청에서 작성합니다.",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Phase 2 — one dedicated call per numbered chapter for its long-form body.
// Order matches MatchReportBody.tsx's 01-09 PartLabel sections exactly.
// ---------------------------------------------------------------------------

type ChapterKey =
  | "firstImpressionBody"
  | "artStyleBody"
  | "moodMatchBody"
  | "styleCompatBody"
  | "moodboardBody"
  | "dateSnsBody"
  | "colorCompatBody"
  | "perfumeBody"
  | "finalBody";

const CHAPTERS: {
  key: ChapterKey;
  number: string;
  title: string;
  needsPhotos: boolean;
  instructions: (s: StructuredFields) => string[];
}[] = [
  {
    key: "firstImpressionBody",
    number: "01",
    title: "첫인상 분석",
    needsPhotos: true,
    instructions: (s) => [
      `첫인상 조화 점수는 ${s.firstImpressionScore}점, 분위기 시너지 점수는 ${s.synergyScore}점입니다.`,
      "왜 이 점수가 나왔는지, 두 사람이 함께 있을 때 다른 사람 눈에 어떻게 비칠지, 사진의 어떤",
      "부분(표정, 톤, 스타일링)이 근거가 되었는지 구체적으로 설명하세요.",
    ],
  },
  {
    key: "artStyleBody",
    number: "02",
    title: "얼굴 그림체 궁합",
    needsPhotos: true,
    instructions: (s) => [
      `본인 그림체는 ${s.myArtStyle}, 상대방 그림체는 ${s.partnerArtStyle}이고, 함께일 때는`,
      `"${s.artStyleTogether}"로 분석됐습니다.`,
      "각 그림체가 사진에서 어떻게 느껴졌는지, 두 그림체가 만났을 때 왜 이런 together 무드가",
      "만들어지는지, 이 조합이 사진이나 프로필에서 어떻게 활용되면 좋을지 설명하세요.",
    ],
  },
  {
    key: "moodMatchBody",
    number: "03",
    title: "무드 궁합",
    needsPhotos: true,
    instructions: (s) => [
      `Mood Type은 ${s.moodTypeName} (Mood Score ${s.moodTypeScore}), 요약은`,
      `"${s.moodTypeSummary}", 키워드는 ${s.moodTypeKeywords.join(", ")}입니다.`,
      `추천 무드는 ${s.recommendedMoods.map((m) => `${m.name}(${m.reason})`).join(" / ")}입니다.`,
      "왜 이 Mood Type으로 분석됐는지, 사진의 어떤 부분이 이 무드로 이어졌는지 설명한 뒤,",
      "추천한 다른 무드들이 지금 무드와 어떻게 다르고 시도하면 어떤 느낌을 더할 수 있는지도",
      "이어서 자연스럽게 다루세요.",
    ],
  },
  {
    key: "styleCompatBody",
    number: "04",
    title: "스타일 궁합",
    needsPhotos: true,
    instructions: (s) => [
      `헤어는 본인 "${s.myHair}", 상대방 "${s.partnerHair}" (헤어 궁합 ${s.hairTogetherScore}/5)이고,`,
      `스타일 카테고리 점수는 ${s.styleCompat.map((c) => `${c.label} ${c.filled}/5`).join(", ")}입니다.`,
      `아이템 궁합은 ${s.itemCompat.map((c) => `${c.label} ${c.filled}/5`).join(", ")}이고,`,
      `같이 입으면 좋은 스타일은 "${s.styleGoodNote}"입니다.`,
      "왜 이런 점수가 나왔는지, 실제로 옷을 맞춰 입거나 헤어를 스타일링할 때 어떻게 활용하면",
      "좋을지 구체적인 조언을 담아 설명하세요.",
    ],
  },
  {
    key: "moodboardBody",
    number: "05",
    title: "이런 방향으로 스타일을 맞추면",
    needsPhotos: false,
    instructions: (s) => [
      `스타일 궁합 중 가장 점수가 높은 카테고리들과, 어울리는 컬러 팔레트`,
      `(${s.colorCompat.map((c) => c.name).join(", ")}), 커플룩 방향 "${s.coupleLookDirection}"을`,
      "종합해서, 두 사람이 실제로 스타일을 맞추면 어떤 무드보드가 완성되는지 정리하세요.",
      "개별 항목을 나열하기보다, 이 요소들을 함께 적용했을 때 만들어지는 전체적인 그림을",
      "그려주듯 설명하세요.",
    ],
  },
  {
    key: "dateSnsBody",
    number: "06",
    title: "데이트 스타일 & SNS",
    needsPhotos: false,
    instructions: (s) => [
      `계절 궁합은 ${s.seasonCompat.map((c) => `${c.label} ${c.filled}/5`).join(", ")},`,
      `데이트 장소 궁합은 ${s.datePlaceCompat.map((c) => `${c.label} ${c.filled}/5`).join(", ")}입니다.`,
      `사진 컨셉 태그는 ${s.photoConceptTags.join(", ")}이고,`,
      `SNS 프로필 궁합은 ${s.snsConceptCompat.map((c) => `${c.label} ${c.filled}/5`).join(", ")}입니다.`,
      "왜 이런 장소/시즌/컨셉이 추천됐는지, 실제 데이트나 나들이, 프로필 사진을 찍을 때 어떻게",
      "활용할 수 있는지 설명하세요.",
    ],
  },
  {
    key: "colorCompatBody",
    number: "07",
    title: "컬러 궁합",
    needsPhotos: false,
    instructions: (s) => [
      `메인 컬러 5가지는 ${s.colorCompat.map((c) => `${c.name}(${c.hex}) — ${c.reason}`).join(" / ")}이고,`,
      `피하면 좋은 스타일은 "${s.styleAvoidNote}"입니다.`,
      "각 컬러가 왜 두 사람에게 잘 어울리는지, 옷·소품·메이크업 중 어디에 적용하면 좋을지,",
      "그리고 피하면 좋은 컬러/스타일 방향은 왜 그런지 설명하세요.",
    ],
  },
  {
    key: "perfumeBody",
    number: "08",
    title: "향수 궁합",
    needsPhotos: false,
    instructions: (s) => [
      `본인 향은 "${s.myPerfume}", 상대방 향은 "${s.partnerPerfume}", 함께일 때는`,
      `"${s.togetherPerfume}"으로 추천됐습니다.`,
      "각 향이 왜 두 사람의 이미지와 어울리는지, 함께 있을 때 두 향이 어떻게 조화를 이루는지,",
      "언제/어떻게 뿌리면 좋을지 설명하세요.",
    ],
  },
  {
    key: "finalBody",
    number: "09",
    title: "총평",
    needsPhotos: false,
    instructions: (s) => [
      `종합 Mood Score는 ${s.overallMoodScore}점 (${s.overallPercentile}), 분위기 키워드는`,
      `${s.moodKeywords.join(", ")}입니다.`,
      "지금까지의 분석(첫인상, 그림체, 무드, 스타일, 컬러, 향수)을 종합해서 두 사람의 전체적인",
      "이미지 궁합을 정리하는 마무리 총평으로 작성하세요. 리포트 전체를 요약하듯 자연스럽게",
      "마무리하세요.",
    ],
  },
];

function buildChapterPrompt(
  chapter: (typeof CHAPTERS)[number],
  structured: StructuredFields,
  answers: Record<string, unknown>,
): string {
  const answerLines = Object.entries(answers ?? {}).map(
    ([key, value]) => `- ${key}: ${JSON.stringify(value)}`,
  );

  return [
    `지금부터 FACEMOOD Match 리포트의 "${chapter.number}. ${chapter.title}" 챕터 본문을`,
    "작성합니다. 공백 포함 1,000~1,300자 분량으로, 아래 분석 결과를 근거로 왜 그렇게 나왔는지",
    "구체적으로 설명하세요.",
    "",
    "두 사람이 입력한 정보:",
    answerLines.length > 0 ? answerLines.join("\n") : "(입력 정보 없음)",
    "",
    "이 챕터가 다뤄야 할 분석 결과:",
    ...chapter.instructions(structured),
    "",
    chapter.needsPhotos
      ? "사진이 첨부되어 있습니다 (첫 번째: 본인, 두 번째: 상대방). 사진에서 보이는 분위기를 참고하세요."
      : "이 챕터는 위 분석 결과 텍스트만으로 작성하고, 새로운 점수나 항목을 만들어내지 마세요.",
    "",
    "결과는 완성된 본문 텍스트만 반환하세요 (JSON이나 따옴표, 챕터 제목 없이 본문만).",
  ].join("\n");
}

// Chapter bodies target 1,000-1,300자 — set a bit under the floor so any
// chapter that undershoots gets topped up rather than shipping thin.
const MIN_BODY_CHARS = 950;

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

// How many chapter requests run at once — kept low for the same reason as
// the main FACEMOOD product's generator: small tokens-per-minute limits on
// lower OpenAI usage tiers 429 quickly if everything fires at once.
const CHAPTER_CONCURRENCY = 3;

async function generateChapterBody(
  client: OpenAI,
  chapter: (typeof CHAPTERS)[number],
  structured: StructuredFields,
  answers: Record<string, unknown>,
  myPhoto: string | null,
  partnerPhoto: string | null,
): Promise<string> {
  const userContent: (
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  )[] = [{ type: "text", text: buildChapterPrompt(chapter, structured, answers) }];

  if (chapter.needsPhotos) {
    if (myPhoto) userContent.push({ type: "image_url", image_url: { url: myPhoto } });
    if (partnerPhoto) userContent.push({ type: "image_url", image_url: { url: partnerPhoto } });
  }

  const completion = await withRetry(() =>
    client.chat.completions.create({
      model: "gpt-5.4-nano",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      max_completion_tokens: 2200,
    }),
  );

  let body = completion.choices[0]?.message?.content?.trim() ?? "";

  if (body.length < MIN_BODY_CHARS) {
    const expanded = await withRetry(() =>
      client.chat.completions.create({
        model: "gpt-5.4-nano",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              `아래는 "${chapter.number}. ${chapter.title}" 챕터 본문 초안인데 너무 짧습니다.`,
              "내용과 어조는 그대로 유지하면서, 구체적인 이유·예시를 조금 더 추가해서 전체",
              "분량을 공백 포함 1,000~1,300자 정도로 만들어주세요. 미사여구나 반복으로 글자 수만",
              "채우지 말고, 실질적인 내용으로 명확하게 채워주세요. 결과는 완성된 본문 텍스트만",
              "반환하세요 (JSON이나 따옴표 없이).",
              "",
              "--- 초안 ---",
              body,
            ].join("\n"),
          },
        ],
        max_completion_tokens: 2200,
      }),
    );
    const expandedBody = expanded.choices[0]?.message?.content?.trim();
    if (expandedBody && expandedBody.length > body.length) body = expandedBody;
  }

  return body;
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
    myPhoto?: string | null;
    partnerPhoto?: string | null;
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
  const myPhoto = body.myPhoto ?? null;
  const partnerPhoto = body.partnerPhoto ?? null;

  const client = new OpenAI({ apiKey });

  try {
    const structuredUserContent: (
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    )[] = [{ type: "text", text: buildStructuredPrompt(answers) }];
    if (myPhoto) structuredUserContent.push({ type: "image_url", image_url: { url: myPhoto } });
    if (partnerPhoto) {
      structuredUserContent.push({ type: "image_url", image_url: { url: partnerPhoto } });
    }

    const structuredCompletion = await withRetry(() =>
      client.chat.completions.create({
        model: "gpt-5.4-nano",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: structuredUserContent },
        ],
        max_completion_tokens: 3000,
        response_format: {
          type: "json_schema",
          json_schema: { name: "match_report_structured", strict: true, schema: STRUCTURED_SCHEMA },
        },
      }),
    );

    const structuredContent = structuredCompletion.choices[0]?.message?.content;
    if (!structuredContent) {
      throw new Error("AI 응답을 받지 못했습니다.");
    }

    const structured = JSON.parse(structuredContent) as StructuredFields;

    // json_schema enums can't express "different from the other field", and
    // the model doesn't reliably follow that instruction in prose — force
    // distinctness deterministically rather than leaving both on the same
    // art style.
    if (structured.myArtStyle === structured.partnerArtStyle) {
      const currentIndex = ART_STYLE_CANDIDATES.indexOf(structured.partnerArtStyle);
      structured.partnerArtStyle =
        ART_STYLE_CANDIDATES[(currentIndex + 1) % ART_STYLE_CANDIDATES.length];
    }

    // Same reasoning — make sure the "other moods to explore" list never
    // repeats the type the couple already landed on.
    structured.recommendedMoods = structured.recommendedMoods.filter(
      (mood) => mood.name !== structured.moodTypeName,
    );

    const bodies = await mapWithConcurrency(CHAPTERS, CHAPTER_CONCURRENCY, (chapter) =>
      generateChapterBody(client, chapter, structured, answers, myPhoto, partnerPhoto),
    );

    const chapterBodies = Object.fromEntries(
      CHAPTERS.map((chapter, index) => [chapter.key, bodies[index]]),
    ) as Record<ChapterKey, string>;

    const report: MatchFullReport = {
      ...structured,
      ...chapterBodies,
    };

    return NextResponse.json({ report });
  } catch (error) {
    console.error("generate-match-report failed", error);

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
