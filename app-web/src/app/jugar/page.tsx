import { getDailySet } from "@/lib/dailySet";
import { GameClient } from "@/components/game/GameClient";

export const dynamic = "force-dynamic";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function JugarPage() {
  const date = today();
  let questions;
  try {
    questions = await getDailySet(date);
  } catch {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
        <p className="text-lg font-semibold">No hay desafío para hoy todavía 🦉</p>
        <p className="text-sm text-white/60">Vuelve más tarde.</p>
      </main>
    );
  }
  const questionIds = questions.map((q) => q.id);
  return (
    <main className="flex flex-1 flex-col py-6">
      <GameClient date={date} questions={questions} questionIds={questionIds} />
    </main>
  );
}
