-- Plan 2 — Task 1: esquema de contenido
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
-- (sin políticas de SELECT para anon -> anon no lee las tablas base directamente)

-- La vista se expone a lectura pública.
grant select on public.v_daily_questions to anon;
