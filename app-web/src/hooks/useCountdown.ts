"use client";
import { useEffect, useState } from "react";

export function useCountdown(seconds: number, running: boolean) {
  const [secondsLeft, setSecondsLeft] = useState(seconds);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  return { secondsLeft };
}
