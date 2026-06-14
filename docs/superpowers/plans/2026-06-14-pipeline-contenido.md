# Plan 2 — Pipeline de Contenido (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan checkbox (`- [ ]`).

**Goal:** Supabase tiene un banco de preguntas en español (filtradas para el público chileno, etiquetadas por categoría y dificultad) y un "set diario" fijo de 3 preguntas (fácil/media/difícil) por fecha, leíble desde la app sin exponer la respuesta correcta.

**Architecture:** El esquema vive en migraciones SQL versionadas en el repo (`supabase/migrations/`). Las preguntas semilla se cargan como `INSERT`s en una migración (producidas por Claude: fetch desde APIs públicas + traducción a español neutro + filtro para Chile + dificultad). La lógica de selección del set diario es una función TypeScript pura y testeada; se usa en tiempo de autoría para pre-generar ~14 días de sets como SQL (todos los jugadores ven las mismas 3 preguntas un día dado → ranking justo). La app lee los sets a través de una **vista pública que NO expone la respuesta correcta**; la validación de respuestas será server-side en el Plan 3.

**Tech Stack:** Supabase Postgres (RLS + vistas) · SQL migrations · TypeScript · Vitest. Cliente `@supabase/supabase-js` ya configurado en `app-web/src/lib/supabase.ts`.

> **Cómo se aplican las migraciones:** dos caminos equivalentes; el ejecutor elige el que esté disponible:
> 1. **Supabase MCP** (si está reconectado): herramientas `apply_migration` / `execute_sql`.
> 2. **Manual:** pegar el SQL en el **SQL Editor** del dashboard de Supabase. (Requiere acción del usuario; el ejecutor debe pausar y pedírselo, entregándole el SQL exacto.)
> No usamos la service-role key en scripts en esta etapa (evita manejar un secreto de admin). Las inserciones van por migración SQL, no por cliente.

> **Convención de testing:** TDD real en la lógica con comportamiento (validación de preguntas, selección de set diario, lectura del set). Los pasos de SQL/migración se verifican con una consulta de comprobación cuyo resultado esperado está escrito.

---

## Estructura de archivos

- `app-web/supabase/migrations/0001_schema.sql` — tablas `questions`, `daily_sets`, RLS, vista pública.
- `app-web/supabase/migrations/0002_seed_questions.sql` — ~36 preguntas semilla (INSERT).
- `app-web/supabase/migrations/0003_seed_daily_sets.sql` — ~14 días de sets (INSERT), generados con la lógica de selección.
- `app-web/src/lib/questions.ts` — tipos `Question`, `Difficulty`, validador `parseQuestion`.
- `app-web/src/lib/dailySetSelection.ts` — función pura `selectDailySets`.
- `app-web/src/lib/dailySet.ts` — `getDailySet(date)` que lee la vista vía Supabase.
- `app-web/scripts/build-daily-sets.ts` — utilidad de autoría: toma las preguntas semilla y emite el SQL de `0003`.
- Tests en `__tests__/` junto a cada módulo.

---

## Task 1: Esquema de base de datos (migración 0001)

**Files:**
- Create: `app-web/supabase/migrations/0001_schema.sql`

- [ ] **Step 1: Escribir la migración de esquema**

Create `app-web/supabase/migrations/0001_schema.sql`:
```sql
-- Banco de preguntas
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  difficulty text not null check (difficulty in ('facil','media','dificil')),
  prompt text not null,
  options jsonb not null,            -- array de 4 strings
  correct_index int not null check (correct_index between 0 and 3),
  source text,
  created_at timestamptz not null default now(),
  constraint options_is_4 check (jsonb_array_length(options) = 4)
);

-- Set diario fijo y global (mismas 3 preguntas para todos en una fecha)
create table if not exists public.daily_sets (
  date date primary key,
  easy_id uuid not null references public.questions(id),
  medium_id uuid not null references public.questions(id),
  hard_id uuid not null references public.questions(id),
  created_at timestamptz not null default now()
);

-- Vista pública SIN la respuesta correcta (evita hacer trampa leyendo correct_index).
-- La validación de respuestas será server-side en el Plan 3.
create or replace view public.v_daily_questions as
select
  ds.date,
  q.id,
  case
    when q.id = ds.easy_id then 'facil'
    when q.id = ds.medium_id then 'media'
    else 'dificil'
  end as slot,
  q.category,
  q.difficulty,
  q.prompt,
  q.options
from public.daily_sets ds
join public.questions q
  on q.id in (ds.easy_id, ds.medium_id, ds.hard_id);

-- RLS: las tablas base NO son legibles por anon (protege correct_index).
alter table public.questions enable row level security;
alter table public.daily_sets enable row level security;
-- (sin políticas de SELECT para anon → anon no lee las tablas base directamente)

-- La vista se expone a lectura pública.
grant select on public.v_daily_questions to anon;
```

