# Plan 3 — Loop de Juego (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan checkbox (`- [ ]`).

**Goal:** El jugador puede entrar a `/jugar`, responder las 3 preguntas del día (fácil/media/difícil) con timer, recibir validación del acierto sin que la respuesta esté nunca en la página, acumular puntaje ponderado, usar power-ups (50/50 y tiempo extra), y ver una pantalla de resultado. "Ya jugaste hoy" se controla en el dispositivo (localStorage) hasta que exista login (Plan 4).

**Architecture:** La página `/jugar` es un Server Component que lee el set del día con `getDailySet` (sin respuestas) y lo pasa a un Client Component que corre la máquina de estados del juego. El acierto se valida con una función Postgres `check_answer` (SECURITY DEFINER, expuesta a `anon`) que compara dentro de la base y devuelve `{correct, correctIndex}`; el 50/50 usa otra función `fifty_fifty` que devuelve 2 índices incorrectos. El puntaje se calcula con una función TypeScript pura y testeada. El resultado se guarda en localStorage (persistencia por usuario + multi-grupo llega en el Plan 4).

**Tech Stack:** Next.js (App Router, Server + Client Components) · React · Framer Motion (animaciones de acierto/error) · Supabase RPC · Vitest + RTL.

> **Decisiones explícitas (validar en review):**
> - **Validación server-side por RPC.** Evita poner la respuesta en el payload. La función puede devolver `correctIndex` (para revelar la correcta tras responder); un usuario con devtools podría "espiar" llamando a la RPC, pero la trampa casual (leer la página, cerrar y reintentar) queda cubierta. El bloqueo robusto (sesión server, una sola respuesta) llega con auth en el Plan 4.
> - **Power-ups V1: 50/50 + tiempo extra.** "Pista" se pospone (necesita texto de ayuda por pregunta = contenido nuevo).
> - **Gating "ya jugaste hoy" por localStorage** (pre-auth). Se reemplaza por gating server-side en el Plan 4.
> - **Timer:** límite fijo de 20 s por pregunta en V1. El tiempo lo reporta el cliente al calcular puntaje (se confía en el cliente en V1; el timing server-side autoritativo es backlog).

---

## Estructura de archivos

- `app-web/supabase/migrations/0004_rpc_gameplay.sql` — funciones `check_answer`, `fifty_fifty`.
- `app-web/src/lib/scoring.ts` — `computeScore` (puro) + constantes.
- `app-web/src/lib/gameplay.ts` — `submitAnswer`, `requestFiftyFifty` (llaman a las RPC).
- `app-web/src/hooks/useCountdown.ts` — hook de cuenta regresiva.
- `app-web/src/components/game/GameClient.tsx` — máquina de estados + UI de juego (client).
- `app-web/src/components/game/QuestionView.tsx` — una pregunta (enunciado, opciones, power-ups, timer).
- `app-web/src/components/game/ResultView.tsx` — pantalla de resultado.
- `app-web/src/lib/playedToday.ts` — gating localStorage.
- `app-web/src/app/jugar/page.tsx` — Server Component que carga el set y monta `GameClient`.
- Tests junto a cada módulo con lógica.

---

## Task 1: Funciones de gameplay en la base (migración 0004)

**Files:**
- Create: `app-web/supabase/migrations/0004_rpc_gameplay.sql`

- [ ] **Step 1: Escribir la migración**

Create `app-web/supabase/migrations/0004_rpc_gameplay.sql`:
```sql
-- Plan 3 — validación de respuesta sin exponerla en el payload.
create or replace function public.check_answer(p_question_id uuid, p_choice int)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'correct', (q.correct_index = p_choice),
    'correctIndex', q.correct_index
  )
  from public.questions q
  where q.id = p_question_id;
$$;

revoke all on function public.check_answer(uuid, int) from public;
grant execute on function public.check_answer(uuid, int) to anon;

-- 50/50: devuelve 2 índices INCORRECTOS a ocultar.
create or replace function public.fifty_fifty(p_question_id uuid)
returns int[]
language sql
security definer
set search_path = public
as $$
  select array(
    select i
    from generate_series(0, 3) as i
    where i <> (select correct_index from public.questions where id = p_question_id)
    order by random()
    limit 2
  );
$$;

revoke all on function public.fifty_fifty(uuid) from public;
grant execute on function public.fifty_fifty(uuid) to anon;
```

