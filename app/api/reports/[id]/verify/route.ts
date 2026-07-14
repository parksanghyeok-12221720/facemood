import { NextRequest, NextResponse } from "next/server";
import { getReport, verifyReportPassword } from "@/lib/reports";

export const runtime = "nodejs";

type Params = Promise<{ id: string }>;

export async function POST(
  request: NextRequest,
  segmentData: { params: Params },
) {
  const { id } = await segmentData.params;

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "요청 형식을 읽을 수 없습니다." },
      { status: 400 },
    );
  }

  const password = body.password ?? "";
  if (!verifyReportPassword(id, password)) {
    return NextResponse.json(
      { error: "비밀번호가 올바르지 않습니다." },
      { status: 401 },
    );
  }

  const record = getReport(id);
  if (!record) {
    return NextResponse.json(
      { error: "리포트를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    answers: record.answers,
    previewResult: record.previewResult,
    fullReport: record.fullReport,
    paid: record.paid,
  });
}
