export type MascotExpression =
  | "neutral"
  | "happy"
  | "surprised"
  | "sad"
  | "victory"
  | "thinking";

const GLYPH: Record<MascotExpression, string> = {
  neutral: "🦉",
  happy: "😄",
  surprised: "😮",
  sad: "😔",
  victory: "🏆",
  thinking: "🤔",
};

export function Mascot({
  expression = "neutral",
  size = 56,
}: {
  expression?: MascotExpression;
  size?: number;
}) {
  return (
    <div
      role="img"
      aria-label="Búho mascota"
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-violet to-violet-light shadow-[0_8px_24px_rgba(124,92,255,0.5)]"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {GLYPH[expression]}
    </div>
  );
}
