"use client";
import { useEffect, useState, type ReactNode } from "react";
import { ensureSession } from "@/lib/auth";
import { getAccountEmail, signUp, signIn } from "@/lib/account";
import { Mascot } from "@/components/Mascot";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";

type Status = "loading" | "anon" | "authed";

/** Muro de cuenta: para usar las funciones hay que crear cuenta o iniciar sesión. */
export function AuthGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [mode, setMode] = useState<"crear" | "entrar">("crear");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await ensureSession();
        setStatus((await getAccountEmail()) ? "authed" : "anon");
      } catch {
        setStatus("anon");
      }
    })();
  }, []);

  async function submit() {
    const e = email.trim();
    if (!e || pass.length < 6) {
      setError("Pon un correo y una contraseña de al menos 6 caracteres.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      if (mode === "crear") await signUp(e, pass);
      else await signIn(e, pass);
      setStatus("authed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Loading />
      </div>
    );
  }

  if (status === "authed") return <>{children}</>;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 py-10 text-center">
      <Mascot expression="happy" size={88} />
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Trivia</h1>
        <p className="mt-2 text-sm text-white/60">
          Una pregunta al día para competir con tu grupo. Crea tu cuenta para empezar a jugar.
        </p>
      </div>

      <div className="flex w-full gap-2 rounded-2xl bg-white/[0.04] p-1">
        <button
          onClick={() => setMode("crear")}
          className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${mode === "crear" ? "bg-gradient-to-br from-violet to-violet-light text-white" : "text-white/60"}`}
        >
          Crear cuenta
        </button>
        <button
          onClick={() => setMode("entrar")}
          className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${mode === "entrar" ? "bg-gradient-to-br from-violet to-violet-light text-white" : "text-white/60"}`}
        >
          Iniciar sesión
        </button>
      </div>

      <input
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@correo.com"
        className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder-white/30 outline-none focus:border-white/30"
      />
      <input
        type="password"
        autoComplete={mode === "crear" ? "new-password" : "current-password"}
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Contraseña (mín. 6)"
        className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder-white/30 outline-none focus:border-white/30"
      />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button className="w-full" disabled={busy} onClick={submit}>
        {busy ? "..." : mode === "crear" ? "Crear cuenta y jugar" : "Entrar"}
      </Button>

      <p className="text-xs text-white/40">
        Sin confirmación de correo. Tu progreso queda guardado en tu cuenta y lo recuperas en
        cualquier dispositivo.
      </p>
    </main>
  );
}
