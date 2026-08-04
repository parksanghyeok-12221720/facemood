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

// Photo at /public/detail-service/0N-*.png — real photos already in place.
const serviceBreakdown = [
  {
    number: "01",
    photo: "/detail-service/01-body.png",
    title: "체형 컨설팅",
    body: "체형을 평가하지 않고\n비율 좋아 보이는 핏과 실루엣을 제안해요",
  },
  {
    number: "02",
    photo: "/detail-service/02-color.png",
    title: "퍼스널컬러 컨설팅",
    body: "사진상 어울리는\n컬러 방향을 찾아드려요",
  },
  {
    number: "03",
    photo: "/detail-service/03-makeup.png",
    title: "메이크업 컨설팅",
    body: "원하는 무드에 맞는\n메이크업 방향을 제안해요",
  },
  {
    number: "04",
    photo: "/detail-service/04-hair.png",
    title: "헤어 컨설팅",
    body: "분위기를 가장 크게 바꾸는\n헤어 방향을 알려드려요",
  },
  {
    number: "05",
    photo: "/detail-service/05-face.png",
    title: "얼굴형 컨설팅",
    body: "사진상 얼굴형을 참고해\n어울리는 스타일을 제안해요",
  },
  {
    number: "06",
    photo: "/detail-service/06-style.png",
    title: "스타일링 컨설팅",
    body: "지금 이미지와\n원하는 추구미를 하나로 정리해요",
  },
];

type PhotoReview = { photo: string; stars: string; text: string };

// Photo at /public/detail-reviews/review-N.png — placeholders are seeded
// there for now; drop in real photos under the same filenames to replace.
const photoReviews: PhotoReview[] = [
  { photo: "/detail-reviews/review-1.png", stars: "★★★★★", text: "생각보다 엄청 자세해서 놀랐어요" },
  { photo: "/detail-reviews/review-2.png", stars: "★★★★★", text: "사진상 색감이 잘 맞는다는 말이 더 믿음 갔어요" },
  { photo: "/detail-reviews/review-3.png", stars: "★★★★★", text: "지금 이미지가 캐주얼하다고 해서 뜨끔했어요" },
  { photo: "/detail-reviews/review-4.png", stars: "★★★★★", text: "메이크업 부분이 진짜 도움 됐어요" },
  { photo: "/detail-reviews/review-5.png", stars: "★★★★★", text: "원하는 분위기를 말로 정리해준 느낌이었어요" },
  { photo: "/detail-reviews/review-6.png", stars: "★★★★☆", text: "헤어 추천이 생각보다 좋았어요" },
];

