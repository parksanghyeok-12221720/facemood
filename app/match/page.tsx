import Link from "next/link";
import Container from "@/app/components/Container";

const reportChapters = [
  { number: "01", title: "우리의 커플 무드 최종 요약" },
  { number: "02", title: "각자의 현재 이미지 무드" },
  { number: "03", title: "두 사람의 첫인상 케미" },
  { number: "04", title: "닮은 분위기와 다른 분위기" },
  { number: "05", title: "함께 있을 때 강해지는 매력" },
  { number: "06", title: "주변에서 바라보는 커플 이미지" },
  { number: "07", title: "설렘·편안함·세련됨 무드 스코어" },
  { number: "08", title: "우리에게 어울리는 커플룩 방향" },
  { number: "09", title: "데이트 상황별 스타일 가이드" },
  { number: "10", title: "커플 사진 컬러와 콘셉트 추천" },
  { number: "11", title: "두 사람에게 어울리는 향기 조합" },
  { number: "12", title: "우리 커플 무드 체크리스트" },
];

const moodChemistryScores = [
  { label: "첫인상 조화", score: 88 },
  { label: "분위기 밸런스", score: 91 },
  { label: "컬러 케미", score: 84 },
  { label: "스타일 시너지", score: 89 },
  { label: "사진 무드 조화", score: 86 },
];

const includedItems = [
  "두 사람의 커플 무드 분석",
  "첫인상과 이미지 케미",
  "커플룩 및 데이트 스타일",
  "사진 콘셉트와 컬러",
  "커플 향기 조합",
  "공유용 커플 무드 카드",
];

