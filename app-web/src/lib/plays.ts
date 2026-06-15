import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";

export type Play = { score: number; correct_count: number };

export async function getMyPlay(
  userId: string,
  date: string,
  client: SupabaseClient = getSupabaseClient(),
): Promise<Play | null> {
  const { data, error } = await client
    .from("plays")
    .select("score, correct_count")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();
  if (error) throw new Error(`error leyendo play: ${error.message}`);
  return data as Play | null;
}

export async function savePlay(
  userId: string,
  date: string,
  score: number,
  correctCount: number,
  client: SupabaseClient = getSupabaseClient(),
): Promise<void> {
  const { error } = await client.from("plays").insert({
    user_id: userId,
    date,
    score,
    correct_count: correctCount,
  });
  if (error && error.code !== "23505") throw new Error(`error guardando play: ${error.message}`);
}

/** Racha de días consecutivos jugados (vía RPC current_streak). */
export async function getMyStreak(
  userId: string,
  client: SupabaseClient = getSupabaseClient(),
): Promise<number> {
  const { data, error } = await client.rpc("current_streak", { p_user: userId });
  if (error) return 0;
  return (data as number) ?? 0;
}
