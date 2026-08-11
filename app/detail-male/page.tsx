"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Container from "@/app/components/Container";
import DiscountCountdownBar from "@/app/components/DiscountCountdownBar";
import KakaoChannelDiscountPopup from "@/app/components/KakaoChannelDiscountPopup";
import PccsColorChart from "@/app/components/PccsColorChart";
import SiteFooter from "@/app/components/SiteFooter";
import { KAKAO_DISCOUNT_APPLIED_KEY } from "@/lib/kakaoChannel";
import type { Review } from "@/app/data/reviews";
import { trendContents, trendUpdates } from "@/app/data/trendContent";
import type { TrendUpdate } from "@/app/data/trendContent";
import { REPORT_CHAPTERS } from "@/types/report";

type Photo = { src: string; keyword: string };

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

// Display-only teaser price for the PREMIUM EVENT promo card below —
// intentionally decoupled from lib/payment.ts's real PREMIUM_PRICE_KRW
// (49,900원), which is what /checkout actually charges. Keep this in mind
// if the promo copy is ever meant to match the real checkout price again.
const PREMIUM_EVENT_PRICE_KRW = 34900;
const PREMIUM_ORIGINAL_PRICE_KRW = 129800;
const basicChapters = REPORT_CHAPTERS.filter((c) => c.tier === "basic");
const premiumOnlyChapters = REPORT_CHAPTERS.filter((c) => c.tier === "premium");

const outcomeHighlights = [
  { icon: "✨", text: "나에게 가장 잘 어울리는 분위기 찾기" },
  { icon: "💇", text: "미용실에서 바로 보여줄 수 있는 헤어 추천" },
  { icon: "👕", text: "무신사에서 바로 참고 가능한 코디 추천" },
  { icon: "👕", text: "내 체형에 맞는 코디 가이드" },
  { icon: "📸", text: "사진에서도 더 잘 나오는 스타일 제안" },
];

const oldConsultingPoints = [
  {
    icon: "💬",
    title: "분야별로 따로 받아야 하는 컨설팅",
    body: "퍼스널컬러 · 헤어 · 코디 · 스타일링 · 체형 · 액세서리, 각각 예약과 비용이 필요해요.",
  },
  {
    icon: "⏳",
    title: "몇 시간 투자",
    body: "예약 → 방문 → 상담 → 쇼핑까지 직접 비교해야 해요.",
  },
  {
    icon: "📄",
    title: "기억에 의존",
    body: "상담이 끝나면 기억을 더듬으며 혼자 다시 찾아봐야 해요.",
  },
  {
    icon: "❌",
    title: "실제 모습을 미리 보기 어려움",
    body: "설명은 들었지만 나에게 어울릴지 직접 해보기 전까지 알기 어려워요.",
  },
];

const premiumEventPoints = [
  {
    title: "AI 기반 얼굴·체형·스타일 통합 분석",
    body: "얼굴형 · 비율 · 분위기 · 퍼스널컬러 · 체형까지 종합 분석해요.",
  },
  {
    title: "나에게 맞는 스타일을 한 번에 추천",
    body: "헤어 · 코디 · 액세서리 · 향수 · 컬러 모두 연결해서 추천해요.",
  },
  {
    title: "Before → After 스타일 시뮬레이션",
    body: "추천만 하는 게 아니라 변한 모습을 직접 확인할 수 있어요.",
  },
  {
    title: "100페이지 이상의 프리미엄 리포트",
    body: "언제든 다시 확인, 미용실에서도 활용, 쇼핑할 때도 참고할 수 있어요.",
  },
  {
    title: "집에서 5분",
    body: "사진만 업로드하면 컨설팅이 끝나요.",
  },
];

const premiumFeatureTags = [
  "헤어 추천",
  "코디 추천",
  "퍼스널컬러",
  "체형 분석",
  "액세서리 추천",
  "향수 추천",
  "스타일 시뮬레이션",
];

