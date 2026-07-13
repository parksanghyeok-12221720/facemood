"use client";

import { useState } from "react";

type ToneKey =
  | "p"
  | "lt"
  | "b"
  | "ltg"
  | "sf"
  | "s"
  | "g"
  | "d"
  | "v"
  | "dkg"
  | "dk"
  | "dp";

type Season = "spring" | "summer" | "autumn" | "winter";

type ToneDef = {
  key: ToneKey;
  label: string;
  saturation: number;
  lightness: number;
};

// Row-major order matches the 3-column x 4-row PCCS tone grid.
const tones: ToneDef[] = [
  { key: "p", label: "페일", saturation: 35, lightness: 88 },
  { key: "lt", label: "라이트", saturation: 55, lightness: 80 },
  { key: "b", label: "브라이트", saturation: 75, lightness: 60 },
  { key: "ltg", label: "라이트 그레이시", saturation: 20, lightness: 75 },
  { key: "sf", label: "소프트", saturation: 45, lightness: 65 },
  { key: "s", label: "스트롱", saturation: 70, lightness: 45 },
  { key: "g", label: "그레이시", saturation: 20, lightness: 55 },
  { key: "d", label: "덜", saturation: 40, lightness: 45 },
  { key: "v", label: "비비드", saturation: 90, lightness: 50 },
  { key: "dkg", label: "다크 그레이시", saturation: 15, lightness: 30 },
  { key: "dk", label: "다크", saturation: 45, lightness: 25 },
  { key: "dp", label: "딥", saturation: 70, lightness: 30 },
];

const HUES = [0, 45, 90, 135, 180, 225, 270, 315];

const seasons: { key: Season; label: string }[] = [
  { key: "spring", label: "봄" },
  { key: "summer", label: "여름" },
  { key: "autumn", label: "가을" },
  { key: "winter", label: "겨울" },
];

const seasonGroups: Record<
  Season,
  { label: string; color: string; tones: ToneKey[] }[]
> = {
  spring: [
    { label: "봄 라이트", color: "#ec4899", tones: ["p", "lt"] },
    { label: "봄 브라이트", color: "#ec4899", tones: ["b", "s", "v"] },
  ],
  summer: [
    { label: "여름 브라이트", color: "#3b82f6", tones: ["lt", "b"] },
    {
      label: "여름 뮤트",
      color: "#3b82f6",
      tones: ["ltg", "sf", "g", "d"],
    },
  ],
  autumn: [
    {
      label: "가을 뮤트",
      color: "#b45309",
      tones: ["ltg", "sf", "g", "d"],
    },
    { label: "가을 스트롱", color: "#b45309", tones: ["s"] },
    { label: "가을 딥", color: "#b45309", tones: ["dkg", "dk", "dp"] },
  ],
  winter: [
    { label: "겨울 브라이트", color: "#7c3aed", tones: ["s", "v"] },
    { label: "겨울 딥", color: "#7c3aed", tones: ["dkg", "dk", "dp"] },
  ],
};

function dotPosition(index: number, total: number, radius: number) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  return {
    left: `calc(50% + ${radius * Math.cos(angle)}px)`,
    top: `calc(50% + ${radius * Math.sin(angle)}px)`,
  };
}

function ToneFlower({
  tone,
  highlight,
}: {
  tone: ToneDef;
  highlight?: { label: string; color: string };
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative h-16 w-16 rounded-full transition-shadow"
        style={
          highlight
            ? { boxShadow: `0 0 0 3px ${highlight.color}` }
            : undefined
        }
      >
        {HUES.map((hue, i) => {
          const pos = dotPosition(i, HUES.length, 24);
          return (
            <span
              key={hue}
              className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                ...pos,
                backgroundColor: `hsl(${hue}, ${tone.saturation}%, ${tone.lightness}%)`,
              }}
            />
          );
        })}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-bold text-black">
            {tone.key}
          </span>
        </div>
      </div>
      <p className="mt-1 text-center text-[10px] leading-tight text-gray-500">
        {tone.label}
      </p>
      {highlight && (
        <span
          className="mt-1 rounded-full px-2 py-0.5 text-center text-[9px] font-semibold text-white"
          style={{ backgroundColor: highlight.color }}
        >
          {highlight.label}
        </span>
      )}
    </div>
  );
}

export default function PccsColorChart() {
  const [season, setSeason] = useState<Season>("spring");
  const groups = seasonGroups[season];

  const highlightMap: Record<string, { label: string; color: string }> = {};
  groups.forEach((group) => {
    group.tones.forEach((toneKey) => {
      highlightMap[toneKey] = { label: group.label, color: group.color };
    });
  });

  return (
    <div className="rounded-2xl border border-violet-100 bg-white p-5">
      <div className="flex gap-1.5">
        {seasons.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSeason(s.key)}
            className={`flex-1 rounded-full px-2 py-1.5 text-xs font-medium transition-colors ${
              season === s.key
                ? "bg-violet-100 text-violet-700"
                : "bg-gray-50 text-gray-400"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-[10px] text-gray-400">
        ※버튼을 클릭하면 계절별 정보를 확인할 수 있어요
      </p>

      <p className="mt-5 text-center text-sm font-bold text-black">
        PCCS 색체계
      </p>

      <div className="mt-5 flex gap-2">
        <div className="flex flex-col items-center justify-between py-1 text-[9px] text-gray-400">
          <span>▲</span>
          <span>명도</span>
          <span>▼</span>
        </div>
        <div className="grid flex-1 grid-cols-3 gap-x-2 gap-y-5 justify-items-center">
          {tones.map((tone) => (
            <ToneFlower
              key={tone.key}
              tone={tone}
              highlight={highlightMap[tone.key]}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between pl-6 text-[9px] text-gray-400">
        <span>◀ 낮음</span>
        <span>채도</span>
        <span>높음 ▶</span>
      </div>
    </div>
  );
}