- [ ] **Step 2: Aplicar la migración**

Aplicar `0001_schema.sql` por Supabase MCP (`apply_migration`) o, si no está disponible, **pausar y pedir al usuario** que pegue el contenido en el SQL Editor de Supabase y lo ejecute.

- [ ] **Step 3: Verificar el esquema**

Ejecutar (MCP `execute_sql` o SQL Editor):
```sql
select table_name from information_schema.tables
where table_schema = 'public' and table_name in ('questions','daily_sets');
select table_name from information_schema.views
where table_schema = 'public' and table_name = 'v_daily_questions';
```
Expected: aparecen `questions`, `daily_sets` y la vista `v_daily_questions`.

- [ ] **Step 4: Commit**
```bash
git add -A && git commit -m "feat(db): esquema questions + daily_sets + vista pública"
```

---

## Task 2: Tipos y validador de preguntas (TDD)

**Files:**
- Create: `app-web/src/lib/questions.ts`
- Test: `app-web/src/lib/__tests__/questions.test.ts`

- [ ] **Step 1: Test que falla**

Create `app-web/src/lib/__tests__/questions.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { parseQuestion } from "@/lib/questions";

const valid = {
  category: "historia",
  difficulty: "facil",
  prompt: "¿En qué año cayó el muro de Berlín?",
  options: ["1987", "1989", "1991", "1985"],
  correctIndex: 1,
  source: "opentdb",
};

describe("parseQuestion", () => {
  it("acepta una pregunta válida", () => {
    expect(parseQuestion(valid)).toMatchObject({ difficulty: "facil", correctIndex: 1 });
  });

  it("rechaza si no hay exactamente 4 opciones", () => {
    expect(() => parseQuestion({ ...valid, options: ["a", "b", "c"] })).toThrow(/4 opciones/);
  });

  it("rechaza correctIndex fuera de rango", () => {
    expect(() => parseQuestion({ ...valid, correctIndex: 5 })).toThrow(/correctIndex/);
  });

  it("rechaza dificultad inválida", () => {
    expect(() => parseQuestion({ ...valid, difficulty: "imposible" })).toThrow(/dificultad/);
  });
});
```

- [ ] **Step 2: Correr y verificar FAIL** — `pnpm test src/lib/__tests__/questions`. Expected: FAIL (no existe `parseQuestion`).

- [ ] **Step 3: Implementar**

Create `app-web/src/lib/questions.ts`:
```ts
export type Difficulty = "facil" | "media" | "dificil";

export type Question = {
  category: string;
  difficulty: Difficulty;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  source?: string;
};

const DIFFICULTIES: Difficulty[] = ["facil", "media", "dificil"];

export function parseQuestion(raw: unknown): Question {
  const o = raw as Record<string, unknown>;

  if (!DIFFICULTIES.includes(o.difficulty as Difficulty)) {
    throw new Error(`dificultad inválida: ${String(o.difficulty)}`);
  }
  if (!Array.isArray(o.options) || o.options.length !== 4) {
    throw new Error("se requieren exactamente 4 opciones");
  }
  const idx = o.correctIndex;
  if (typeof idx !== "number" || idx < 0 || idx > 3) {
    throw new Error(`correctIndex fuera de rango: ${String(idx)}`);
  }
  if (typeof o.prompt !== "string" || o.prompt.trim() === "") {
    throw new Error("prompt vacío");
  }
  if (typeof o.category !== "string" || o.category.trim() === "") {
    throw new Error("category vacía");
  }

  return {
    category: o.category as string,
    difficulty: o.difficulty as Difficulty,
    prompt: o.prompt as string,
    options: o.options as [string, string, string, string],
    correctIndex: idx as 0 | 1 | 2 | 3,
    source: typeof o.source === "string" ? o.source : undefined,
  };
}
```

- [ ] **Step 4: Correr y verificar PASS** — `pnpm test src/lib/__tests__/questions`. Expected: PASS (4 tests).

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: tipos + validador de preguntas"
```

---

## Task 3: Lógica de selección del set diario (TDD)

**Files:**
- Create: `app-web/src/lib/dailySetSelection.ts`
- Test: `app-web/src/lib/__tests__/dailySetSelection.test.ts`

La función toma la lista de preguntas (con id y dificultad/categoría) y produce, para una secuencia de fechas, un set por día eligiendo una fácil, una media y una difícil **sin repetir** preguntas mientras haya stock, variando categorías cuando sea posible.

- [ ] **Step 1: Test que falla**

Create `app-web/src/lib/__tests__/dailySetSelection.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { selectDailySets, type Pickable } from "@/lib/dailySetSelection";

