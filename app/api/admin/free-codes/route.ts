import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";
import { createFreeCode, listFreeCodes, type FreeCodeProduct } from "@/lib/freeCodes";
import type { ReportTier } from "@/lib/reports";

export const runtime = "nodejs";

function isAuthed(request: NextRequest): boolean {
  return verifyAdminSessionToken(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
}

export async function GET(request: NextRequest) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }
  return NextResponse.json({ codes: listFreeCodes() });
}

export async function POST(request: NextRequest) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  let body: { product?: string; tier?: string; note?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "요청 형식을 읽을 수 없습니다." },
      { status: 400 },
    );
  }

  const product: FreeCodeProduct = body.product === "match" ? "match" : "facemood";
  const tier: ReportTier | null =
    product === "facemood" ? (body.tier === "basic" ? "basic" : "premium") : null;
  const note = typeof body.note === "string" ? body.note : null;

  const code = createFreeCode(product, tier, note);
  return NextResponse.json({ code });
}
