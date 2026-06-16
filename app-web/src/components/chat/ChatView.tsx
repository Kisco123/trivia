"use client";
import { useEffect, useRef, useState } from "react";
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
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mantén la conversación pegada al último mensaje cuando llegan nuevos.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  // Limpia el temporizador de "mantener presionado" al desmontar.
  useEffect(() => () => clearPress(), []);

  function startPress(id: string) {
    clearPress();
    pressTimer.current = setTimeout(() => setPickerFor(id), 450);
  }
  function clearPress() {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }

  function send() {
    const body = text.trim();
    if (!body) return;
    onSend(body);
    setText("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={listRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1"
      >
        {messages.length === 0 && (
          <p className="mt-8 text-center text-sm text-white/40">
            Aún no hay mensajes. ¡Saluda a tu grupo! 🦉
          </p>
        )}
        {messages.map((m, i) => {
          const mine = m.user_id === myUserId;
          const counts = reactionCounts[m.id] ?? {};
          const active = Object.entries(counts).filter(([, n]) => n > 0);
          const placeBelow = i === 0; // evita que el selector se corte arriba del todo
          return (
            <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              {!mine && <span className="mb-1 ml-1 text-[11px] text-white/50">{m.display_name}</span>}
              <div className="relative max-w-[80%]">
                {pickerFor === m.id && (
                  <div
                    className={`absolute z-50 flex gap-0.5 rounded-full border border-white/10 bg-bg-elevated p-1 shadow-xl ${
                      placeBelow ? "top-full mt-1" : "bottom-full mb-1"
                    } ${mine ? "right-0" : "left-0"}`}
                  >
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        aria-label={e}
                        onClick={() => {
                          onReact(m.id, e);
                          setPickerFor(null);
                        }}
                        className="cursor-pointer rounded-full px-1.5 py-0.5 text-lg transition hover:scale-125"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}
                <div
                  onPointerDown={() => startPress(m.id)}
                  onPointerUp={clearPress}
                  onPointerLeave={clearPress}
                  onPointerCancel={clearPress}
                  onContextMenu={(ev) => {
                    ev.preventDefault();
                    setPickerFor(m.id);
                  }}
                  className={`cursor-pointer select-none rounded-2xl px-4 py-2 text-sm [-webkit-touch-callout:none] ${
                    mine
                      ? "bg-gradient-to-br from-violet to-violet-light text-white"
                      : "bg-white/10 text-white"
                  }`}
                >
                  {m.body}
                </div>
              </div>
              {active.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {active.map(([e, n]) => (
                    <button
                      key={e}
                      aria-label={`${e} ${n}`}
                      onClick={() => onReact(m.id, e)}
                      className="flex cursor-pointer items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-xs transition hover:bg-white/10"
                    >
                      <span>{e}</span>
                      <span className="text-[10px] text-white/70">{n}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {pickerFor && (
        <div className="fixed inset-0 z-40" onPointerDown={() => setPickerFor(null)} />
      )}

      <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
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
