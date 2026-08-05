import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import StarRating from "@/app/components/StarRating";
import { ART_STYLE_CANDIDATES } from "@/types/matchReport";
import type { FilledScore, MatchFullReport, MoodTypeCandidate } from "@/types/matchReport";

// A second, playful "그림체" naming set (남자상/여자상 스타일), separate from
// the AI-assigned ArtStyleCandidate enum — picked client-side at random
// per page load rather than analyzed, so it's shown as a fun label, not a
// personalized result.
const MALE_ART_TYPES = [
  "도시적 댄디상",
  "모델상",
  "배우상",
  "빈티지 무드상",
  "소년상",
  "아이돌상",
  "클래식 신사상",
  "힙스터상",
];
const FEMALE_ART_TYPES = [
  "모델상",
  "배우상",
  "빈티지 무드상",
  "소녀상",
  "시크상",
  "아이돌상",
  "청순상",
  "클래식 레이디상",
];

// Same order as MALE_ART_TYPES/FEMALE_ART_TYPES above (index 0 = 1.png = the
// first type in each list), so the photo shown always matches the picked
// type name.
const MALE_ART_TYPE_PHOTOS = MALE_ART_TYPES.map(
  (_, index) => `/match-artstyle-profile/male/${index + 1}.png`,
);
const FEMALE_ART_TYPE_PHOTOS = FEMALE_ART_TYPES.map(
  (_, index) => `/match-artstyle-profile/female/${index + 1}.png`,
);

function subscribeNoop() {
  return () => {};
}

// One random pick per page load (not per render), cached at module level —
// same pattern as the mock-report variant picker on /match/result.
let cachedMaleTypeIndex: number | null = null;
let cachedFemaleTypeIndex: number | null = null;
let cachedTopArtStyleIndex: number | null = null;
function getMaleTypeIndexSnapshot() {
  if (cachedMaleTypeIndex === null) {
    cachedMaleTypeIndex = Math.floor(Math.random() * MALE_ART_TYPES.length);
  }
  return cachedMaleTypeIndex;
}
function getFemaleTypeIndexSnapshot() {
  if (cachedFemaleTypeIndex === null) {
    cachedFemaleTypeIndex = Math.floor(Math.random() * FEMALE_ART_TYPES.length);
  }
  return cachedFemaleTypeIndex;
}
// The top "얼굴 그림체 궁합" photo — a separate random pick from the
// original 12-candidate ArtStyleCandidate photo set, independent of
// report.myArtStyle (matches the "make this random too" request).
function getTopArtStyleIndexSnapshot() {
  if (cachedTopArtStyleIndex === null) {
    cachedTopArtStyleIndex = Math.floor(Math.random() * ART_STYLE_CANDIDATES.length);
  }
  return cachedTopArtStyleIndex;
}
function getServerTypeIndexSnapshot() {
  return 0;
}