- [ ] **Step 2: Aplicar** (Supabase MCP `apply_migration` con name `rpc_gameplay`, project_id `xbwlqebqcyifearzcasj`; o SQL Editor).

- [ ] **Step 3: Verificar**

Ejecutar (MCP `execute_sql`), usando una pregunta conocida (la fácil de hoy, id `...0001`, correcta = índice 1):
```sql
select public.check_answer('00000000-0000-4000-8000-000000000001', 1) as acierto,
       public.check_answer('00000000-0000-4000-8000-000000000001', 0) as fallo,
       public.fifty_fifty('00000000-0000-4000-8000-000000000001') as ocultar;
```
Expected: `acierto` → `{"correct": true, "correctIndex": 1}`; `fallo` → `{"correct": false, "correctIndex": 1}`; `ocultar` → array de 2 índices que NO incluyen el 1 (p. ej. `{0,3}`).

- [ ] **Step 4: Commit**
```bash
git add -A && git commit -m "feat(db): RPC check_answer + fifty_fifty"
```

---

## Task 2: Lógica de puntaje (TDD)

**Files:**
- Create: `app-web/src/lib/scoring.ts`
- Test: `app-web/src/lib/__tests__/scoring.test.ts`

- [ ] **Step 1: Test que falla**

Create `app-web/src/lib/__tests__/scoring.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { computeScore, TIME_LIMIT_MS } from "@/lib/scoring";

describe("computeScore", () => {
  it("respuesta incorrecta vale 0", () => {
    expect(computeScore("facil", false, 0, TIME_LIMIT_MS)).toBe(0);
  });

  it("acierto instantáneo da base + bonus máximo", () => {
    expect(computeScore("dificil", true, 0, TIME_LIMIT_MS)).toBe(500); // 400 + 100
  });

  it("acierto justo al límite da solo la base", () => {
    expect(computeScore("media", true, TIME_LIMIT_MS, TIME_LIMIT_MS)).toBe(200);
  });

  it("acierto a mitad de tiempo da base + medio bonus", () => {
    expect(computeScore("facil", true, TIME_LIMIT_MS / 2, TIME_LIMIT_MS)).toBe(115); // 100 + round(30*0.5)
  });

  it("nunca da menos que la base si acierta (tiempo excedido)", () => {
    expect(computeScore("facil", true, TIME_LIMIT_MS * 2, TIME_LIMIT_MS)).toBe(100);
  });
});
```

- [ ] **Step 2: Correr y verificar FAIL** — `pnpm test src/lib/__tests__/scoring`. Expected: FAIL.

- [ ] **Step 3: Implementar**

Create `app-web/src/lib/scoring.ts`:
```ts
import type { Difficulty } from "@/lib/questions";

export const TIME_LIMIT_MS = 20_000;

const BASE: Record<Difficulty, number> = { facil: 100, media: 200, dificil: 400 };
const MAX_BONUS: Record<Difficulty, number> = { facil: 30, media: 60, dificil: 100 };

/** Puntaje de una pregunta: base por dificultad + bonus por velocidad (solo si acierta). */
export function computeScore(
  difficulty: Difficulty,
  correct: boolean,
  elapsedMs: number,
  limitMs: number,
): number {
  if (!correct) return 0;
  const ratio = Math.max(0, 1 - elapsedMs / limitMs);
  return BASE[difficulty] + Math.round(MAX_BONUS[difficulty] * ratio);
}
```

