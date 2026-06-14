import type { Difficulty } from "@/lib/questions";

export type Pickable = {
  id: string;
  difficulty: Difficulty;
  category: string;
};

export type DailySetPick = {
  dayIndex: number;
  easyId: string;
  mediumId: string;
  hardId: string;
};

function take(pool: Pickable[], difficulty: Difficulty, count: number): string[] {
  const available = pool.filter((q) => q.difficulty === difficulty);
  if (available.length < count) {
    throw new Error(
      `stock insuficiente de dificultad ${difficulty}: hay ${available.length}, se piden ${count}`,
    );
  }
  return available.slice(0, count).map((q) => q.id);
}

/** Genera `days` sets, uno por día, sin repetir preguntas mientras haya stock. */
export function selectDailySets(pool: Pickable[], days: number): DailySetPick[] {
  const easy = take(pool, "facil", days);
  const medium = take(pool, "media", days);
  const hard = take(pool, "dificil", days);

  return Array.from({ length: days }, (_, i) => ({
    dayIndex: i,
    easyId: easy[i],
    mediumId: medium[i],
    hardId: hard[i],
  }));
}
