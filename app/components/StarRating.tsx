export default function StarRating({
  filled,
  color = "var(--match-rose)",
  trackColor = "var(--match-beige)",
}: {
  filled: number;
  color?: string;
  trackColor?: string;
}) {
  const clamped = Math.max(0, Math.min(5, Math.round(filled)));
  return (
    <span style={{ color }}>
      {"★".repeat(clamped)}
      <span style={{ color: trackColor }}>{"★".repeat(5 - clamped)}</span>
    </span>
  );
}
