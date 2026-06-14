export type Category = {
  id: string;
  label: string;
  emoji: string;
  color: string;
};

export const CATEGORIES: Category[] = [
  { id: "general", label: "Cultura general", emoji: "🧠", color: "#7c5cff" },
  { id: "historia", label: "Historia", emoji: "🏛️", color: "#f59e0b" },
  { id: "ciencia", label: "Ciencia", emoji: "🔬", color: "#22d3a4" },
  { id: "geografia", label: "Geografía", emoji: "🌎", color: "#4ade80" },
  { id: "arte", label: "Arte y Literatura", emoji: "🎨", color: "#ff3d8b" },
  { id: "cine", label: "Cine y TV", emoji: "🎬", color: "#ff8a4c" },
  { id: "musica", label: "Música", emoji: "🎵", color: "#b794ff" },
  { id: "deporte", label: "Deporte", emoji: "⚽", color: "#38bdf8" },
];

const byId = new Map(CATEGORIES.map((c) => [c.id, c]));

export function getCategory(id: string): Category {
  return byId.get(id) ?? CATEGORIES[0];
}
