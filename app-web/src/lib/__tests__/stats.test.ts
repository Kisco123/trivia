import { describe, it, expect } from "vitest";
import { computeStats } from "@/lib/stats";

describe("computeStats", () => {
  it("vacío da todo en cero", () => {
    expect(computeStats([])).toEqual({ totalPoints: 0, daysPlayed: 0, average: 0, bestStreak: 0 });
  });
  it("suma puntos, cuenta días y promedia", () => {
    const s = computeStats([
      { date: "2026-06-10", score: 100 },
      { date: "2026-06-11", score: 200 },
    ]);
    expect(s.totalPoints).toBe(300);
    expect(s.daysPlayed).toBe(2);
    expect(s.average).toBe(150);
  });
  it("calcula la mejor racha de días consecutivos", () => {
    const s = computeStats([
      { date: "2026-06-01", score: 10 },
      { date: "2026-06-02", score: 10 },
      { date: "2026-06-03", score: 10 },
      { date: "2026-06-05", score: 10 },
      { date: "2026-06-06", score: 10 },
    ]);
    expect(s.bestStreak).toBe(3);
  });
});
