"use client";
import { useState } from "react";
import type { ChatMessage } from "@/lib/chat";

const EMOJIS = ["👍", "❤️", "😂", "🔥"];

type Props = {
  messages: ChatMessage[];
  myUserId: string;
  reactionCounts: Record<string, Record<string, number>>;
  onSend: (body: string) => void;
  onReact: (messageId: string, emoji: string) => void;
};

export function ChatView({ messages, myUserId, reactionCounts, onSend, onReact }: Props) {
  const [text, setText] = useState("");

  function send() {
    const body = text.trim();
    if (!body) return;
    onSend(body);
    setText("");
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-2">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-sm text-white/40">
            Aún no hay mensajes. ¡Saluda a tu grupo! 🦉
          </p>
        )}
        {messages.map((m) => {
          const mine = m.user_id === myUserId;
          const counts = reactionCounts[m.id] ?? {};
          return (
            <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              {!mine && <span className="mb-1 ml-1 text-[11px] text-white/50">{m.display_name}</span>}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  mine
                    ? "bg-gradient-to-br from-violet to-violet-light text-white"
                    : "bg-white/10 text-white"
                }`}
              >
                {m.body}
              </div>
              <div className="mt-1 flex gap-1">
                {EMOJIS.map((e) => {
                  const n = counts[e] ?? 0;
                  return (
                    <button
                      key={e}
                      aria-label={e}
                      onClick={() => onReact(m.id, e)}
                      className="flex cursor-pointer items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-xs transition hover:bg-white/10"
                    >
                      <span>{e}</span>
                      {n > 0 && <span className="text-[10px] text-white/60">{n}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Escribe un mensaje…"
          className="flex-1 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet/50"
        />
        <button
          onClick={send}
          className="cursor-pointer rounded-2xl bg-gradient-to-br from-violet to-violet-light px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 active:scale-95"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
