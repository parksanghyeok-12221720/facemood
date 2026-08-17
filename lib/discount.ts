// Shared by every on-site countdown — counts down to the next local
// midnight, a real, recurring "today only" deadline, rather than a
// per-session/per-load timer that would quietly reset on every visit.
export function getMsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}