- [ ] **Step 4: Correr y verificar PASS** — `pnpm test src/lib/__tests__/scoring`. Expected: PASS (5 tests).

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: lógica de puntaje ponderado"
```

---

## Task 3: Capa de datos de gameplay (TDD con mock)

**Files:**
- Create: `app-web/src/lib/gameplay.ts`
- Test: `app-web/src/lib/__tests__/gameplay.test.ts`

- [ ] **Step 1: Test que falla**

Create `app-web/src/lib/__tests__/gameplay.test.ts`:
```ts
import { describe, it, expect, vi } from "vitest";
import { submitAnswer, requestFiftyFifty } from "@/lib/gameplay";

function clientReturning(data: unknown) {
  return { rpc: vi.fn().mockResolvedValue({ data, error: null }) } as never;
}

describe("submitAnswer", () => {
  it("devuelve correct y correctIndex desde la RPC", async () => {
    const client = clientReturning({ correct: true, correctIndex: 2 });
    const res = await submitAnswer("q1", 2, client);
    expect(res).toEqual({ correct: true, correctIndex: 2 });
  });

  it("lanza si la RPC da error", async () => {
    const client = { rpc: vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } }) } as never;
    await expect(submitAnswer("q1", 0, client)).rejects.toThrow(/boom/);
  });
});

describe("requestFiftyFifty", () => {
  it("devuelve los índices a ocultar", async () => {
    const client = clientReturning([0, 3]);
    expect(await requestFiftyFifty("q1", client)).toEqual([0, 3]);
  });
});
```

- [ ] **Step 2: Correr y verificar FAIL** — `pnpm test src/lib/__tests__/gameplay`. Expected: FAIL.

- [ ] **Step 3: Implementar**

Create `app-web/src/lib/gameplay.ts`:
```ts
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
```

- [ ] **Step 4: Correr y verificar PASS** — `pnpm test src/lib/__tests__/gameplay`. Expected: PASS (3 tests).

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: capa de datos de gameplay (RPC)"
```

---

## Task 4: Gating "ya jugaste hoy" (TDD)

**Files:**
- Create: `app-web/src/lib/playedToday.ts`
- Test: `app-web/src/lib/__tests__/playedToday.test.ts`

- [ ] **Step 1: Test que falla**

Create `app-web/src/lib/__tests__/playedToday.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { hasPlayed, markPlayed } from "@/lib/playedToday";

describe("playedToday", () => {
  beforeEach(() => localStorage.clear());

  it("no ha jugado por defecto", () => {
    expect(hasPlayed("2026-06-14")).toBe(false);
  });

  it("queda marcado tras markPlayed", () => {
    markPlayed("2026-06-14", 315);
    expect(hasPlayed("2026-06-14")).toBe(true);
  });

  it("el marcado es por fecha", () => {
    markPlayed("2026-06-14", 315);
    expect(hasPlayed("2026-06-15")).toBe(false);
  });

  it("guarda el puntaje del día", () => {
    markPlayed("2026-06-14", 315);
    expect(getScore("2026-06-14")).toBe(315);
  });
});

import { getScore } from "@/lib/playedToday";
```

- [ ] **Step 2: Correr y verificar FAIL** — `pnpm test src/lib/__tests__/playedToday`. Expected: FAIL.

- [ ] **Step 3: Implementar**

Create `app-web/src/lib/playedToday.ts`:
```ts
const KEY = (date: string) => `trivia:played:${date}`;

export function hasPlayed(date: string): boolean {
  return localStorage.getItem(KEY(date)) !== null;
}

export function markPlayed(date: string, score: number): void {
  localStorage.setItem(KEY(date), String(score));
}

export function getScore(date: string): number | null {
  const v = localStorage.getItem(KEY(date));
  return v === null ? null : Number(v);
}
```

- [ ] **Step 4: Correr y verificar PASS** — `pnpm test src/lib/__tests__/playedToday`. Expected: PASS (4 tests).

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: gating ya-jugaste-hoy (localStorage)"
```

---

## Task 5: Hook de cuenta regresiva

**Files:**
- Create: `app-web/src/hooks/useCountdown.ts`
- Test: `app-web/src/hooks/__tests__/useCountdown.test.ts`

- [ ] **Step 1: Test que falla**

Create `app-web/src/hooks/__tests__/useCountdown.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCountdown } from "@/hooks/useCountdown";

