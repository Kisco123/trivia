"use client";
import { useEffect, useState } from "react";
import { Mascot } from "@/components/Mascot";

const KEY = "trivia:installPromptSeen";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mm = window.matchMedia?.("(display-mode: standalone)");
  if (mm?.matches) return true;
  return (window.navigator as unknown as { standalone?: boolean }).standalone === true;
}

function detectPlatform(): "ios" | "android" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "other";
}

const STEPS: Record<"ios" | "android" | "other", string[]> = {
  ios: [
    "Toca el botón Compartir (el cuadrito con la flecha ↑, abajo en Safari).",
    "Baja y elige “Agregar a pantalla de inicio”.",
    "Toca “Agregar”. ¡Listo!",
  ],
  android: [
    "Toca el menú ⋮ (arriba a la derecha, en Chrome).",
    "Elige “Instalar app” o “Agregar a pantalla de inicio”.",
    "Confirma. ¡Listo!",
  ],
  other: [
    "Abre esta misma dirección en tu celular (Safari en iPhone, Chrome en Android).",
    "Agrégala a tu pantalla de inicio desde el menú del navegador.",
  ],
};

export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");

  useEffect(() => {
    if (isStandalone()) return; // ya está instalada
    if (localStorage.getItem(KEY)) return; // ya la vio
    setPlatform(detectPlatform());
    setShow(true);
  }, []);

  function dismiss() {
    localStorage.setItem(KEY, "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-6">
      <div className="w-full max-w-[360px] rounded-3xl border border-white/10 bg-bg-elevated p-6 text-center shadow-2xl">
        <div className="flex justify-center">
          <Mascot expression="happy" size={64} />
        </div>
        <h2 className="mt-3 text-lg font-extrabold">Agrégala a tu pantalla de inicio 📲</h2>
        <p className="mt-2 text-sm text-white/70">
          Así se juega Trivia: se abre al instante y a pantalla completa, como una app.
          Hazlo ahora, toma 10 segundos:
        </p>

        <ol className="mt-4 flex flex-col gap-2 text-left">
          {STEPS[platform].map((step, i) => (
            <li key={i} className="flex items-start gap-3 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/85">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-violet text-xs font-bold text-white">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <button
          onClick={dismiss}
          className="mt-5 w-full cursor-pointer rounded-2xl bg-gradient-to-br from-violet to-violet-light px-6 py-3 font-semibold text-white transition hover:brightness-110 active:scale-95"
        >
          Listo, ya la agregué
        </button>
      </div>
    </div>
  );
}
