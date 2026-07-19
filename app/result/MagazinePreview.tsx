"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Container from "@/app/components/Container";
import type { PreviewResult } from "@/types/report";

// Everything in this file is presentation only — it reads fields already
// computed by the rule-based buildPreviewResult (or static copy written
// here), and never calls an API. The free preview must stay zero-cost.

function LockGlyph({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <rect x="4.5" y="9" width="11" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Scroll-triggered reveal — fades/slides content in once it enters the
// viewport, and skips straight to visible for prefers-reduced-motion.
function FadeInSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [reduceMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [visible, setVisible] = useState(reduceMotion);

  useEffect(() => {
    if (reduceMotion) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduceMotion]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] text-[var(--lavender-deep)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--blush-deep)]" aria-hidden="true" />
      {children}
    </span>
  );
}

function LockChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ink)]/[0.06] px-3 py-1.5 text-[11px] font-medium text-[var(--ink-soft)]">
      <LockGlyph />
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// 1. Mood film hero
// ---------------------------------------------------------------------------

function MoodFilmHero({ heroImage }: { heroImage: string }) {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <section className="relative w-full overflow-hidden" style={{ aspectRatio: "3 / 4" }}>
      {!videoFailed && (
        // No video asset ships with the project yet — this quietly falls
        // back to the image below the moment the source 404s, so dropping
        // a real clip in at this path later "just works" with no code change.
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={heroImage}
          onError={() => setVideoFailed(true)}
        >
          <source src="/mood/hero-loop.mp4" type="video/mp4" />
        </video>
      )}
      {videoFailed && (
        <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 px-6 pb-10 pt-16">
        <span className="text-[11px] font-semibold tracking-[0.2em] text-white/70">
          FACEMOOD · PREVIEW FILM
        </span>
        <h1
          className="mt-3 text-[26px] font-bold leading-[1.35] text-white break-keep"
          style={{ fontFamily: "'Noto Serif KR', serif" }}
        >
          2n년째 몰랐던 나의 추구미,
          <br />
          이제는 분위기로 찾을 시간
        </h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-white/80">
          사진과 답변을 바탕으로 내 분위기가 어떤 방식으로 분석되는지 미리
          확인해보세요.
        </p>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 2. Magazine intro
// ---------------------------------------------------------------------------

function MagazineIntro() {
  return (
    <Container className="mt-14">
      <FadeInSection>
        <Eyebrow>MAGAZINE INTRO</Eyebrow>
        <h2
          className="text-[21px] font-bold leading-[1.45] text-[var(--ink)] break-keep"
          style={{ fontFamily: "'Noto Serif KR', serif" }}
        >
          요즘 추구미는 얼굴보다
          <br />
          분위기의 조합에서 시작돼요.
        </h2>
        <p className="mt-4 text-[14.5px] leading-relaxed text-[var(--ink-soft)]">
          헤어의 흐름, 메이크업의 강도, 옷의 색감, 사진 속 분위기가 합쳐져
          하나의 이미지가 만들어져요. FACEMOOD는 이 요소들을 바탕으로 나에게
          자연스럽게 연결되는 추구미 방향을 정리해드려요.
        </p>
      </FadeInSection>
    </Container>
  );
}

// ---------------------------------------------------------------------------
// 3. 내 분위기를 만드는 5가지 — floating chips around a blurred mood image
// ---------------------------------------------------------------------------

// Each chip anchors from a fixed edge inset instead of a percentage +
// -translate-x-1/2 center point — the latter clips near the container
// edge once the chip's real rendered width is wider than the remaining
// space (exactly what was happening on narrow screens before).
const MOOD_FACTORS = [
  {
    label: "헤어의 흐름",
    position: "left-3 top-3",
    desc: "볼륨이 실리는 위치와 컬의 방향만 바뀌어도 인상의 온도가 완전히 달라져요.",
  },
  {
    label: "메이크업 강도",
    position: "right-3 top-3",
    desc: "음영과 채도의 세기가 &lsquo;또렷함&rsquo;과 &lsquo;여림&rsquo; 사이 어디쯤 위치할지를 결정해요.",
  },
  {
    label: "옷의 색감",
    position: "left-3 top-1/2 -translate-y-1/2",
    desc: "톤의 채도와 명도는 사진 속 분위기를 가장 빠르게 바꾸는 요소예요.",
  },
  {
    label: "실루엣",
    position: "right-3 bottom-3",
    desc: "핏의 라인이 곧게 떨어지는지, 부드럽게 흐르는지에 따라 무드가 갈려요.",
  },
  {
    label: "사진의 밝기",
    position: "left-1/2 bottom-3 -translate-x-1/2",
    desc: "같은 스타일링도 조명 온도에 따라 전혀 다른 인상으로 읽힐 수 있어요.",
  },
] as const;

function MoodFactorExplorer({ heroImage }: { heroImage: string }) {
  const [selected, setSelected] = useState(0);

  return (
    <Container className="mt-16">
      <FadeInSection>
        <Eyebrow>MOOD FACTORS</Eyebrow>
        <h2
          className="text-[21px] font-bold leading-[1.4] text-[var(--ink)] break-keep"
          style={{ fontFamily: "'Noto Serif KR', serif" }}
        >
          내 분위기를 만드는 5가지
        </h2>

        <div className="relative mt-6 aspect-square w-full overflow-hidden rounded-[28px] bg-[var(--lavender)]">
          <Image
            src={heroImage}
            alt=""
            fill
            sizes="(min-width: 448px) 400px, 100vw"
            className="object-cover opacity-90 blur-[6px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/35" />
          <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[var(--ink)] shadow-sm">
            <LockGlyph className="h-4 w-4" />
          </span>

          {MOOD_FACTORS.map((factor, index) => (
            <button
              key={factor.label}
              type="button"
              onClick={() => setSelected(index)}
              aria-pressed={selected === index}
              className={`absolute max-w-[42%] rounded-full px-3.5 py-2 text-[12.5px] font-semibold shadow-sm backdrop-blur-sm transition-all ${factor.position} ${
                selected === index
                  ? "scale-105 bg-[var(--ink)] text-white"
                  : "bg-white/85 text-[var(--ink)] hover:bg-white"
              }`}
            >
              {factor.label}
            </button>
          ))}
        </div>

        <div
          key={selected}
          className="mt-5 rounded-2xl border border-[var(--hairline)] bg-[var(--ivory)] p-5 magazine-fade-in"
        >
          <p className="text-[12px] font-semibold text-[var(--blush-deep)]">
            {MOOD_FACTORS[selected].label}
          </p>
          <p
            className="mt-2 text-[14.5px] leading-relaxed text-[var(--ink)]"
            dangerouslySetInnerHTML={{ __html: MOOD_FACTORS[selected].desc }}
          />
        </div>
      </FadeInSection>
    </Container>
  );
}

// ---------------------------------------------------------------------------
// 4. 트렌드 캐러셀 — 3D-ish carousel, center card large, neighbors small/dim
// ---------------------------------------------------------------------------

const TREND_CARDS = [
  {
    name: "클린걸 메이크업",
    desc: "피부 결을 살린 투명한 베이스와 은은한 혈색만 남기는 미니멀 메이크업.",
    fit: "꾸안꾸 느낌을 좋아하는 사람",
    image: "/mood/makeup/makeup1.png",
  },
  {
    name: "무채색 시크룩",
    desc: "블랙·그레이·화이트만으로 완성하는 절제된 도시적 룩.",
    fit: "차분하고 정돈된 인상을 원하는 사람",
    image: "/mood/cards/무채색 핀터걸st.png",
  },
  {
    name: "러블리 블러셔",
    desc: "볼 전체에 은은하게 퍼지는 블러셔로 생기와 애교를 더하는 스타일.",
    fit: "따뜻하고 사랑스러운 인상을 원하는 사람",
    image: "/mood/makeup/makeup5.png",
  },
  {
    name: "뮤트 아이 메이크업",
    desc: "채도를 낮춘 브라운·카키 톤으로 눈매에 깊이만 더하는 방식.",
    fit: "과하지 않게 또렷한 눈매를 원하는 사람",
    image: "/mood/makeup/makeup_ 은은한 스모키.png",
  },
  {
    name: "글로우 베이스",
    desc: "빛을 머금은 듯한 윤광 피부로 생기와 화사함을 강조하는 베이스.",
    fit: "화사하고 입체적인 인상을 원하는 사람",
    image: "/mood/makeup/makeup_굴로우베이스.png",
  },
  {
    name: "레이어드 헤어",
    desc: "층이 자연스럽게 떨어지는 웨이브로 가볍고 움직임 있는 헤어 라인.",
    fit: "가볍고 자연스러운 헤어를 원하는 사람",
    image: "/mood/hair/hair_텍스처 웨이브.png",
  },
] as const;

function relativeOffset(index: number, current: number, length: number) {
  let raw = index - current;
  if (raw > length / 2) raw -= length;
  if (raw < -length / 2) raw += length;
  return raw;
}

function TrendCarousel() {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  function go(delta: number) {
    setIndex((prev) => (prev + delta + TREND_CARDS.length) % TREND_CARDS.length);
  }

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (delta > 40) go(-1);
    else if (delta < -40) go(1);
    touchStartX.current = null;
  }

  return (
    <section className="mt-16 overflow-hidden py-2">
      <Container>
        <FadeInSection>
          <Eyebrow>TREND CHECK</Eyebrow>
          <h2
            className="text-[21px] font-bold leading-[1.4] text-[var(--ink)] break-keep"
            style={{ fontFamily: "'Noto Serif KR', serif" }}
          >
            요즘 유행하는 추구미,
            <br />
            나한테도 맞을까?
          </h2>
        </FadeInSection>
      </Container>

      <div
        className="relative mt-7 flex h-[360px] items-center justify-center [perspective:1200px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {TREND_CARDS.map((card, i) => {
          const offset = relativeOffset(i, index, TREND_CARDS.length);
          const isActive = offset === 0;
          const isNeighbor = Math.abs(offset) === 1;
          const visible = Math.abs(offset) <= 1;

          return (
            <button
              key={card.name}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${card.name} 카드${isActive ? " (선택됨)" : ""}`}
              className="absolute w-[230px] shrink-0 text-left transition-all duration-500 ease-out"
              style={{
                transform: `translateX(${offset * 148}px) scale(${isActive ? 1 : 0.8}) rotateY(${offset * -8}deg)`,
                opacity: visible ? (isActive ? 1 : 0.5) : 0,
                zIndex: isActive ? 20 : isNeighbor ? 10 : 0,
                pointerEvents: visible ? "auto" : "none",
                filter: isActive ? "none" : "blur(0.5px)",
              }}
            >
              <div className="overflow-hidden rounded-2xl border border-[var(--hairline)] bg-white shadow-[0_12px_30px_-12px_rgba(140,110,170,0.35)]">
                <div className="relative aspect-[4/5] w-full bg-[var(--lavender)]">
                  <Image
                    src={card.image}
                    alt={card.name}
                    fill
                    sizes="230px"
                    className="object-cover blur-[5px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25" />
                  <span className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[var(--ink)] shadow-sm">
                    <LockGlyph className="h-3 w-3" />
                  </span>
                </div>
                <div className="p-4">
                  <p
                    className="text-[15px] font-bold text-[var(--ink)]"
                    style={{ fontFamily: "'Noto Serif KR', serif" }}
                  >
                    {card.name}
                  </p>
                  <p className="mt-1.5 select-none text-[12px] leading-relaxed text-[var(--ink-soft)] blur-[3px]">
                    {card.desc}
                  </p>
                  <p className="mt-2 select-none text-[11px] font-medium text-[var(--blush-deep)] blur-[3px]">
                    잘 맞는 사람 · {card.fit}
                  </p>
                  <div className="mt-3">
                    <LockChip>내 적합도는 상세 리포트에서 확인</LockChip>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-center gap-2">
        {TREND_CARDS.map((card, i) => (
          <button
            key={card.name}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`${i + 1}번째 트렌드로 이동`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-5 bg-[var(--blush-deep)]" : "w-1.5 bg-[var(--hairline)]"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 5. 나의 추구미 완성 공식 — signature section
// ---------------------------------------------------------------------------

function MoodFormula({ previewResult }: { previewResult: PreviewResult }) {
  const [tapped, setTapped] = useState(false);
  const tone = previewResult.colorHint.palette[0];

  const ingredients = [
    { label: "컬러톤", value: tone?.name ?? "무드 컬러", swatch: tone?.hex },
    { label: "헤어 흐름", value: "결의 방향" },
    { label: "메이크업 강도", value: "톤의 세기" },
    { label: "옷 실루엣", value: "라인의 흐름" },
  ];

  function handleTap() {
    setTapped(true);
    window.setTimeout(() => setTapped(false), 420);
  }

  return (
    <Container className="mt-16">
      <FadeInSection>
        <Eyebrow>MOOD FORMULA</Eyebrow>
        <h2
          className="text-[21px] font-bold leading-[1.4] text-[var(--ink)] break-keep"
          style={{ fontFamily: "'Noto Serif KR', serif" }}
        >
          나의 추구미 완성 공식
        </h2>

        <div className="mt-7 flex flex-col items-center gap-2.5 rounded-[28px] border border-[var(--hairline)] bg-[var(--ivory)] px-5 py-8">
          {ingredients.map((ingredient, i) => (
            <div key={ingredient.label} className="contents">
              <div className="flex w-full max-w-[280px] items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                {ingredient.swatch && (
                  <span
                    className="h-6 w-6 shrink-0 rounded-full border border-black/5"
                    style={{ backgroundColor: ingredient.swatch }}
                    aria-hidden="true"
                  />
                )}
                <span className="text-[11px] font-semibold tracking-[0.02em] text-[var(--ink-soft)]">
                  {ingredient.label}
                </span>
                <span
                  className="ml-auto text-[13.5px] font-bold text-[var(--ink)]"
                  style={{ fontFamily: "'Noto Serif KR', serif" }}
                >
                  {ingredient.value}
                </span>
              </div>
              <span
                className="text-[20px] font-bold text-[var(--lavender-deep)]"
                style={{ fontFamily: "'Noto Serif KR', serif" }}
                aria-hidden="true"
              >
                {i < ingredients.length - 1 ? "+" : "="}
              </span>
            </div>
          ))}

          <button
            type="button"
            onClick={handleTap}
            className={`relative flex w-full max-w-[280px] flex-col items-center gap-1.5 overflow-hidden rounded-2xl bg-[var(--ink)] px-6 py-4 text-white shadow-lg ${
              tapped ? "magazine-shake" : ""
            }`}
          >
            <span className="text-[10.5px] font-semibold tracking-[0.04em] text-white/70">
              나만의 추구미
            </span>
            <span
              className="select-none text-[15px] font-bold blur-[6px]"
              style={{ fontFamily: "'Noto Serif KR', serif" }}
              aria-hidden="true"
            >
              {previewResult.recommendedMood}
            </span>
            <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium text-white/80">
              <LockGlyph className="h-3 w-3 text-white/80" />
              상세 리포트에서 공개
            </span>
          </button>
        </div>
      </FadeInSection>
    </Container>
  );
}

// ---------------------------------------------------------------------------
// 6. 상대가 처음 느끼는 나의 3초 분위기 — timeline
// ---------------------------------------------------------------------------

const IMPRESSION_TIMELINE = [
  { time: "0초", label: "첫 느낌" },
  { time: "1초", label: "분위기 키워드" },
  { time: "3초", label: "오래 남는 인상" },
] as const;

function ThreeSecondTimeline() {
  return (
    <Container className="mt-16">
      <FadeInSection>
        <Eyebrow>FIRST 3 SECONDS</Eyebrow>
        <h2
          className="text-[21px] font-bold leading-[1.4] text-[var(--ink)] break-keep"
          style={{ fontFamily: "'Noto Serif KR', serif" }}
        >
          상대가 처음 느끼는
          <br />
          나의 3초 분위기
        </h2>

        <div className="relative mt-7 flex flex-col gap-6 pl-2">
          <div
            className="absolute bottom-3 left-[19px] top-3 w-px bg-[var(--hairline)]"
            aria-hidden="true"
          />
          {IMPRESSION_TIMELINE.map((step) => (
            <div key={step.time} className="relative flex items-start gap-4">
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--hairline)] bg-white text-[11px] font-bold text-[var(--blush-deep)]">
                {step.time}
              </span>
              <div className="flex-1 rounded-2xl bg-[var(--ivory)] px-4 py-3.5">
                <p className="text-[12.5px] font-semibold text-[var(--ink)]">
                  {step.label}
                </p>
                <p
                  className="mt-1.5 select-none text-[13px] leading-relaxed text-[var(--ink-soft)] blur-[4px]"
                  aria-hidden="true"
                >
                  사진과 답변을 바탕으로 정리된 인상 포인트가 이 자리에 채워져요.
                </p>
                <div className="mt-2">
                  <LockChip>상세 리포트에서 공개</LockChip>
                </div>
              </div>
            </div>
          ))}
        </div>
      </FadeInSection>
    </Container>
  );
}

// ---------------------------------------------------------------------------
// 7. 내 이미지가 애매해지는 순간 — flip cards
// ---------------------------------------------------------------------------

const AMBIGUOUS_MOMENTS = [
  {
    front: "헤어는 청순한데\n옷은 너무 시크할 때",
    back: "두 무드가 서로 반대 방향을 가리키면 시선이 분산돼서 어떤 인상도 또렷하게 남지 않을 수 있어요.",
  },
  {
    front: "메이크업은 러블리한데\n컬러는 무거울 때",
    back: "따뜻한 인상과 무거운 톤이 부딪히면 전체 분위기가 애매하게 느껴질 수 있어요.",
  },
  {
    front: "옷은 고급스러운데\n헤어가 너무 캐주얼할 때",
    back: "톤 사이의 격차가 크면 공들인 스타일링도 완성도가 낮아 보일 수 있어요.",
  },
  {
    front: "사진 분위기와\n스타일링 톤이 다를 때",
    back: "사진 속 분위기와 실제 스타일 방향이 어긋나면 이미지가 흐릿하게 전달돼요.",
  },
] as const;

function FlipCard({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setFlipped((v) => !v)}
      aria-pressed={flipped}
      className="h-[168px] w-full text-left [perspective:1000px]"
    >
      <div
        className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        <div
          className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-[var(--hairline)] bg-white p-5 [backface-visibility:hidden]"
        >
          <p
            className="whitespace-pre-line text-[14.5px] font-bold leading-[1.5] text-[var(--ink)] break-keep"
            style={{ fontFamily: "'Noto Serif KR', serif" }}
          >
            {front}
          </p>
          <span className="text-[11px] font-medium text-[var(--lavender-deep)]">
            상세 리포트에서 공개 ↺
          </span>
        </div>
        <div
          className="absolute inset-0 flex flex-col justify-between rounded-2xl bg-[var(--lavender)] p-5 [backface-visibility:hidden]"
          style={{ transform: "rotateY(180deg)" }}
        >
          <p className="text-[13px] leading-relaxed text-[var(--ink)] break-keep">
            {back}
          </p>
          <span className="text-[11px] font-medium text-[var(--ink-soft)]">
            다시 보기 ↺
          </span>
        </div>
      </div>
    </button>
  );
}

function AmbiguousMomentGrid() {
  return (
    <Container className="mt-16">
      <FadeInSection>
        <Eyebrow>WHERE IT GETS BLURRY</Eyebrow>
        <h2
          className="text-[21px] font-bold leading-[1.4] text-[var(--ink)] break-keep"
          style={{ fontFamily: "'Noto Serif KR', serif" }}
        >
          내 이미지가 애매해지는 순간
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {AMBIGUOUS_MOMENTS.map((moment) => (
            <FlipCard key={moment.front} front={moment.front} back={moment.back} />
          ))}
        </div>
      </FadeInSection>
    </Container>
  );
}

// ---------------------------------------------------------------------------
// 8. 오늘 바로 해볼 수 있는 3가지 무드 미션
// ---------------------------------------------------------------------------

const MOOD_MISSIONS = [
  "상의 색 먼저 바꿔보기",
  "립 컬러 톤 낮춰보기",
  "머리 볼륨 위치 확인하기",
  "액세서리 하나로 포인트 주기",
  "사진 찍을 때 자연광 쪽으로 서보기",
];

function TodayMissions() {
  const [index, setIndex] = useState(0);
  const [checked, setChecked] = useState<boolean[]>(() => MOOD_MISSIONS.map(() => false));

  function go(delta: number) {
    setIndex((prev) => (prev + delta + MOOD_MISSIONS.length) % MOOD_MISSIONS.length);
  }

  function toggle(i: number) {
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  return (
    <Container className="mt-16">
      <FadeInSection>
        <Eyebrow>TODAY&apos;S MISSION</Eyebrow>
        <h2
          className="text-[21px] font-bold leading-[1.4] text-[var(--ink)] break-keep"
          style={{ fontFamily: "'Noto Serif KR', serif" }}
        >
          오늘 바로 해볼 수 있는
          <br />
          5가지 무드 미션
        </h2>

        <div className="mt-7 flex flex-col items-center gap-4 rounded-[28px] border border-[var(--hairline)] bg-[var(--ivory)] px-5 py-8">
          <button
            key={index}
            type="button"
            onClick={() => toggle(index)}
            aria-pressed={checked[index]}
            className={`magazine-fade-in flex w-full max-w-[280px] items-center gap-3.5 rounded-2xl border px-4 py-4 text-left transition-colors ${
              checked[index]
                ? "border-transparent bg-[var(--ink)] text-white"
                : "border-[var(--hairline)] bg-white text-[var(--ink)]"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                checked[index]
                  ? "bg-white text-[var(--ink)]"
                  : "bg-[var(--lavender)] text-[var(--lavender-deep)]"
              }`}
            >
              {checked[index] ? "✓" : String(index + 1).padStart(2, "0")}
            </span>
            <span className="flex-1 text-[14px] font-medium">
              {MOOD_MISSIONS[index]}
            </span>
          </button>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="이전 미션"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--hairline)] bg-white text-[var(--ink)]"
            >
              ‹
            </button>
            <div className="flex items-center gap-1.5">
              {MOOD_MISSIONS.map((mission, i) => (
                <button
                  key={mission}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`${i + 1}번째 미션으로 이동`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-5 bg-[var(--lavender-deep)]" : "w-1.5 bg-[var(--hairline)]"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="다음 미션"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--hairline)] bg-white text-[var(--ink)]"
            >
              ›
            </button>
          </div>
        </div>
        <p className="mt-3 text-center text-[12px] text-[var(--ink-soft)]">
          상세 리포트에서 내 맞춤 미션을 확인할 수 있어요.
        </p>
      </FadeInSection>
    </Container>
  );
}

// ---------------------------------------------------------------------------
// 9. 상세 리포트에서 열리는 나만의 무드 보관함 — locked grid
// ---------------------------------------------------------------------------

const MOOD_VAULT_ITEMS = [
  "내 얼굴 분위기에 맞는 최종 추구미는",
  "내가 피해야 할 옷 색감은",
  "나에게 맞는 앞머리 여부는",
  "사진에서 더 예뻐 보이는 메이크업 강도는",
  "이성이 처음 느끼는 내 분위기는",
  "인스타 프로필에서 살아나는 포즈와 색감은",
  "미용실에서 바로 말할 수 있는 헤어 문장은",
  "쇼핑할 때 참고할 컬러 팔레트는",
];

function MoodVaultGrid() {
  return (
    <Container className="mt-16">
      <FadeInSection>
        <Eyebrow>MOOD VAULT</Eyebrow>
        <h2
          className="text-[21px] font-bold leading-[1.4] text-[var(--ink)] break-keep"
          style={{ fontFamily: "'Noto Serif KR', serif" }}
        >
          상세 리포트에서 열리는
          <br />
          나만의 무드 보관함
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {MOOD_VAULT_ITEMS.map((item) => (
            <div
              key={item}
              className="relative flex h-[132px] flex-col justify-between overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--ivory)] p-4"
            >
              <p className="text-[12.5px] font-medium leading-relaxed text-[var(--ink)] break-keep">
                {item}
                <span className="select-none text-[var(--ink)]/0" aria-hidden="true">
                  {" "}
                  ●●●●●●●●●●
                </span>
              </p>
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[var(--ivory)] to-transparent"
                aria-hidden="true"
              />
              <span className="relative flex items-center gap-1 text-[10.5px] font-medium text-[var(--ink-soft)]">
                <LockGlyph />
                잠금
              </span>
            </div>
          ))}
        </div>
      </FadeInSection>
    </Container>
  );
}

// ---------------------------------------------------------------------------
// 10. Magazine quote card (reused 3x, interspersed through the flow)
// ---------------------------------------------------------------------------

function MagazineQuote({ children }: { children: React.ReactNode }) {
  return (
    <Container className="mt-16">
      <FadeInSection>
        <blockquote className="rounded-[28px] bg-gradient-to-br from-[var(--blush)] via-[var(--ivory)] to-[var(--lavender)] px-7 py-10 text-center">
          <p
            className="text-[19px] font-bold leading-[1.55] text-[var(--ink)] break-keep"
            style={{ fontFamily: "'Noto Serif KR', serif" }}
          >
            &ldquo;{children}&rdquo;
          </p>
        </blockquote>
      </FadeInSection>
    </Container>
  );
}

// ---------------------------------------------------------------------------
// 11. Bottom CTA
// ---------------------------------------------------------------------------

function MagazineBottomCTA() {
  return (
    <Container className="mt-16">
      <FadeInSection>
        <div className="rounded-[28px] bg-[var(--ink)] px-7 py-10 text-center">
          <p className="text-[15px] font-medium leading-relaxed text-white/85">
            상세 리포트에서 내 분위기에 맞는 추구미를 확인해보세요.
          </p>
          <Link
            href="/checkout"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-[14px] font-semibold text-[var(--ink)]"
          >
            잠금 해제하고 내 상세 무드 리포트 보기
          </Link>
        </div>
      </FadeInSection>
    </Container>
  );
}

// ---------------------------------------------------------------------------
// Assembly — split into two pieces so the page can render the hero at the
// very top, then the rest of the magazine body further down (currently
// placed right before the "HOW WE ANALYZE" section).
// ---------------------------------------------------------------------------

const MAGAZINE_CSS_VARS = {
  "--ink": "#241E2B",
  "--ink-soft": "#786D82",
  "--ivory": "#FBF6EF",
  "--blush": "#F7D9DF",
  "--blush-deep": "#DB7E93",
  "--lavender": "#E7DFF6",
  "--lavender-deep": "#8F72D6",
  "--hairline": "#EFE6ED",
} as React.CSSProperties;

function MagazineFont() {
  return (
    // eslint-disable-next-line @next/next/no-page-custom-font -- scoped to this preview section only.
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@500;600;700&display=swap"
    />
  );
}

export function MagazineHero({
  previewResult,
}: {
  previewResult: PreviewResult;
}) {
  return (
    <div style={MAGAZINE_CSS_VARS}>
      <MagazineFont />
      <MoodFilmHero heroImage={previewResult.images.hero} />
    </div>
  );
}

export function MagazineBody({
  previewResult,
}: {
  previewResult: PreviewResult;
}) {
  return (
    <div style={MAGAZINE_CSS_VARS}>
      <MagazineFont />
      <MagazineIntro />
      <MoodFactorExplorer heroImage={previewResult.images.hero} />
      <MagazineQuote>
        예뻐 보이는 것보다 중요한 건, 내 분위기가 선명하게 기억되는 것.
      </MagazineQuote>
      <TrendCarousel />
      <MoodFormula previewResult={previewResult} />
      <MagazineQuote>
        추구미는 따라 하는 게 아니라, 내 얼굴 분위기와 연결하는 거예요.
      </MagazineQuote>
      <ThreeSecondTimeline />
      <AmbiguousMomentGrid />
      <MagazineQuote>
        내가 바꾸고 싶은 건 얼굴이 아니라, 나에게 맞는 분위기일지도 몰라요.
      </MagazineQuote>
      <TodayMissions />
      <MoodVaultGrid />
      <MagazineBottomCTA />

      <style jsx>{`
        .magazine-fade-in {
          animation: magazineFadeIn 0.35s ease-out;
        }
        @keyframes magazineFadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .magazine-shake {
          animation: magazineShake 0.4s ease-in-out;
        }
        @keyframes magazineShake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          75% {
            transform: translateX(4px);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .magazine-fade-in,
          .magazine-shake {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
