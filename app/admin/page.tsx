import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Container from "@/app/components/Container";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";
import { listPaidReports } from "@/lib/reports";

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

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAuthed = verifyAdminSessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);

  if (!isAuthed) {
    redirect("/admin/login");
  }

  const paidReports = listPaidReports();
  const totalAmount = paidReports.reduce((sum, r) => sum + (r.amount ?? 0), 0);

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

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-gray-500">결제 건수</p>
            <p className="mt-1 text-xl font-bold text-white">{paidReports.length}건</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-gray-500">누적 결제액</p>
            <p className="mt-1 text-xl font-bold text-white">
              {totalAmount.toLocaleString("ko-KR")}원
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-gray-500">
                <th className="px-4 py-3 font-medium">이름</th>
                <th className="px-4 py-3 font-medium">연락처</th>
                <th className="px-4 py-3 font-medium">추천 무드</th>
                <th className="px-4 py-3 font-medium">결제 금액</th>
                <th className="px-4 py-3 font-medium">결제 일시</th>
                <th className="px-4 py-3 font-medium">리포트 발송</th>
                <th className="px-4 py-3 font-medium">주문 ID</th>
              </tr>
            </thead>
            <tbody>
              {paidReports.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    아직 결제 내역이 없습니다.
                  </td>
                </tr>
              )}
              {paidReports.map((report) => (
                <tr key={report.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3 text-white">{report.name ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-300">{report.phone ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-300">
                    {report.recommendedMood ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {formatAmount(report.amount)}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{formatDate(report.paidAt)}</td>
                  <td className="px-4 py-3 text-gray-300">
                    {report.reportSentAt ? "발송 완료" : "미발송"}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-gray-500">
                    {report.id}
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