function make(n: number, difficulty: string, cat = "general"): Pickable[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `${difficulty}-${i}`,
    difficulty: difficulty as Pickable["difficulty"],
    category: cat,
  }));
}

const pool: Pickable[] = [
  ...make(3, "facil"),
  ...make(3, "media"),
  ...make(3, "dificil"),
];

describe("selectDailySets", () => {
  it("genera N sets con una pregunta de cada dificultad", () => {
    const sets = selectDailySets(pool, 3);
    expect(sets).toHaveLength(3);
    for (const s of sets) {
      expect(s.easyId).toMatch(/^facil-/);
      expect(s.mediumId).toMatch(/^media-/);
      expect(s.hardId).toMatch(/^dificil-/);
    }
  });

  it("no repite preguntas entre sets mientras haya stock", () => {
    const sets = selectDailySets(pool, 3);
    const easies = sets.map((s) => s.easyId);
    expect(new Set(easies).size).toBe(3);
  });

  it("lanza error si no alcanza el stock para N días", () => {
    expect(() => selectDailySets(pool, 4)).toThrow(/stock insuficiente/);
  });
});
```

- [ ] **Step 2: Correr y verificar FAIL** — `pnpm test src/lib/__tests__/dailySetSelection`. Expected: FAIL.

- [ ] **Step 3: Implementar**

Create `app-web/src/lib/dailySetSelection.ts`:
```ts
import type { Difficulty } from "@/lib/questions";

export type Pickable = {
  id: string;
  difficulty: Difficulty;
  category: string;
};

export type DailySetPick = {
  dayIndex: number;
  easyId: string;
  mediumId: string;
  hardId: string;
};

function take(pool: Pickable[], difficulty: Difficulty, count: number): string[] {
  const available = pool.filter((q) => q.difficulty === difficulty);
  if (available.length < count) {
    throw new Error(
      `stock insuficiente de dificultad ${difficulty}: hay ${available.length}, se piden ${count}`,
    );
  }
  return available.slice(0, count).map((q) => q.id);
}

/** Genera `days` sets, uno por día, sin repetir preguntas mientras haya stock. */
export function selectDailySets(pool: Pickable[], days: number): DailySetPick[] {
  const easy = take(pool, "facil", days);
  const medium = take(pool, "media", days);
  const hard = take(pool, "dificil", days);

  return Array.from({ length: days }, (_, i) => ({
    dayIndex: i,
    easyId: easy[i],
    mediumId: medium[i],
    hardId: hard[i],
  }));
}
```

- [ ] **Step 4: Correr y verificar PASS** — `pnpm test src/lib/__tests__/dailySetSelection`. Expected: PASS (3 tests).

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: lógica de selección de set diario"
```

---

## Task 4: Preguntas semilla (migración 0002)

**Files:**
- Create: `app-web/supabase/migrations/0002_seed_questions.sql`

> **Esta tarea es de contenido.** El ejecutor (Claude) produce ~36 preguntas (12 fáciles, 12 medias, 12 difíciles) repartidas en categorías (`general, historia, ciencia, geografia, arte, cine, musica, deporte`), tomando como base preguntas de OpenTDB / The Trivia API pero **traducidas a español neutro, filtradas para el público chileno** (sin trivia muy estadounidense/oscura, sin respuestas cambiantes en el tiempo) y con dificultad ajustada a ese público. Cada pregunta: enunciado claro, 4 opciones plausibles, 1 correcta.

- [ ] **Step 1: Generar el SQL semilla**

Crear `app-web/supabase/migrations/0002_seed_questions.sql` con este encabezado y ~36 `INSERT`s con la forma exacta:
```sql
-- Preguntas semilla V1 (español neutro, filtradas para público chileno).
-- Generadas a partir de bancos públicos + curaduría. id determinista por slug para poder
-- referenciarlas en 0003 sin depender de uuids aleatorios.
insert into public.questions (id, category, difficulty, prompt, options, correct_index, source) values
  ('00000000-0000-4000-8000-000000000001', 'historia', 'facil',
   '¿En qué año cayó el muro de Berlín?',
   '["1987","1989","1991","1985"]'::jsonb, 1, 'curado'),
  -- ... (continuar hasta completar 12 fáciles, 12 medias, 12 difíciles)
  ('00000000-0000-4000-8000-000000000024', 'ciencia', 'dificil',
   '¿Qué científica recibió dos premios Nobel en disciplinas distintas?',
   '["Marie Curie","Rosalind Franklin","Lise Meitner","Dorothy Hodgkin"]'::jsonb, 0, 'curado')
on conflict (id) do nothing;
```
Reglas para el contenido (el ejecutor las cumple al redactar las 36):
- Usar uuids deterministas incrementales `...0001`..`...0024` (o hasta `...0036`) para poder referenciarlos en la Task 6.
- Exactamente 4 opciones por pregunta; `correct_index` apunta a la correcta.
- Español neutro, sin chilenismos ni argentinismos; temas de cultura general que un chileno promedio podría conocer.
- Repartir categorías; dificultad realista (fácil = muy conocido, difícil = requiere bastante cultura general).

