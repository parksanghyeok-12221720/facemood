import { NextRequest, NextResponse } from "next/server";
import { updateFullReport, updatePreviewResult } from "@/lib/reports";
import type { FullReport, PreviewResult } from "@/types/report";

export const runtime = "nodejs";

type Params = Promise<{ id: string }>;

export async function PATCH(
  request: NextRequest,
  segmentData: { params: Params },
) {
  const { id } = await segmentData.params;

  let body: {
    previewResult?: PreviewResult;
    fullReport?: FullReport;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "요청 형식을 읽을 수 없습니다." },
      { status: 400 },
    );
  }

  let updated = false;
  if (body.previewResult) {
    updated = updatePreviewResult(id, body.previewResult) || updated;
  }
  if (body.fullReport) {
    updated = updateFullReport(id, body.fullReport) || updated;
  }

  if (!updated) {
    return NextResponse.json(
      { error: "리포트를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}