const recommendedForList = [
  "매번 헤어를 바꿔도 만족스럽지 않은 분",
  "나에게 어울리는 스타일을 모르겠는 분",
  "쇼핑할 때 항상 실패하는 분",
  "이미지를 한 단계 업그레이드하고 싶은 분",
  "소개팅 · 면접 · 프로필 촬영을 준비하는 분",
];

const chapters = [
  { key: "mood", label: "스타일", id: "section-mood" },
  { key: "color", label: "컬러", id: "section-color" },
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
    photo: "/detail-service/04-hair.png",
    title: "헤어 컨설팅",
    body: "분위기를 가장 크게 바꾸는\n헤어 방향을 알려드려요",
  },
  {
    number: "04",
    photo: "/detail-service/05-face.png",
    title: "얼굴형 컨설팅",
    body: "사진상 얼굴형을 참고해\n어울리는 스타일을 제안해요",
  },
  {
    number: "05",
    photo: "/detail-service/06-style.png",
    title: "스타일링 컨설팅",
    body: "지금 이미지와\n원하는 추구미를 하나로 정리해요",
  },
];

type PhotoReview = { photo: string; ratio: string; stars: string; text: string };

// Photo at /public/detail-reviews-male/review-N.png (separate from the
// female page's /detail-reviews folder). Real male photos are in — each
// card uses its own `ratio` (matching that photo's real dimensions) since
// they aren't all the same shape (some portrait outfit shots, one
// landscape hair before/after).
const photoReviews: PhotoReview[] = [
  { photo: "/detail-reviews-male/review-1.png", ratio: "1024 / 1536", stars: "★★★★★", text: "생각보다 엄청 자세해서 놀랐어요" },
  { photo: "/detail-reviews-male/review-2.png", ratio: "1023 / 1537", stars: "★★★★★", text: "사진상 색감이 잘 맞는다는 말이 더 믿음 갔어요" },
  { photo: "/detail-reviews-male/review-3.png", ratio: "1024 / 1536", stars: "★★★★★", text: "지금 이미지가 캐주얼하다고 해서 뜨끔했어요" },
  { photo: "/detail-reviews-male/review-4.png", ratio: "1024 / 1536", stars: "★★★★★", text: "코디 부분이 진짜 도움 됐어요" },
  { photo: "/detail-reviews-male/review-5.png", ratio: "1086 / 1448", stars: "★★★★★", text: "원하는 분위기를 말로 정리해준 느낌이었어요" },
  { photo: "/detail-reviews-male/review-6.png", ratio: "1448 / 1086", stars: "★★★★☆", text: "헤어 추천이 생각보다 좋았어요" },
];

// Each photo already contains both the before and after side in one image
// — /public/detail-case-male/case-N.png (separate from the female page's
// /detail-case folder so swapping photos here never touches that one).
// Placeholders (copies of the female case photos) are seeded there for
// now; drop in real before/after photos under the same filenames to
// replace them — no code changes needed.
const caseAssets = [
  { photo: "/detail-case-male/case-1.png", ratio: "1122 / 1402" },
  { photo: "/detail-case-male/case-2.png", ratio: "1086 / 1448" },
  { photo: "/detail-case-male/case-3.png", ratio: "1086 / 1448" },
];

type CaseTestimonial = { name: string; score: string; stars: string; text: string };

// Local to this page (not the shared reviews.ts) since CASE 01/02/03 here
// need their own 헤어/코디/코디 copy — reusing the shared array would have
// also changed the female page's REVIEWS section.
const caseTestimonials: CaseTestimonial[] = [
  {
    name: "이*준",
    score: "5.0",
    stars: "★★★★★",
    text: "미용실 갈 때마다 그냥 '알아서 잘라주세요' 했었는데, 이번엔 제 얼굴형이랑 정수리 볼륨까지 짚어줘서 처음으로 원하는 느낌이 뭔지 알고 갔어요. 헤어 하나 바꿨을 뿐인데 인상이 확 달라지더라고요.",
  },
  {
    name: "박*현",
    score: "5.0",
    stars: "★★★★★",
    text: "맨날 무채색 반팔에 청바지만 입었는데, 제 분위기에 맞는 핏이랑 컬러를 짚어주니까 같은 옷장 안에서도 훨씬 정돈돼 보였어요. 옷 고를 때 기준이 생긴 느낌이에요.",
  },
  {
    name: "정*우",
    score: "5.0",
    stars: "★★★★★",
    text: "소개팅 앞두고 뭘 입어야 할지 감이 안 왔는데, 제 이미지에 맞는 톤이랑 아이템을 구체적으로 짚어줘서 그대로 따라 입었더니 반응이 확실히 달랐어요.",
  },
];

