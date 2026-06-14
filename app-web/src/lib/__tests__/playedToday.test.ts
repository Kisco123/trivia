import { describe, it, expect, beforeEach } from "vitest";
import { hasPlayed, markPlayed, getScore } from "@/lib/playedToday";

describe("playedToday", () => {
  beforeEach(() => localStorage.clear());

  it("no ha jugado por defecto", () => {
    expect(hasPlayed("2026-06-14")).toBe(false);
  });
  it("queda marcado tras markPlayed", () => {
    markPlayed("2026-06-14", 315);
    expect(hasPlayed("2026-06-14")).toBe(true);
  });
  it("el marcado es por fecha", () => {
    markPlayed("2026-06-14", 315);
    expect(hasPlayed("2026-06-15")).toBe(false);
  });
  it("guarda el puntaje del día", () => {
    markPlayed("2026-06-14", 315);
    expect(getScore("2026-06-14")).toBe(315);
  });
});
