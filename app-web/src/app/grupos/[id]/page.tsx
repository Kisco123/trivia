"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getGroupRanking } from "@/lib/ranking";
import type { RankRow, Period } from "@/lib/ranking";
import { RankingView } from "@/components/ranking/RankingView";
import { Loading } from "@/components/ui/Loading";

export default function GrupoRankingPage() {
  const params = useParams();
  const id = params.id as string;

  const [period, setPeriod] = useState<Period>("semana");
  const [rows, setRows] = useState<RankRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getGroupRanking(id, period)
      .then(setRows)
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "No autorizado o grupo no encontrado"
        );
      })
      .finally(() => setLoading(false));
  }, [id, period]);

  return (
    <main className="flex flex-1 flex-col py-6">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Ranking</h1>
        <Link
          href={`/grupos/${id}/chat`}
          className="ml-auto rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/70 transition hover:text-white"
        >
          💬 Chat
        </Link>
      </div>

      <Link
        href="/jugar"
        className="mb-5 block w-full rounded-2xl bg-gradient-to-br from-violet to-violet-light px-6 py-3 text-center font-semibold text-white shadow-[0_6px_20px_rgba(124,92,255,0.4)] transition hover:brightness-110 active:scale-95"
      >
        🎮 Jugar el desafío de hoy
      </Link>

      {loading ? (
        <Loading />
      ) : error ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      ) : (
        <RankingView rows={rows} period={period} onPeriodChange={setPeriod} />
      )}
    </main>
  );
}
