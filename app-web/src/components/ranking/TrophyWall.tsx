"use client";
import { useEffect, useState } from "react";
import { getTrophyWall, type TrophyRow } from "@/lib/ranking";

function formatWeek(d: string): string {
  return new Date(`${d}T00:00:00`).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
  });
}

/** Muro de trofeos: campeones de semanas ya cerradas. Se oculta si no hay. */
export function TrophyWall({ groupId }: { groupId: string }) {
  const [rows, setRows] = useState<TrophyRow[] | null>(null);

  useEffect(() => {
    getTrophyWall(groupId)
      .then(setRows)
      .catch(() => setRows([]));
  }, [groupId]);

  if (!rows || rows.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="mb-3 text-lg font-extrabold">🏆 Campeones anteriores</h2>
      <div className="flex flex-col gap-2">
        {rows.map((r) => (
          <div
            key={r.week_start}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
          >
            <span className="text-2xl">👑</span>
            <div className="flex flex-col">
              <span className="text-sm font-bold">{r.display_name}</span>
              <span className="text-[11px] text-white/50">Semana del {formatWeek(r.week_start)}</span>
            </div>
            <span className="ml-auto text-sm font-bold text-violet-light">{r.score} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