- [ ] **Step 2: Aplicar la migración** (MCP `apply_migration` o SQL Editor, igual que Task 1).

- [ ] **Step 3: Verificar el conteo**

Ejecutar:
```sql
select difficulty, count(*) from public.questions group by difficulty order by difficulty;
```
Expected: `dificil 12`, `facil 12`, `media 12` (o los números que se hayan cargado, ≥ 14 por dificultad NO es necesario; con 12 alcanza para 12 días).

- [ ] **Step 4: Commit**
```bash
git add -A && git commit -m "feat(db): preguntas semilla en español (36)"
```

---

## Task 5: Lectura del set diario desde la app (TDD)

**Files:**
- Create: `app-web/src/lib/dailySet.ts`
- Test: `app-web/src/lib/__tests__/dailySet.test.ts`

`getDailySet(date)` consulta la vista `v_daily_questions` y devuelve las 3 preguntas (sin respuesta) ordenadas fácil→media→difícil. Se testea con un cliente Supabase simulado.

- [ ] **Step 1: Test que falla**

Create `app-web/src/lib/__tests__/dailySet.test.ts`:
```ts
import { describe, it, expect, vi } from "vitest";
import { getDailySet } from "@/lib/dailySet";

function fakeClient(rows: unknown[]) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: rows, error: null }),
      }),
    }),
  } as never;
}

const rows = [
  { date: "2026-06-14", slot: "media", category: "ciencia", difficulty: "media", prompt: "P2", options: ["a","b","c","d"] },
  { date: "2026-06-14", slot: "facil", category: "historia", difficulty: "facil", prompt: "P1", options: ["a","b","c","d"] },
  { date: "2026-06-14", slot: "dificil", category: "arte", difficulty: "dificil", prompt: "P3", options: ["a","b","c","d"] },
];

describe("getDailySet", () => {
  it("devuelve 3 preguntas ordenadas fácil→media→difícil", async () => {
    const set = await getDailySet("2026-06-14", fakeClient(rows));
    expect(set.map((q) => q.slot)).toEqual(["facil", "media", "dificil"]);
    expect(set[0].prompt).toBe("P1");
  });

  it("lanza si no hay set para la fecha", async () => {
    await expect(getDailySet("2026-01-01", fakeClient([]))).rejects.toThrow(/sin set/);
  });
});
```

- [ ] **Step 2: Correr y verificar FAIL** — `pnpm test src/lib/__tests__/dailySet`. Expected: FAIL.

- [ ] **Step 3: Implementar**

Create `app-web/src/lib/dailySet.ts`:
```ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";

export type DailyQuestion = {
  date: string;
  slot: "facil" | "media" | "dificil";
  category: string;
  difficulty: string;
  prompt: string;
  options: string[];
};

const ORDER = { facil: 0, media: 1, dificil: 2 } as const;

export async function getDailySet(
  date: string,
  client: SupabaseClient = getSupabaseClient(),
): Promise<DailyQuestion[]> {
  const { data, error } = await client
    .from("v_daily_questions")
    .select("date, slot, category, difficulty, prompt, options")
    .eq("date", date);

  if (error) throw new Error(`error leyendo set diario: ${error.message}`);
  const rows = (data ?? []) as DailyQuestion[];
  if (rows.length === 0) throw new Error(`sin set para la fecha ${date}`);

  return rows.sort((a, b) => ORDER[a.slot] - ORDER[b.slot]);
}
```

