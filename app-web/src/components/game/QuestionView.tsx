"use client";
import { getCategory } from "@/lib/categories";

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
  onFiftyFifty: () => void;
  onExtraTime: () => void;
};

const LETTERS = ["A", "B", "C", "D"];

export function QuestionView({
  question, secondsLeft, hidden, answeredIndex, correctIndex,
  onAnswer, onFiftyFifty, onExtraTime,
}: Props) {
  const cat = getCategory(question.category);
  const locked = answeredIndex !== null;

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

      <div className="mt-auto flex justify-center gap-3 pt-4">
        <button onClick={onFiftyFifty} disabled={locked} title="50/50: elimina 2 incorrectas"
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg transition hover:brightness-125 disabled:cursor-default disabled:opacity-40">✂️</button>
        <button onClick={onExtraTime} disabled={locked} title="Tiempo extra: +5 s"
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg transition hover:brightness-125 disabled:cursor-default disabled:opacity-40">⏱️</button>
      </div>
    </div>
  );
}
