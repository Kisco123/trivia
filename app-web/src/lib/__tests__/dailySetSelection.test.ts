import { describe, it, expect } from "vitest";
import { selectDailySets, type Pickable } from "@/lib/dailySetSelection";

function make(n: number, difficulty: string, cat = "general"): Pickable[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `${difficulty}-${i}`,
    difficulty: difficulty as Pickable["difficulty"],
    category: cat,
  }));
}

const pool: Pickable[] = [
  ...make(3, "facil"),
  ...make(3, "media"),
  ...make(3, "dificil"),
];

describe("selectDailySets", () => {
  it("genera N sets con una pregunta de cada dificultad", () => {
    const sets = selectDailySets(pool, 3);
    expect(sets).toHaveLength(3);
    for (const s of sets) {
      expect(s.easyId).toMatch(/^facil-/);
      expect(s.mediumId).toMatch(/^media-/);
      expect(s.hardId).toMatch(/^dificil-/);
    }
  });
  it("no repite preguntas entre sets mientras haya stock", () => {
    const sets = selectDailySets(pool, 3);
    const easies = sets.map((s) => s.easyId);
    expect(new Set(easies).size).toBe(3);
  });
  it("lanza error si no alcanza el stock para N días", () => {
    expect(() => selectDailySets(pool, 4)).toThrow(/stock insuficiente/);
  });
});
