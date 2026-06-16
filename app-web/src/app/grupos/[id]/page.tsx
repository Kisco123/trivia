"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getGroupRanking } from "@/lib/ranking";
import type { RankRow, Period } from "@/lib/ranking";
import { RankingView } from "@/components/ranking/RankingView";
import { TrophyWall } from "@/components/ranking/TrophyWall";
import { GroupChat } from "@/components/chat/GroupChat";
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
      <h1 className="mb-4 text-2xl font-extrabold tracking-tight">Ranking</h1>

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
        <>
          <RankingView rows={rows} period={period} onPeriodChange={setPeriod} />
          <TrophyWall groupId={id} />

          <div className="mt-8">
            <h2 className="mb-3 text-lg font-extrabold">💬 Chat del grupo</h2>
            <div className="flex h-[420px] flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-3">
              <GroupChat groupId={id} />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
