"use client";

import { ReactNode, useEffect, useState } from "react";
import { ensureSession, getDisplayName, setDisplayName } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

export function DisplayNameGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"loading" | "needs-name" | "ready">("loading");
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ensureSession()
      .then(() => getDisplayName())
      .then((name) => {
        setStatus(name ? "ready" : "needs-name");
      })
      .catch(() => setStatus("needs-name"));
  }, []);

  async function handleConfirm() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await setDisplayName(trimmed);
      setStatus("ready");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center text-white/60">
        Cargando…
      </div>
    );
  }

  if (status === "needs-name") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-2">
        <h2 className="text-2xl font-extrabold tracking-tight">¿Cómo te llamas?</h2>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
          placeholder="Tu nombre"
          maxLength={32}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder-white/30 outline-none focus:border-white/30"
        />
        <Button
          onClick={handleConfirm}
          disabled={!input.trim() || saving}
          className="w-full"
        >
          Continuar
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
