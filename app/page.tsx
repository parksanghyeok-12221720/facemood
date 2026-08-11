import Image from "next/image";
import Link from "next/link";
import AnalysisCounter from "@/app/components/AnalysisCounter";
import Container from "@/app/components/Container";
import HotLiveCounter from "@/app/components/HotLiveCounter";
import ProductChoiceCards from "@/app/components/ProductChoiceCards";
import SiteFooter from "@/app/components/SiteFooter";

function FaceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9" cy="10.5" r="1" fill="currentColor" />
      <circle cx="15" cy="10.5" r="1" fill="currentColor" />
      <path d="M9 14.5c.9.8 1.9 1.2 3 1.2s2.1-.4 3-1.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CirclesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9.5" cy="12" r="6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="14.5" cy="12" r="6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Container maxWidth="max-w-md" className="pb-16 pt-6">
        <p className="text-sm font-bold tracking-[0.2em] text-violet-600">
          FACEMOOD
        </p>

        {/* Hero card */}
        <div className="relative mt-4 aspect-[1434/1097] w-full overflow-hidden rounded-3xl">
          <Image
            src="/home-hero.png"
            alt=""
            fill
            priority
            sizes="(max-width: 480px) 100vw, 448px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <h1 className="text-2xl font-bold leading-snug text-white">
              내 얼굴 분위기,
              <br />
              어떤 무드로 보일까?
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              셀카와 간단한 질문으로 지금의 이미지를 분석해드려요.
            </p>
          </div>
        </div>

        {/* Category icon nav */}
        <div className="mt-7 flex justify-center gap-12">
          <Link href="/detail" className="flex flex-col items-center gap-2">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-50 text-violet-600">
              <FaceIcon />
            </span>
            <span className="text-xs font-semibold text-black">추구미 찾기</span>
          </Link>
          <Link href="/match/upload" className="flex flex-col items-center gap-2">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-50 text-violet-600">
              <CirclesIcon />
            </span>
            <span className="text-xs font-semibold text-black">무드 궁합</span>
          </Link>
        </div>

        {/* Product cards */}
        <div className="mt-10 flex items-center gap-2">
          <h2 className="text-base font-bold text-black">FACEMOOD 서비스</h2>
          <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold text-white">
            HOT
          </span>
          <HotLiveCounter />
        </div>

        <ProductChoiceCards />

        <AnalysisCounter />
      </Container>

      <SiteFooter />
    </main>
  );
}
