import { NextRequest, NextResponse } from "next/server";
import { createReport } from "@/lib/reports";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: { answers?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "요청 형식을 읽을 수 없습니다." },
      { status: 400 },
    );
  }

  const id = createReport(body.answers ?? {});
  return NextResponse.json({ id });
}
