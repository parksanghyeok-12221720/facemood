"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Container from "@/app/components/Container";
import PccsColorChart from "@/app/components/PccsColorChart";
import { credentials } from "@/app/data/credentials";
import { reviews } from "@/app/data/reviews";
import { trendContents } from "@/app/data/trendContent";

type Photo = { src: string; keyword: string };

const moodPhotos: Photo[] = [
  { src: "/mood/cheongsun.jpg", keyword: "#청순에겐st" },
  { src: "/mood/cheongsun2.jpg", keyword: "#청순에겐st" },
  { src: "/mood/sikeu.jpg", keyword: "#무채색핀터걸st" },
  { src: "/mood/lovely.jpg", keyword: "#러블리힙st" },
  { src: "/mood/dark-sikeu.jpg", keyword: "#일본여주st" },
  { src: "/mood/hip.jpg", keyword: "#래퍼여친st" },
];

const makeupPhotos: Photo[] = [
  { src: "/mood/makeup/makeup1.png", keyword: "#물광베이스" },
  { src: "/mood/makeup/makeup2.png", keyword: "#소프트아이메이크업" },
  { src: "/mood/makeup/makeup3.png", keyword: "#러블리블러셔" },
  { src: "/mood/makeup/makeup4.png", keyword: "#글로시립" },
  { src: "/mood/makeup/makeup5.png", keyword: "#포인트아이라인" },
];

const hairPhotos: Photo[] = [
  { src: "/mood/hair/hair1.png", keyword: "#레이어드컷" },
  { src: "/mood/hair/hair_시스루.png", keyword: "#시스루뱅" },
  { src: "/mood/hair/hair2.png", keyword: "#윤기헤어" },
  { src: "/mood/hair/hair_샌드펌.png", keyword: "#샌드펌" },
  { src: "/mood/hair/hair_히피펌.png", keyword: "#히피펌" },
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

const reportContents = [
  "나에게 어울리는 추구미 최종 요약",
  "현재 이미지 무드 분석",
  "원하는 추구미와 현재 이미지의 차이",
  "추천 추구미 상세 해석",
  "스타일링 방향",
  "헤어 스타일 방향",
  "메이크업 방향",
  "사진상 컬러 무드 분석",
  "추천 컬러 팔레트",
  "피하면 좋은 스타일",
  "상황별 이미지 전략",
  "최종 스타일 가이드",
];

const chapters = [
  { key: "mood", label: "스타일", id: "section-mood" },
  { key: "color", label: "컬러", id: "section-color" },
  { key: "makeup", label: "메이크업", id: "section-makeup" },
  { key: "hair", label: "헤어", id: "section-hair" },
];

function MarqueeRow({ photos, animationKey }: { photos: Photo[]; animationKey: string }) {
  return (
    <div className="marquee-fade -mx-6 overflow-hidden px-6">
      <div
        key={animationKey}
        className="animate-marquee flex w-max gap-3"
        style={{ animationDuration: "28s" }}
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
          사진과 간단한 답변으로 추구미, 퍼스널컬러 방향, 헤어·메이크업·스타일링까지 한 번에 정리해요.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-gray-400">
          외모 평가가 아닌, 자연스럽게 어울리는 스타일 방향 제안이에요.
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

      {/* Intro mood photo marquee */}
      <div className="mx-auto mt-10 w-full max-w-3xl">
        <MarqueeRow photos={moodPhotos} animationKey="intro" />
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

      {/* Credentials */}
      <Container maxWidth="max-w-3xl" className="mt-14">
        <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold tracking-[0.15em] text-violet-600">
          CREDENTIALS
        </span>
        <h2 className="mt-4 text-lg font-bold leading-snug text-black">
          전문성을 갖춘 팀이 함께해요
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          메이크업, 헤어, 퍼스널컬러 관련 자격과 이력을 소개합니다.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {credentials.map((item) => (
            <div
              key={item.category}
              className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/30 p-5"
            >
              <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold text-violet-600">
                {item.label}
              </span>
              <p className="mt-3 text-sm font-semibold text-black">
                {item.title || "내용을 입력해주세요"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-gray-400">
                {item.description || "준비 중입니다."}
              </p>
            </div>
          ))}
        </div>
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
          상세 리포트에서는 아래 내용을 순서대로 확인할 수 있어요.
        </p>

        <div className="mt-6 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm shadow-violet-100/60">
          <ol className="flex flex-col gap-3">
            {reportContents.map((item, index) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm text-gray-700"
              >
                <span className="shrink-0 text-xs font-semibold tabular-nums text-violet-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {item}
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
    </main>
  );
}
