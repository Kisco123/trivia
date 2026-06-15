"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ensureSession, getCurrentUserId } from "@/lib/auth";
import { getMyPlays, getMyStreak } from "@/lib/plays";
import { computeStats, type Stats } from "@/lib/stats";
import { Mascot } from "@/components/Mascot";
import { Loading } from "@/components/ui/Loading";

const STAT_CARDS = [
  { emoji: "🔥", label: "Racha actual", key: "streak" as const },
  { emoji: "🏆", label: "Mejor racha", key: "bestStreak" as const },
  { emoji: "🎯", label: "Puntos totales", key: "totalPoints" as const },
  { emoji: "📅", label: "Días jugados", key: "daysPlayed" as const },
  { emoji: "📊", label: "Promedio por día", key: "average" as const },
];

type StatKey = (typeof STAT_CARDS)[number]["key"];

type FullStats = Stats & { streak: number };

export default function PerfilPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        await ensureSession();
        const uid = await getCurrentUserId();
        if (!uid) {
          setLoading(false);
          return;
        }
        const [plays, s] = await Promise.all([getMyPlays(uid), getMyStreak(uid)]);
        setStats(computeStats(plays));
        setStreak(s);
      } catch {
        // silently degrade
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fullStats: FullStats | null = stats ? { ...stats, streak } : null;

  return (
    <main className="flex flex-1 flex-col py-6 gap-6">
      <h1 className="text-2xl font-extrabold">Mi perfil</h1>

      {loading ? (
        <Loading />
      ) : stats === null || stats.daysPlayed === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <Mascot expression="neutral" size={72} />
          <p className="text-sm text-white/60 max-w-xs">
            Aún no has jugado ningún desafío. ¡Juega el de hoy y vuelve a ver tus estadísticas!
          </p>
          <Link
            href="/jugar"
            className="rounded-2xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 active:scale-95"
          >
            Jugar ahora
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {STAT_CARDS.map(({ emoji, label, key }) => (
            <div
              key={key}
              className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/[0.06] p-4"
            >
              <span className="text-lg">{emoji}</span>
              <span className="text-3xl font-extrabold text-violet-400">
                {fullStats![key as StatKey]}
              </span>
              <span className="text-xs text-white/60">{label}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
