"use client";
import { useEffect, useState } from "react";
import { ChatView } from "@/components/chat/ChatView";
import {
  getMessages,
  sendMessage,
  subscribeMessages,
  toggleReaction,
  getReactionCounts,
  type ChatMessage,
} from "@/lib/chat";
import { ensureSession, getCurrentUserId, getDisplayName } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/supabase";

/** Chat del grupo, listo para embeberse (ej. bajo el ranking). */
export function GroupChat({ groupId }: { groupId: string }) {
  const [myUserId, setMyUserId] = useState("");
  const [displayName, setDisplayName] = useState("Jugador");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reactionCounts, setReactionCounts] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    if (!groupId) return;
    let channel: ReturnType<typeof subscribeMessages> | null = null;

    (async () => {
      try {
        await ensureSession();
        setMyUserId((await getCurrentUserId()) ?? "");
        setDisplayName((await getDisplayName()) ?? "Jugador");
        const msgs = await getMessages(groupId);
        setMessages(msgs);
        setReactionCounts(await getReactionCounts(msgs.map((m) => m.id)));
        channel = subscribeMessages(groupId, (m) =>
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m])),
        );
      } catch {
        /* sin sesión: mostramos lo que haya */
      }
    })();

    return () => {
      if (channel) getSupabaseClient().removeChannel(channel);
    };
  }, [groupId]);

  async function onSend(body: string) {
    if (!myUserId) return;
    try {
      await sendMessage(groupId, myUserId, displayName, body);
    } catch {
      /* ignore */
    }
  }

  async function onReact(messageId: string, emoji: string) {
    if (!myUserId) return;
    try {
      await toggleReaction(messageId, myUserId, emoji);
      setReactionCounts(await getReactionCounts(messages.map((m) => m.id)));
    } catch {
      /* ignore */
    }
  }

  return (
    <ChatView
      messages={messages}
      myUserId={myUserId}
      reactionCounts={reactionCounts}
      onSend={onSend}
      onReact={onReact}
    />
  );
}
