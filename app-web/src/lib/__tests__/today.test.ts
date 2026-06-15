import { describe, it, expect } from "vitest";
import { todayString } from "@/lib/today";

describe("todayString", () => {
  it("devuelve formato YYYY-MM-DD", () => {
    expect(todayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("usa horario de Chile (UTC-4 en junio)", () => {
    // 2026-06-15 02:00 UTC = 2026-06-14 22:00 en Chile → la fecha local es el 14.
    expect(todayString(new Date("2026-06-15T02:00:00Z"))).toBe("2026-06-14");
  });
});