const faqItems = [
  {
    q: "사진만으로 정확한 분석이 가능한가요?",
    a: "확정적인 진단이 아니라 참고용 방향 제안이에요. 그래서 '무조건 이렇습니다' 대신 '이런 방향이 잘 맞을 수 있어요'처럼 안내해요. 사진 화질·조명·보정에 따라 결과가 달라질 수 있다는 점도 함께 알려드려요.",
  },
  {
    q: "외모 점수나 등급을 매기는 건가요?",
    a: "아니요. FACEMOOD는 얼굴 점수화나 단점 평가를 하지 않아요. 지금 사진에서 느껴지는 분위기와 원하는 방향의 차이를 비교해서, 스타일 선택지를 제안하는 방식이에요.",
  },
  {
    q: "결제 전에 미리 확인할 수 있나요?",
    a: "네, 무료 미리보기로 대략적인 방향을 먼저 확인할 수 있어요. 마음에 드시면 그 다음에 상세 리포트를 결제하시면 돼요.",
  },
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

function PhotoReviewMarquee({ items }: { items: PhotoReview[] }) {
  return (
    <div className="marquee-fade -mx-6 overflow-hidden px-6">
      <div
        className="animate-marquee flex w-max gap-3"
        style={{ animationDuration: `${items.length * 4}s` }}
      >
        {[...items, ...items].map((review, index) => (
          <div
            key={`${review.photo}-${index}`}
            className="w-36 shrink-0 overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm shadow-violet-100/60"
          >
            <div className="relative aspect-[3/4] w-full">
              <Image
                src={review.photo}
                alt={review.text}
                fill
                sizes="144px"
                loading="eager"
                className="object-cover"
              />
            </div>
            <div className="p-3">
              <p className="text-xs tracking-wide text-violet-500">{review.stars}</p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-gray-600">
                {review.text}
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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
    <main className="min-h-screen bg-white pb-24 text-black">
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

      {/* Precision analysis visual */}
      <Container maxWidth="max-w-3xl" className="mt-14 text-center">
        <span className="inline-flex items-center rounded-full bg-violet-600 px-3 py-1 text-[11px] font-bold tracking-[0.15em] text-white">
          POINT 01
        </span>
        <h2 className="mt-4 text-2xl font-bold leading-snug text-black">
          사진 한 장으로 확인하는
          <br />
          <span className="text-violet-600">정밀한 얼굴 분위기 분석</span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          막연했던 내 얼굴 분위기를 구체적인 언어로!
          <br />
          AI가 사진 속 디테일까지 참고해 자세하게 분석해요.
        </p>

        <div className="relative mx-auto mt-8 aspect-[3/4] w-full max-w-xs overflow-hidden rounded-3xl border border-violet-100 shadow-sm shadow-violet-100/60">
          <Image
            src="/detail-point/precision-analysis.png"
            alt="정밀 얼굴 분위기 분석 예시"
            fill
            sizes="320px"
            className="object-cover"
          />
        </div>
      </Container>

      {/* POINT 02 */}
      <Container maxWidth="max-w-3xl" className="mt-14 text-center">
        <span className="inline-flex items-center rounded-full bg-violet-600 px-3 py-1 text-[11px] font-bold tracking-[0.15em] text-white">
          POINT 02
        </span>
        <h2 className="mt-4 text-2xl font-bold leading-snug text-black">
          나만을 위한
          <br />
          <span className="text-violet-600">
            헤어·메이크업 방향과
            <br />
            스타일 리포트
          </span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          최신 헤어·스타일 트렌드를 반영해서
          <br />
          내가 가장 잘 어울리는 방향을 콕 짚어드립니다
        </p>

        <div className="relative mx-auto mt-8 aspect-[3/2] w-full max-w-xs overflow-hidden rounded-3xl border border-violet-100 shadow-sm shadow-violet-100/60">
          <Image
            src="/detail-point/style-report-mockup.png"
            alt="스타일 리포트 예시"
            fill
            sizes="320px"
            className="object-cover"
          />
        </div>
      </Container>

      {/* POINT 03 */}
      <Container maxWidth="max-w-3xl" className="mt-14 text-center">
        <span className="inline-flex items-center rounded-full bg-violet-600 px-3 py-1 text-[11px] font-bold tracking-[0.15em] text-white">
          POINT 03
        </span>
        <h2 className="mt-4 text-2xl font-bold leading-snug text-black">
          논문 기반 학술 연구를 참고한
          <br />
          <span className="text-violet-600">과학적인 분석 방식</span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          얼굴형 분류와 스타일 추천에 대한 실제 연구를 참고해서
          <br />
          리포트 방향을 설계했어요
        </p>

        <div className="relative mx-auto mt-10 h-72 w-full max-w-sm">
          {/* Far-left card — smallest, most blurred */}
          <div
            className="absolute overflow-hidden rounded-2xl border border-white shadow-md"
            style={{
              left: "3%",
              top: "50%",
              width: "104px",
              height: "139px",
              transform: "translate(-50%, -50%) rotate(-17deg) scale(0.7)",
              filter: "blur(4px)",
              zIndex: 10,
            }}
          >
            <Image src="/detail-point/paper-4.png" alt="" fill sizes="104px" className="object-cover" />
          </div>

          {/* Near-left card */}
          <div
            className="absolute overflow-hidden rounded-2xl border border-white shadow-lg"
            style={{
              left: "26%",
              top: "54%",
              width: "128px",
              height: "171px",
              transform: "translate(-50%, -50%) rotate(-9deg) scale(0.85)",
              filter: "blur(3px)",
              zIndex: 20,
            }}
          >
            <Image src="/detail-point/paper-2.png" alt="" fill sizes="128px" className="object-cover" />
          </div>

          {/* Front-center card — largest */}
          <div
            className="absolute overflow-hidden rounded-2xl border border-white shadow-xl"
            style={{
              left: "50%",
              top: "48%",
              width: "160px",
              height: "213px",
              transform: "translate(-50%, -50%)",
              filter: "blur(2.5px)",
              zIndex: 30,
            }}
          >
            <Image src="/detail-point/paper-1.png" alt="" fill sizes="160px" className="object-cover" />
          </div>

          {/* Near-right card */}
          <div
            className="absolute overflow-hidden rounded-2xl border border-white shadow-lg"
            style={{
              left: "74%",
              top: "54%",
              width: "128px",
              height: "171px",
              transform: "translate(-50%, -50%) rotate(9deg) scale(0.85)",
              filter: "blur(3px)",
              zIndex: 20,
            }}
          >
            <Image src="/detail-point/paper-3.png" alt="" fill sizes="128px" className="object-cover" />
          </div>

          {/* Far-right card — smallest, most blurred */}
          <div
            className="absolute overflow-hidden rounded-2xl border border-white shadow-md"
            style={{
              left: "97%",
              top: "50%",
              width: "104px",
              height: "139px",
              transform: "translate(-50%, -50%) rotate(17deg) scale(0.7)",
              filter: "blur(4px)",
              zIndex: 10,
            }}
          >
            <Image src="/detail-point/paper-5.png" alt="" fill sizes="104px" className="object-cover" />
          </div>
        </div>
      </Container>

      {/* Pain-point hook */}
      <Container maxWidth="max-w-3xl" className="mt-14">
        <p className="text-center text-lg font-bold leading-snug text-black">
          혹시
          <br />
          내 얘기는 아닌가요?
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {[
            "미용실에 연예인 사진 보여줬는데\n왜 다른 느낌이 나는지 모르겠어요 😭",
            "분명 예쁜 옷인데\n제가 입으면 안 어울려요 😭",
            "사진 찍을 때마다\n어떤 느낌으로 나올지 감이 안 와요 😭",
            "내 스타일 기준이 뭔지\n설명을 못 하겠어요 😭",
          ].map((item) => (
            <div
              key={item}
              className="whitespace-pre-line rounded-2xl border border-violet-100 bg-white px-5 py-4 text-center text-sm font-medium leading-relaxed text-gray-700 shadow-sm shadow-violet-100/60"
            >
              {item}
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm leading-relaxed text-gray-500">
          혹시 이렇게 생각한 적 있나요?
          <br />
          &lsquo;패션 센스가 없나...?&rsquo; &lsquo;유행을 몰라서 그런가?&rsquo;
        </p>

        <div className="mt-8 rounded-2xl bg-black px-6 py-7 text-center">
          <p className="text-xs font-semibold tracking-[0.15em] text-violet-300">
            사실은
          </p>
          <p className="mt-3 text-lg font-bold leading-relaxed text-white">
            나만의 추구미 기준을
            <br />
            몰라서예요
          </p>
          <p className="mt-3 text-xs leading-relaxed text-gray-400">
            얼굴이나 센스의 문제가 아니라,
            <br />
            지금 내 이미지와 원하는 방향을 비교할 기준이 없었던 것뿐이에요.
          </p>
        </div>
      </Container>

      {/* Benefit highlights */}
      <Container maxWidth="max-w-3xl" className="mt-14">
        <p className="text-center text-lg font-bold leading-snug text-black">
          지금부터
          <br />
          달라질 거예요
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {[
            {
              title: "미용실 갈 때마다 헤매지 않고",
              body: "원하는 방향이 명확해져서 디자이너에게 정확히 전달할 수 있어요.",
            },
            {
              title: "옷 고를 때 기준이 생기고",
              body: "예뻐 보이는 게 아니라, 내 분위기에 맞는 컬러와 핏을 먼저 보게 돼요.",
            },
            {
              title: "사진 찍을 때 자신감이 생겨요",
              body: "내 이미지 무드를 알고 있으면, 어떤 각도·표정이 잘 살아나는지도 자연스럽게 알게 돼요.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm shadow-violet-100/60"
            >
              <p className="text-sm font-bold text-black">{item.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </Container>

      {/* Photo reviews */}
      <div className="mx-auto mt-10 w-full max-w-3xl">
        <PhotoReviewMarquee items={photoReviews} />
      </div>

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

      {/* Service breakdown */}
      <Container maxWidth="max-w-3xl" className="mt-14 text-center">
        <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold tracking-[0.15em] text-violet-600">
          나만의 스타일 기준, 이렇게 만들어져요
        </span>
        <h2 className="mt-4 text-xl font-bold leading-snug text-black">
          FACEMOOD 상세 리포트
        </h2>
      </Container>

      <Container maxWidth="max-w-3xl" className="mt-6">
        <div className="flex flex-col gap-3">
          {serviceBreakdown.map((item) => (
            <div
              key={item.number}
              className="relative mx-auto w-full max-w-xs overflow-hidden rounded-3xl"
            >
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={item.photo}
                  alt={item.title}
                  fill
                  sizes="320px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/45" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
                <span className="text-xs font-bold tracking-[0.2em] text-white/80">
                  {item.number}
                </span>
                <p className="mt-1.5 text-lg font-bold text-white">
                  {item.title}
                </p>
                <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-white/85">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* Chapter: 스타일 */}
      <Container id="section-mood" maxWidth="max-w-3xl" className="mt-14 scroll-mt-20">
        <span className="text-xs font-bold tabular-nums text-violet-300">01</span>
        <span className="ml-2 inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold tracking-[0.15em] text-violet-600">
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
        <span className="text-xs font-bold tabular-nums text-violet-300">02</span>
        <span className="ml-2 inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold tracking-[0.15em] text-violet-600">
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
        <span className="text-xs font-bold tabular-nums text-violet-300">03</span>
        <span className="ml-2 inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold tracking-[0.15em] text-violet-600">
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
        <span className="text-xs font-bold tabular-nums text-violet-300">04</span>
        <span className="ml-2 inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold tracking-[0.15em] text-violet-600">
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

      {/* Featured case studies */}
      <Container maxWidth="max-w-3xl" className="mt-10">
        <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold tracking-[0.15em] text-violet-600">
          CASE
        </span>
        <h2 className="mt-4 text-lg font-bold leading-snug text-black">
          이렇게 달라졌어요
        </h2>

        <div className="mt-6 flex flex-col gap-4">
          {[reviews[0], reviews[3], reviews[6]].map((review, index) => (
            <div
              key={review.name}
              className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm shadow-violet-100/60"
            >
              <span className="text-xs font-semibold tracking-[0.1em] text-violet-400">
                CASE {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-relaxed text-black">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">
                  {review.name}
                </span>
                <span className="text-sm tracking-wide text-violet-500">
                  {review.stars}
                </span>
              </div>
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

      {/* FAQ */}
      <Container maxWidth="max-w-3xl" className="mt-10">
        <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold tracking-[0.15em] text-violet-600">
          FAQ
        </span>
        <h2 className="mt-4 text-lg font-bold leading-snug text-black">
          자주 묻는 질문
        </h2>

        <div className="mt-6 flex flex-col gap-2.5">
          {faqItems.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={item.q}
                className="rounded-2xl border border-violet-100 bg-white px-5 py-4 shadow-sm shadow-violet-100/60"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-3 text-left text-sm font-semibold text-black"
                >
                  <span>Q. {item.q}</span>
                  <span className="shrink-0 text-gray-400">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <p className="mt-2.5 text-xs leading-relaxed text-gray-500">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Container>

      {/* 3-point feature highlight */}
      <Container maxWidth="max-w-3xl" className="mt-10">
        <div className="flex flex-col gap-3">
          {[
            {
              point: "REASON 01",
              title: "실제 사진 기반 개인화 분석",
              body: "업로드한 사진과 답변을 바탕으로 매번 다르게 작성돼요. 같은 문장을 복사해서 붙여넣는 방식이 아니에요.",
            },
            {
              point: "REASON 02",
              title: "외모 점수화 없는 무드 분석",
              body: "점수나 등급, 단점 지적이 아니라 지금 이미지와 원하는 방향의 차이를 비교해서 방향을 제안해요.",
            },
            {
              point: "REASON 03",
              title: "평생 참고 가능한 상세 리포트",
              body: "Basic 8개 챕터, Premium 17개 챕터로 구성되고, 미용실·쇼핑·사진 찍을 때마다 다시 꺼내볼 수 있어요.",
            },
          ].map((item) => (
            <div
              key={item.point}
              className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm shadow-violet-100/60"
            >
              <span className="text-[11px] font-bold tracking-[0.15em] text-violet-400">
                {item.point}
              </span>
              <p className="mt-2 text-sm font-bold text-black">{item.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                {item.body}
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
        <p className="text-center text-lg font-bold leading-snug text-black">
          더 이상 헤매지 않도록.
          <br />
          지금 이미지에서, 원하는 방향으로.
        </p>

        {/* Disclaimer */}
        <div className="mt-6 rounded-3xl border border-violet-100 bg-violet-50/60 p-6 text-center">
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

      {/* Sticky bottom CTA — stays visible while scrolling through the page */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-violet-100 bg-white/95 px-6 py-4 backdrop-blur">
        <div className="mx-auto max-w-md">
          <Link
            href="/test"
            className="flex w-full items-center justify-center rounded-full bg-black px-8 py-4 text-sm font-semibold text-white"
          >
            나의 추구미 무료 컨설팅 받기
          </Link>
          <p className="mt-2 text-center text-xs text-gray-400">
            무료 미리보기로 먼저 확인할 수 있어요.
          </p>
        </div>
      </div>
    </main>
  );
}