describe("useCountdown", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("arranca en el valor inicial", () => {
    const { result } = renderHook(() => useCountdown(20, true));
    expect(result.current.secondsLeft).toBe(20);
  });

  it("decrementa con el tiempo", () => {
    const { result } = renderHook(() => useCountdown(20, true));
    act(() => { vi.advanceTimersByTime(3000); });
    expect(result.current.secondsLeft).toBe(17);
  });

  it("no baja de 0", () => {
    const { result } = renderHook(() => useCountdown(2, true));
    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.secondsLeft).toBe(0);
  });

  it("no corre si running es false", () => {
    const { result } = renderHook(() => useCountdown(20, false));
    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.secondsLeft).toBe(20);
  });
});
```

- [ ] **Step 2: Correr y verificar FAIL** — `pnpm test src/hooks`. Expected: FAIL.

- [ ] **Step 3: Implementar**

Create `app-web/src/hooks/useCountdown.ts`:
```ts
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
```

- [ ] **Step 4: Correr y verificar PASS** — `pnpm test src/hooks`. Expected: PASS (4 tests).

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: hook useCountdown"
```

---

## Task 6: Pantalla de una pregunta (QuestionView)

**Files:**
- Create: `app-web/src/components/game/QuestionView.tsx`
- Test: `app-web/src/components/game/__tests__/QuestionView.test.tsx`

Presentacional + interacción local: muestra categoría, enunciado, opciones (A–D), power-ups y timer. Recibe callbacks; NO conoce la red ni el puntaje. Estados de opción: idle / seleccionada / correcta / incorrecta (tras responder).

- [ ] **Step 1: Test que falla**

Create `app-web/src/components/game/__tests__/QuestionView.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuestionView } from "@/components/game/QuestionView";

const q = {
  slot: "facil" as const,
  category: "historia",
  difficulty: "facil",
  prompt: "¿Capital de Chile?",
  options: ["Lima", "Santiago", "Bogotá", "Quito"],
};

describe("QuestionView", () => {
  it("muestra enunciado y 4 opciones", () => {
    render(<QuestionView question={q} secondsLeft={20} hidden={[]} answeredIndex={null} correctIndex={null} onAnswer={() => {}} onFiftyFifty={() => {}} onExtraTime={() => {}} />);
    expect(screen.getByText("¿Capital de Chile?")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Lima|Santiago|Bogotá|Quito/ })).toHaveLength(4);
  });

  it("dispara onAnswer con el índice al tocar una opción", () => {
    const onAnswer = vi.fn();
    render(<QuestionView question={q} secondsLeft={20} hidden={[]} answeredIndex={null} correctIndex={null} onAnswer={onAnswer} onFiftyFifty={() => {}} onExtraTime={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Santiago" }));
    expect(onAnswer).toHaveBeenCalledWith(1);
  });

  it("oculta las opciones indicadas por 50/50", () => {
    render(<QuestionView question={q} secondsLeft={20} hidden={[0, 2]} answeredIndex={null} correctIndex={null} onAnswer={() => {}} onFiftyFifty={() => {}} onExtraTime={() => {}} />);
    expect(screen.queryByRole("button", { name: "Lima" })).toBeNull();
    expect(screen.getByRole("button", { name: "Santiago" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Correr y verificar FAIL** — `pnpm test src/components/game`. Expected: FAIL.

- [ ] **Step 3: Implementar**

Create `app-web/src/components/game/QuestionView.tsx`:
```tsx
"use client";
import { getCategory } from "@/lib/categories";

type Props = {
  question: {
    slot: "facil" | "media" | "dificil";
    category: string;
    difficulty: string;
    prompt: string;
    options: string[];
  };
  secondsLeft: number;
  hidden: number[];
  answeredIndex: number | null;
  correctIndex: number | null;
  onAnswer: (index: number) => void;
  onFiftyFifty: () => void;
  onExtraTime: () => void;
};

