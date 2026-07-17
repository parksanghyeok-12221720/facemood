import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  ANIMAL_TYPE_CANDIDATES,
  FACE_SHAPE_CANDIDATES,
  applyPreviewPersonalization,
  buildPreviewResult,
} from "@/types/report";
import type { PreviewPersonalization } from "@/types/report";

export const runtime = "nodejs";

// Unlike /api/generate-report, this runs on every free-preview visit, not
// just paying customers — so it's deliberately small: short output, no
// vision-heavy multi-call orchestration. If anything fails (no API key,
// OpenAI error, bad JSON), we fall back to the rule-based preview instead
// of breaking the free funnel.

const SYSTEM_PROMPT = `당신은 FACEMOOD의 무료 미리보기 문구를 개인화하는 AI입니다.

FACEMOOD는 외모를 평가하거나 점수를 매기는 서비스가 아니라, 사진과 답변을 바탕으로
사용자가 원하는 "추구미"에 가까워지는 스타일 방향을 참고용으로 제안하는 서비스입니다.

절대 규칙:
- 얼굴 점수, 외모 등급, 외모 순위, 단점 지적 표현을 절대 사용하지 마세요.
- 연예인이나 유명인과 닮았다는 표현을 절대 사용하지 마세요.
- 퍼스널컬러를 "봄웜입니다", "여쿨입니다"처럼 확정해서 말하지 마세요.
- "전문가가 직접 얼굴을 분석했다"는 식으로 말하지 말고, "사진상으로는", "~할 가능성이 높아요",
"~와 잘 맞을 수 있어요" 같은 부드럽고 참고형인 표현을 사용하세요.
- 이건 유료 상세 리포트가 아니라 무료 미리보기입니다. 각 항목은 1~2문장으로 짧고 간결하게
작성하세요. 길게 늘어뜨리지 마세요.
- 사용자의 답변(성별, 나이, 키, 몸무게, 원하는 추구미, 평소 스타일 등)과 사진에서 보이는
분위기를 반영해서 개인화하세요. 키·몸무게는 체형 지적이 아니라 스타일 참고로만 언급하세요.
- 사진이 첨부된 경우, 얼굴형과 동물상도 분류해주세요. 이건 확정 진단이 아니라 사진상으로
보이는 인상 분류이니, 주어진 후보 중에서만 하나씩 고르세요.`;

function buildSchema(hasImage: boolean) {
  const base = {
    oneLineSummary: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    currentMood: { type: "array", items: { type: "string" } },
    upgradePoints: { type: "array", items: { type: "string" } },
    colorHint: {
      type: "object",
      additionalProperties: false,
      required: ["summary", "description"],
      properties: {
        summary: { type: "string" },
        description: { type: "string" },
      },
    },
    hints: {
      type: "object",
      additionalProperties: false,
      required: ["styling", "hair", "makeup"],
      properties: {
        styling: { type: "string" },
        hair: { type: "string" },
        makeup: { type: "string" },
      },
    },
  };

  const required = [
    "oneLineSummary",
    "tags",
    "currentMood",
    "upgradePoints",
    "colorHint",
    "hints",
  ];

  // Face shape / animal type need an actual photo — only ask for (and
  // require) them when one was uploaded.
  const properties = hasImage
    ? {
        ...base,
        faceShapeType: { type: "string", enum: [...FACE_SHAPE_CANDIDATES] },
        animalType: { type: "string", enum: [...ANIMAL_TYPE_CANDIDATES] },
      }
    : base;
  if (hasImage) {
    required.push("faceShapeType", "animalType");
  }

  return {
    type: "object",
    additionalProperties: false,
    required,
    properties,
  } as const;
}

function buildUserPrompt(
  answers: Record<string, unknown>,
  recommendedMood: string,
  subMood: string,
  hasImage: boolean,
) {
  const answerLines = Object.entries(answers ?? {}).map(
    ([key, value]) => `- ${key}: ${String(value)}`,
  );

  return [
    `규칙 기반으로 이미 정해진 추천 추구미: ${recommendedMood} (보조 무드: ${subMood})`,
    "이 추구미 자체는 바꾸지 말고, 아래 답변과 사진을 참고해서 문구만 개인화해주세요.",
    "",
    "사용자 답변:",
    answerLines.length > 0 ? answerLines.join("\n") : "(답변 없음)",
    "",
    hasImage
      ? "사진이 첨부되어 있습니다. 사진에서 보이는 분위기를 참고하세요."
      : "사진은 첨부되지 않았습니다. 답변 정보만으로 작성하세요.",
    "",
    "아래 항목을 짧고 간결하게 작성해주세요:",
    "- oneLineSummary: 사진/답변 기반 한줄 총평 (2~3문장)",
    "- tags: 해시태그 3~4개",
    "- currentMood: 현재 이미지에서 느껴지는 분위기 키워드 3개",
    "- upgradePoints: 추구미에 가까워지기 위한 포인트 3개",
    "- colorHint.summary: 컬러 무드 한줄 요약 (1문장)",
    "- colorHint.description: 컬러 무드 설명 (2~3문장)",
    "- hints.styling / hints.hair / hints.makeup: 각각 1~2문장짜리 짧은 힌트",
    ...(hasImage
      ? [
          `- faceShapeType: 사진상 얼굴형을 [${FACE_SHAPE_CANDIDATES.join(", ")}] 중 하나로 분류`,
          `- animalType: 사진상 동물상을 [${ANIMAL_TYPE_CANDIDATES.join(", ")}] 중 하나로 분류`,
        ]
      : []),
  ].join("\n");
}

export async function POST(request: NextRequest) {
  let body: {
    answers?: Record<string, unknown>;
    imageDataUrl?: string | null;
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
  const base = buildPreviewResult(answers);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ previewResult: base });
  }

  try {
    const client = new OpenAI({ apiKey });

    const userContent: (
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    )[] = [
      {
        type: "text",
        text: buildUserPrompt(
          answers,
          base.recommendedMood,
          base.subMood,
          !!imageDataUrl,
        ),
      },
    ];

    if (imageDataUrl) {
      userContent.push({ type: "image_url", image_url: { url: imageDataUrl } });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      max_tokens: 1200,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "preview_personalization",
          strict: true,
          schema: buildSchema(!!imageDataUrl),
        },
      },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ previewResult: base });
    }

    const patch = JSON.parse(content) as PreviewPersonalization;
    return NextResponse.json({
      previewResult: applyPreviewPersonalization(base, patch),
    });
  } catch (error) {
    console.error("generate-preview failed", error);
    // Free preview should never hard-fail — fall back to the rule-based version.
    return NextResponse.json({ previewResult: base });
  }
}
