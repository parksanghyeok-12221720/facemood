import Image from "next/image";
import Link from "next/link";
import AnalysisCounter from "@/app/components/AnalysisCounter";
import Container from "@/app/components/Container";

const floatingTags: {
  label: string;
  className: string;
  delay: string;
  duration: string;
}[] = [
  {
    label: "#추구미",
    className: "left-[2%] top-16",
    delay: "0s",
    duration: "6s",
  },
  {
    label: "#헤어스타일",
    className: "right-[4%] top-28",
    delay: "1.2s",
    duration: "7s",
  },
  {
    label: "#메이크업",
    className: "left-[6%] bottom-24",
    delay: "0.6s",
    duration: "6.5s",
  },
  {
    label: "#스타일링",
    className: "right-[2%] bottom-10",
    delay: "1.8s",
    duration: "7.5s",
  },
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white text-black">
      {/* Background photo. Drop the hero image at public/hero-bg.png. */}
      <Image
        src="/hero-bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/55 to-white/85" />

      {/* Positioned relative to the same max-w-md column as the text below
          (not the full viewport) so the tags hug the content instead of
          drifting out toward the screen edges on wide/desktop views. */}
      <div className="pointer-events-none absolute left-1/2 top-0 z-10 h-full w-full max-w-md -translate-x-1/2">
        {floatingTags.map((tag) => (
          <span
            key={tag.label}
            className={`animate-float absolute whitespace-nowrap rounded-full border border-white/60 bg-white/70 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-violet-600 shadow-sm backdrop-blur-sm ${tag.className}`}
            style={{ animationDelay: tag.delay, animationDuration: tag.duration }}
          >
            {tag.label}
          </span>
        ))}
      </div>

      <Container className="relative z-20 flex flex-col items-center text-center">
        <p className="mb-8 text-sm tracking-[0.3em] text-violet-600">
          FACEMOOD
        </p>

        <h1 className="text-3xl font-bold leading-snug text-black">
          내 얼굴 분위기,
          <br />
          어떤 무드로 보일까?
        </h1>

        <p className="mt-6 text-sm leading-relaxed text-gray-500">
          셀카와 간단한 질문으로
          <br />
          지금의 이미지와 원하는 추구미 방향을 비교해보세요.
        </p>

        <div className="mt-14 w-full">
          <Link
            href="/detail"
            className="flex w-full items-center justify-center rounded-full bg-black px-8 py-4 text-sm font-semibold text-white"
          >
            분석 시작하기
          </Link>
          <AnalysisCounter />
        </div>
      </Container>
    </main>
  );
}
