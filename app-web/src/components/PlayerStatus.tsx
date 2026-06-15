"use client";
import { useEffect, useState } from "react";
import { ensureSession, getCurrentUserId } from "@/lib/auth";
import { getMyStreak, getMyPlay } from "@/lib/plays";
import { todayString } from "@/lib/today";

/** Muestra la racha del jugador y su estado de hoy en la portada. */
export function PlayerStatus() {
  const [streak, setStreak] = useState<number | null>(null);
  const [todayScore, setTodayScore] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureSession();
        const uid = await getCurrentUserId();
        if (!uid || cancelled) return;
        const [s, play] = await Promise.all([getMyStreak(uid), getMyPlay(uid, todayString())]);
        if (cancelled) return;
        setStreak(s);
        setTodayScore(play?.score ?? null);
      } catch {
        // sin sesión: no mostramos nada
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (streak === null) return null;

  return (
    <div className="flex w-full items-center justify-center gap-3">
      <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange to-magenta px-3 py-1.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(255,61,139,0.35)]">
        🔥 {streak} {streak === 1 ? "día" : "días"}
      </div>
      <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm text-white/70">
        {todayScore !== null ? `Hoy: ${todayScore} pts` : "Aún no juegas hoy"}
      </div>
    </div>
  );
}
