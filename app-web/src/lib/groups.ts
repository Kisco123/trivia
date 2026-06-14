import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";

export type Group = { id: string; name: string; invite_code: string; owner_id: string };

export async function createGroup(
  name: string,
  displayName: string,
  client: SupabaseClient = getSupabaseClient(),
): Promise<Group> {
  const { data, error } = await client.rpc("create_group", {
    p_name: name,
    p_display_name: displayName,
  });
  if (error) throw new Error(`no se pudo crear el grupo: ${error.message}`);
  return data as Group;
}

export async function joinGroup(
  code: string,
  displayName: string,
  client: SupabaseClient = getSupabaseClient(),
): Promise<Group> {
  const { data, error } = await client.rpc("join_group", {
    p_code: code,
    p_display_name: displayName,
  });
  if (error) throw new Error(error.message);
  return data as Group;
}

export async function getMyGroups(client: SupabaseClient = getSupabaseClient()): Promise<Group[]> {
  const { data, error } = await client.from("group_members").select("groups(*)");
  if (error) throw new Error(`error listando grupos: ${error.message}`);
  return (data ?? []).map((r: { groups: Group }) => r.groups);
}
