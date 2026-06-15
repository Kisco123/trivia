"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SupabaseClient } from "@supabase/supabase-js";
import { QuestionView } from "@/components/game/QuestionView";
import { ResultView } from "@/components/game/ResultView";
import { IntroView } from "@/components/game/IntroView";
import { useCountdown } from "@/hooks/useCountdown";
import { submitAnswer } from "@/lib/gameplay";
import { computeScore, TIME_LIMIT_MS } from "@/lib/scoring";
import { markPlayed, hasPlayed, getScore } from "@/lib/playedToday";
import { ensureSession, getCurrentUserId } from "@/lib/auth";
import { savePlay, getMyPlay } from "@/lib/plays";
import type { DailyQuestion } from "@/lib/dailySet";
import type { Difficulty } from "@/lib/questions";

type Props = {
  date: string;
  questions: DailyQuestion[];
  questionIds: string[];
  client?: SupabaseClient;
  revealMs?: number;
};

type Outcome = { prompt: string; correct: boolean; points: number };
type Phase = "intro" | "playing";

export function GameClient({ date, questions, questionIds, client, revealMs = 1200 }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [idx, setIdx] = useState(0);
  const [answeredIndex, setAnsweredIndex] = useState<number | null>(null);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [done, setDone] = useState(false);
  const [alreadyTotal, setAlreadyTotal] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureSession(client);
        const uid = await getCurrentUserId(client);
        if (cancelled) return;
        setUserId(uid);
        if (uid) {
          const play = await getMyPlay(uid, date, client);
          if (!cancelled && play) {
            setAlreadyTotal(play.score);
            return;
          }
        }
      } catch {
        // auth no disponible: caemos al gating local
      }
      if (!cancelled && hasPlayed(date)) setAlreadyTotal(getScore(date) ?? 0);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const q = questions[idx];
  const running =
    phase === "playing" && answeredIndex === null && !done && alreadyTotal === null;
  const { secondsLeft } = useCountdown(TIME_LIMIT_MS / 1000, running, idx);

  async function resolveAnswer(choice: number) {
    if (answeredIndex !== null) return;
    setAnsweredIndex(choice);
    const elapsed = Date.now() - startedAt;
    const res = await submitAnswer(questionIds[idx], choice, client);
    setCorrectIndex(res.correctIndex);
    const points = computeScore(q.difficulty as Difficulty, res.correct, elapsed, TIME_LIMIT_MS);
    const next = [...outcomes, { prompt: q.prompt, correct: res.correct, points }];
    setOutcomes(next);

    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        const total = next.reduce((s, o) => s + o.points, 0);
        const aciertos = next.filter((o) => o.correct).length;
        markPlayed(date, total);
        if (userId) void savePlay(userId, date, total, aciertos, client).catch(() => {});
        setDone(true);
      } else {
        setIdx(idx + 1);
        setAnsweredIndex(null);
        setCorrectIndex(null);
        setStartedAt(Date.now());
      }
    }, revealMs);
  }

  // Tiempo agotado: cuenta como fallo (sin opción elegida) y avanza.
  useEffect(() => {
    if (running && secondsLeft === 0) {
      void resolveAnswer(-1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, running]);

  // Anti-trampa: si sales de la pantalla (cambias de pestaña / minimizas) durante
  // una pregunta activa, se bloquea como fallada. Evita irse a buscar la respuesta.
  useEffect(() => {
    if (!running) return;
    function onHidden() {
      if (document.visibilityState === "hidden") void resolveAnswer(-1);
    }
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function handleAnswer(choice: number) {
    void resolveAnswer(choice);
  }

  function startGame() {
    setStartedAt(Date.now());
    setPhase("playing");
  }

  if (alreadyTotal !== null) {
    return <ResultView total={alreadyTotal} breakdown={[]} />;
  }

  if (done) {
    const total = outcomes.reduce((s, o) => s + o.points, 0);
    return <ResultView total={total} breakdown={outcomes} />;
  }

  if (phase === "intro") {
    return <IntroView questions={questions} onStart={startGame} />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={idx}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.25 }}
        className="flex flex-1 flex-col"
      >
        <QuestionView
          question={q}
          secondsLeft={secondsLeft}
          hidden={[]}
          answeredIndex={answeredIndex}
          correctIndex={correctIndex}
          onAnswer={handleAnswer}
        />
      </motion.div>
    </AnimatePresence>
  );
}
