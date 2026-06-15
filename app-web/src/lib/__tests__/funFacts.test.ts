import { describe, it, expect } from "vitest";
import { getFactOfDay, FUN_FACTS } from "@/lib/funFacts";

describe("funFacts", () => {
  it("devuelve un dato del listado", () => {
    expect(FUN_FACTS).toContain(getFactOfDay(new Date("2026-06-15")));
  });

  it("es determinista para una misma fecha", () => {
    expect(getFactOfDay(new Date("2026-06-15"))).toBe(getFactOfDay(new Date("2026-06-15")));
  });

  it("cambia entre días consecutivos", () => {
    const a = getFactOfDay(new Date("2026-06-15"));
    const b = getFactOfDay(new Date("2026-06-16"));
    expect(a).not.toBe(b);
  });
});
