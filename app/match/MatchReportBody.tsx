import Image from "next/image";
import StarRating from "@/app/components/StarRating";
import type { MatchFullReport, MoodTypeCandidate } from "@/types/matchReport";
import { MOOD_TYPE_CANDIDATES } from "@/types/matchReport";

export function PartLabel({ part, title }: { part: string; title: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span
        className="text-[11px] font-bold tracking-[0.15em]"
        style={{ color: "var(--match-rose)" }}
      >
        {part}
      </span>
      <h2 className="text-lg font-bold leading-snug" style={{ fontFamily: "'Noto Serif KR', serif" }}>
        {title}
      </h2>
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[24px] p-6 ${className}`}
      style={{ backgroundColor: "white", border: "1px solid var(--match-beige)" }}
    >
      {children}
    </div>
  );
}

function ScoreRow({ label, filled }: { label: string; filled: number }) {
  return (
    <div className="flex items-center justify-between text-xs font-semibold">
      <span>{label}</span>
      <StarRating filled={filled} />
    </div>
  );
}

function PhotoScoreRow({
  label,
  filled,
  photo,
}: {
  label: string;
  filled: number;
  photo: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl">
        <Image src={photo} alt={label} fill className="object-cover" />
      </div>
      <div className="flex flex-1 items-center justify-between text-xs font-semibold">
        <span>{label}</span>
        <StarRating filled={filled} />
      </div>
    </div>
  );
}

function moodTypePhoto(name: MoodTypeCandidate) {
  return `/mood/match-types/${name}.png`;
}

export default function MatchReportBody({
  report,
  myName,
  partnerName,
}: {
  report: MatchFullReport;
  myName: string;
  partnerName: string;
}) {
  return (
    <>
      {/* 01. Mood Type + 02. Recommended moods */}
      <Container01 />

      {/* PART 1 */}
      {renderPart1()}

      {/* PART 2 */}
      {renderPart2()}

      {/* PART 3 */}
      {renderPart3()}

      {/* PART 4 */}
      {renderPart4()}
    </>
  );

  function Container01() {
    return (
      <section className="mt-4">
        <PartLabel part="01" title="우리의 Mood Type" />
        <div className="mt-5">
          <Card>
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl">
              <Image
                src={moodTypePhoto(report.moodTypeName)}
                alt={report.moodTypeName}
                fill
                className="object-cover"
              />
              <div
                className="absolute inset-x-0 bottom-0 px-5 py-4"
                style={{ background: "linear-gradient(to top, rgba(30,42,58,0.85), transparent)" }}
              >
                <p className="text-xl font-bold text-white" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                  {report.moodTypeName}
                </p>
                <p className="text-xs font-semibold text-white/80">
                  Mood Score {report.moodTypeScore}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed">{report.moodTypeSummary}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {report.moodTypeKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full px-2.5 py-1 text-[10.5px] font-medium"
                  style={{ backgroundColor: "var(--match-beige)", color: "var(--match-burgundy)" }}
                >
                  {keyword}
                </span>
              ))}
            </div>
          </Card>
          <p className="mt-3 text-[11px] leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
            그 외 나올 수 있는 Mood Type —{" "}
            {MOOD_TYPE_CANDIDATES.filter((name) => name !== report.moodTypeName).join(" · ")}
          </p>
        </div>

        <div className="mt-10">
          <PartLabel part="02" title="잘 어울리는 추천 무드" />
          <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
            지금 무드에 더해보면 좋은 다른 방향이에요.
          </p>
        </div>
        <div className="mt-5 -mx-6 overflow-x-auto px-6">
          <div className="flex w-max gap-3">
            {report.recommendedMoods.map((mood) => (
              <div
                key={mood.name}
                className="w-48 shrink-0 overflow-hidden rounded-2xl"
                style={{ backgroundColor: "white", border: "1px solid var(--match-beige)" }}
              >
                <div className="relative aspect-[3/2] w-full">
                  <Image src={moodTypePhoto(mood.name)} alt={mood.name} fill className="object-cover" />
                  <div
                    className="absolute inset-x-0 bottom-0 px-3 py-2.5"
                    style={{ background: "linear-gradient(to top, rgba(30,42,58,0.85), transparent)" }}
                  >
                    <p className="text-sm font-bold text-white" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                      {mood.name}
                    </p>
                  </div>
                </div>
                <p className="px-3 py-3 text-[11px] leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
                  {mood.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function renderPart1() {
    return (
      <section className="mt-10">
        <PartLabel part="PART 1" title="얼굴 무드 분석" />
        <div className="mt-5 flex flex-col gap-3">
          <Card>
            <p className="text-sm font-bold">각자의 현재 이미지 무드</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                  {myName}
                </p>
                <p className="mt-1 text-sm font-bold">{report.myMoodLabel}</p>
                <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
                  {report.myMoodNote}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                  {partnerName}
                </p>
                <p className="mt-1 text-sm font-bold">{report.partnerMoodLabel}</p>
                <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
                  {report.partnerMoodNote}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-4">
              {[
                { label: "첫인상 조화", score: report.firstImpressionScore },
                { label: "분위기 시너지", score: report.synergyScore },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>{item.label}</span>
                    <span className="flex items-center gap-2">
                      <StarRating filled={item.score / 20} />
                      <span style={{ color: "var(--match-burgundy)" }}>{item.score}</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--match-beige)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.score}%`, backgroundColor: "var(--match-rose)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
              style={{ backgroundColor: "var(--match-burgundy)" }}
            >
              NEW
            </span>
            <p className="mt-3 text-sm font-bold">얼굴 그림체 케미</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 text-center">
                <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl">
                  <Image
                    src={`/mood/match-artstyle/${report.myArtStyle}.png`}
                    alt={`${myName} - ${report.myArtStyle}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="mt-2 text-xs font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                  {myName}
                </p>
                <p className="text-sm font-bold">{report.myArtStyle}</p>
              </div>
              <span style={{ color: "var(--match-rose)" }}>→</span>
              <div className="flex-1 text-center">
                <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl">
                  <Image
                    src={`/mood/match-artstyle/${report.partnerArtStyle}.png`}
                    alt={`${partnerName} - ${report.partnerArtStyle}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="mt-2 text-xs font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                  {partnerName}
                </p>
                <p className="text-sm font-bold">{report.partnerArtStyle}</p>
              </div>
            </div>
            <div
              className="mt-3 rounded-2xl p-3 text-center text-xs font-semibold"
              style={{ backgroundColor: "var(--match-beige)", color: "var(--match-burgundy)" }}
            >
              Together — {report.artStyleTogether}
            </div>
          </Card>
        </div>
      </section>
    );
  }

  function renderPart2() {
    return (
      <section className="mt-10">
        <PartLabel part="PART 2" title="스타일 분석" />
        <div className="mt-5 flex flex-col gap-3">
          <Card>
            <p className="text-sm font-bold">스타일 궁합</p>
            <div className="mt-3 flex flex-col gap-3">
              {report.styleCompat.map((item) => (
                <PhotoScoreRow
                  key={item.label}
                  label={item.label}
                  filled={item.filled}
                  photo={`/mood/match-style/${item.label.toLowerCase()}.png`}
                />
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2 border-t pt-3" style={{ borderColor: "var(--match-beige)" }}>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
                <span className="font-semibold" style={{ color: "var(--match-ink)" }}>
                  같이 입으면 좋은 스타일
                </span>{" "}
                — {report.styleGoodNote}
              </p>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
                <span className="font-semibold" style={{ color: "var(--match-ink)" }}>
                  피해야 할 스타일
                </span>{" "}
                — {report.styleAvoidNote}
              </p>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
                <span className="font-semibold" style={{ color: "var(--match-ink)" }}>
                  커플룩 방향
                </span>{" "}
                — {report.coupleLookDirection}
              </p>
            </div>
          </Card>

          <Card>
            <p className="text-sm font-bold">헤어 궁합</p>
            <div className="mt-3 flex items-center justify-between text-center text-xs">
              <div className="flex-1">
                <p className="font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                  {myName}
                </p>
                <p className="mt-1 font-bold">{report.myHair}</p>
              </div>
              <span className="px-2" style={{ color: "var(--match-rose)" }}>
                →
              </span>
              <div className="flex-1">
                <p className="font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                  {partnerName}
                </p>
                <p className="mt-1 font-bold">{report.partnerHair}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold">
              <span>Together</span>
              <StarRating filled={report.hairTogetherScore} />
            </div>
          </Card>

          <Card>
            <p className="text-sm font-bold">컬러 궁합</p>
            <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
              두 사람이 함께 있을 때 가장 잘 어울리는 메인 컬러 5가지예요.
            </p>
            <div className="mt-3 flex flex-col gap-2.5">
              {report.colorCompat.map((color) => (
                <div key={color.name} className="flex items-start gap-2.5">
                  <span
                    className="mt-0.5 h-5 w-5 shrink-0 rounded-full"
                    style={{ backgroundColor: color.hex, border: "1px solid var(--match-beige)" }}
                  />
                  <div>
                    <p className="text-xs font-bold">{color.name}</p>
                    <p className="text-[11px] leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
                      {color.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-sm font-bold">코디 궁합</p>
            <div className="mt-3 flex flex-col gap-2.5">
              {report.itemCompat.map((item) => (
                <ScoreRow key={item.label} label={item.label} filled={item.filled} />
              ))}
            </div>
          </Card>
        </div>
      </section>
    );
  }

  function renderPart3() {
    return (
      <section className="mt-10">
        <PartLabel part="PART 3" title="무드 라이프" />
        <div className="mt-5 flex flex-col gap-3">
          <Card>
            <p className="text-sm font-bold">데이트 장소 궁합</p>
            <div className="mt-3 flex flex-col gap-2.5">
              {report.datePlaceCompat.map((item) => (
                <ScoreRow key={item.label} label={item.label} filled={item.filled} />
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-sm font-bold">사진 컨셉 궁합</p>
            <p className="mt-2 text-xs" style={{ color: "var(--match-ink-soft)" }}>
              둘이 사진 찍으면 가장 잘 나오는 분위기
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {report.photoConceptTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2.5 py-1 text-[10.5px] font-medium"
                  style={{ backgroundColor: "var(--match-beige)", color: "var(--match-burgundy)" }}
                >
                  #{tag}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2.5 border-t pt-3" style={{ borderColor: "var(--match-beige)" }}>
              {report.snsConceptCompat.map((item) => (
                <ScoreRow key={item.label} label={item.label} filled={item.filled} />
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-sm font-bold">향기 조합</p>
            <div className="mt-3 flex items-center justify-between text-center text-xs">
              <div className="flex-1">
                <p className="font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                  {myName}
                </p>
                <p className="mt-1 font-bold">{report.myPerfume}</p>
              </div>
              <span className="px-1" style={{ color: "var(--match-rose)" }}>
                →
              </span>
              <div className="flex-1">
                <p className="font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                  {partnerName}
                </p>
                <p className="mt-1 font-bold">{report.partnerPerfume}</p>
              </div>
              <span className="px-1" style={{ color: "var(--match-rose)" }}>
                →
              </span>
              <div className="flex-1">
                <p className="font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                  Together
                </p>
                <p className="mt-1 font-bold">{report.togetherPerfume}</p>
              </div>
            </div>
          </Card>

          <Card>
            <p className="text-sm font-bold">계절 궁합</p>
            <div className="mt-3 flex flex-col gap-2.5">
              {report.seasonCompat.map((item) => (
                <ScoreRow key={item.label} label={item.label} filled={item.filled} />
              ))}
            </div>
          </Card>
        </div>
      </section>
    );
  }

  function renderPart4() {
    return (
      <section className="mt-10">
        <PartLabel part="PART 4" title="공유 리포트" />
        <div className="mt-5 flex flex-col gap-3">
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">종합 Mood Score</p>
              <span
                className="rounded-full px-3 py-1 text-[11px] font-bold text-white"
                style={{ backgroundColor: "var(--match-navy)" }}
              >
                {report.overallPercentile}
              </span>
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-3xl font-bold" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                {report.overallMoodScore}
              </span>
              <span className="pb-1 text-xs" style={{ color: "var(--match-ink-soft)" }}>
                / 100
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--match-beige)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${report.overallMoodScore}%`, backgroundColor: "var(--match-navy)" }}
              />
            </div>
          </Card>

          <Card>
            <p className="text-sm font-bold">분위기 키워드 궁합</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {report.moodKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full px-2.5 py-1 text-[10.5px] font-medium"
                  style={{ backgroundColor: "var(--match-beige)", color: "var(--match-burgundy)" }}
                >
                  {keyword}
                </span>
              ))}
            </div>
          </Card>

          <div
            className="mx-auto w-full max-w-[220px] overflow-hidden rounded-[24px] shadow-sm"
            style={{ backgroundColor: "white", border: "1px solid var(--match-beige)" }}
          >
            <div className="relative aspect-[4/5] w-full">
              <Image
                src={moodTypePhoto(report.moodTypeName)}
                alt="공유 카드"
                fill
                className="object-cover"
              />
              <div
                className="absolute inset-x-0 bottom-0 px-4 py-3"
                style={{ background: "linear-gradient(to top, rgba(30,42,58,0.85), transparent)" }}
              >
                <p className="text-sm font-bold text-white">{report.pairLabel}</p>
                <p className="text-[11px] font-semibold text-white/80">
                  Mood Chemistry {report.pairScore}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}
