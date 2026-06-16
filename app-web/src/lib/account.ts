import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";

function traducir(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("already") || m.includes("registered")) return "Ese correo ya tiene una cuenta. Inicia sesión.";
  if (m.includes("invalid") || m.includes("credentials")) return "Correo o contraseña incorrectos.";
  if (m.includes("password") && (m.includes("6") || m.includes("short") || m.includes("least")))
    return "La contraseña debe tener al menos 6 caracteres.";
  if (m.includes("confirm")) return "Falta desactivar la confirmación de correo en Supabase.";
  if (m.includes("anonymous")) return "Sesión no iniciada. Recarga la página.";
  if (m.includes("valid email") || m.includes("invalid email")) return "Correo no válido.";
  return msg;
}

/** Convierte la sesión anónima actual en una cuenta permanente (conserva el progreso). */
export async function signUp(
  email: string,
  password: string,
  client: SupabaseClient = getSupabaseClient(),
): Promise<void> {
  const { error } = await client.auth.updateUser({ email, password });
  if (error) throw new Error(traducir(error.message));
}

/** Inicia sesión con una cuenta existente (recupera los datos en cualquier dispositivo). */
export async function signIn(
  email: string,
  password: string,
  client: SupabaseClient = getSupabaseClient(),
): Promise<void> {
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(traducir(error.message));
}

export async function signOutAccount(client: SupabaseClient = getSupabaseClient()): Promise<void> {
  await client.auth.signOut();
}

/** Devuelve el correo si la sesión es una cuenta permanente; null si es anónima. */
export async function getAccountEmail(client: SupabaseClient = getSupabaseClient()): Promise<string | null> {
  const { data } = await client.auth.getUser();
  return data.user?.email ?? null;
}
