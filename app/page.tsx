import Link from "next/link";
import Container from "@/app/components/Container";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white text-black">
      <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-200/40 blur-3xl" />

      <Container className="flex flex-col items-center text-center">
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
        </div>
      </Container>
    </main>
  );
}
