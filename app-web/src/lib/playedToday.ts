const KEY = (date: string) => `trivia:played:${date}`;

export function hasPlayed(date: string): boolean {
  return localStorage.getItem(KEY(date)) !== null;
}

export function markPlayed(date: string, score: number): void {
  localStorage.setItem(KEY(date), String(score));
}

export function getScore(date: string): number | null {
  const v = localStorage.getItem(KEY(date));
  return v === null ? null : Number(v);
}
