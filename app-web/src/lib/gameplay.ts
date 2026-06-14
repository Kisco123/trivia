import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";

export type AnswerResult = { correct: boolean; correctIndex: number };

export async function submitAnswer(
  questionId: string,
  choice: number,
  client: SupabaseClient = getSupabaseClient(),
): Promise<AnswerResult> {
  const { data, error } = await client.rpc("check_answer", {
    p_question_id: questionId,
    p_choice: choice,
  });
  if (error) throw new Error(`error validando respuesta: ${error.message}`);
  return data as AnswerResult;
}

export async function requestFiftyFifty(
  questionId: string,
  client: SupabaseClient = getSupabaseClient(),
): Promise<number[]> {
  const { data, error } = await client.rpc("fifty_fifty", {
    p_question_id: questionId,
  });
  if (error) throw new Error(`error en 50/50: ${error.message}`);
  return (data ?? []) as number[];
}
