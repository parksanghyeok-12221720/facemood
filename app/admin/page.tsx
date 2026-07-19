import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Container from "@/app/components/Container";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";
import { getRevenueStats, listPaidReports } from "@/lib/reports";
import type { DailyRevenuePoint } from "@/lib/reports";

export const dynamic = "force-dynamic";

function formatAmount(amount: number | null): string {
  if (amount == null) return "-";
  return `${amount.toLocaleString("ko-KR")}원`;
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  // SQLite datetime('now') is UTC without a timezone suffix — append "Z"
  // so the browser/server renders it in local time instead of treating
  // it as already-local.
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(value: string): string {
  const [, month, day] = value.split("-");
  return `${month}/${day}`;
}

// Server-rendered CSS bar chart — no client JS or chart library needed
// for a simple daily-revenue view. Native <title> gives a hover tooltip.
function RevenueChart({ daily }: { daily: DailyRevenuePoint[] }) {
  const max = Math.max(1, ...daily.map((d) => d.total));

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs text-gray-500">최근 {daily.length}일 매출</p>
      <div className="mt-4 flex h-36 items-end gap-[3px]">
        {daily.map((point) => (
          <div key={point.date} className="group relative flex-1">
            <div
              className="w-full rounded-t bg-violet-500/70 transition-colors group-hover:bg-violet-400"
              style={{ height: `${(point.total / max) * 100}%`, minHeight: point.total > 0 ? 2 : 0 }}
            />
            <span className="sr-only">
              {point.date}: {point.total.toLocaleString("ko-KR")}원 ({point.count}건)
            </span>
            <div className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-[10px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {formatShortDate(point.date)} · {point.total.toLocaleString("ko-KR")}원
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-gray-600">
        <span>{daily[0] ? formatShortDate(daily[0].date) : ""}</span>
        <span>{daily[daily.length - 1] ? formatShortDate(daily[daily.length - 1].date) : ""}</span>
      </div>
    </div>
  );
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAuthed = verifyAdminSessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);

  if (!isAuthed) {
    redirect("/admin/login");
  }

  const paidReports = listPaidReports();
  const revenue = getRevenueStats();

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-10 text-white">
      <Container maxWidth="max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.3em] text-gray-500">
              FACEMOOD ADMIN
            </p>
            <h1 className="mt-2 text-lg font-semibold text-white">결제 내역</h1>
          </div>
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-gray-300 hover:bg-white/5"
            >
              로그아웃
            </button>
          </form>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-gray-500">오늘 매출</p>
            <p className="mt-1 text-lg font-bold text-white sm:text-xl">
              {revenue.todayTotal.toLocaleString("ko-KR")}원
            </p>
            <p className="mt-0.5 text-[11px] text-gray-500">{revenue.todayCount}건</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-gray-500">이번 달 매출</p>
            <p className="mt-1 text-lg font-bold text-white sm:text-xl">
              {revenue.monthTotal.toLocaleString("ko-KR")}원
            </p>
            <p className="mt-0.5 text-[11px] text-gray-500">{revenue.monthCount}건</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-gray-500">누적 매출</p>
            <p className="mt-1 text-lg font-bold text-white sm:text-xl">
              {revenue.allTimeTotal.toLocaleString("ko-KR")}원
            </p>
            <p className="mt-0.5 text-[11px] text-gray-500">{paidReports.length}건</p>
          </div>
        </div>

        <RevenueChart daily={revenue.daily} />

        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-gray-500">
                <th className="px-4 py-3 font-medium">이름</th>
                <th className="px-4 py-3 font-medium">연락처</th>
                <th className="px-4 py-3 font-medium">결제 금액</th>
                <th className="px-4 py-3 font-medium">결제 일시</th>
                <th className="px-4 py-3 font-medium">리포트 발송</th>
              </tr>
            </thead>
            <tbody>
              {paidReports.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    아직 결제 내역이 없습니다.
                  </td>
                </tr>
              )}
              {paidReports.map((report) => (
                <tr key={report.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3 text-white">{report.name ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-300">{report.phone ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-300">
                    {formatAmount(report.amount)}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{formatDate(report.paidAt)}</td>
                  <td className="px-4 py-3 text-gray-300">
                    {report.reportSentAt ? "발송 완료" : "미발송"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </main>
  );
}
