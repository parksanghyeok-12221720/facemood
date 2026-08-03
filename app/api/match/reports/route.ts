import { NextRequest, NextResponse } from "next/server";
import { createMatchReport } from "@/lib/matchReports";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
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

  const id = createMatchReport(
    body.answers ?? {},
    body.myPhoto ?? null,
    body.partnerPhoto ?? null,
  );
  return NextResponse.json({ id });
}
