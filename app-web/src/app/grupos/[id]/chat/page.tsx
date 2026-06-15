"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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

export default function GrupoChatPage() {
  const params = useParams();
  const id = params.id as string;

  const [myUserId, setMyUserId] = useState("");
  const [displayName, setDisplayName] = useState("Jugador");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reactionCounts, setReactionCounts] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    if (!id) return;
    let channel: ReturnType<typeof subscribeMessages> | null = null;

    (async () => {
      try {
        await ensureSession();
        setMyUserId((await getCurrentUserId()) ?? "");
        setDisplayName((await getDisplayName()) ?? "Jugador");
        const msgs = await getMessages(id);
        setMessages(msgs);
        setReactionCounts(await getReactionCounts(msgs.map((m) => m.id)));
        channel = subscribeMessages(id, (m) =>
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m])),
        );
      } catch {
        // sin sesión (auth anónima deshabilitada): mostramos lo que haya
      }
    })();

    return () => {
      if (channel) getSupabaseClient().removeChannel(channel);
    };
  }, [id]);

  async function onSend(body: string) {
    if (!myUserId) return;
    try {
      await sendMessage(id, myUserId, displayName, body);
    } catch {
      // ignore: el envío falla si no hay sesión
    }
  }

  async function onReact(messageId: string, emoji: string) {
    if (!myUserId) return;
    try {
      await toggleReaction(messageId, myUserId, emoji);
      setReactionCounts(await getReactionCounts(messages.map((m) => m.id)));
    } catch {
      // ignore
    }
  }

  return (
    <main className="flex flex-1 flex-col py-4">
      <div className="mb-3 flex items-center gap-3">
        <Link
          href={`/grupos/${id}`}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/60 transition hover:text-white"
        >
          ← Volver
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight">Chat</h1>
      </div>

      <ChatView
        messages={messages}
        myUserId={myUserId}
        reactionCounts={reactionCounts}
        onSend={onSend}
        onReact={onReact}
      />
    </main>
  );
}