export default function MatchPage() {
  return (
    <main
      className="min-h-screen pb-24"
      style={
        {
          "--match-ivory": "#F7F3EC",
          "--match-ink": "#2B2620",
          "--match-ink-soft": "#8A8580",
          "--match-navy": "#1E2A3A",
          "--match-rose": "#C9A0A0",
          "--match-burgundy": "#6F2A3A",
          "--match-beige": "#E4D2C3",
          backgroundColor: "var(--match-ivory)",
          color: "var(--match-ink)",
        } as React.CSSProperties
      }
    >
      {/* eslint-disable-next-line @next/next/no-page-custom-font -- scoped to this page only */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@500;600;700&display=swap"
      />

      {/* Hero */}
      <div className="relative overflow-hidden pb-14 pt-16">
        {/* Two overlapping circles instead of a heart — the recurring
            "two becoming one mood" motif used throughout this page. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-8 h-56 w-56 -translate-x-[65%] rounded-full opacity-40 blur-2xl"
          style={{ backgroundColor: "var(--match-rose)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-8 h-56 w-56 -translate-x-[35%] rounded-full opacity-40 blur-2xl"
          style={{ backgroundColor: "var(--match-navy)" }}
        />

        <Container maxWidth="max-w-3xl" className="relative text-center">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.2em]"
            style={{ backgroundColor: "var(--match-navy)", color: "var(--match-ivory)" }}
          >
            FACEMOOD MATCH
          </span>
          <h1
            className="mt-5 text-[26px] font-bold leading-[1.4] break-keep"
            style={{ fontFamily: "'Noto Serif KR', serif" }}
          >
            우리 둘이 함께 있을 때
            <br />
            만들어지는 분위기
          </h1>
          <p
            className="mx-auto mt-4 max-w-xs text-sm leading-relaxed"
            style={{ color: "var(--match-ink-soft)" }}
          >
            두 사람의 얼굴 무드와 이미지 조화를 분석해
            <br />
            우리만의 커플 무드를 발견해보세요.
          </p>

          <Link
            href="/match/upload"
            className="mt-7 inline-flex items-center justify-center rounded-full px-9 py-4 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--match-navy)" }}
          >
            우리의 무드 분석하기
          </Link>

          {/* Result preview mockup */}
          <div
            className="mx-auto mt-10 max-w-sm rounded-[28px] p-6 text-left shadow-sm"
            style={{ backgroundColor: "var(--match-beige)" }}
          >
            <span
              className="text-[10px] font-semibold tracking-[0.2em]"
              style={{ color: "var(--match-burgundy)" }}
            >
              FACEMOOD MATCH
            </span>
            <p
              className="mt-2 text-xl font-bold"
              style={{ fontFamily: "'Noto Serif KR', serif" }}
            >
              SOFT CITY COUPLE
            </p>
            <p className="mt-1 text-xs font-semibold" style={{ color: "var(--match-ink-soft)" }}>
              Mood Chemistry 87%
            </p>
            <p className="mt-3 text-xs leading-relaxed" style={{ color: "var(--match-ink)" }}>
              차분한 무드와 도시적인 무드가 만나 서로의 분위기를 더욱 선명하게
              만들어주는 조합
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["#차분한케미", "#은근한설렘", "#시티데이트"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/70 px-2.5 py-1 text-[10.5px] font-medium"
                  style={{ color: "var(--match-burgundy)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-3 text-[11px]" style={{ color: "var(--match-ink-soft)" }}>
            궁합 점수보다 두 사람만의 커플 무드 타입을 먼저 알려드려요.
          </p>
        </Container>
      </div>

      {/* Report contents */}
      <Container maxWidth="max-w-3xl" className="mt-14">
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.2em]"
          style={{ backgroundColor: "var(--match-beige)", color: "var(--match-burgundy)" }}
        >
          MATCH REPORT
        </span>
        <h2
          className="mt-4 text-lg font-bold leading-snug"
          style={{ fontFamily: "'Noto Serif KR', serif" }}
        >
          FACEMOOD Match Report 목차
        </h2>
        <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
          시각적 분위기와 스타일 조화만 분석해요. 갈등 가능성, 결혼 가능성
          같은 얼굴로 알 수 없는 내용은 다루지 않습니다.
        </p>

        <div
          className="mt-5 rounded-[24px] p-6"
          style={{ backgroundColor: "white", border: "1px solid var(--match-beige)" }}
        >
          <ol className="flex flex-col gap-3">
            {reportChapters.map((chapter) => (
              <li key={chapter.number} className="flex items-start gap-3 text-sm">
                <span
                  className="shrink-0 text-xs font-semibold tabular-nums"
                  style={{ color: "var(--match-rose)" }}
                >
                  {chapter.number}
                </span>
                {chapter.title}
              </li>
            ))}
          </ol>
        </div>
      </Container>

      {/* Mood Chemistry scores */}
      <Container maxWidth="max-w-3xl" className="mt-12">
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.2em]"
          style={{ backgroundColor: "var(--match-beige)", color: "var(--match-burgundy)" }}
        >
          MOOD CHEMISTRY
        </span>
        <h2
          className="mt-4 text-lg font-bold leading-snug"
          style={{ fontFamily: "'Noto Serif KR', serif" }}
        >
          궁합을 5가지 무드로 나눠 봐요
        </h2>

        <div
          className="mt-5 flex flex-col gap-4 rounded-[24px] p-6"
          style={{ backgroundColor: "white", border: "1px solid var(--match-beige)" }}
        >
          {moodChemistryScores.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>{item.label}</span>
                <span style={{ color: "var(--match-burgundy)" }}>{item.score}</span>
              </div>
              <div
                className="mt-1.5 h-2 w-full overflow-hidden rounded-full"
                style={{ backgroundColor: "var(--match-beige)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${item.score}%`, backgroundColor: "var(--match-rose)" }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
          업로드된 사진에서 감지된 시각적 인상과 선택한 선호 정보를 바탕으로
          구성된 무드 지표입니다.
        </p>
      </Container>

      {/* Final CTA */}
      <Container maxWidth="max-w-3xl" className="mt-14">
        <div
          className="rounded-[28px] p-7 text-center text-white"
          style={{ backgroundColor: "var(--match-navy)" }}
        >
          <p
            className="text-base font-bold leading-relaxed"
            style={{ fontFamily: "'Noto Serif KR', serif" }}
          >
            우리가 함께 있을 때 가장 빛나는
            <br />
            분위기를 발견하세요.
          </p>

          <ul className="mt-5 flex flex-col gap-2 text-left text-xs text-white/80">
            {includedItems.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span
                  className="h-1 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: "var(--match-rose)" }}
                />
                {item}
              </li>
            ))}
          </ul>

          <Link
            href="/match/upload"
            className="mt-6 flex w-full items-center justify-center rounded-full px-8 py-4 text-sm font-semibold"
            style={{ backgroundColor: "var(--match-ivory)", color: "var(--match-navy)" }}
          >
            우리의 리포트 만들기
          </Link>
        </div>
      </Container>
    </main>
  );
}
