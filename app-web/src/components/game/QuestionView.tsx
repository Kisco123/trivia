"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getCategory } from "@/lib/categories";
import { Mascot, type MascotExpression } from "@/components/Mascot";

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
  onFiftyFifty?: () => void;
  onExtraTime?: () => void;
};

const LETTERS = ["A", "B", "C", "D"];

const POWERUP_INFO: Record<PowerUp, { emoji: string; name: string; desc: string }> = {
  "5050": { emoji: "✂️", name: "50/50", desc: "Elimina 2 de las alternativas incorrectas: te quedas con la correcta y una más." },
  pista: { emoji: "💡", name: "Pista", desc: "Te da una ayuda sobre la respuesta sin decírtela directamente." },
};

function reaction(answeredIndex: number | null, correctIndex: number | null): { expr: MascotExpression; text: string } {
  if (answeredIndex === null) return { expr: "thinking", text: "¿Cuál será?" };
  if (correctIndex !== null && answeredIndex === correctIndex) return { expr: "happy", text: "¡Correcto!" };
  if (answeredIndex === -1) return { expr: "sad", text: "¡Se acabó el tiempo!" };
  return { expr: "sad", text: "¡Casi!" };
}

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
  const { expr, text } = reaction(answeredIndex, correctIndex);

  // Confeti al acertar (solo si hay canvas 2D real; en tests/jsdom se omite).
  useEffect(() => {
    if (correctIndex === null || answeredIndex !== correctIndex) return;
    const hasCanvas =
      typeof document !== "undefined" &&
      !!document.createElement("canvas").getContext?.("2d");
    if (!hasCanvas) return;
    void import("canvas-confetti")
      .then((m) => {
        try {
          m.default({ particleCount: 90, spread: 75, origin: { y: 0.65 }, scalar: 0.9 });
        } catch {
          /* no-op */
        }
      })
      .catch(() => {});
  }, [correctIndex, answeredIndex]);

  function optionClass(i: number): string {
    if (correctIndex === i) return "border-success bg-success/15 text-success";
    if (answeredIndex === i && correctIndex !== null && i !== correctIndex)
      return "border-danger bg-danger/15 text-danger";
    return "border-white/10 bg-white/5 text-white";
  }

  function optionAnimate(i: number) {
    if (correctIndex === null) return {};
    if (i === correctIndex) return { scale: [1, 1.05, 1] };
    if (i === answeredIndex) return { x: [0, -8, 8, -6, 6, 0] };
    return {};
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
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

      {/* Mascota reaccionando */}
      <div className="flex items-center gap-3">
        <motion.div
          key={expr}
          initial={{ scale: 0.8, rotate: -6 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <Mascot expression={expr} size={48} />
        </motion.div>
        <div className="rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/70">
          {text}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 text-lg font-semibold"
      >
        {question.prompt}
      </motion.div>

      <div className="flex flex-col gap-3">
        {question.options.map((opt, i) =>
          hidden.includes(i) ? null : (
            <motion.button
              key={i}
              disabled={locked}
              onClick={() => onAnswer(i)}
              animate={optionAnimate(i)}
              transition={{ duration: 0.4 }}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition hover:brightness-110 disabled:cursor-default disabled:hover:brightness-100 ${optionClass(i)}`}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs font-bold">
                {LETTERS[i]}
              </span>
              {opt}
            </motion.button>
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
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
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
          </motion.div>
        </div>
      )}
    </div>
  );
}
