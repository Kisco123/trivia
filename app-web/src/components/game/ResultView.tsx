"use client";
import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import { Card } from "@/components/ui/Card";

export function ResultView({ total, breakdown, groupHref = "/grupos" }: {
  total: number;
  breakdown: { prompt: string; correct: boolean; points: number }[];
  groupHref?: string;
}) {
  const aciertos = breakdown.filter((b) => b.correct).length;
  const hasGroup = groupHref.startsWith("/grupos/");

  // Confeti al ganar (solo si hay canvas 2D real; en tests/jsdom se omite).
  useEffect(() => {
    if (aciertos < 2) return;
    const hasCanvas =
      typeof document !== "undefined" &&
      !!document.createElement("canvas").getContext?.("2d");
    if (!hasCanvas) return;
    void import("canvas-confetti")
      .then((m) => {
        try {
          m.default({ particleCount: 120, spread: 90, origin: { y: 0.5 }, scalar: 1 });
        } catch {
          /* no-op */
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center">
      <Mascot expression={aciertos >= 2 ? "victory" : "neutral"} size={84} />
      <div>
        <div className="text-sm text-white/60">Tu puntaje de hoy</div>
        <motion.div
          className="text-5xl font-extrabold text-violet-light"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 14 }}
        >
          {total}
        </motion.div>
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
      <div className="w-full rounded-2xl border border-orange/25 bg-gradient-to-br from-orange/[0.12] to-magenta/[0.07] px-4 py-3 text-center text-sm font-semibold text-orange">
        🦉 Vuelve mañana para el próximo desafío
      </div>

      <Link
        href={groupHref}
        className="w-full cursor-pointer rounded-2xl bg-gradient-to-br from-violet to-violet-light px-6 py-3 text-center font-semibold text-white shadow-[0_6px_20px_rgba(124,92,255,0.4)] transition hover:brightness-110 active:scale-95"
      >
        {hasGroup ? "🏆 Ver ranking y chat" : "👥 Crea tu grupo para competir"}
      </Link>

      <Link href="/" className="text-sm text-white/50 transition hover:text-white/80">
        Volver al inicio
      </Link>
    </div>
  );
}
