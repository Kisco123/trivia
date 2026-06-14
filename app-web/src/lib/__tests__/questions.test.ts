import { describe, it, expect } from "vitest";
import { parseQuestion } from "@/lib/questions";

const valid = {
  category: "historia",
  difficulty: "facil",
  prompt: "¿En qué año cayó el muro de Berlín?",
  options: ["1987", "1989", "1991", "1985"],
  correctIndex: 1,
  source: "opentdb",
};

describe("parseQuestion", () => {
  it("acepta una pregunta válida", () => {
    expect(parseQuestion(valid)).toMatchObject({ difficulty: "facil", correctIndex: 1 });
  });
  it("rechaza si no hay exactamente 4 opciones", () => {
    expect(() => parseQuestion({ ...valid, options: ["a", "b", "c"] })).toThrow(/4 opciones/);
  });
  it("rechaza correctIndex fuera de rango", () => {
    expect(() => parseQuestion({ ...valid, correctIndex: 5 })).toThrow(/correctIndex/);
  });
  it("rechaza dificultad inválida", () => {
    expect(() => parseQuestion({ ...valid, difficulty: "imposible" })).toThrow(/dificultad/);
  });
});
