import Image from "next/image";
import Link from "next/link";
import Container from "@/app/components/Container";

type Service = {
  title: string;
  subtitle: string;
  href: string;
  image: string;
  badge?: string;
};

// Reuses the two hero photos already on hand (home-card-mood.png /
// home-card-match.png) — the sub-consulting items (헤어/메이크업/퍼스널
// 컨설팅, 퍼스널컬러) don't have dedicated photos yet, so they borrow the
// mood-analysis one as a placeholder until real product shots exist.
const SERVICES: Service[] = [
  {
    title: "토탈 스타일 컨설팅",
    subtitle: "내 얼굴에 어울리는 헤어·메이크업·스타일 분석",
    href: "/detail",
    image: "/home-card-mood.png",
  },
  {
    title: "그 사람과의 무드궁합",
    subtitle: "두 사람의 얼굴 무드와 커플 케미 분석",
    href: "/match/upload",
    image: "/home-card-match.png",
    badge: "NEW",
  },
  {
    title: "헤어 컨설팅",
    subtitle: "얼굴형부터 어울리는 헤어 방향까지",
    href: "/detail#section-hair",
    image: "/home-card-mood.png",
    badge: "NEW",
  },
  {
    title: "메이크업 컨설팅",
    subtitle: "원하는 무드에 맞춘 메이크업 방향 제안",
    href: "/detail#section-makeup",
    image: "/home-card-mood.png",
    badge: "NEW",
  },
  {
    title: "퍼스널 컨설팅",
    subtitle: "지금 이미지와 원하는 추구미를 하나로 정리",
    href: "/detail",
    image: "/home-card-mood.png",
    badge: "NEW",
  },
  {
    title: "퍼스널 컬러",
    subtitle: "사진상 어울리는 컬러 무드 방향 제안",
    href: "/detail#section-color",
    image: "/home-card-mood.png",
    badge: "NEW",
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-white pb-16 text-black">
      <div className="sticky top-0 z-10 border-b border-violet-100 bg-white/90 backdrop-blur">
        <Container maxWidth="max-w-md" className="flex items-center justify-between py-4">
          <span className="text-sm font-bold tracking-[0.2em] text-violet-600">
            전체 서비스
          </span>
          <Link href="/" className="text-xs text-gray-400">
            닫기
          </Link>
        </Container>
      </div>

      <Container maxWidth="max-w-md" className="mt-6 flex flex-col gap-5">
        {SERVICES.map((service, index) => (
          <Link
            key={service.title}
            href={service.href}
            className="group block overflow-hidden rounded-3xl border border-black/5"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={service.image}
                alt={service.title}
                fill
                priority={index === 0}
                sizes="(max-width: 480px) 100vw, 448px"
                className="object-cover transition-transform duration-300 group-active:scale-105"
              />
              {service.badge && (
                <span className="absolute right-3 top-3 rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-bold text-white">
                  {service.badge}
                </span>
              )}
            </div>
            <div className="p-4">
              <p className="text-base font-bold text-black">{service.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                {service.subtitle}
              </p>
            </div>
          </Link>
        ))}
      </Container>
    </main>
  );
}
