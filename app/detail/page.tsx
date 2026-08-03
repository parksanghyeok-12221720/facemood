"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Container from "@/app/components/Container";
import PccsColorChart from "@/app/components/PccsColorChart";
import { reviews } from "@/app/data/reviews";
import { trendContents, trendUpdates } from "@/app/data/trendContent";
import type { TrendUpdate } from "@/app/data/trendContent";
import { REPORT_CHAPTERS } from "@/types/report";

type Photo = { src: string; keyword: string };

// One photo per mood — the folder has several numbered variants per mood
// (e.g. 러블리 여리st.png..st5.png) meant for cycling through report
// chapters elsewhere, but showing all of them here just repeats the same
// hashtag back-to-back, so only the first of each is kept.
const moodPhotos: Photo[] = [
  { src: "/mood/cards/고급도시st.png", keyword: "#고급도시st" },
  { src: "/mood/cards/꾸안꾸 st.png", keyword: "#꾸안꾸st" },
  { src: "/mood/cards/내추럴 데일리st.png", keyword: "#내추럴데일리st" },
  { src: "/mood/cards/느좋녀st.png", keyword: "#느좋녀st" },
  { src: "/mood/cards/래퍼 여친st.png", keyword: "#래퍼여친st" },
  { src: "/mood/cards/러블리 여리st.png", keyword: "#러블리여리st" },
  { src: "/mood/cards/러블리 캐주얼st.png", keyword: "#러블리캐주얼st" },
  { src: "/mood/cards/러블리 힙st.png", keyword: "#러블리힙st" },
  { src: "/mood/cards/무채색 핀터걸st.png", keyword: "#무채색핀터걸st" },
  { src: "/mood/cards/시크섹시st.png", keyword: "#시크섹시st" },
  { src: "/mood/cards/에겐 큐티st.png", keyword: "#에겐큐티st" },
  { src: "/mood/cards/올블랙st.png", keyword: "#올블랙st" },
  { src: "/mood/cards/일본여주st.png", keyword: "#일본여주st" },
  { src: "/mood/cards/차분시크st.png", keyword: "#차분시크st" },
  { src: "/mood/cards/청순 에겐st.png", keyword: "#청순에겐st" },
  { src: "/mood/cards/청순 캐주얼st.png", keyword: "#청순캐주얼st" },
  { src: "/mood/cards/청순여친st.png", keyword: "#청순여친st" },
  { src: "/mood/cards/청순자연st.png", keyword: "#청순자연st" },
  { src: "/mood/cards/힙 트렌디st.png", keyword: "#힙트렌디st" },
];

const makeupPhotos: Photo[] = [
  { src: "/mood/makeup/makeup1.png", keyword: "#물광베이스" },
  { src: "/mood/makeup/makeup2.png", keyword: "#소프트아이메이크업" },
  { src: "/mood/makeup/makeup3.png", keyword: "#러블리블러셔" },
  { src: "/mood/makeup/makeup4.png", keyword: "#글로시립" },
  { src: "/mood/makeup/makeup5.png", keyword: "#포인트아이라인" },
  { src: "/mood/makeup/makeup_굴로우베이스.png", keyword: "#글로우베이스" },
  {
    src: "/mood/makeup/션makeup_라이트 레이어링 파운데이.png",
    keyword: "#라이트레이어링파운데이션",
  },
  { src: "/mood/makeup/makeup_절제된 컨투어.png", keyword: "#절제된컨투어" },
  { src: "/mood/makeup/makeup_ 은은한 스모키.png", keyword: "#은은한스모키" },
  { src: "/mood/makeup/makeup_실버포인트.png", keyword: "#실버포인트" },
  { src: "/mood/makeup/makeup_고스트 래시.png", keyword: "#고스트래시" },
];

