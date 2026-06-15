"use client";
import { useState } from "react";
import { getCategory } from "@/lib/categories";

type PowerUp = "5050" | "pista";

type Props = {
  question: {
    slot: "facil" | "media" | "dificil";
    category: string;
    difficulty: string;
    prompt: string;
    options: string[];
  };
  secondsLeft: number;
  hidden: number[];
  answeredIndex: number | null;
  correctIndex: number | null;
  onAnswer: (index: number) => void;
  // Reservados para cuando los power-ups sean ganables (hoy muestran solo info).
  onFiftyFifty?: () => void;
  onExtraTime?: () => void;
};

const LETTERS = ["A", "B", "C", "D"];

const POWERUP_INFO: Record<PowerUp, { emoji: string; name: string; desc: string }> = {
  "5050": { emoji: "✂️", name: "50/50", desc: "Elimina 2 de las alternativas incorrectas: te quedas con la correcta y una más." },
  pista: { emoji: "💡", name: "Pista", desc: "Te da una ayuda sobre la respuesta sin decírtela directamente." },
};

export function QuestionView({
  question,
  secondsLeft,
  hidden,
  answeredIndex,
  correctIndex,
  onAnswer,
}: Props) {
  const cat = getCategory(question.category);
  const locked = answeredIndex !== null;
  const [info, setInfo] = useState<PowerUp | null>(null);

  function optionClass(i: number): string {
    if (correctIndex === i) return "border-success bg-success/15 text-success";
    if (answeredIndex === i && correctIndex !== null && i !== correctIndex)
      return "border-danger bg-danger/15 text-danger";
    return "border-white/10 bg-white/5 text-white";
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
               style={{ backgroundColor: `${cat.color}22` }}>{cat.emoji}</div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-white/50">Categoría</div>
            <div className="text-sm font-bold">{cat.label}</div>
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-violet text-lg font-bold">
          {secondsLeft}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 text-lg font-semibold">
        {question.prompt}
      </div>

      <div className="flex flex-col gap-3">
        {question.options.map((opt, i) =>
          hidden.includes(i) ? null : (
            <button
              key={i}
              disabled={locked}
              onClick={() => onAnswer(i)}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition hover:brightness-110 disabled:cursor-default disabled:hover:brightness-100 ${optionClass(i)}`}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs font-bold">
                {LETTERS[i]}
              </span>
              {opt}
            </button>
          ),
        )}
      </div>

      {/* Power-ups: hoy muestran su explicación. Se ganan/usan en una versión futura. */}
      <div className="mt-auto flex items-center justify-center gap-3 pt-4">
        <button
          onClick={() => setInfo("5050")}
          aria-label="50/50"
          className="flex h-11 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-lg transition hover:brightness-125"
        >
          ✂️ <span className="text-xs font-semibold text-white/50">0</span>
        </button>
        <button
          onClick={() => setInfo("pista")}
          aria-label="Pista"
          className="flex h-11 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-lg transition hover:brightness-125"
        >
          💡 <span className="text-xs font-semibold text-white/50">0</span>
        </button>
      </div>

      {info && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
          onClick={() => setInfo(null)}
        >
          <div
            className="w-full max-w-[340px] rounded-3xl border border-white/10 bg-bg-elevated p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl">{POWERUP_INFO[info].emoji}</div>
            <h3 className="mt-2 text-lg font-extrabold">{POWERUP_INFO[info].name}</h3>
            <p className="mt-2 text-sm text-white/70">{POWERUP_INFO[info].desc}</p>
            <p className="mt-4 rounded-xl bg-white/5 px-3 py-2 text-xs text-white/50">
              🔒 No los tienes todavía. Pronto podrás ganarlos jugando o viendo un anuncio.
            </p>
            <button
              onClick={() => setInfo(null)}
              className="mt-4 w-full cursor-pointer rounded-2xl bg-gradient-to-br from-violet to-violet-light px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 active:scale-95"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
