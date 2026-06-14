import { describe, it, expect, vi } from "vitest";
import { getDailySet } from "@/lib/dailySet";

function fakeClient(rows: unknown[]) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: rows, error: null }),
      }),
    }),
  } as never;
}

const rows = [
  { date: "2026-06-14", slot: "media", category: "ciencia", difficulty: "media", prompt: "P2", options: ["a","b","c","d"] },
  { date: "2026-06-14", slot: "facil", category: "historia", difficulty: "facil", prompt: "P1", options: ["a","b","c","d"] },
  { date: "2026-06-14", slot: "dificil", category: "arte", difficulty: "dificil", prompt: "P3", options: ["a","b","c","d"] },
];

describe("getDailySet", () => {
  it("devuelve 3 preguntas ordenadas fácil→media→difícil", async () => {
    const set = await getDailySet("2026-06-14", fakeClient(rows));
    expect(set.map((q) => q.slot)).toEqual(["facil", "media", "dificil"]);
    expect(set[0].prompt).toBe("P1");
  });
  it("lanza si no hay set para la fecha", async () => {
    await expect(getDailySet("2026-01-01", fakeClient([]))).rejects.toThrow(/sin set/);
  });
});