const hairPhotos: Photo[] = [
  { src: "/mood/hair/hair1.png", keyword: "#레이어드컷" },
  { src: "/mood/hair/hair_샌드펌.png", keyword: "#샌드펌" },
  { src: "/mood/hair/hair_시스루 뱅 보브.png", keyword: "#시스루뱅보브" },
  { src: "/mood/hair/hair_히피펌.png", keyword: "#히피펌" },
  { src: "/mood/hair/hair_박스 보브.png", keyword: "#박스보브" },
  { src: "/mood/hair/hair2.png", keyword: "#윤기헤어" },
  { src: "/mood/hair/hair_텍스처 웨이브.png", keyword: "#텍스처웨이브" },
  { src: "/mood/hair/hair_중단발 레이어드.png", keyword: "#중단발레이어드" },
  { src: "/mood/hair/hair_슬릭 보브.png", keyword: "#슬릭보브" },
  { src: "/mood/hair/hair_허쉬컷.png", keyword: "#허쉬컷" },
  { src: "/mood/hair/hair_ 뱅드 보브.png", keyword: "#뱅드보브" },
  { src: "/mood/hair/hair_숏컷.png", keyword: "#숏컷" },
  { src: "/mood/hair/hair_러블리보브.png", keyword: "#러블리보브" },
  { src: "/mood/hair/hair_중단발 레이어드2.png", keyword: "#롱레이어드컷" },
  { src: "/mood/hair/hair_S컬(지지컬).png", keyword: "#지지컬" },
  { src: "/mood/hair/hair_시스루.png", keyword: "#시스루뱅" },
  { src: "/mood/hair/hair_클라우드 보브.png", keyword: "#클라우드보브" },
  { src: "/mood/hair/hair_중단발 허쉬컷.png", keyword: "#중단발허쉬컷" },
];

const moodCardPhotos: Record<string, string> = {
  "청순 자연st": "/mood/cards/청순자연st.png",
  "고급 도시st": "/mood/cards/고급도시st.png",
  "차분 시크st": "/mood/cards/차분시크st.png",
  "러블리 여리st": "/mood/cards/러블리 여리st.png",
  "힙 트렌디st": "/mood/cards/힙 트렌디st.png",
  "러블리 힙st": "/mood/cards/러블리 힙st.png",
  "래퍼 여친st": "/mood/cards/래퍼 여친st.png",
  "청순 에겐st": "/mood/cards/청순 에겐st.png",
  "무채색 핀터걸st": "/mood/cards/무채색 핀터걸st.png",
  "일본 여주st": "/mood/cards/일본여주st.png",
};

const BASIC_PRICE_KRW = 34900;
const PREMIUM_PRICE_KRW = 49900;
const basicChapters = REPORT_CHAPTERS.filter((c) => c.tier === "basic");
const premiumOnlyChapters = REPORT_CHAPTERS.filter((c) => c.tier === "premium");

const chapters = [
  { key: "mood", label: "스타일", id: "section-mood" },
  { key: "color", label: "컬러", id: "section-color" },
  { key: "makeup", label: "메이크업", id: "section-makeup" },
  { key: "hair", label: "헤어", id: "section-hair" },
];