- [ ] **Step 4: Correr y verificar PASS** — `pnpm test src/lib/__tests__/dailySet`. Expected: PASS (2 tests).

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: getDailySet (lectura de la vista pública)"
```

---

## Task 6: Pre-generar sets diarios (migración 0003)

**Files:**
- Create: `app-web/supabase/migrations/0003_seed_daily_sets.sql`

> Se pre-generan ~12 días de sets a partir de las 36 preguntas semilla, usando la asignación de la lógica de la Task 3 (1 fácil + 1 media + 1 difícil por día, sin repetir). Se escribe como SQL explícito para no depender de la service-role key en runtime.

- [ ] **Step 1: Generar el SQL de sets**

Decidir la fecha de inicio = hoy. Mapear: día 0 → fácil `...0001`, media `...0009`, difícil `...0021` (los uuids exactos según cómo quedaron repartidas las dificultades en 0002). Crear `app-web/supabase/migrations/0003_seed_daily_sets.sql`:
```sql
-- Sets diarios pre-generados (12 días desde la fecha de inicio).
insert into public.daily_sets (date, easy_id, medium_id, hard_id) values
  (current_date + 0, '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-00000000000d', '00000000-0000-4000-8000-000000000019'),
  -- ... (continuar 12 filas, sin repetir ids; ajustar los uuids a los reales de 0002)
  (current_date + 11, '00000000-0000-4000-8000-00000000000c', '00000000-0000-4000-8000-000000000018', '00000000-0000-4000-8000-000000000024')
on conflict (date) do nothing;
```
El ejecutor debe usar los uuids reales según el reparto de dificultades de la Task 4 (12 fáciles `...01..0c`, 12 medias `...0d..18`, 12 difíciles `...19..24`, en hex). Verificar que cada id se use una sola vez.

- [ ] **Step 2: Aplicar la migración** (MCP o SQL Editor).

- [ ] **Step 3: Verificar**

Ejecutar:
```sql
select count(*) as dias from public.daily_sets;
select * from public.v_daily_questions where date = current_date order by slot;
```
Expected: `dias = 12`; la segunda consulta devuelve 3 filas (facil/media/dificil) para hoy, **sin** columna de respuesta correcta.

- [ ] **Step 4: Commit**
```bash
git add -A && git commit -m "feat(db): sets diarios pre-generados (12 días)"
```

---

## Verificación final del Plan 2

- [ ] `pnpm test` → todos los tests pasan (incluye los nuevos de questions, dailySetSelection, dailySet).
- [ ] `pnpm build` → compila.
- [ ] En Supabase: `select * from public.v_daily_questions where date = current_date;` devuelve 3 preguntas de hoy sin la respuesta.
- [ ] `getDailySet(hoy)` desde la app (probado vía test con cliente real opcional) devolvería esas 3.

**Entregable:** banco de preguntas en español + sets diarios fijos por fecha, leíbles desde la app sin filtrar la respuesta. Listo para que el Plan 3 (loop de juego) consuma `getDailySet` y construya la pantalla de juego con timer, scoring y power-ups.

---

## Notas / decisiones explícitas

- **Anti-cheat (respuesta):** la app NUNCA lee `correct_index` (las tablas base no son legibles por anon; solo la vista, que lo omite). La validación del acierto será server-side en el Plan 3 (route handler / Edge Function que recibe la respuesta y devuelve si es correcta + puntaje). Esto se construye en el Plan 3, no aquí.
- **Volumen semilla:** 36 preguntas = 12 días de contenido. Suficiente para validar retención con el grupo semilla. Cuando se acerquen a agotarse, se repite la Task 4/6 con un lote nuevo (o se importa el banco físico del usuario — backlog).
- **Automatización del pipeline (Edge Function + API de Claude):** queda en el backlog; para V1 el procesado lo hace Claude en sesión y se versiona como SQL.
- **i18n:** el esquema guarda `prompt`/`options` en español. Para inglés (backlog) se añadirían columnas `prompt_en`/`options_en` o una tabla de traducciones; no se construye ahora.

---

## Self-review (cobertura vs. spec §4)

- Fuente APIs públicas + procesado LLM (traducción + filtro chileno + dificultad) → Task 4 (contenido). ✓
- Revisión/aprobación humana → implícita: el usuario revisa el SQL semilla antes de aplicar (gate manual). ✓
- Estructura i18n-ready → nota explícita; esquema en español, ampliable. ✓ (columnas `_en` diferidas, coherente con "lanzar solo en español").
- Set diario de 3 (fácil/media/difícil), global y fijo por fecha → tablas + lógica + pre-generación. ✓
- Anti-cheat (no exponer respuesta) → vista sin `correct_index` + RLS; validación server-side diferida al Plan 3 (correcto, es gameplay). ✓
- Sin placeholders de código sin resolver: el único contenido "a completar" son las 36 preguntas de la Task 4 y el mapeo de uuids de la Task 6, que son trabajo de contenido propio de la ejecución, no lógica faltante. ✓
