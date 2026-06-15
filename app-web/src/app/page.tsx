import Link from "next/link";
import { Mascot } from "@/components/Mascot";
import { Card } from "@/components/ui/Card";
import { PlayCTA } from "@/components/PlayCTA";
import { PlayerStatus } from "@/components/PlayerStatus";
import { CATEGORIES } from "@/lib/categories";
import { getFactOfDay } from "@/lib/funFacts";

export default function Home() {
  const fact = getFactOfDay();
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 py-10 text-center">
      <Mascot expression="happy" size={88} />

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Trivia</h1>
        <p className="mt-2 text-white/60">
          Una trivia al día. Compite con tu grupo.
        </p>
      </div>

      <PlayerStatus />

      <Card className="w-full">
        <p className="mb-4 text-sm text-white/70">Categorías de hoy</p>
        <div className="grid grid-cols-4 gap-3">
          {CATEGORIES.slice(0, 8).map((c) => (
            <div key={c.id} className="flex flex-col items-center gap-1">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl"
                style={{ backgroundColor: `${c.color}22` }}
              >
                {c.emoji}
              </div>
              <span className="text-[10px] text-white/50">{c.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <PlayCTA />

      <Link
        href="/grupos"
        className="flex w-full items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.06] px-5 py-4 text-left transition hover:bg-white/[0.10] active:scale-95"
      >
        <span className="text-2xl">👥</span>
        <span className="flex flex-col">
          <span className="text-sm font-semibold">Grupos</span>
          <span className="text-[11px] text-white/50">Rankings y chat con tu grupo</span>
        </span>
        <span className="ml-auto text-lg text-white/30">›</span>
      </Link>

      <Link
        href="/perfil"
        className="flex w-full items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.06] px-5 py-4 text-left transition hover:bg-white/[0.10] active:scale-95"
      >
        <span className="text-2xl">📊</span>
        <span className="flex flex-col">
          <span className="text-sm font-semibold">Mi perfil</span>
          <span className="text-[11px] text-white/50">Tus estadísticas y rachas</span>
        </span>
        <span className="ml-auto text-lg text-white/30">›</span>
      </Link>

      <div className="w-full rounded-2xl border border-orange/20 bg-gradient-to-br from-orange/[0.10] to-magenta/[0.06] p-4 text-left">
        <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-orange">
          💡 Dato curioso del día
        </div>
        <p className="text-sm text-white/80">{fact}</p>
      </div>
    </main>
  );
}
