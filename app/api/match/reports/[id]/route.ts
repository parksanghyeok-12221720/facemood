import { NextRequest, NextResponse } from "next/server";
import {
  getMatchReport,
  markMatchReportSent,
  updateMatchFullReport,
} from "@/lib/matchReports";
import { sendReportReadySms } from "@/lib/notify";
import type { MatchFullReport } from "@/types/matchReport";

export const runtime = "nodejs";

type Params = Promise<{ id: string }>;

function resolveSiteOrigin(request: NextRequest): string {
  const siteUrl = process.env.SITE_URL;
  if (siteUrl) return siteUrl.replace(/\/$/, "");
  return request.nextUrl.origin;
}

export async function PATCH(
  request: NextRequest,
  segmentData: { params: Params },
) {
  const { id } = await segmentData.params;

  let body: { fullReport?: MatchFullReport };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "요청 형식을 읽을 수 없습니다." },
      { status: 400 },
    );
  }

  if (!body.fullReport) {
    return NextResponse.json(
      { error: "저장할 리포트 내용이 없습니다." },
      { status: 400 },
    );
  }

  const before = getMatchReport(id);
  const updated = updateMatchFullReport(id, body.fullReport);

  if (!updated) {
    return NextResponse.json(
      { error: "리포트를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  if (before && !before.fullReport && before.phone) {
    const reportUrl = `${resolveSiteOrigin(request)}/match/report?id=${id}`;
    sendReportReadySms(before.phone, reportUrl)
      .then(() => markMatchReportSent(id))
      .catch((error) => console.error("sendReportReadySms failed", error));
  }

  return NextResponse.json({ ok: true });
}
