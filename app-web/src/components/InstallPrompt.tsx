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

// Solo dos casos: Android, o iOS (que cubre iPhone/iPad y es el default).
function detectPlatform(): "ios" | "android" {
  if (typeof navigator === "undefined") return "ios";
  if (/android/i.test(navigator.userAgent)) return "android";
  return "ios";
}

const STEPS: Record<"ios" | "android", string[]> = {
  ios: [
    "Toca el botón Compartir (el cuadrito con la flecha ↑).",
    "Elige “Agregar a pantalla de inicio”.",
    "Toca “Agregar”.",
  ],
  android: [
    "Toca el menú ⋮ (arriba a la derecha).",
    "Elige “Instalar app” o “Agregar a pantalla de inicio”.",
    "Confirma.",
  ],
};

export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android">("ios");

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
          Es la forma óptima de usar Trivia. Solo sigue estos pasos:
        </p>

        <ol className="mt-4 flex flex-col gap-2 text-left">
          {STEPS[platform].map((step, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/85"
            >
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
