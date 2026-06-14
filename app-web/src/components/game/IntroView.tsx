"use client";
import { Mascot } from "@/components/Mascot";
import { Button } from "@/components/ui/Button";
import { getCategory } from "@/lib/categories";
import type { DailyQuestion } from "@/lib/dailySet";

const DIFF_LABEL: Record<string, string> = {
  facil: "Fácil",
  media: "Media",
  dificil: "Difícil",
};

export function IntroView({
  questions,
  onStart,
}: {
  questions: DailyQuestion[];
  onStart: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center">
      <Mascot expression="thinking" size={80} />
      <div>
        <h2 className="text-2xl font-extrabold">Desafío de hoy</h2>
        <p className="mt-1 text-sm text-white/60">
          3 preguntas. Una sola oportunidad cada una. Responde rápido para sumar más.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3">
        {questions.map((q, i) => {
          const cat = getCategory(q.category);
          return (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                style={{ backgroundColor: `${cat.color}22` }}
              >
                {cat.emoji}
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">
                  Pregunta {i + 1} · {cat.label}
                </div>
                <div className="text-xs text-white/50">{DIFF_LABEL[q.slot] ?? q.slot}</div>
              </div>
            </div>
          );
        })}
      </div>

      <Button className="w-full" onClick={onStart}>
        Comenzar
      </Button>
    </div>
  );
}
