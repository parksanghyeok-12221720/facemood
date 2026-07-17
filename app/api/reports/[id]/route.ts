import { NextRequest, NextResponse } from "next/server";
import {
  getReport,
  markReportSent,
  updateFullReport,
  updatePreviewResult,
} from "@/lib/reports";
import { sendReportReadySms } from "@/lib/notify";
import type { FullReport, PreviewResult } from "@/types/report";

export const runtime = "nodejs";

type Params = Promise<{ id: string }>;

// Behind nginx, request.nextUrl.origin reflects whatever address Next.js
// itself is bound to (http://localhost:3000) unless the proxy forwards
// the original host/protocol — which this app's nginx config doesn't do.
// SITE_URL (set in .env.local) is the reliable source for the public
// domain; nextUrl.origin is only a local-dev fallback.
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
    // Snapshot before the write so we only notify the first time this
    // report's full report is saved, not on every regeneration.
    const before = getReport(id);
    updated = updateFullReport(id, body.fullReport) || updated;

    if (before && !before.fullReport && before.phone) {
      const reportUrl = `${resolveSiteOrigin(request)}/report?id=${id}`;
      sendReportReadySms(before.phone, reportUrl)
        .then(() => markReportSent(id))
        .catch((error) => console.error("sendReportReadySms failed", error));
    }
  }

  if (!updated) {
    return NextResponse.json(
      { error: "리포트를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}
