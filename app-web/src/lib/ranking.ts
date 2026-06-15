import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";

export type Period = "hoy" | "semana" | "temporada";
export type RankRow = {
  user_id: string;
  display_name: string;
  score: number;
  days_played: number;
  streak: number;
  is_me: boolean;
};

export async function getGroupRanking(
  groupId: string,
  period: Period,
  client: SupabaseClient = getSupabaseClient(),
): Promise<RankRow[]> {
  const { data, error } = await client.rpc("group_ranking", {
    p_group: groupId,
    p_period: period,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as RankRow[];
}

export type TrophyRow = { week_start: string; display_name: string; score: number };

/** Campeones de semanas ya cerradas del grupo (muro de trofeos). */
export async function getTrophyWall(
  groupId: string,
  client: SupabaseClient = getSupabaseClient(),
): Promise<TrophyRow[]> {
  const { data, error } = await client.rpc("group_trophy_wall", { p_group: groupId });
  if (error) throw new Error(error.message);
  return (data ?? []) as TrophyRow[];
}
