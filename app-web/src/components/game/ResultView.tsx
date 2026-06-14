"use client";
import Link from "next/link";
import { Mascot } from "@/components/Mascot";
import { Card } from "@/components/ui/Card";

export function ResultView({ total, breakdown }: {
  total: number;
  breakdown: { prompt: string; correct: boolean; points: number }[];
}) {
  const aciertos = breakdown.filter((b) => b.correct).length;
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center">
      <Mascot expression={aciertos >= 2 ? "victory" : "neutral"} size={84} />
      <div>
        <div className="text-sm text-white/60">Tu puntaje de hoy</div>
        <div className="text-5xl font-extrabold text-violet-light">{total}</div>
        {breakdown.length > 0 && (
          <div className="mt-1 text-sm text-white/60">{aciertos} de {breakdown.length} correctas</div>
        )}
      </div>
      {breakdown.length > 0 && (
        <Card className="w-full text-left">
          {breakdown.map((b, i) => (
            <div key={i} className="flex items-center justify-between border-b border-white/5 py-2 last:border-0">
              <span className="mr-2 flex-1 truncate text-sm text-white/80">{b.prompt}</span>
              <span className={`text-sm font-bold ${b.correct ? "text-success" : "text-danger"}`}>
                {b.correct ? `+${b.points}` : "0"}
              </span>
            </div>
          ))}
        </Card>
      )}
      <p className="text-sm text-white/50">Vuelve mañana para el próximo desafío 🦉</p>

      <Link
        href="/"
        className="w-full cursor-pointer rounded-2xl bg-gradient-to-br from-violet to-violet-light px-6 py-3 text-center font-semibold text-white shadow-[0_6px_20px_rgba(124,92,255,0.4)] transition hover:brightness-110 active:scale-95"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
