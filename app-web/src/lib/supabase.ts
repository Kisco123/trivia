import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL");
  if (!key) throw new Error("Falta NEXT_PUBLIC_SUPABASE_ANON_KEY");

  cached = createClient(url, key);
  return cached;
}
