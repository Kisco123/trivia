"use client";
import { useCallback, useEffect, useState } from "react";

/**
 * Cuenta regresiva en segundos.
 * - `running`: corre solo cuando es true.
 * - `resetKey`: al cambiar, reinicia la cuenta a `seconds` (p. ej. nueva pregunta).
 * - `addSeconds`: suma tiempo al vuelo (power-up de tiempo extra).
 */
export function useCountdown(seconds: number, running: boolean, resetKey?: unknown) {
  const [secondsLeft, setSecondsLeft] = useState(seconds);

  useEffect(() => {
    setSecondsLeft(seconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [running, resetKey]);

  const addSeconds = useCallback((n: number) => {
    setSecondsLeft((s) => s + n);
  }, []);

  return { secondsLeft, addSeconds };
}
