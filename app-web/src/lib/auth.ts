import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";

export async function ensureSession(client: SupabaseClient = getSupabaseClient()): Promise<void> {
  const { data } = await client.auth.getSession();
  if (!data.session) {
    const { error } = await client.auth.signInAnonymously();
    if (error) throw new Error(`no se pudo iniciar sesión anónima: ${error.message}`);
  }
}

export async function getCurrentUserId(client: SupabaseClient = getSupabaseClient()): Promise<string | null> {
  const { data } = await client.auth.getUser();
  return data.user?.id ?? null;
}

export async function setDisplayName(name: string, client: SupabaseClient = getSupabaseClient()): Promise<void> {
  const { error } = await client.auth.updateUser({ data: { display_name: name } });
  if (error) throw new Error(`no se pudo guardar el nombre: ${error.message}`);
}

export async function getDisplayName(client: SupabaseClient = getSupabaseClient()): Promise<string | null> {
  const { data } = await client.auth.getUser();
  return (data.user?.user_metadata?.display_name as string) ?? null;
}
