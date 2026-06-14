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
