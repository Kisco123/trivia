export type PlayRow = { date: string; score: number };
export type Stats = { totalPoints: number; daysPlayed: number; average: number; bestStreak: number };

function longestConsecutive(dateStrs: string[]): number {
  const days = [...new Set(dateStrs)]
    .map((d) => Date.parse(`${d}T00:00:00Z`) / 86_400_000)
    .sort((a, b) => a - b);
  if (days.length === 0) return 0;
  let best = 1;
  let cur = 1;
  for (let i = 1; i < days.length; i++) {
    if (days[i] === days[i - 1] + 1) cur++;
    else if (days[i] !== days[i - 1]) cur = 1;
    best = Math.max(best, cur);
  }
  return best;
}

export function computeStats(plays: PlayRow[]): Stats {
  const daysPlayed = plays.length;
  const totalPoints = plays.reduce((s, p) => s + p.score, 0);
  const average = daysPlayed === 0 ? 0 : Math.round(totalPoints / daysPlayed);
  const bestStreak = longestConsecutive(plays.map((p) => p.date));
  return { totalPoints, daysPlayed, average, bestStreak };
}
