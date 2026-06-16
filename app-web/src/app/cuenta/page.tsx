"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ensureSession } from "@/lib/auth";
import { signUp, signIn, signOutAccount, getAccountEmail } from "@/lib/account";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { Mascot } from "@/components/Mascot";

export default function CuentaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [mode, setMode] = useState<"crear" | "entrar">("crear");
  const [inEmail, setInEmail] = useState("");
  const [inPass, setInPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await ensureSession();
        setEmail(await getAccountEmail());
      } catch {
        /* sin sesión */
      }
      setLoading(false);
    })();
  }, []);

  async function handleSubmit() {
    const e = inEmail.trim();
    if (!e || inPass.length < 6) {
      setError("Pon un correo y una contraseña de al menos 6 caracteres.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      if (mode === "crear") await signUp(e, inPass);
      else await signIn(e, inPass);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    await signOutAccount();
    router.push("/");
  }

  if (loading) {
    return (
      <main className="flex flex-1 flex-col py-6">
        <Loading />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col py-6">
      <h1 className="mb-5 text-2xl font-extrabold tracking-tight">Mi cuenta</h1>

      {email ? (
        <div className="flex flex-col items-center gap-5 text-center">
          <Mascot expression="happy" size={72} />
          <div>
            <p className="text-sm text-white/60">Sesión iniciada como</p>
            <p className="text-lg font-bold">{email}</p>
          </div>
          <p className="text-sm text-white/60">
            Tu progreso está guardado. Inicia sesión con este correo en cualquier dispositivo
            (o en la app instalada) para recuperarlo.
          </p>
          <Button variant="secondary" className="w-full" onClick={handleSignOut}>
            Cerrar sesión
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-white/70">
            Crea una cuenta para no perder tu progreso y recuperarlo en tu celular u otro
            dispositivo. Es rápido: solo correo y contraseña.
          </p>

          <div className="flex gap-2 rounded-2xl bg-white/[0.04] p-1">
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
            value={inEmail}
            onChange={(e) => setInEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder-white/30 outline-none focus:border-white/30"
          />
          <input
            type="password"
            autoComplete={mode === "crear" ? "new-password" : "current-password"}
            value={inPass}
            onChange={(e) => setInPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Contraseña (mín. 6)"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder-white/30 outline-none focus:border-white/30"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button className="w-full" disabled={busy} onClick={handleSubmit}>
            {busy ? "..." : mode === "crear" ? "Crear cuenta" : "Iniciar sesión"}
          </Button>

          {mode === "crear" && (
            <p className="text-center text-xs text-white/40">
              Tu progreso actual (racha, puntajes, grupos) quedará guardado en la cuenta.
            </p>
          )}
        </div>
      )}
    </main>
  );
}
