import { describe, it, expect, vi } from "vitest";
import { savePlay, getMyPlay } from "@/lib/plays";

describe("plays", () => {
  it("getMyPlay devuelve el puntaje si existe", async () => {
    const client = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: { score: 315, correct_count: 3 }, error: null }),
            }),
          }),
        }),
      }),
    } as never;
    expect(await getMyPlay("u1", "2026-06-14", client)).toEqual({ score: 315, correct_count: 3 });
  });

  it("savePlay lanza si hay error distinto de conflicto", async () => {
    const client = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: { code: "XXX", message: "boom" } }),
      }),
    } as never;
    await expect(savePlay("u1", "2026-06-14", 100, 1, client)).rejects.toThrow(/boom/);
  });

  it("savePlay ignora el conflicto (ya jugó)", async () => {
    const client = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: { code: "23505", message: "dup" } }),
      }),
    } as never;
    await expect(savePlay("u1", "2026-06-14", 100, 1, client)).resolves.toBeUndefined();
  });
});
