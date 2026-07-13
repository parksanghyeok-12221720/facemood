import { ReactNode } from "react";

type Tone = "neutral" | "accent";

const toneClasses: Record<Tone, string> = {
  neutral: "border-white/10 bg-white/[0.03]",
  accent: "border-violet-400/25 bg-violet-500/[0.07]",
};

export default function Card({
  children,
  className = "",
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  tone?: Tone;
}) {
  return (
    <div className={`rounded-2xl border p-6 ${toneClasses[tone]} ${className}`}>
      {children}
    </div>
  );
}
