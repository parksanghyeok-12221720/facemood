import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { MOOD_CANDIDATES } from "@/types/report";
import type { FullReport, PreviewResult } from "@/types/report";

export const runtime = "nodejs";

// This is the ONLY place in the app that calls the OpenAI API. It only
// runs after checkout, from /report — never from /upload or /result, so
// the free preview flow never costs API usage.

const SYSTEM_PROMPT = `당신은 FACEMOOD의 이미지 컨설팅 리포트 작성 어시스턴트입니다.

FACEMOOD는 외모를 평가하거나 점수를 매기는 서비스가 아닙니다. 사진과 답변을 바탕으로 사용자가 원하는 "추구미"에 가까워지는 스타일 방향을 이미지 컨설팅 관점에서 참고용으로 제안하는 서비스입니다.

절대 규칙:
- 얼굴 점수, 외모 등급, 외모 순위, 단점 지적 표현을 절대 사용하지 마세요.
- 연예인이나 유명인과 닮았다는 표현을 절대 사용하지 마세요.
- 퍼스널컬러를 "봄웜입니다", "여쿨입니다"처럼 확정해서 말하지 마세요. 조명, 카메라 보정, 피부 상태, 배경색에 따라 색감은 달라질 수 있습니다.
- "전문가가 직접 얼굴을 분석했다"는 식으로 말하지 말고, "이미지 컨설팅 관점에서는", "스타일 분석 흐름상" 같은 표현을 사용하세요.
- 모든 문장은 "사진상으로는", "~할 가능성이 높아요", "~와 잘 맞을 수 있어요" 같은 부드럽고 참고형인 표현을 사용하세요.
- 20대 여성이 감성적인 뷰티/스타일 앱에서 유료 상세 리포트를 받아보는 느낌으로, 부드럽고 자연스럽지만 충분히 구체적으로 작성하세요.

recommendedMood와 subMood는 반드시 아래 8개 후보 중에서만 선택하세요:
${MOOD_CANDIDATES.map((m, i) => `${i + 1}. ${m}`).join("\n")}

각 섹션은 무료 미리보기보다 훨씬 구체적이고 분량이 많아야 합니다. 스타일링, 헤어, 메이크업, 컬러, 피하면 좋은 방향, 상황별 이미지 전략을 실제로 따라 할 수 있을 만큼 구체적으로 작성하세요.

hair.salonScript는 사용자가 미용실에 가서 그대로 읽을 수 있는 실제 대사 형태의 문장으로 작성하세요 (예: "앞머리는 살리고 전체적으로 레이어드컷을 넣어주세요. 컬러는...").

결과는 반드시 JSON 스키마에 맞춰 반환하세요.`;

const fullReportJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "summary",
    "currentImageMood",
    "gapAnalysis",
    "styling",
    "hair",
    "makeup",
    "colorMood",
    "situationGuide",
    "finalChecklist",
  ],
  properties: {
    summary: {
      type: "object",
      additionalProperties: false,
      required: ["recommendedMood", "subMood", "keywords", "finalAdvice"],
      properties: {
        recommendedMood: { type: "string", enum: [...MOOD_CANDIDATES] },
        subMood: { type: "string", enum: [...MOOD_CANDIDATES] },
        keywords: { type: "array", items: { type: "string" } },
        finalAdvice: { type: "string" },
      },
    },
    currentImageMood: {
      type: "object",
      additionalProperties: false,
      required: ["title", "content"],
      properties: {
        title: { type: "string" },
        content: { type: "string" },
      },
    },
    gapAnalysis: {
      type: "object",
      additionalProperties: false,
      required: ["title", "content"],
      properties: {
        title: { type: "string" },
        content: { type: "string" },
      },
    },
    styling: {
      type: "object",
      additionalProperties: false,
      required: ["title", "colors", "silhouettes", "items", "avoid"],
      properties: {
        title: { type: "string" },
        colors: { type: "array", items: { type: "string" } },
        silhouettes: { type: "array", items: { type: "string" } },
        items: { type: "array", items: { type: "string" } },
        avoid: { type: "array", items: { type: "string" } },
      },
    },
    hair: {
      type: "object",
      additionalProperties: false,
      required: ["title", "length", "bangs", "perm", "color", "salonScript"],
      properties: {
        title: { type: "string" },
        length: { type: "string" },
        bangs: { type: "string" },
        perm: { type: "string" },
        color: { type: "string" },
        salonScript: { type: "string" },
      },
    },
    makeup: {
      type: "object",
      additionalProperties: false,
      required: ["base", "eyebrow", "eye", "blush", "lip"],
      properties: {
        base: { type: "string" },
        eyebrow: { type: "string" },
        eye: { type: "string" },
        blush: { type: "string" },
        lip: { type: "string" },
      },
    },
    colorMood: {
      type: "object",
      additionalProperties: false,
      required: [
        "title",
        "tone",
        "recommendedPalette",
        "avoidColors",
        "notice",
      ],
      properties: {
        title: { type: "string" },
        tone: { type: "string" },
        recommendedPalette: { type: "array", items: { type: "string" } },
        avoidColors: { type: "array", items: { type: "string" } },
        notice: { type: "string" },
      },
    },
    situationGuide: {
      type: "object",
      additionalProperties: false,
      required: ["dating", "instagram", "daily", "interview"],
      properties: {
        dating: { type: "string" },
        instagram: { type: "string" },
        daily: { type: "string" },
        interview: { type: "string" },
      },
    },
    finalChecklist: { type: "array", items: { type: "string" } },
  },
} as const;

function buildUserPrompt(
  answers: Record<string, unknown>,
  previewResult: PreviewResult | null,
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
    "사용자가 테스트에서 선택한 답변은 다음과 같습니다:",
    answerLines.length > 0 ? answerLines.join("\n") : "(답변 없음)",
    "",
    ...previewLines,
    "",
    "첨부된 사진(있다면)과 위 정보를 참고해서 유료 상세 리포트(FullReport) JSON을 생성해주세요.",
  ].join("\n");
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

  const userContent: (
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  )[] = [{ type: "text", text: buildUserPrompt(answers, previewResult) }];

  if (imageDataUrl) {
    userContent.push({ type: "image_url", image_url: { url: imageDataUrl } });
  }

  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "full_report",
          strict: true,
          schema: fullReportJsonSchema,
        },
      },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "AI 응답을 받지 못했습니다." },
        { status: 502 },
      );
    }

    const report = JSON.parse(content) as FullReport;
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