const LETTERS = ["A", "B", "C", "D"];

export function QuestionView({
  question, secondsLeft, hidden, answeredIndex, correctIndex,
  onAnswer, onFiftyFifty, onExtraTime,
}: Props) {
  const cat = getCategory(question.category);
  const locked = answeredIndex !== null;

  function optionClass(i: number): string {
    if (correctIndex === i) return "border-success bg-success/15 text-success";
    if (answeredIndex === i && correctIndex !== null && i !== correctIndex)
      return "border-danger bg-danger/15 text-danger";
    return "border-white/10 bg-white/5 text-white";
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
               style={{ backgroundColor: `${cat.color}22` }}>{cat.emoji}</div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-white/50">Categoría</div>
            <div className="text-sm font-bold">{cat.label}</div>
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-violet text-lg font-bold">
          {secondsLeft}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 text-lg font-semibold">
        {question.prompt}
      </div>

      <div className="flex flex-col gap-3">
        {question.options.map((opt, i) =>
          hidden.includes(i) ? null : (
            <button
              key={i}
              disabled={locked}
              onClick={() => onAnswer(i)}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition disabled:cursor-default ${optionClass(i)}`}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs font-bold">
                {LETTERS[i]}
              </span>
              {opt}
            </button>
          ),
        )}
      </div>

      <div className="mt-auto flex justify-center gap-3 pt-4">
        <button onClick={onFiftyFifty} disabled={locked}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg disabled:opacity-40">✂️</button>
        <button onClick={onExtraTime} disabled={locked}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg disabled:opacity-40">⏱️</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Correr y verificar PASS** — `pnpm test src/components/game`. Expected: PASS (3 tests).

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: QuestionView (pregunta, opciones, power-ups, timer)"
```

---

## Task 7: Máquina de juego + resultado (GameClient + ResultView)

**Files:**
- Create: `app-web/src/components/game/ResultView.tsx`
- Create: `app-web/src/components/game/GameClient.tsx`
- Test: `app-web/src/components/game/__tests__/GameClient.test.tsx`

`GameClient` orquesta: para cada pregunta corre el timer, al responder llama `submitAnswer`, revela, suma puntaje con `computeScore`, y tras 3 preguntas marca `markPlayed` y muestra `ResultView`. Recibe el set y (para test) un cliente Supabase inyectable.

- [ ] **Step 1: ResultView (presentacional)**

Create `app-web/src/components/game/ResultView.tsx`:
```tsx
"use client";
import { Mascot } from "@/components/Mascot";
import { Card } from "@/components/ui/Card";

export function ResultView({ total, breakdown }: {
  total: number;
  breakdown: { prompt: string; correct: boolean; points: number }[];
}) {
  const aciertos = breakdown.filter((b) => b.correct).length;
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center">
      <Mascot expression={aciertos >= 2 ? "victory" : "neutral"} size={84} />
      <div>
        <div className="text-sm text-white/60">Tu puntaje de hoy</div>
        <div className="text-5xl font-extrabold text-violet-light">{total}</div>
        <div className="mt-1 text-sm text-white/60">{aciertos} de {breakdown.length} correctas</div>
      </div>
      <Card className="w-full text-left">
        {breakdown.map((b, i) => (
          <div key={i} className="flex items-center justify-between border-b border-white/5 py-2 last:border-0">
            <span className="mr-2 flex-1 truncate text-sm text-white/80">{b.prompt}</span>
            <span className={`text-sm font-bold ${b.correct ? "text-success" : "text-danger"}`}>
              {b.correct ? `+${b.points}` : "0"}
            </span>
          </div>
        ))}
      </Card>
      <p className="text-sm text-white/50">Vuelve mañana para el próximo desafío 🦉</p>
    </div>
  );
}
```

- [ ] **Step 2: Test de GameClient (que falla)**

Create `app-web/src/components/game/__tests__/GameClient.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GameClient } from "@/components/game/GameClient";

const set = [
  { date: "2026-06-14", slot: "facil", category: "historia", difficulty: "facil", prompt: "P1", options: ["a", "b", "c", "d"] },
  { date: "2026-06-14", slot: "media", category: "ciencia", difficulty: "media", prompt: "P2", options: ["a", "b", "c", "d"] },
  { date: "2026-06-14", slot: "dificil", category: "arte", difficulty: "dificil", prompt: "P3", options: ["a", "b", "c", "d"] },
];

// cliente que siempre dice "correcto, índice 0"
const okClient = { rpc: vi.fn().mockResolvedValue({ data: { correct: true, correctIndex: 0 }, error: null }) } as never;

describe("GameClient", () => {
  beforeEach(() => localStorage.clear());

  it("avanza por las 3 preguntas y muestra el resultado", async () => {
    render(<GameClient date="2026-06-14" questions={set as never} client={okClient} questionIds={["q1","q2","q3"]} />);
    // P1
    expect(screen.getByText("P1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^A/ }));
    await waitFor(() => screen.getByText("P2"));
    fireEvent.click(screen.getByRole("button", { name: /^A/ }));
    await waitFor(() => screen.getByText("P3"));
    fireEvent.click(screen.getByRole("button", { name: /^A/ }));
    await waitFor(() => screen.getByText(/Tu puntaje de hoy/));
    // 3 aciertos => marca jugado
    expect(localStorage.getItem("trivia:played:2026-06-14")).not.toBeNull();
  });
});
```
> Nota para el implementador: tras responder, el avance a la siguiente pregunta puede requerir un pequeño delay (mostrar la respuesta correcta ~1 s antes de avanzar). En test, usar `waitFor`. Si usas un `setTimeout` para el avance, exponer el delay como prop con default (p. ej. `revealMs = 1200`) y pasarle `0` en el test para que avance al instante. Ajustar el test si hace falta, manteniendo la intención (recorre 3 preguntas → resultado).

- [ ] **Step 3: Implementar GameClient**

Create `app-web/src/components/game/GameClient.tsx`:
```tsx
"use client";
import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { QuestionView } from "@/components/game/QuestionView";
import { ResultView } from "@/components/game/ResultView";
import { useCountdown } from "@/hooks/useCountdown";
import { submitAnswer, requestFiftyFifty } from "@/lib/gameplay";
import { computeScore, TIME_LIMIT_MS } from "@/lib/scoring";
import { markPlayed } from "@/lib/playedToday";
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

  const q = questions[idx];
  const { secondsLeft } = useCountdown(20 + extra, answeredIndex === null && !done);

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
```
> Si el test del avance instantáneo lo requiere, el implementer pasa `revealMs={0}` en el render del test.

- [ ] **Step 4: Correr y verificar PASS** — `pnpm test src/components/game`. Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: GameClient (máquina de juego) + ResultView"
```

---

## Task 8: Ruta /jugar + enganche desde la home

**Files:**
- Create: `app-web/src/app/jugar/page.tsx`
- Modify: `app-web/src/components/PlayCTA.tsx`

- [ ] **Step 1: Página de juego (Server Component)**

Create `app-web/src/app/jugar/page.tsx`:
```tsx
import { getDailySet } from "@/lib/dailySet";
import { GameClient } from "@/components/game/GameClient";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function JugarPage() {
  const date = today();
  let questions;
  try {
    questions = await getDailySet(date);
  } catch {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
        <p className="text-lg font-semibold">No hay desafío para hoy todavía 🦉</p>
        <p className="text-sm text-white/60">Vuelve más tarde.</p>
      </main>
    );
  }
  const questionIds = questions.map((q) => q.id as unknown as string);
  return (
    <main className="flex flex-1 flex-col py-6">
      <GameClient date={date} questions={questions} questionIds={questionIds} />
    </main>
  );
}
```
> `getDailySet` debe devolver también `id` por pregunta (lo selecciona la vista). Confirmar que el `select` en `dailySet.ts` incluya `id`; si no, añadir `"id"` al `.select(...)` y al tipo `DailyQuestion`. (La vista ya expone `id`.)

- [ ] **Step 2: Enganchar el botón de la home** — editar `src/components/PlayCTA.tsx` para navegar a `/jugar` en vez de mostrar el mensaje provisional:
```tsx
"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function PlayCTA() {
  const router = useRouter();
  return (
    <Button className="w-full" onClick={() => router.push("/jugar")}>
      Jugar el desafío de hoy
    </Button>
  );
}
```

- [ ] **Step 3: Verificación manual** — `pnpm dev`, abrir http://localhost:3000 → "Jugar" → responder las 3 → ver resultado. Probar 50/50 y tiempo extra. Confirmar que al recargar `/jugar` el mismo día… (gating se aplica en el siguiente paso; por ahora solo verifica el flujo).

- [ ] **Step 4: Gating en la página** — en `src/app/jugar/page.tsx` el gating server-side no aplica (no hay identidad). Añadir gating client-side: envolver el render del juego con una comprobación en `GameClient` o un pequeño wrapper que, si `hasPlayed(date)`, muestre directamente el resultado guardado. Implementación mínima: en `GameClient`, al montar, `if (hasPlayed(date)) setDone con outcomes vacíos pero total = getScore(date)`. Mantener simple: mostrar un `ResultView` con el total guardado y sin breakdown. (Aceptable para V1.)

```tsx
// dentro de GameClient, añadir:
import { hasPlayed, getScore } from "@/lib/playedToday";
// ...
const [alreadyTotal, setAlreadyTotal] = useState<number | null>(null);
useEffect(() => {
  if (hasPlayed(date)) setAlreadyTotal(getScore(date) ?? 0);
}, [date]);
if (alreadyTotal !== null) {
  return <ResultView total={alreadyTotal} breakdown={[]} />;
}
```

- [ ] **Step 5: Verificar tests + build** — `pnpm test` (todo verde) y `pnpm build`.

- [ ] **Step 6: Commit**
```bash
git add -A && git commit -m "feat: ruta /jugar + enganche home + gating diario"
```

---

## Verificación final del Plan 3

- [ ] `pnpm test` → todos verdes (scoring, gameplay, playedToday, useCountdown, QuestionView, GameClient).
- [ ] `pnpm build` → compila.
- [ ] En el navegador: home → "Jugar" → 3 preguntas con timer → resultado con puntaje. 50/50 oculta 2 incorrectas; tiempo extra suma 10 s. Recargar `/jugar` el mismo día muestra el resultado guardado (no deja re-jugar).
- [ ] La respuesta correcta NO aparece en el HTML/payload antes de responder (verificar en Network/devtools que `v_daily_questions` no trae `correct_index` y que la validación pasa por la RPC).

**Entregable:** la trivia diaria es jugable de punta a punta para un usuario anónimo, con puntaje y power-ups, lista para que el Plan 4 agregue identidad (login), grupos y persistencia del puntaje (tabla `plays`) + replicación multi-grupo.

---

## Self-review (cobertura vs. spec §2)

- 3 preguntas/día, dificultad progresiva, timer → Task 6/7. ✓
- Scoring ponderado (100/200/400 + bonus velocidad) → Task 2. ✓
- 1 sola oportunidad por pregunta → `answeredIndex` bloquea reintento en QuestionView/GameClient. ✓
- Power-ups: 50/50 + tiempo extra → Task 1/6/7. **Pista pospuesta** (necesita contenido) — desviación consciente del spec, anotada. ⚠️
- Anti-trampa (no exponer respuesta) → RPC `check_answer`; payload sin `correct_index`. Robustez total (sesión server/one-shot) diferida al Plan 4 con auth. ✓ (parcial, documentado)
- Persistencia de puntaje + multi-grupo → fuera de alcance (Plan 4); en V1 se guarda en localStorage. ✓ (límite consciente)
- Sin placeholders de lógica: el único punto "a ajustar en ejecución" es el `revealMs` del test y confirmar `id` en el select de `dailySet.ts` (anotado en la tarea). ✓
