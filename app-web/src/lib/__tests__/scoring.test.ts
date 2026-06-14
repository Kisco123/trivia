import { describe, it, expect } from "vitest";
import { computeScore, TIME_LIMIT_MS } from "@/lib/scoring";

describe("computeScore", () => {
  it("respuesta incorrecta vale 0", () => {
    expect(computeScore("facil", false, 0, TIME_LIMIT_MS)).toBe(0);
  });
  it("acierto instantáneo da base + bonus máximo", () => {
    expect(computeScore("dificil", true, 0, TIME_LIMIT_MS)).toBe(500);
  });
  it("acierto justo al límite da solo la base", () => {
    expect(computeScore("media", true, TIME_LIMIT_MS, TIME_LIMIT_MS)).toBe(200);
  });
  it("acierto a mitad de tiempo da base + medio bonus", () => {
    expect(computeScore("facil", true, TIME_LIMIT_MS / 2, TIME_LIMIT_MS)).toBe(115);
  });
  it("nunca da menos que la base si acierta (tiempo excedido)", () => {
    expect(computeScore("facil", true, TIME_LIMIT_MS * 2, TIME_LIMIT_MS)).toBe(100);
  });
});
