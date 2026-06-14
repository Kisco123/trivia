export type Difficulty = "facil" | "media" | "dificil";

export type Question = {
  category: string;
  difficulty: Difficulty;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  source?: string;
};

const DIFFICULTIES: Difficulty[] = ["facil", "media", "dificil"];

export function parseQuestion(raw: unknown): Question {
  const o = raw as Record<string, unknown>;

  if (!DIFFICULTIES.includes(o.difficulty as Difficulty)) {
    throw new Error(`dificultad inválida: ${String(o.difficulty)}`);
  }
  if (!Array.isArray(o.options) || o.options.length !== 4) {
    throw new Error("se requieren exactamente 4 opciones");
  }
  const idx = o.correctIndex;
  if (typeof idx !== "number" || idx < 0 || idx > 3) {
    throw new Error(`correctIndex fuera de rango: ${String(idx)}`);
  }
  if (typeof o.prompt !== "string" || o.prompt.trim() === "") {
    throw new Error("prompt vacío");
  }
  if (typeof o.category !== "string" || o.category.trim() === "") {
    throw new Error("category vacía");
  }

  return {
    category: o.category as string,
    difficulty: o.difficulty as Difficulty,
    prompt: o.prompt as string,
    options: o.options as [string, string, string, string],
    correctIndex: idx as 0 | 1 | 2 | 3,
    source: typeof o.source === "string" ? o.source : undefined,
  };
}
