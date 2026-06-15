import type { Difficulty } from "@/lib/questions";

// Tiempo por pregunta. Corto a propósito: dificulta buscar la respuesta en internet.
export const TIME_LIMIT_MS = 12_000;

const BASE: Record<Difficulty, number> = { facil: 100, media: 200, dificil: 400 };
const MAX_BONUS: Record<Difficulty, number> = { facil: 30, media: 60, dificil: 100 };

export function computeScore(
  difficulty: Difficulty,
  correct: boolean,
  elapsedMs: number,
  limitMs: number,
): number {
  if (!correct) return 0;
  const ratio = Math.max(0, 1 - elapsedMs / limitMs);
  return BASE[difficulty] + Math.round(MAX_BONUS[difficulty] * ratio);
}
