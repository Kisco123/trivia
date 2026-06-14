"use client";

import type { RankRow, Period } from "@/lib/ranking";

interface RankingViewProps {
  rows: RankRow[];
  period: Period;
  onPeriodChange: (p: Period) => void;
}

const TABS: { label: string; value: Period }[] = [
  { label: "Hoy", value: "hoy" },
  { label: "Semana", value: "semana" },
  { label: "Temporada", value: "temporada" },
];

const PODIUM_HEIGHTS = ["h-20", "h-28", "h-16"]; // 2nd, 1st, 3rd
const PODIUM_ORDER = [1, 0, 2]; // visual left-to-right: 2nd, 1st, 3rd

export function RankingView({ rows, period, onPeriodChange }: RankingViewProps) {
  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <div className="flex flex-col gap-6">
      {/* Period tabs */}
      <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onPeriodChange(tab.value)}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
              period === tab.value
                ? "bg-violet-600 text-white shadow"
                : "text-white/60 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="text-4xl">🏆</span>
          <p className="text-sm text-white/60">
            Aún no hay puntajes. ¡Juega para aparecer aquí!
          </p>
        </div>
      ) : (
        <>
          {/* Podium (top 3) */}
          {top3.length > 0 && (
            <div className="flex items-end justify-center gap-3 px-4 pt-4">
              {PODIUM_ORDER.map((rankIndex) => {
                const player = top3[rankIndex];
                if (!player) return <div key={rankIndex} className="flex-1" />;
                const visualPos = PODIUM_ORDER.indexOf(rankIndex);
                const isFirst = rankIndex === 0;
                return (
                  <div
                    key={player.user_id}
                    data-me={player.is_me ? "true" : undefined}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-2xl border pb-3 pt-2 transition ${
                      player.is_me
                        ? "border-violet-500/50 bg-violet-500/20"
                        : "border-white/10 bg-white/[0.04]"
                    } ${isFirst ? "border-yellow-400/30 bg-yellow-400/10" : ""}`}
                  >
                    {isFirst && <span className="text-xl">👑</span>}
                    <span className="text-xs text-white/50">#{rankIndex + 1}</span>
                    <span className="text-sm font-bold text-white leading-tight text-center px-1">
                      {player.display_name}
                    </span>
                    <span className="text-base font-extrabold text-white">
                      {player.score}
                    </span>
                    <span className="text-xs text-orange-400">
                      🔥{player.streak}
                    </span>
                    {/* Podium base */}
                    <div
                      className={`mt-1 w-full rounded-b-xl ${PODIUM_HEIGHTS[visualPos]} ${
                        isFirst
                          ? "bg-yellow-400/20"
                          : "bg-white/[0.06]"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* List (rest, index >= 3) */}
          {rest.length > 0 && (
            <div className="flex flex-col gap-2 px-1">
              {rest.map((player, i) => (
                <div
                  key={player.user_id}
                  data-me={player.is_me ? "true" : undefined}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                    player.is_me
                      ? "border-violet-500/50 bg-violet-500/20"
                      : "border-white/10 bg-white/[0.04]"
                  }`}
                >
                  <span className="w-5 text-center text-sm text-white/40">
                    {i + 4}
                  </span>
                  <span className="flex-1 text-sm font-semibold text-white">
                    {player.display_name}
                  </span>
                  <span className="text-xs text-orange-400">🔥{player.streak}</span>
                  <span className="text-sm font-bold text-white">{player.score}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
