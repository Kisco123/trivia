"use client";
import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { QuestionView } from "@/components/game/QuestionView";
import { ResultView } from "@/components/game/ResultView";
import { useCountdown } from "@/hooks/useCountdown";
import { submitAnswer, requestFiftyFifty } from "@/lib/gameplay";
import { computeScore, TIME_LIMIT_MS } from "@/lib/scoring";
import { markPlayed, hasPlayed, getScore } from "@/lib/playedToday";
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

export function GameClient({ date, questions, questionIds, client, revealMs = 1200 }: Props) {
  const [idx, setIdx] = useState(0);
  const [hidden, setHidden] = useState<number[]>([]);
  const [extra, setExtra] = useState(0);
  const [answeredIndex, setAnsweredIndex] = useState<number | null>(null);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [done, setDone] = useState(false);
  const [alreadyTotal, setAlreadyTotal] = useState<number | null>(null);

  useEffect(() => {
    if (hasPlayed(date)) setAlreadyTotal(getScore(date) ?? 0);
  }, [date]);

  const q = questions[idx];
  const { secondsLeft } = useCountdown(20 + extra, answeredIndex === null && !done && alreadyTotal === null);

  async function handleAnswer(choice: number) {
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
        markPlayed(date, total);
        setDone(true);
      } else {
        setIdx(idx + 1);
        setHidden([]);
        setExtra(0);
        setAnsweredIndex(null);
        setCorrectIndex(null);
        setStartedAt(Date.now());
      }
    }, revealMs);
  }

  async function handleFiftyFifty() {
    if (answeredIndex !== null || hidden.length > 0) return;
    setHidden(await requestFiftyFifty(questionIds[idx], client));
  }

  function handleExtraTime() {
    if (answeredIndex !== null || extra > 0) return;
    setExtra(10);
  }

  if (alreadyTotal !== null) {
    return <ResultView total={alreadyTotal} breakdown={[]} />;
  }

  if (done) {
    const total = outcomes.reduce((s, o) => s + o.points, 0);
    return <ResultView total={total} breakdown={outcomes} />;
  }

  return (
    <QuestionView
      question={q}
      secondsLeft={secondsLeft}
      hidden={hidden}
      answeredIndex={answeredIndex}
      correctIndex={correctIndex}
      onAnswer={handleAnswer}
      onFiftyFifty={handleFiftyFifty}
      onExtraTime={handleExtraTime}
    />
  );
}