export function PartLabel({ part, title }: { part: string; title: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span
        className="text-[11px] font-bold tracking-[0.15em]"
        style={{ color: "var(--match-burgundy)" }}
      >
        {part}
      </span>
      <h2
        className="text-lg font-bold leading-snug"
        style={{ fontFamily: "'Noto Serif KR', serif" }}
      >
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

// Bar fills from 0 to its score the first time it scrolls into view, then
// stays filled (one-time entrance, not a toggle) — same
// observe-once-then-unobserve pattern as the scroll-reveal effect on
// /detail.
function BarScoreRow({ label, filled, max = 5 }: { label: string; filled: number; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const percent = Math.max(0, Math.min(100, (filled / max) * 100));

  return (
    <div ref={ref} className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-xs font-semibold">{label}</span>
      <div
        className="h-2 flex-1 overflow-hidden rounded-full"
        style={{ backgroundColor: "var(--match-beige)" }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: visible ? `${percent}%` : "0%",
            backgroundColor: "var(--match-burgundy)",
          }}
        />
      </div>
    </div>
  );
}

function moodTypePhoto(name: MoodTypeCandidate) {
  return `/mood/match-types/${name}.png`;
}

function stylePhoto(label: string) {
  return `/mood/match-style/${label.toLowerCase()}.png`;
}

// Short, deterministic "how this couple reads to other people" phrases —
// derived from existing scores/fields instead of a new AI call, so the
// impression cards stay in sync with the rest of the report at zero extra
// generation cost.
function getFirstImpressionCards(
  report: MatchFullReport,
): { icon: string; text: string }[] {
  const cards: { icon: string; text: string }[] = [];

  if (report.firstImpressionScore >= 85) {
    cards.push({ icon: "🤝", text: "안정감 있는 커플처럼 보여요" });
  } else if (report.firstImpressionScore >= 70) {
    cards.push({ icon: "🤝", text: "자연스럽게 잘 어울리는 첫인상이에요" });
  } else {
    cards.push({ icon: "🤝", text: "서로 다른 매력이 첫인상에서부터 대비돼요" });
  }

  if (report.synergyScore >= 85) {
    cards.push({ icon: "✨", text: "분위기가 비슷해 함께 있으면 자연스러워요" });
  } else if (report.synergyScore >= 70) {
    cards.push({ icon: "✨", text: "서로 다른 분위기가 오히려 좋은 시너지를 만들어요" });
  } else {
    cards.push({ icon: "✨", text: "서로 다른 매력이 대비를 이루는 조합이에요" });
  }

  cards.push({
    icon: "👀",
    text: `같이 있을 때 ${report.moodTypeName} 무드가 강하게 느껴져요`,
  });

  return cards;
}

function topStyleEntries(styleCompat: FilledScore[], count: number): FilledScore[] {
  return [...styleCompat].sort((a, b) => b.filled - a.filled).slice(0, count);
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
      <rect x="4.5" y="9" width="11" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function BodyCard({
  label,
  body,
  locked = false,
}: {
  label: string;
  body: string;
  locked?: boolean;
}) {
  return (
    <Card className={locked ? "relative overflow-hidden" : ""}>
      <span
        className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold"
        style={{ backgroundColor: "var(--match-beige)", color: "var(--match-burgundy)" }}
      >
        {label}
      </span>
      <p
        className="mt-3 text-sm leading-relaxed"
        style={
          locked
            ? { whiteSpace: "pre-line", filter: "blur(5px)", userSelect: "none" }
            : { whiteSpace: "pre-line" }
        }
      >
        {body}
      </p>

      {locked && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center"
          style={{ backgroundColor: "rgba(250, 249, 247, 0.75)" }}
        >
          <span style={{ color: "var(--match-navy)" }}>
            <LockIcon />
          </span>
          <p className="text-xs font-bold" style={{ color: "var(--match-navy)" }}>
            전체 리포트에서 확인하세요
          </p>
          <Link
            href="/match/checkout"
            className="mt-1 rounded-full px-4 py-2 text-[11px] font-semibold text-white"
            style={{ backgroundColor: "var(--match-navy)" }}
          >
            리포트 받기
          </Link>
        </div>
      )}
    </Card>
  );
}

export default function MatchReportBody({
  report,
  myName,
  partnerName,
  locked = false,
}: {
  report: MatchFullReport;
  myName: string;
  partnerName: string;
  // When true, the "자세히 보기"/"총평" detail bodies render blurred with a
  // paywall CTA instead of the real text — used by the free /match/result
  // preview. /match/report (the paid page) always renders unlocked.
  locked?: boolean;
}) {
  const maleTypeIndex = useSyncExternalStore(
    subscribeNoop,
    getMaleTypeIndexSnapshot,
    getServerTypeIndexSnapshot,
  );
  const femaleTypeIndex = useSyncExternalStore(
    subscribeNoop,
    getFemaleTypeIndexSnapshot,
    getServerTypeIndexSnapshot,
  );
  const maleArtType = MALE_ART_TYPES[maleTypeIndex];
  const femaleArtType = FEMALE_ART_TYPES[femaleTypeIndex];

  const topArtStyleIndex = useSyncExternalStore(
    subscribeNoop,
    getTopArtStyleIndexSnapshot,
    getServerTypeIndexSnapshot,
  );
  const topArtStyle = ART_STYLE_CANDIDATES[topArtStyleIndex];

  return (
    <>
      {renderFirstImpression()}
      {renderArtStyleChemistry()}
      {renderMoodMatch()}
      {renderStyleCompat()}
      {renderMoodboard()}
      {renderDateAndSns()}
      {renderColorCompat()}
      {renderPerfume()}
      {renderFinal()}
    </>
  );

  function renderFirstImpression() {
    const cards = getFirstImpressionCards(report);
    return (
      <section className="mt-4">
        <PartLabel part="01" title="첫인상 분석" />
        <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
          다른 사람들 눈에는 두 분이 이렇게 비칠 거예요.
        </p>
        <div className="mt-5 flex flex-col gap-3">
          {cards.map((card) => (
            <Card key={card.text} className="flex items-center gap-3">
              <span className="text-xl">{card.icon}</span>
              <p className="text-sm font-semibold">{card.text}</p>
            </Card>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[
            { label: "첫인상 조화", score: report.firstImpressionScore },
            { label: "분위기 시너지", score: report.synergyScore },
          ].map((item) => (
            <Card key={item.label} className="text-center">
              <p className="text-[11px] font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                {item.label}
              </p>
              <p
                className="mt-1 text-2xl font-bold"
                style={{ fontFamily: "'Noto Serif KR', serif", color: "var(--match-burgundy)" }}
              >
                {item.score}
              </p>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  function renderArtStyleChemistry() {
    // The art-style images are full composed cards (photo + baked-in title/
    // rating/keyword panel) at a fixed native 3:2 ratio, not plain
    // headshots — showing two side by side duplicated that baked-in chrome
    // and read as cluttered, so this card shows just one representative
    // photo. The "OO상" label is a separate, playful random pick (see
    // MALE_ART_TYPES/FEMALE_ART_TYPES above) shown alongside it — not
    // derived from report.myArtStyle/partnerArtStyle.
    return (
      <section className="mt-10">
        <PartLabel part="02" title="얼굴 그림체 궁합" />
        <div className="mt-5 flex flex-col gap-3">
          <Card>
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl">
              <Image
                src={`/mood/match-artstyle/${topArtStyle}.png`}
                alt={topArtStyle}
                fill
                className="object-cover"
                style={{
                  filter: "blur(1.5px)",
                  maskImage:
                    "linear-gradient(to bottom, black 0%, black 45%, transparent 95%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 0%, black 45%, transparent 95%)",
                }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div>
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
                  <Image
                    src={MALE_ART_TYPE_PHOTOS[maleTypeIndex]}
                    alt={`${myName} - ${maleArtType}`}
                    fill
                    className="object-cover"
                    style={{
                      filter: "blur(1.5px)",
                      maskImage:
                        "linear-gradient(to bottom, black 0%, black 45%, transparent 95%)",
                      WebkitMaskImage:
                        "linear-gradient(to bottom, black 0%, black 45%, transparent 95%)",
                    }}
                  />
                </div>
                <p className="mt-1.5 text-center text-xs font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                  {myName}
                </p>
              </div>
              <div>
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
                  <Image
                    src={FEMALE_ART_TYPE_PHOTOS[femaleTypeIndex]}
                    alt={`${partnerName} - ${femaleArtType}`}
                    fill
                    className="object-cover"
                    style={{
                      filter: "blur(1.5px)",
                      maskImage:
                        "linear-gradient(to bottom, black 0%, black 45%, transparent 95%)",
                      WebkitMaskImage:
                        "linear-gradient(to bottom, black 0%, black 45%, transparent 95%)",
                    }}
                  />
                </div>
                <p className="mt-1.5 text-center text-xs font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                  {partnerName}
                </p>
              </div>
            </div>
            <div
              className="mt-4 rounded-2xl p-3 text-center text-xs font-semibold"
              style={{ backgroundColor: "var(--match-beige)", color: "var(--match-burgundy)" }}
            >
              Together — {report.artStyleTogether}
            </div>
          </Card>

          <BodyCard label="자세히 보기" body={report.part1Body} locked={locked} />
        </div>
      </section>
    );
  }

  function renderMoodMatch() {
    return (
      <section className="mt-10">
        <PartLabel part="03" title="무드 궁합" />
        <div className="mt-5">
          <Card>
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl">
              <Image
                src={moodTypePhoto(report.moodTypeName)}
                alt={report.moodTypeName}
                fill
                className="object-cover"
                style={{ filter: locked ? "blur(10px)" : undefined }}
              />
              <div
                className="absolute inset-x-0 bottom-0 px-5 py-4"
                style={{ background: "linear-gradient(to top, rgba(17,17,17,0.8), transparent)" }}
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
          <div className="mt-3">
            <BodyCard label="자세히 보기" body={report.moodTypeBody} locked={locked} />
          </div>
        </div>

        <p className="mt-8 text-sm font-bold">잘 어울리는 추천 무드</p>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
          지금 무드에 더해보면 좋은 다른 방향이에요.
        </p>
        <div className="mt-4 -mx-6 overflow-x-auto px-6 no-scrollbar">
          <div className="flex w-max gap-3">
            {report.recommendedMoods.map((mood) => (
              <div
                key={mood.name}
                className="w-72 shrink-0 overflow-hidden rounded-2xl"
                style={{ backgroundColor: "white", border: "1px solid var(--match-beige)" }}
              >
                <div className="relative aspect-[3/2] w-full">
                  <Image
                    src={moodTypePhoto(mood.name)}
                    alt={mood.name}
                    fill
                    className="object-cover"
                    style={{ filter: locked ? "blur(10px)" : undefined }}
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 px-3 py-2.5"
                    style={{ background: "linear-gradient(to top, rgba(17,17,17,0.8), transparent)" }}
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
        <div className="mt-4">
          <BodyCard label="자세히 보기" body={report.recommendedMoodsBody} locked={locked} />
        </div>
      </section>
    );
  }

  function renderStyleCompat() {
    return (
      <section className="mt-10">
        <PartLabel part="04" title="스타일 궁합" />
        <div className="mt-5 flex flex-col gap-3">
          <Card>
            <p className="text-sm font-bold">헤어 · 코디 · 액세서리</p>
            <div className="mt-3 flex items-center justify-between text-center text-xs">
              <div className="flex-1">
                <p className="font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                  {myName}
                </p>
                <p className="mt-1 font-bold">{report.myHair}</p>
              </div>
              <span className="px-2" style={{ color: "var(--match-rose)" }}>
                ×
              </span>
              <div className="flex-1">
                <p className="font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                  {partnerName}
                </p>
                <p className="mt-1 font-bold">{report.partnerHair}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold">
              <span>헤어 궁합</span>
              <StarRating filled={report.hairTogetherScore} />
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t pt-4" style={{ borderColor: "var(--match-beige)" }}>
              {report.styleCompat.map((item) => (
                <BarScoreRow key={item.label} label={item.label} filled={item.filled} />
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2.5 border-t pt-4" style={{ borderColor: "var(--match-beige)" }}>
              {report.itemCompat.map((item) => (
                <ScoreRow key={item.label} label={item.label} filled={item.filled} />
              ))}
            </div>

            <p className="mt-4 text-[11px] leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
              <span className="font-semibold" style={{ color: "var(--match-ink)" }}>
                같이 입으면 좋은 스타일
              </span>{" "}
              — {report.styleGoodNote}
            </p>
          </Card>

          <BodyCard label="자세히 보기" body={report.part2Body} locked={locked} />
        </div>
      </section>
    );
  }

  function renderMoodboard() {
    const topStyles = topStyleEntries(report.styleCompat, 3);
    return (
      <section className="mt-10">
        <PartLabel part="05" title="이런 방향으로 스타일을 맞추면" />
        <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
          두 분의 궁합 분석을 바탕으로 정리한 스타일 무드보드예요.
        </p>
        <div className="mt-5 -mx-6 overflow-x-auto px-6 no-scrollbar">
          <div className="flex w-max gap-3">
            {topStyles.map((style) => (
              <div
                key={style.label}
                className="w-40 shrink-0 overflow-hidden rounded-2xl"
                style={{ backgroundColor: "white", border: "1px solid var(--match-beige)" }}
              >
                <div className="relative aspect-[3/2] w-full">
                  <Image src={stylePhoto(style.label)} alt={style.label} fill className="object-cover" />
                </div>
                <div className="flex items-center justify-between px-3 py-2.5">
                  <p className="text-xs font-bold">{style.label}</p>
                  <StarRating filled={style.filled} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <Card className="mt-3">
          <p className="text-xs font-semibold" style={{ color: "var(--match-ink-soft)" }}>
            같이 맞추면 좋은 컬러 팔레트
          </p>
          <div className="mt-3 flex gap-2">
            {report.colorCompat.map((color) => (
              <span
                key={color.name}
                className="h-12 flex-1 rounded-xl"
                style={{ backgroundColor: color.hex, border: "1px solid var(--match-beige)" }}
                title={color.name}
              />
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed">{report.coupleLookDirection}</p>
        </Card>
      </section>
    );
  }

  function renderDateAndSns() {
    return (
      <section className="mt-10">
        <PartLabel part="06" title="데이트 스타일 & SNS" />
        <div className="mt-5 flex flex-col gap-3">
          <Card>
            <p className="text-sm font-bold">계절별 데이트룩</p>
            <div className="mt-3 flex flex-col gap-2.5">
              {report.seasonCompat.map((item) => (
                <ScoreRow key={item.label} label={item.label} filled={item.filled} />
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-sm font-bold">데이트 장소 궁합</p>
            <div className="mt-3 flex flex-col gap-2.5">
              {report.datePlaceCompat.map((item) => (
                <ScoreRow key={item.label} label={item.label} filled={item.filled} />
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-sm font-bold">사진 포즈 · SNS 프로필 추천</p>
            <p className="mt-2 text-xs" style={{ color: "var(--match-ink-soft)" }}>
              둘이 사진 찍으면 가장 잘 나오는 분위기예요.
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

          <BodyCard label="자세히 보기" body={report.part3Body} locked={locked} />
        </div>
      </section>
    );
  }

  function renderColorCompat() {
    return (
      <section className="mt-10">
        <PartLabel part="07" title="컬러 궁합" />
        <div className="mt-5">
          <Card>
            <p className="text-[11px] leading-relaxed" style={{ color: "var(--match-ink-soft)" }}>
              두 분이 함께 있을 때 가장 잘 어울리는 메인 컬러 5가지예요.
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
            <p className="mt-4 text-[11px] leading-relaxed border-t pt-3" style={{ borderColor: "var(--match-beige)", color: "var(--match-ink-soft)" }}>
              <span className="font-semibold" style={{ color: "var(--match-ink)" }}>
                피하면 좋은 스타일
              </span>{" "}
              — {report.styleAvoidNote}
            </p>
          </Card>
        </div>
      </section>
    );
  }

  function renderPerfume() {
    return (
      <section className="mt-10">
        <PartLabel part="08" title="향수 궁합" />
        <div className="mt-5">
          <Card>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
                <Image
                  src="/match-perfume/male.png"
                  alt="남자 향 추천"
                  fill
                  className="object-cover"
                  style={{ filter: "blur(1.5px)" }}
                />
              </div>
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
                <Image
                  src="/match-perfume/female.png"
                  alt="여자 향 추천"
                  fill
                  className="object-cover"
                  style={{ filter: "blur(1.5px)" }}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-center text-xs">
              <div className="flex-1">
                <p className="font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                  {myName}
                </p>
                <p className="mt-1 font-bold">{report.myPerfume}</p>
              </div>
              <span className="px-1" style={{ color: "var(--match-rose)" }}>
                ×
              </span>
              <div className="flex-1">
                <p className="font-semibold" style={{ color: "var(--match-ink-soft)" }}>
                  {partnerName}
                </p>
                <p className="mt-1 font-bold">{report.partnerPerfume}</p>
              </div>
            </div>
            <div
              className="mt-4 rounded-2xl p-3 text-center text-xs font-semibold"
              style={{ backgroundColor: "var(--match-beige)", color: "var(--match-burgundy)" }}
            >
              Together — {report.togetherPerfume}
            </div>
          </Card>
        </div>
      </section>
    );
  }

  function renderFinal() {
    return (
      <section className="mt-10">
        <PartLabel part="09" title="총평" />
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
                style={{ width: `${report.overallMoodScore}%`, backgroundColor: "var(--match-burgundy)" }}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
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

          <BodyCard label="총평" body={report.part4Body} locked={locked} />

          <ShareCard report={report} />
        </div>
      </section>
    );
  }
}

function ShareCard({ report }: { report: MatchFullReport }) {
  async function handleShare() {
    const shareText = `❤️ 얼굴합 ${report.pairScore}% · ⭐ ${report.overallPercentile} · 🎨 ${report.moodTypeName} Couple`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "FACEMOOD MATCH", text: shareText });
      } catch {
        // User cancelled the share sheet — nothing to do.
      }
    }
  }

  return (
    <div className="mt-4">
      <div
        className="mx-auto w-full max-w-xs overflow-hidden rounded-[28px] p-7 text-center shadow-lg"
        style={{
          background: "linear-gradient(135deg, var(--match-rose), var(--match-burgundy))",
        }}
      >
        <span className="text-[10px] font-bold tracking-[0.2em] text-white/90">
          FACEMOOD MATCH
        </span>
        <p className="mt-5 text-xs font-semibold text-white/85">
          ❤️ 얼굴합 {report.pairScore}%
        </p>
        <div className="mt-1 flex justify-center">
          <StarRating filled={report.pairScore / 20} color="#FFFFFF" trackColor="rgba(255,255,255,0.3)" />
        </div>
        <p
          className="mt-4 text-2xl font-bold text-white"
          style={{ fontFamily: "'Noto Serif KR', serif" }}
        >
          {report.moodTypeName} Couple
        </p>
        <p className="mt-1 text-[11px] font-semibold text-white/85">
          ⭐ {report.overallPercentile}
        </p>
      </div>
      <button
        type="button"
        onClick={handleShare}
        className="mx-auto mt-3 flex w-full max-w-xs items-center justify-center gap-2 rounded-full px-6 py-3 text-xs font-semibold text-white"
        style={{ backgroundColor: "var(--match-navy)" }}
      >
        공유하기
      </button>
      <p className="mt-2 text-center text-[11px]" style={{ color: "var(--match-ink-soft)" }}>
        이 카드를 캡처해서 저장하거나 공유해보세요.
      </p>
    </div>
  );
}
