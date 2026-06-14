import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";

export type DailyQuestion = {
  date: string;
  slot: "facil" | "media" | "dificil";
  category: string;
  difficulty: string;
  prompt: string;
  options: string[];
};

const ORDER = { facil: 0, media: 1, dificil: 2 } as const;

export async function getDailySet(
  date: string,
  client: SupabaseClient = getSupabaseClient(),
): Promise<DailyQuestion[]> {
  const { data, error } = await client
    .from("v_daily_questions")
    .select("date, slot, category, difficulty, prompt, options")
    .eq("date", date);

  if (error) throw new Error(`error leyendo set diario: ${error.message}`);
  const rows = (data ?? []) as DailyQuestion[];
  if (rows.length === 0) throw new Error(`sin set para la fecha ${date}`);

  return rows.sort((a, b) => ORDER[a.slot] - ORDER[b.slot]);
}
