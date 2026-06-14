import type { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";

export type ChatMessage = {
  id: string;
  user_id: string;
  display_name: string;
  body: string;
  created_at: string;
};

export async function getMessages(
  groupId: string, client: SupabaseClient = getSupabaseClient(),
): Promise<ChatMessage[]> {
  const { data, error } = await client
    .from("chat_messages")
    .select("id, user_id, display_name, body, created_at")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`error leyendo mensajes: ${error.message}`);
  return (data ?? []) as ChatMessage[];
}

export async function sendMessage(
  groupId: string, userId: string, displayName: string, body: string,
  client: SupabaseClient = getSupabaseClient(),
): Promise<void> {
  const { error } = await client.from("chat_messages").insert({
    group_id: groupId, user_id: userId, display_name: displayName, body,
  });
  if (error) throw new Error(`error enviando mensaje: ${error.message}`);
}

export function subscribeMessages(
  groupId: string, onInsert: (m: ChatMessage) => void,
  client: SupabaseClient = getSupabaseClient(),
): RealtimeChannel {
  return client
    .channel(`chat:${groupId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "chat_messages", filter: `group_id=eq.${groupId}` },
      (payload) => onInsert(payload.new as ChatMessage),
    )
    .subscribe();
}

export async function toggleReaction(
  messageId: string, userId: string, emoji: string,
  client: SupabaseClient = getSupabaseClient(),
): Promise<void> {
  const { data } = await client
    .from("message_reactions").select("emoji")
    .eq("message_id", messageId).eq("user_id", userId).eq("emoji", emoji)
    .maybeSingle();
  if (data) {
    await client.from("message_reactions").delete()
      .eq("message_id", messageId).eq("user_id", userId).eq("emoji", emoji);
  } else {
    await client.from("message_reactions").insert({ message_id: messageId, user_id: userId, emoji });
  }
}

export async function getReactionCounts(
  messageIds: string[], client: SupabaseClient = getSupabaseClient(),
): Promise<Record<string, Record<string, number>>> {
  if (messageIds.length === 0) return {};
  const { data, error } = await client
    .from("message_reactions").select("message_id, emoji").in("message_id", messageIds);
  if (error) throw new Error(`error leyendo reacciones: ${error.message}`);
  const out: Record<string, Record<string, number>> = {};
  for (const r of (data ?? []) as { message_id: string; emoji: string }[]) {
    out[r.message_id] ??= {};
    out[r.message_id][r.emoji] = (out[r.message_id][r.emoji] ?? 0) + 1;
  }
  return out;
}