// Local to this page (not the shared reviews.ts) — same reason as
// caseTestimonials: the general REVIEWS section needs its own male-voiced
// copy instead of the female page's.
const maleReviews: Review[] = [
  {
    name: "김*준",
    stars: "★★★★★",
    score: "5.0",
    text: "생각보다 엄청 자세해서 놀랐어요. 그냥 '댄디하시네요~' 이런 느낌일 줄 알았는데, 제 사진에서 보이는 분위기랑 제가 원하는 이미지 차이를 설명해줘서 좋았어요. 특히 정리해야 하는 부분이랑 살려야 하는 포인트가 현실적이었음.",
  },
  {
    name: "min**",
    stars: "★★★★★",
    score: "5.0",
    text: "퍼스널컬러를 딱 잘라서 말하는 게 아니라 “사진상으로는 이런 색감이 잘 맞아 보인다” 이런 식이라 오히려 더 믿음 갔어요. 조명 따라 달라질 수 있다는 말도 있어서 부담 없었고, 추천 컬러 팔레트가 생각보다 유용했어요.",
  },
  {
    name: "이수*",
    stars: "★★★★☆",
    score: "4.0",
    text: "처음엔 반신반의했는데 리포트 읽고 나니까 제가 왜 사진마다 분위기가 달라 보였는지 좀 알겠더라구요. 헤어랑 옷 색감이 따로 놀고 있다는 부분이 제일 공감됐어요. 결과가 조금 더 길었으면 더 좋았을 듯!",
  },
  {
    name: "정*훈",
    stars: "★★★★★",
    score: "5.0",
    text: "제가 원하는 건 세련되고 차분한 느낌이었는데, 지금 이미지는 너무 편한 캐주얼 쪽에 가깝다고 해서 뜨끔했어요ㅋㅋ 근데 말투가 기분 나쁘게 평가하는 게 아니라 방향을 잡아주는 느낌이라 좋았어요.",
  },
  {
    name: "박준*",
    stars: "★★★★★",
    score: "5.0",
    text: "코디 부분이 진짜 도움 됐어요. 평소에 그냥 무난한 옷만 골랐는데, 제 추구미랑 맞추려면 핏이랑 톤을 봐야 한다는 게 새로웠어요. 바로 옷 살 때 참고할 듯요.",
  },
  {
    name: "hyun**",
    stars: "★★★★☆",
    score: "4.0",
    text: "사진 올리는 게 살짝 민망했는데 외모 점수 이런 게 아니라 무드 분석이라 괜찮았어요. 결과도 막 단점 지적이 아니라 “이 방향으로 가면 더 가까워질 수 있다” 식이라 편하게 봤습니다.",
  },
  {
    name: "재*원",
    stars: "★★★★★",
    score: "5.0",
    text: "내가 원하는 분위기는 있는데 설명을 못 했거든요. 근데 리포트에서 그걸 말로 정리해준 느낌이었어요. 특히 댄디/캐주얼/시크한 느낌이 섞여 있는데 어느 쪽을 살리면 좋은지 알려줘서 좋았어요.",
  },
  {
    name: "kevin**",
    stars: "★★★★★",
    score: "5.0",
    text: "헤어 추천이 생각보다 좋았음… 앞머리랑 컬 방향이 분위기에 얼마나 영향 주는지 몰랐는데, 제 사진 기준으로 어떤 스타일이 더 잘 맞을지 설명해줘서 미용실 갈 때 참고하려고요.",
  },
  {
    name: "최*수",
    stars: "★★★★☆",
    score: "4.0",
    text: "무료 요약만 봤을 때도 꽤 괜찮았고, 상세 리포트는 확실히 더 구체적이었어요. 컬러, 코디, 헤어를 따로 보는 게 아니라 하나의 분위기로 맞춰주는 게 좋았습니다.",
  },
  {
    name: "sh**89",
    stars: "★★★★★",
    score: "5.0",
    text: "프로필 사진 바꾸려고 해봤는데 기대보다 만족했어요. 어떤 옷 색감이랑 배경이 제 분위기를 더 잘 살리는지 알려줘서 좋았고, 너무 AI 느낌보다는 스타일 컨설팅 받는 느낌이었어요.",
  },
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
    q: "사진은 저장되는건가요?",
    a: "업로드한 사진은 리포트 생성 목적으로만 사용되고, 리포트가 완성되면 자동으로 삭제돼요. 서비스 오류 대응이 필요한 경우에 한해서만 최대 7일간 보관 후 삭제돼요.",
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
            <div className="relative w-full" style={{ aspectRatio: review.ratio }}>
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
  const [kakaoDiscountApplied, setKakaoDiscountApplied] = useState(false);
  const overview = trendContents.all;

  // Reflects whatever was already set on another page (or an earlier
  // visit) — localStorage isn't available during SSR, so this starts
  // false and corrects itself right after mount.
  useEffect(() => {
    let cancelled = false;
    // Push past a microtask boundary so this setState call is never
    // synchronous relative to the effect body (react-hooks/set-state-in-effect).
    Promise.resolve().then(() => {
      if (cancelled) return;
      if (localStorage.getItem(KAKAO_DISCOUNT_APPLIED_KEY) === "1") {
        setKakaoDiscountApplied(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function markKakaoDiscountApplied() {
    localStorage.setItem(KAKAO_DISCOUNT_APPLIED_KEY, "1");
    setKakaoDiscountApplied(true);
  }

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

  // Fades + slides each content section into view the first time it
  // scrolls into the viewport (see .reveal / .reveal-visible in
  // globals.css). Unobserves each element right after it reveals so this
  // never fires again on scroll-up — a one-time entrance, not a toggle.
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(".reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
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
      <KakaoChannelDiscountPopup
        applied={kakaoDiscountApplied}
        eligible
        onApplied={markKakaoDiscountApplied}
      />
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
          헤어·코디·스타일링까지 한 번에 정리해요.
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
      <Container maxWidth="max-w-3xl" className="mt-6 reveal">
        <div className="rounded-2xl border border-violet-200 bg-violet-50 px-5 py-4 text-center">
          <p className="text-sm font-semibold leading-relaxed text-violet-700">
            전문 이미지 컨설턴트가 글로벌 패션 교육기관의
            <br />
            스타일 분석 관점을 참고한 리포트 구조
          </p>
        </div>
      </Container>

      {/* Precision analysis visual */}
      <Container maxWidth="max-w-3xl" className="mt-14 text-center reveal">
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
            src="/detail-point/precision-analysis-male.png"
            alt="정밀 얼굴 분위기 분석 예시"
            fill
            sizes="320px"
            className="object-cover"
          />
        </div>
      </Container>

      {/* POINT 02 */}
      <Container maxWidth="max-w-3xl" className="mt-14 text-center reveal">
        <span className="inline-flex items-center rounded-full bg-violet-600 px-3 py-1 text-[11px] font-bold tracking-[0.15em] text-white">
          POINT 02
        </span>
        <h2 className="mt-4 text-2xl font-bold leading-snug text-black">
          나만을 위한
          <br />
          <span className="text-violet-600">
            헤어·코디 방향과
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
            src="/detail-point/style-report-mockup-male.png"
            alt="스타일 리포트 예시"
            fill
            sizes="320px"
            className="object-cover"
          />
        </div>
      </Container>

      {/* POINT 03 */}
      <Container maxWidth="max-w-3xl" className="mt-14 text-center reveal">
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
      <Container maxWidth="max-w-3xl" className="mt-14 reveal">
        <p className="text-center text-lg font-bold leading-snug text-black">
          혹시
          <br />
          내 얘기는 아닌가요?
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {[
            "미용실에 연예인 사진 보여줬는데\n왜 다른 느낌이 나는지 모르겠어요 😭",
            "분명 남들 입으면 멋있는데\n제가 입으면 안 어울려요 😭",
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

        <div className="mt-8 rounded-2xl border border-violet-100 bg-violet-50 px-6 py-7 text-center">
          <p className="text-xs font-semibold tracking-[0.15em] text-violet-500">
            사실은
          </p>
          <p className="mt-3 text-lg font-bold leading-relaxed text-black">
            나만의 추구미 기준을
            <br />
            몰라서예요
          </p>
          <p className="mt-3 text-xs leading-relaxed text-gray-500">
            얼굴이나 센스의 문제가 아니라,
            <br />
            지금 내 이미지와 원하는 방향을 비교할 기준이 없었던 것뿐이에요.
          </p>
        </div>
      </Container>

      {/* Benefit highlights */}
      <Container maxWidth="max-w-3xl" className="mt-14 reveal">
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
              body: "멋있어 보이는 게 아니라, 내 분위기에 맞는 컬러와 핏을 먼저 보게 돼요.",
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

      {/* Trend Note overview */}
      <Container maxWidth="max-w-3xl" className="mt-10 reveal">
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
      <Container maxWidth="max-w-3xl" className="mt-14 text-center reveal">
        <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold tracking-[0.15em] text-violet-600">
          나만의 스타일 기준, 이렇게 만들어져요
        </span>
        <h2 className="mt-4 text-xl font-bold leading-snug text-black">
          FACEMOOD 상세 리포트
        </h2>
      </Container>

      <Container maxWidth="max-w-3xl" className="mt-6 reveal">
        <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
          {serviceBreakdown.map((item) => (
            <div
              key={item.number}
              className="relative w-full overflow-hidden rounded-2xl"
            >
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={item.photo}
                  alt={item.title}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/45" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
                <span className="text-[10px] font-bold tracking-[0.15em] text-white/80">
                  {item.number}
                </span>
                <p className="mt-1 text-sm font-bold text-white">
                  {item.title}
                </p>
                <p className="mt-1.5 whitespace-pre-line text-[10px] leading-relaxed text-white/85">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* Chapter: 스타일 */}
      <Container id="section-mood" maxWidth="max-w-3xl" className="mt-14 scroll-mt-20 reveal">
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
      <Container id="section-color" maxWidth="max-w-3xl" className="mt-14 scroll-mt-20 reveal">
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

      {/* Chapter: 헤어 */}
      <Container id="section-hair" maxWidth="max-w-3xl" className="mt-14 scroll-mt-20 reveal">
        <span className="text-xs font-bold tabular-nums text-violet-300">03</span>
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
      <Container maxWidth="max-w-3xl" className="mt-10 reveal">
        <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold tracking-[0.15em] text-violet-600">
          CASE
        </span>
        <h2 className="mt-4 text-lg font-bold leading-snug text-black">
          이렇게 달라졌어요
        </h2>

        <div className="mt-6 flex flex-col gap-4">
          {caseTestimonials.map((review, index) => (
            <div
              key={review.name}
              className="mx-auto w-full max-w-xs rounded-2xl border border-violet-100 bg-white p-4 shadow-sm shadow-violet-100/60"
            >
              <span className="text-xs font-semibold tracking-[0.1em] text-violet-400">
                CASE {String(index + 1).padStart(2, "0")}
              </span>

              <div
                className="relative mt-3 w-full overflow-hidden rounded-xl"
                style={{ aspectRatio: caseAssets[index].ratio }}
              >
                <Image
                  src={caseAssets[index].photo}
                  alt={`Before/After — CASE ${String(index + 1).padStart(2, "0")}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 720px"
                  className="object-cover"
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
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
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                {review.text}
              </p>
            </div>
          ))}
        </div>
      </Container>

      {/* Reviews */}
      <Container maxWidth="max-w-3xl" className="mt-10 reveal">
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
          {maleReviews.map((review) => (
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
      <Container maxWidth="max-w-3xl" className="mt-10 reveal">
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
      <Container maxWidth="max-w-3xl" className="mt-10 reveal">
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

      {/* Premium Event — offline consulting comparison */}
      <Container maxWidth="max-w-3xl" className="mt-10 reveal">
        <div className="rounded-3xl border border-violet-100 bg-violet-50/50 p-6">
          <p className="text-sm font-bold text-black">이런 결과를 받아보세요</p>
          <ul className="mt-4 flex flex-col gap-3">
            {outcomeHighlights.map((item) => (
              <li
                key={item.text}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-700"
              >
                <span className="shrink-0">{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 text-center">
          <span className="inline-flex items-center rounded-full bg-violet-600 px-3 py-1 text-[11px] font-bold tracking-[0.15em] text-white">
            🔥 PREMIUM EVENT
          </span>
          <p className="mt-4 text-lg font-bold leading-snug text-black">
            오프라인 이미지 컨설팅 50만원+를
            <br />
            <span className="text-violet-600">
              {PREMIUM_EVENT_PRICE_KRW.toLocaleString()}원
            </span>
            에
          </p>
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            단 한 번의 AI 스타일 컨설팅으로
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {/* Offline consulting — de-emphasized */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <p className="text-sm font-bold text-gray-500">
              기존 이미지 컨설팅
            </p>
            <ul className="mt-4 flex flex-col gap-4">
              {oldConsultingPoints.map((point) => (
                <li key={point.title}>
                  <p className="text-xs font-semibold text-gray-600">
                    {point.icon} {point.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-400">
                    {point.body}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-right text-base font-extrabold text-gray-500">
              약 50만원+
            </p>
          </div>

          {/* FACEMOOD Premium Report — emphasized */}
          <div className="rounded-2xl border-2 border-violet-500 bg-white p-6 shadow-lg shadow-violet-200/60">
            <span className="inline-flex items-center rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-bold text-white">
              BEST
            </span>
            <p className="mt-3 text-sm font-bold text-black">
              FACEMOOD Premium Report
            </p>
            <ul className="mt-4 flex flex-col gap-4">
              {premiumEventPoints.map((point) => (
                <li key={point.title}>
                  <p className="text-xs font-semibold text-black">
                    ✅ {point.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">
                    {point.body}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-baseline justify-end gap-2">
              <span className="text-sm text-gray-400 line-through decoration-gray-400">
                {PREMIUM_ORIGINAL_PRICE_KRW.toLocaleString()}원
              </span>
              <span className="text-xl font-extrabold text-violet-600">
                {PREMIUM_EVENT_PRICE_KRW.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {premiumFeatureTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-600"
            >
              ✔ {tag}
            </span>
          ))}
        </div>


        <div className="mt-10 rounded-2xl border border-violet-100 bg-white p-6">
          <p className="text-sm font-bold text-black">
            이런 분들에게 추천합니다
          </p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {recommendedForList.map((text) => (
              <li
                key={text}
                className="flex items-start gap-2 text-sm leading-relaxed text-gray-700"
              >
                <span className="shrink-0 text-violet-500">✔</span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </Container>

      {/* Report table of contents */}
      <Container maxWidth="max-w-3xl" className="mt-10 reveal">
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
          <p className="text-sm font-bold text-black">Basic</p>
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
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-bold text-white">
              BEST
            </span>
            <p className="text-sm font-bold text-black">Premium</p>
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

      <Container className="mt-10 pb-8 reveal">
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

      <SiteFooter />

      {/* Sticky bottom CTA — stays visible while scrolling through the page */}
      <DiscountCountdownBar
        href="/test"
        ctaLabel="나의 추구미 무료 컨설팅 받기"
        darkColor="#000000"
        gradientFrom="#7c3aed"
        gradientTo="#c026d3"
      />
    </main>
  );
}