function MarqueeRow({
  photos,
  animationKey,
  durationSeconds = 28,
}: {
  photos: Photo[];
  animationKey: string;
  durationSeconds?: number;
}) {
  return (
    <div className="marquee-fade -mx-6 overflow-hidden px-6">
      <div
        key={animationKey}
        className="animate-marquee flex w-max gap-3"
        style={{ animationDuration: `${durationSeconds}s` }}
      >
        {[...photos, ...photos].map((photo, index) => (
          <div
            key={`${photo.src}-${index}`}
            className="w-36 shrink-0 overflow-hidden rounded-2xl border border-violet-100 bg-white"
          >
            <div className="relative aspect-square w-full">
              <Image
                src={photo.src}
                alt={photo.keyword}
                fill
                sizes="144px"
                loading="eager"
                className="object-cover"
              />
            </div>
            <div className="p-3">
              <p className="text-xs font-medium text-violet-500">
                {photo.keyword}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendUpdateCarousel({ updates }: { updates: TrendUpdate[] }) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const current = updates[index];

  function go(delta: number) {
    setIndex((prev) => (prev + delta + updates.length) % updates.length);
    setExpanded(false);
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-3">
      <div className="w-full rounded-2xl border border-violet-100 bg-white p-4 shadow-sm shadow-violet-100/60">
        <span className="text-[10.5px] font-semibold tabular-nums text-violet-400">
          {current.date}
        </span>
        <p className="mt-1 text-base font-bold text-black">
          {current.keyword}
        </p>

        {expanded ? (
          <p className="mt-2 text-xs leading-relaxed text-gray-600">
            {current.detail}
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="mt-2 text-xs font-semibold text-violet-500 underline underline-offset-2"
          >
            자세히 보기
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="이전 트렌드"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-100 bg-white text-black"
        >
          ‹
        </button>
        <div className="flex items-center gap-1.5">
          {updates.map((update, i) => (
            <button
              key={`${update.date}-${i}`}
              type="button"
              onClick={() => {
                setIndex(i);
                setExpanded(false);
              }}
              aria-label={`${i + 1}번째 트렌드로 이동`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-violet-500" : "w-1.5 bg-violet-100"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="다음 트렌드"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-100 bg-white text-black"
        >
          ›
        </button>
      </div>
    </div>
  );
}

export default function DetailPage() {
  const [activeChapter, setActiveChapter] = useState("mood");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const overview = trendContents.all;

  useEffect(() => {
    const sections = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveChapter(entry.target.id.replace("section-", ""));
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 400);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToChapter(id: string) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="sticky top-0 z-10 border-b border-violet-100 bg-white/90 backdrop-blur">
        <Container className="flex items-center justify-between py-4">
          <span className="text-sm font-bold tracking-[0.2em] text-violet-600">
            FACEMOOD
          </span>
          <Link href="/" className="text-xs text-gray-400">
            닫기
          </Link>
        </Container>
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="맨 위로 이동"
          className="fixed left-1/2 top-16 z-20 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-black/50 text-white shadow-md backdrop-blur-sm"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-3.5 w-3.5"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 12L10 6L16 12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* Right-side chapter nav */}
      <nav className="fixed right-2 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2">
        {chapters.map((chapter) => (
          <button
            key={chapter.key}
            type="button"
            onClick={() => scrollToChapter(chapter.id)}
            className={`rounded-full px-2.5 py-2 text-[10px] font-semibold shadow-sm transition-colors ${
              activeChapter === chapter.key
                ? "bg-black text-white"
                : "bg-violet-50 text-violet-500"
            }`}
          >
            {chapter.label}
          </button>
        ))}
      </nav>

      <Container className="relative overflow-hidden pt-12 text-center">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-200/40 blur-3xl" />

        {/* Hero */}
        <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-violet-500">
          PHOTO MOOD ANALYSIS
        </span>
        <h1 className="mt-6 text-2xl font-bold leading-snug text-black">
          내 얼굴 분위기에 맞는
          <br />
          추구미를 찾아드려요
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-gray-600">
          사진과 간단한 답변으로 추구미, 퍼스널컬러 방향,
          <br />
          헤어·메이크업·스타일링까지 한 번에 정리해요.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-gray-400">
          외모 평가가 아닌,
          <br />
          자연스럽게 어울리는 스타일 방향 제안이에요.
        </p>
        <Link
          href="/test"
          className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-black px-8 py-4 text-sm font-semibold text-white"
        >
          내 추구미 분석 시작하기
        </Link>
        <p className="mt-3 text-xs text-gray-400">
          무료 미리보기로 먼저 확인할 수 있어요.
        </p>
      </Container>

      {/* Authority statement */}
      <Container maxWidth="max-w-3xl" className="mt-6">
        <div className="rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-center">
          <p className="text-sm font-semibold leading-relaxed text-violet-700">
            전문 이미지 컨설턴트가 글로벌 패션 교육기관의
            <br />
            스타일 분석 관점을 참고한 리포트 구조
          </p>
        </div>
      </Container>

      {/* Intro mood photo marquee — this row has far more photos (54) than
          hair/makeup (11-17), so it needs a proportionally longer duration
          to scroll at the same visual speed instead of rushing by. */}
      <div className="mx-auto mt-10 w-full max-w-3xl">
        <MarqueeRow
          photos={moodPhotos}
          animationKey="intro"
          durationSeconds={moodPhotos.length * (28 / 17)}
        />
      </div>

      {/* Trend Note overview */}
      <Container maxWidth="max-w-3xl" className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold tracking-[0.15em] text-violet-600">
            FACEMOOD Trend Note
          </span>
          <span className="shrink-0 text-[11px] text-gray-400">
            마지막 업데이트: {overview.updatedAt}
          </span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-gray-500">
          최근 뷰티/스타일 키워드와 이미지 무드 흐름을 바탕으로 주기적으로
          업데이트됩니다.
        </p>

        <TrendUpdateCarousel updates={trendUpdates} />

        <h2 className="mt-6 whitespace-pre-line text-lg font-bold leading-snug text-black">
          {overview.title}
        </h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-500">
          {overview.description}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {overview.cards.map((card, index) => (
            <div
              key={card.title}
              className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm shadow-violet-100/60"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-[11px] font-semibold text-violet-600">
                {index + 1}
              </span>
              <p className="mt-3 text-sm font-semibold text-black">
                {card.title}
              </p>
              <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-gray-500">
                {card.content}
              </p>
            </div>
          ))}
        </div>

        {overview.footerNote && (
          <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
            <p className="text-xs leading-relaxed text-gray-500">
              {overview.footerNote}
            </p>
          </div>
        )}
      </Container>

      {/* Chapter: 스타일 */}
      <Container id="section-mood" maxWidth="max-w-3xl" className="mt-14 scroll-mt-20">
        <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold tracking-[0.15em] text-violet-600">
          STYLE
        </span>
        <h2 className="mt-4 text-lg font-bold leading-snug text-black">
          {trendContents.mood.title}
        </h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-500">
          {trendContents.mood.description}
        </p>

        <div className="mt-6">
          <div className="marquee-fade -mx-6 overflow-hidden px-6">
            <div
              key="mood-cards"
              className="animate-marquee flex w-max gap-3"
              style={{
                animationDuration: `${trendContents.mood.cards.length * 4}s`,
              }}
            >
              {[...trendContents.mood.cards, ...trendContents.mood.cards].map(
                (card, index) => (
                  <div
                    key={`${card.title}-${index}`}
                    className="w-48 shrink-0 overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm shadow-violet-100/60"
                  >
                    <div className="relative aspect-square w-full">
                      <Image
                        src={moodCardPhotos[card.title]}
                        alt={card.title}
                        fill
                        sizes="192px"
                        loading="eager"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-semibold text-black">
                        {card.title}
                      </p>
                      <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-gray-500">
                        {card.content}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {trendContents.mood.footerNote && (
          <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
            <p className="text-xs leading-relaxed text-gray-500">
              {trendContents.mood.footerNote}
            </p>
          </div>
        )}
      </Container>

      {/* Chapter: 컬러 */}
      <Container id="section-color" maxWidth="max-w-3xl" className="mt-14 scroll-mt-20">
        <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold tracking-[0.15em] text-violet-600">
          COLOR
        </span>
        <h2 className="mt-4 whitespace-pre-line text-lg font-bold leading-snug text-black">
          {trendContents.color.title}
        </h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-500">
          {trendContents.color.description}
        </p>

        <div className="mt-6">
          <PccsColorChart />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trendContents.color.cards.map((card, index) => (
            <div
              key={card.title}
              className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm shadow-violet-100/60"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-[11px] font-semibold text-violet-600">
                {index + 1}
              </span>
              <p className="mt-3 text-sm font-semibold text-black">
                {card.title}
              </p>
              <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-gray-500">
                {card.content}
              </p>
            </div>
          ))}
        </div>

        {trendContents.color.footerNote && (
          <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
            <p className="text-xs leading-relaxed text-gray-500">
              {trendContents.color.footerNote}
            </p>
          </div>
        )}
      </Container>

      {/* Chapter: 메이크업 */}
      <Container id="section-makeup" maxWidth="max-w-3xl" className="mt-14 scroll-mt-20">
        <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold tracking-[0.15em] text-violet-600">
          MAKEUP
        </span>
        <h2 className="mt-4 whitespace-pre-line text-lg font-bold leading-snug text-black">
          {trendContents.makeup.title}
        </h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-500">
          {trendContents.makeup.description}
        </p>

        <div className="mt-6">
          <MarqueeRow photos={makeupPhotos} animationKey="makeup" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trendContents.makeup.cards.map((card, index) => (
            <div
              key={card.title}
              className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm shadow-violet-100/60"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-[11px] font-semibold text-violet-600">
                {index + 1}
              </span>
              <p className="mt-3 text-sm font-semibold text-black">
                {card.title}
              </p>
              <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-gray-500">
                {card.content}
              </p>
            </div>
          ))}
        </div>

        {trendContents.makeup.footerNote && (
          <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
            <p className="text-xs leading-relaxed text-gray-500">
              {trendContents.makeup.footerNote}
            </p>
          </div>
        )}
      </Container>

      {/* Chapter: 헤어 */}
      <Container id="section-hair" maxWidth="max-w-3xl" className="mt-14 scroll-mt-20">
        <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold tracking-[0.15em] text-violet-600">
          HAIR
        </span>
        <h2 className="mt-4 whitespace-pre-line text-lg font-bold leading-snug text-black">
          {trendContents.hair.title}
        </h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-500">
          {trendContents.hair.description}
        </p>

        <div className="mt-6">
          <MarqueeRow photos={hairPhotos} animationKey="hair" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trendContents.hair.cards.map((card, index) => (
            <div
              key={card.title}
              className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm shadow-violet-100/60"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-[11px] font-semibold text-violet-600">
                {index + 1}
              </span>
              <p className="mt-3 text-sm font-semibold text-black">
                {card.title}
              </p>
              <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-gray-500">
                {card.content}
              </p>
            </div>
          ))}
        </div>

        {trendContents.hair.footerNote && (
          <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
            <p className="text-xs leading-relaxed text-gray-500">
              {trendContents.hair.footerNote}
            </p>
          </div>
        )}
      </Container>

      {/* Reviews */}
      <Container maxWidth="max-w-3xl" className="mt-10">
        <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold tracking-[0.15em] text-violet-600">
          REVIEWS
        </span>
        <h2 className="mt-4 text-lg font-bold leading-snug text-black">
          먼저 경험한 분들의 이야기
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          FACEMOOD를 사용해본 분들의 후기예요.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm shadow-violet-100/60"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-black">
                  {review.name}
                </span>
                <span className="text-xs font-semibold text-gray-400">
                  {review.score}
                </span>
              </div>
              <p className="mt-1 text-sm tracking-wide text-violet-500">
                {review.stars}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                {review.text}
              </p>
            </div>
          ))}
        </div>
      </Container>

      {/* Report table of contents */}
      <Container maxWidth="max-w-3xl" className="mt-10">
        <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold tracking-[0.15em] text-violet-600">
          REPORT CONTENTS
        </span>
        <h2 className="mt-4 text-lg font-bold leading-snug text-black">
          상세 리포트 목차
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          Basic과 Premium, 두 가지 상품으로 나뉘어 있어요. Premium은
          Basic 내용을 전부 포함해요.
        </p>

        <div className="mt-6 rounded-2xl border-2 border-violet-100 bg-white p-6 shadow-sm shadow-violet-100/60">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-black">Basic</p>
            <p className="text-sm font-extrabold text-black">
              {BASIC_PRICE_KRW.toLocaleString()}원
            </p>
          </div>
          <ol className="mt-4 flex flex-col gap-3">
            {basicChapters.map((chapter) => (
              <li
                key={chapter.key}
                className="flex items-start gap-3 text-sm text-gray-700"
              >
                <span className="shrink-0 text-xs font-semibold tabular-nums text-violet-500">
                  {chapter.number}
                </span>
                {chapter.title}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-4 rounded-2xl border-2 border-violet-500 bg-violet-50/40 p-6 shadow-sm shadow-violet-100/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-bold text-white">
                BEST
              </span>
              <p className="text-sm font-bold text-black">Premium</p>
            </div>
            <p className="text-sm font-extrabold text-black">
              {PREMIUM_PRICE_KRW.toLocaleString()}원
            </p>
          </div>
          <p className="mt-2 text-xs text-gray-500">Basic 8개 챕터 전체 포함 +</p>
          <ol className="mt-3 flex flex-col gap-3">
            {premiumOnlyChapters.map((chapter) => (
              <li
                key={chapter.key}
                className="flex items-start gap-3 text-sm text-gray-700"
              >
                <span className="shrink-0 text-xs font-semibold tabular-nums text-violet-500">
                  {chapter.number}
                </span>
                {chapter.title}
              </li>
            ))}
          </ol>
        </div>
      </Container>

      <Container className="mt-10 pb-8">
        {/* Disclaimer */}
        <div className="rounded-3xl border border-violet-100 bg-violet-50/60 p-6 text-center">
          <p className="text-sm font-semibold text-black">
            외모 평가는 하지 않습니다
          </p>
          <p className="mt-3 text-xs leading-relaxed text-gray-500">
            FACEMOOD는 얼굴 점수나 단점 평가를 제공하지 않습니다. 사진을
            바탕으로 현재 이미지가 주는 분위기를 참고하고, 사용자가 원하는
            방향에 맞는 스타일 선택지를 제안합니다. 퍼스널컬러는 조명과
            카메라 보정에 따라 달라질 수 있어 확정 진단이 아닌 참고
            의견으로만 제공합니다.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-6">
          <Link
            href="/test"
            className="flex w-full items-center justify-center rounded-full bg-black px-8 py-4 text-sm font-semibold text-white"
          >
            무료로 시작하기
          </Link>
        </div>
      </Container>

      {/* Footer */}
      <footer className="mt-4 bg-black px-6 py-10 text-center">
        <p className="text-sm font-bold text-white">벨루아랩(Valualab)</p>
        <div className="mx-auto mt-4 flex max-w-md flex-col gap-1.5 text-xs leading-relaxed text-gray-400">
          <p>Business Registration Number: 102-03-84971</p>
          <p>CEO: SangHyeok Park</p>
          <p>Address: 88-21 Yonghyeon-dong, Michuhol-gu, Incheon</p>
          <p>서비스 문의: 공식 인스타그램 DM</p>
          <p>Customer Service: 050-6485-9701</p>
        </div>
        <div className="mt-5 flex items-center justify-center gap-3 text-xs text-gray-500">
          <span>서비스 이용약관</span>
          <span className="text-gray-700">|</span>
          <span>개인정보 처리방침</span>
        </div>
      </footer>
    </main>
  );
}
