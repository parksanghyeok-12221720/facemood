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

6. 모든 텍스트는 한국어로, 간결하고 자연스럽게 작성하세요. 같은 표현을 반복하지 마세요.

7. moodTypeBody, recommendedMoodsBody, part1Body, part2Body, part3Body, part4Body는 각 챕터를
   풍부하게 설명하는 본문입니다. 각각 공백 포함 900~1100자 분량으로, 문단 구분(줄바꿈 두 번)을
   섞어가며 작성하세요. 단순히 점수나 라벨을 나열하지 말고, 왜 그렇게 분석했는지, 사진과 답변에서
   어떤 부분이 근거가 되었는지, 두 사람에게 어떤 의미가 있는지를 구체적으로 풀어서 설명하세요.
   미사여구나 같은 문장 반복으로 글자 수만 채우지 말고, 실질적인 내용으로 채우세요.`;

function buildUserPrompt(answers: Record<string, unknown>): string {
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
    "각 챕터의 본문(공백 포함 900~1100자)이 다뤄야 할 내용:",
    "- moodTypeBody: 왜 이 Mood Type으로 분석됐는지, 사진에서 어떤 부분이 이 무드로 이어졌는지,",
    "  이 무드가 두 사람에게 어떤 인상을 주는지 설명하세요.",
    "- recommendedMoodsBody: 추천한 다른 무드들이 지금 무드와 어떻게 다르고, 시도하면 어떤 느낌을",
    "  더할 수 있는지 각각 짚어가며 설명하세요.",
    "- part1Body: 각자의 현재 이미지 무드, 첫인상·시너지 점수, 그림체 케미가 왜 그렇게 나왔는지,",
    "  두 사람의 얼굴 분위기가 어떻게 서로 다르거나 닮았는지 설명하세요.",
    "- part2Body: 스타일·헤어·컬러·코디 궁합이 왜 그렇게 분석됐는지, 실제로 어떻게 활용하면",
    "  좋을지 구체적인 조언을 담아 설명하세요.",
    "- part3Body: 데이트 장소, 사진 컨셉, 향기, 계절 궁합을 왜 그렇게 추천했는지, 실제 데이트나",
    "  나들이에서 어떻게 활용할 수 있는지 설명하세요.",
    "- part4Body: 종합 Mood Score와 키워드가 의미하는 바를 정리하고, 리포트 전체를 요약하는",
    "  마무리 총평으로 작성하세요.",
  ].join("\n");
}

const FILLED_SCORE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["label", "filled"],
  properties: {
    label: { type: "string" },
    filled: { type: "integer" },
  },
} as const;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "pairLabel",
    "pairScore",
    "pairBullets",
    "moodTypeName",
    "moodTypeScore",
    "moodTypeSummary",
    "moodTypeKeywords",
    "moodTypeBody",
    "recommendedMoods",
    "recommendedMoodsBody",
    "myMoodLabel",
    "myMoodNote",
    "partnerMoodLabel",
    "partnerMoodNote",
    "firstImpressionScore",
    "synergyScore",
    "myArtStyle",
    "partnerArtStyle",
    "artStyleTogether",
    "part1Body",
    "styleCompat",
    "styleGoodNote",
    "styleAvoidNote",
    "coupleLookDirection",
    "myHair",
    "partnerHair",
    "hairTogetherScore",
    "colorCompat",
    "itemCompat",
    "part2Body",
    "datePlaceCompat",
    "photoConceptTags",
    "snsConceptCompat",
    "myPerfume",
    "partnerPerfume",
    "togetherPerfume",
    "seasonCompat",
    "part3Body",
    "overallMoodScore",
    "overallPercentile",
    "moodKeywords",
    "part4Body",
  ],
  properties: {
    pairLabel: { type: "string" },
    pairScore: { type: "integer" },
    pairBullets: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
    moodTypeName: { type: "string", enum: [...MOOD_TYPE_CANDIDATES] },
    moodTypeScore: { type: "integer" },
    moodTypeSummary: { type: "string" },
    moodTypeKeywords: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 5 },
    moodTypeBody: { type: "string" },
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
    recommendedMoodsBody: { type: "string" },
    myMoodLabel: { type: "string" },
    myMoodNote: { type: "string" },
    partnerMoodLabel: { type: "string" },
    partnerMoodNote: { type: "string" },
    firstImpressionScore: { type: "integer" },
    synergyScore: { type: "integer" },
    myArtStyle: { type: "string", enum: [...ART_STYLE_CANDIDATES] },
    partnerArtStyle: { type: "string", enum: [...ART_STYLE_CANDIDATES] },
    artStyleTogether: { type: "string" },
    part1Body: { type: "string" },
    styleCompat: { type: "array", items: FILLED_SCORE_SCHEMA, minItems: 6, maxItems: 6 },
    styleGoodNote: { type: "string" },
    styleAvoidNote: { type: "string" },
    coupleLookDirection: { type: "string" },
    myHair: { type: "string" },
    partnerHair: { type: "string" },
    hairTogetherScore: { type: "integer" },
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
    itemCompat: { type: "array", items: FILLED_SCORE_SCHEMA, minItems: 4, maxItems: 4 },
    part2Body: { type: "string" },
    datePlaceCompat: { type: "array", items: FILLED_SCORE_SCHEMA, minItems: 4, maxItems: 4 },
    photoConceptTags: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 5 },
    snsConceptCompat: { type: "array", items: FILLED_SCORE_SCHEMA, minItems: 4, maxItems: 4 },
    myPerfume: { type: "string" },
    partnerPerfume: { type: "string" },
    togetherPerfume: { type: "string" },
    seasonCompat: { type: "array", items: FILLED_SCORE_SCHEMA, minItems: 4, maxItems: 4 },
    part3Body: { type: "string" },
    overallMoodScore: { type: "integer" },
    overallPercentile: { type: "string" },
    moodKeywords: { type: "array", items: { type: "string" }, minItems: 6, maxItems: 6 },
    part4Body: { type: "string" },
  },
} as const;

// Chapter bodies target 900-1100자 — set a bit under that so any chapter
// that undershoots gets topped up rather than shipping noticeably thin.
const MIN_BODY_CHARS = 850;
const BODY_FIELDS = [
  "moodTypeBody",
  "recommendedMoodsBody",
  "part1Body",
  "part2Body",
  "part3Body",
  "part4Body",
] as const;

async function expandBody(client: OpenAI, currentBody: string): Promise<string> {
  const completion = await client.chat.completions.create({
    model: "gpt-5.4-nano",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          "아래는 리포트 챕터 본문 초안인데 너무 짧습니다. 내용과 어조는 그대로 유지하면서,",
          "구체적인 이유·근거를 조금 더 추가해서 전체 분량을 공백 포함 900~1100자 정도로",
          "만들어주세요. 미사여구나 반복으로 글자 수만 채우지 말고, 실질적인 내용으로 채워주세요.",
          "결과는 완성된 본문 텍스트만 반환하세요 (JSON이나 따옴표 없이).",
          "",
          "--- 초안 ---",
          currentBody,
        ].join("\n"),
      },
    ],
    max_completion_tokens: 1500,
  });

  const expanded = completion.choices[0]?.message?.content?.trim();
  return expanded && expanded.length > currentBody.length ? expanded : currentBody;
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

  const userContent: (
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  )[] = [{ type: "text", text: buildUserPrompt(answers) }];

  if (myPhoto) userContent.push({ type: "image_url", image_url: { url: myPhoto } });
  if (partnerPhoto) userContent.push({ type: "image_url", image_url: { url: partnerPhoto } });

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-5.4-nano",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      max_completion_tokens: 9000,
      response_format: {
        type: "json_schema",
        json_schema: { name: "match_report", strict: true, schema: SCHEMA },
      },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("AI 응답을 받지 못했습니다.");
    }

    const report = JSON.parse(content) as MatchFullReport;

    // json_schema enums can't express "different from the other field", and
    // the model doesn't reliably follow that instruction in prose — force
    // distinctness deterministically rather than leaving both on the same
    // art style.
    if (report.myArtStyle === report.partnerArtStyle) {
      const currentIndex = ART_STYLE_CANDIDATES.indexOf(report.partnerArtStyle);
      report.partnerArtStyle =
        ART_STYLE_CANDIDATES[(currentIndex + 1) % ART_STYLE_CANDIDATES.length];
    }

    // Same reasoning — make sure the "other moods to explore" list never
    // repeats the type the couple already landed on.
    report.recommendedMoods = report.recommendedMoods.filter(
      (mood) => mood.name !== report.moodTypeName,
    );

    // Top up any chapter body that undershot the 900-1100자 target instead
    // of shipping a thin one.
    await Promise.all(
      BODY_FIELDS.map(async (field) => {
        if (report[field].length < MIN_BODY_CHARS) {
          report[field] = await expandBody(client, report[field]);
        }
      }),
    );

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
