"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getGroupRanking } from "@/lib/ranking";
import type { RankRow, Period } from "@/lib/ranking";
import { RankingView } from "@/components/ranking/RankingView";

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
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/grupos"
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/60 transition hover:text-white"
        >
          ← Volver
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight">Ranking</h1>
        <Link
          href={`/grupos/${id}/chat`}
          className="ml-auto rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/70 transition hover:text-white"
        >
          💬 Chat
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-white/60">
          Cargando…
        </div>
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
