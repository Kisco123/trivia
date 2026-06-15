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

  const instructions =
    platform === "ios" ? (
      <>
        Toca <b>Compartir</b> (el cuadrito con la flecha ↑) y luego{" "}
        <b>&ldquo;Agregar a pantalla de inicio&rdquo;</b>.
      </>
    ) : platform === "android" ? (
      <>
        Toca el menú <b>⋮</b> (arriba a la derecha) y luego{" "}
        <b>&ldquo;Instalar app&rdquo;</b> o <b>&ldquo;Agregar a pantalla de inicio&rdquo;</b>.
      </>
    ) : (
      <>Ábrela en tu <b>celular</b> y agrégala a la pantalla de inicio para usarla como app.</>
    );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-6">
      <div className="w-full max-w-[360px] rounded-3xl border border-white/10 bg-bg-elevated p-6 text-center shadow-2xl">
        <div className="flex justify-center">
          <Mascot expression="happy" size={64} />
        </div>
        <h2 className="mt-3 text-lg font-extrabold">Tenla a mano 📲</h2>
        <p className="mt-2 text-sm text-white/70">
          Para la mejor experiencia, agrega Trivia a tu pantalla de inicio. Se abre como una
          app, en pantalla completa.
        </p>
        <div className="mt-3 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/80">
          {instructions}
        </div>
        <button
          onClick={dismiss}
          className="mt-5 w-full cursor-pointer rounded-2xl bg-gradient-to-br from-violet to-violet-light px-6 py-3 font-semibold text-white transition hover:brightness-110 active:scale-95"
        >
          OK, entendido
        </button>
      </div>
    </div>
  );
}
