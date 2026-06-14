# Plan 4 — Identidad + Grupos (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) o superpowers:executing-plans. Pasos con checkbox (`- [ ]`).

**Goal:** Cada visitante tiene una identidad (sesión anónima de Supabase). Su puntaje del día se guarda en la base (tabla `plays`, una por usuario/día). Puede crear un grupo, unirse a otro por código, y estar en varios grupos a la vez. El gating "ya jugaste hoy" pasa a ser por usuario en la base (no solo localStorage).

**Architecture:** Auth **client-side** con Supabase (anonymous sign-in automático en la primera visita; el `id` de `auth.users` es la identidad). Persistencia con RLS. Para evitar la recursión típica de RLS en `group_members`, las pertenencias se consultan con una función `SECURITY DEFINER` `is_member()`. Crear y unirse a grupos se hace con RPCs `create_group` / `join_group` (SECURITY DEFINER) para encapsular las inserciones y la generación del código. El nombre visible del jugador se guarda en `user_metadata` y se copia a `group_members.display_name` al unirse. Google OAuth se difiere (requiere setup en Google Cloud; backlog).

**Tech Stack:** Supabase Auth (anonymous) + Postgres RLS + RPC · `@supabase/supabase-js` · Next.js client components · Vitest.

> **Decisiones explícitas (validar en review):**
> - **Identidad anónima primero.** Sin Google ahora. El usuario juega y se une a grupos con una sesión anónima. Riesgo: si borra el navegador, pierde su identidad/grupos. Mitigación futura: vincular Google/Apple (backlog, requiere tu setup en Google Cloud).
> - **"Score único replicado" = un `plays` por usuario/día + JOIN.** No se duplica el puntaje por grupo; el ranking (Plan 5) une `plays` con `group_members`. Una sola fila sirve a todos los grupos del usuario. Cumple el spec sin redundancia.
> - **Gating server-side** por `unique(user_id, date)` en `plays`. localStorage queda como respaldo de UX.

> **Acción del usuario requerida (Task 0):** habilitar *Anonymous sign-ins* en el dashboard de Supabase (Authentication → Sign In / Providers → Anonymous). Sin esto, la auth anónima falla. Es un toggle.

---

## Estructura de archivos

- `app-web/supabase/migrations/0005_groups_plays.sql` — tablas, `is_member`, RLS, RPCs.
- `app-web/src/lib/auth.ts` — `ensureSession()`, `getCurrentUserId()`, `setDisplayName()`, `getDisplayName()`.
- `app-web/src/lib/plays.ts` — `savePlay()`, `getMyPlay()`.
- `app-web/src/lib/groups.ts` — `createGroup()`, `joinGroup()`, `getMyGroups()`.
- `app-web/src/components/groups/GroupsLobby.tsx` — lista de grupos + crear + unirse (client).
- `app-web/src/components/groups/DisplayNameGate.tsx` — pide nombre la primera vez.
- `app-web/src/app/grupos/page.tsx` — ruta de grupos.
- Modificar: `app-web/src/components/game/GameClient.tsx` — guardar `plays` al terminar.
- Modificar: `app-web/src/app/page.tsx` — el acceso "Grupos" del lobby deja de ser "Pronto".
- Tests junto a cada módulo con lógica.

---

## Task 0: Habilitar auth anónima (acción del usuario)

- [ ] **Step 1:** Pedir al usuario que, en el dashboard de Supabase del proyecto `xbwlqebqcyifearzcasj`, vaya a **Authentication → Providers (o Sign In)** y active **Anonymous sign-ins**. Confirmar que quedó activo antes de seguir.

---

## Task 1: Esquema grupos + plays (migración 0005)

**Files:** Create `app-web/supabase/migrations/0005_groups_plays.sql`

- [ ] **Step 1: Escribir la migración**
```sql
-- Grupos
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  owner_id uuid not null references auth.users(id),
  season_number int not null default 1,
  season_start date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  display_name text not null,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- Un puntaje por usuario por día (replica a todos sus grupos vía JOIN en el ranking)
create table if not exists public.plays (
  user_id uuid not null references auth.users(id),
  date date not null,
  score int not null,
  correct_count int not null,
  created_at timestamptz not null default now(),
  primary key (user_id, date)
);

-- Helper SECURITY DEFINER para evitar recursión de RLS en group_members
create or replace function public.is_member(p_group uuid, p_user uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group and user_id = p_user
  );
$$;

alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.plays enable row level security;

-- groups: los miembros pueden leer su grupo
create policy groups_read on public.groups for select
  using (public.is_member(id, auth.uid()));

-- group_members: un miembro ve a los miembros de sus grupos
create policy gm_read on public.group_members for select
  using (public.is_member(group_id, auth.uid()));

-- plays: leo lo mío y lo de mis co-miembros (para el ranking del Plan 5)
create policy plays_read on public.plays for select
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.group_members gm_me
      join public.group_members gm_other on gm_me.group_id = gm_other.group_id
      where gm_me.user_id = auth.uid() and gm_other.user_id = public.plays.user_id
    )
  );

-- plays: solo escribo lo mío (una vez por día por el PK)
create policy plays_insert on public.plays for insert
  with check (user_id = auth.uid());

-- RPC: crear grupo (inserta grupo + agrega al dueño como miembro, genera código)
create or replace function public.create_group(p_name text, p_display_name text)
returns public.groups language plpgsql security definer set search_path = public as $$
declare
  v_code text;
  v_group public.groups;
begin
  if auth.uid() is null then raise exception 'no autenticado'; end if;
  v_code := upper(substr(md5(random()::text), 1, 6));
  insert into public.groups (name, invite_code, owner_id)
    values (p_name, v_code, auth.uid())
    returning * into v_group;
  insert into public.group_members (group_id, user_id, display_name)
    values (v_group.id, auth.uid(), p_display_name);
  return v_group;
end;
$$;
grant execute on function public.create_group(text, text) to anon, authenticated;

-- RPC: unirse por código
create or replace function public.join_group(p_code text, p_display_name text)
returns public.groups language plpgsql security definer set search_path = public as $$
declare
  v_group public.groups;
begin
  if auth.uid() is null then raise exception 'no autenticado'; end if;
  select * into v_group from public.groups where invite_code = upper(p_code);
  if v_group.id is null then raise exception 'codigo invalido'; end if;
  insert into public.group_members (group_id, user_id, display_name)
    values (v_group.id, auth.uid(), p_display_name)
    on conflict (group_id, user_id) do nothing;
  return v_group;
end;
$$;
grant execute on function public.join_group(text, text) to anon, authenticated;
```

- [ ] **Step 2: Aplicar** (MCP `apply_migration` name `groups_plays`, project `xbwlqebqcyifearzcasj`).

- [ ] **Step 3: Verificar** — `list_tables` muestra `groups`, `group_members`, `plays`; las funciones existen:
```sql
select proname from pg_proc where proname in ('is_member','create_group','join_group');
```
Expected: las 3.

- [ ] **Step 4: Commit** — `git commit -m "feat(db): grupos, plays, RLS y RPCs"`

---

## Task 2: Capa de auth (sesión anónima + nombre)

**Files:** Create `app-web/src/lib/auth.ts` + test.

- [ ] **Step 1: Test (mock del cliente)** — `src/lib/__tests__/auth.test.ts`:
```ts
import { describe, it, expect, vi } from "vitest";
import { ensureSession, getCurrentUserId } from "@/lib/auth";

function client(session: unknown, user: unknown) {
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
      signInAnonymously: vi.fn().mockResolvedValue({ data: { user: { id: "anon-1" } }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
  } as never;
}

describe("auth", () => {
  it("no crea sesión si ya existe", async () => {
    const c = client({ user: { id: "u1" } }, null);
    await ensureSession(c);
    expect(c.auth.signInAnonymously).not.toHaveBeenCalled();
  });

  it("crea sesión anónima si no hay", async () => {
    const c = client(null, null);
    await ensureSession(c);
    expect(c.auth.signInAnonymously).toHaveBeenCalledOnce();
  });

  it("getCurrentUserId devuelve el id del usuario", async () => {
    const c = client(null, { id: "u9" });
    expect(await getCurrentUserId(c)).toBe("u9");
  });
});
```

- [ ] **Step 2: FAIL** — `pnpm test src/lib/__tests__/auth`.

- [ ] **Step 3: Implementar** — `src/lib/auth.ts`:
```ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";

export async function ensureSession(client: SupabaseClient = getSupabaseClient()): Promise<void> {
  const { data } = await client.auth.getSession();
  if (!data.session) {
    const { error } = await client.auth.signInAnonymously();
    if (error) throw new Error(`no se pudo iniciar sesión anónima: ${error.message}`);
  }
}

export async function getCurrentUserId(client: SupabaseClient = getSupabaseClient()): Promise<string | null> {
  const { data } = await client.auth.getUser();
  return data.user?.id ?? null;
}

export async function setDisplayName(name: string, client: SupabaseClient = getSupabaseClient()): Promise<void> {
  const { error } = await client.auth.updateUser({ data: { display_name: name } });
  if (error) throw new Error(`no se pudo guardar el nombre: ${error.message}`);
}

export async function getDisplayName(client: SupabaseClient = getSupabaseClient()): Promise<string | null> {
  const { data } = await client.auth.getUser();
  return (data.user?.user_metadata?.display_name as string) ?? null;
}
```

- [ ] **Step 4: PASS** + **Step 5: Commit** — `feat: capa de auth (sesión anónima + nombre)`

---

## Task 3: Capa de plays (guardar/leer puntaje del día)

**Files:** Create `app-web/src/lib/plays.ts` + test.

- [ ] **Step 1: Test** — `src/lib/__tests__/plays.test.ts`:
```ts
import { describe, it, expect, vi } from "vitest";
import { savePlay, getMyPlay } from "@/lib/plays";

describe("plays", () => {
  it("getMyPlay devuelve el puntaje si existe", async () => {
    const client = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: { score: 315, correct_count: 3 }, error: null }),
            }),
          }),
        }),
      }),
    } as never;
    expect(await getMyPlay("u1", "2026-06-14", client)).toEqual({ score: 315, correct_count: 3 });
  });

  it("savePlay inserta y lanza si hay error distinto de conflicto", async () => {
    const client = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: { code: "XXX", message: "boom" } }),
      }),
    } as never;
    await expect(savePlay("u1", "2026-06-14", 100, 1, client)).rejects.toThrow(/boom/);
  });

  it("savePlay ignora el conflicto (ya jugó)", async () => {
    const client = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: { code: "23505", message: "dup" } }),
      }),
    } as never;
    await expect(savePlay("u1", "2026-06-14", 100, 1, client)).resolves.toBeUndefined();
  });
});
```

- [ ] **Step 2: FAIL** → **Step 3: Implementar** — `src/lib/plays.ts`:
```ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";

export type Play = { score: number; correct_count: number };

export async function getMyPlay(
  userId: string, date: string, client: SupabaseClient = getSupabaseClient(),
): Promise<Play | null> {
  const { data, error } = await client
    .from("plays").select("score, correct_count")
    .eq("user_id", userId).eq("date", date).maybeSingle();
  if (error) throw new Error(`error leyendo play: ${error.message}`);
  return data as Play | null;
}

export async function savePlay(
  userId: string, date: string, score: number, correctCount: number,
  client: SupabaseClient = getSupabaseClient(),
): Promise<void> {
  const { error } = await client.from("plays").insert({
    user_id: userId, date, score, correct_count: correctCount,
  });
  // 23505 = unique_violation => ya jugó hoy, no es error real
  if (error && error.code !== "23505") throw new Error(`error guardando play: ${error.message}`);
}
```

- [ ] **Step 4: PASS** + **Step 5: Commit** — `feat: capa de plays (persistencia del puntaje)`

---

## Task 4: Capa de grupos (crear/unirse/listar)

**Files:** Create `app-web/src/lib/groups.ts` + test.

- [ ] **Step 1: Test** — `src/lib/__tests__/groups.test.ts`:
```ts
import { describe, it, expect, vi } from "vitest";
import { createGroup, joinGroup, getMyGroups } from "@/lib/groups";

const group = { id: "g1", name: "Familia", invite_code: "ABC123", owner_id: "u1" };

function rpcClient(data: unknown, error: unknown = null) {
  return { rpc: vi.fn().mockResolvedValue({ data, error }) } as never;
}

describe("groups", () => {
  it("createGroup devuelve el grupo creado", async () => {
    expect(await createGroup("Familia", "Fran", rpcClient(group))).toEqual(group);
  });

  it("joinGroup lanza con código inválido", async () => {
    await expect(joinGroup("XXX", "Fran", rpcClient(null, { message: "codigo invalido" })))
      .rejects.toThrow(/codigo invalido/);
  });

  it("getMyGroups lista los grupos del usuario", async () => {
    const client = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: [{ groups: group }], error: null }),
      }),
    } as never;
    expect(await getMyGroups(client)).toEqual([group]);
  });
});
```

- [ ] **Step 2: FAIL** → **Step 3: Implementar** — `src/lib/groups.ts`:
```ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";

export type Group = { id: string; name: string; invite_code: string; owner_id: string };

export async function createGroup(
  name: string, displayName: string, client: SupabaseClient = getSupabaseClient(),
): Promise<Group> {
  const { data, error } = await client.rpc("create_group", { p_name: name, p_display_name: displayName });
  if (error) throw new Error(`no se pudo crear el grupo: ${error.message}`);
  return data as Group;
}

export async function joinGroup(
  code: string, displayName: string, client: SupabaseClient = getSupabaseClient(),
): Promise<Group> {
  const { data, error } = await client.rpc("join_group", { p_code: code, p_display_name: displayName });
  if (error) throw new Error(error.message);
  return data as Group;
}

export async function getMyGroups(client: SupabaseClient = getSupabaseClient()): Promise<Group[]> {
  const { data, error } = await client.from("group_members").select("groups(*)");
  if (error) throw new Error(`error listando grupos: ${error.message}`);
  return (data ?? []).map((r: { groups: Group }) => r.groups);
}
```

- [ ] **Step 4: PASS** + **Step 5: Commit** — `feat: capa de grupos (crear/unirse/listar)`

---

## Task 5: Guardar el puntaje al terminar el juego

**Files:** Modify `app-web/src/components/game/GameClient.tsx`

- [ ] **Step 1:** Al montar, asegurar sesión: llamar `ensureSession()` y guardar `getCurrentUserId()` en estado. Reemplazar el gating: al montar, si `getMyPlay(userId, date)` existe → mostrar `ResultView` con ese puntaje (server-side gating). Mantener `markPlayed` (localStorage) como respaldo de UX rápido.
- [ ] **Step 2:** En el avance final (donde hoy se hace `markPlayed`), además llamar `savePlay(userId, date, total, aciertos)`.
- [ ] **Step 3:** Como `GameClient` recibe `client?` inyectable para tests, las nuevas llamadas usan ese mismo `client`. El test existente de `GameClient` pasa un mock con `rpc`; **ampliar el mock** para incluir `auth.getSession`, `auth.signInAnonymously`, `auth.getUser` y `from('plays')` devolviendo vacío, de modo que el flujo de 3 preguntas siga pasando. Mantener la intención del test.
- [ ] **Step 4:** `pnpm test` verde + `pnpm build`. **Commit** — `feat: guardar plays al terminar el juego`

> Nota: el guardado de `plays` solo ocurre si hay sesión; con auth anónima habilitada (Task 0) siempre la hay. Si la auth anónima está deshabilitada, `ensureSession` lanza y el juego debe seguir funcionando en modo local (capturar el error y caer al gating de localStorage). Implementar ese fallback con try/catch.

---

## Task 6: UI de grupos + nombre + lobby

**Files:** Create `DisplayNameGate.tsx`, `GroupsLobby.tsx`, `src/app/grupos/page.tsx`; modify `src/app/page.tsx`.

- [ ] **Step 1: DisplayNameGate** — componente client que, si `getDisplayName()` es null, muestra un input para el nombre y lo guarda con `setDisplayName`. Envuelve a sus children una vez hay nombre.
- [ ] **Step 2: GroupsLobby** — client component:
  - Al montar: `ensureSession()` → `getMyGroups()` → lista (nombre + código para compartir).
  - Botón "Crear grupo" → pide nombre del grupo → `createGroup(nombre, displayName)` → refresca lista y muestra el código de invitación.
  - Botón "Unirse" → input de código → `joinGroup(code, displayName)` → refresca.
  - Cada grupo enlaza a (futuro Plan 5) su ranking; por ahora muestra el grupo y su código.
- [ ] **Step 3: Página** `src/app/grupos/page.tsx` (client): monta `<DisplayNameGate><GroupsLobby/></DisplayNameGate>` dentro de un `<main>`.
- [ ] **Step 4: Lobby home** — en `src/app/page.tsx`, convertir el acceso "Grupos"/"Ranking" : el tile que hoy dice Ranking "Pronto" se mantiene; **añadir/был** un acceso a **Grupos** que navegue a `/grupos` (usar un componente client con `useRouter` o un `<Link>`). Quitar el "Pronto" del de Grupos.
- [ ] **Step 5:** Verificación manual: crear grupo, copiar código, unirse desde otra pestaña/incógnito con el código, confirmar que ambos aparecen como miembros. `pnpm test` + `pnpm build`. **Commit** — `feat: UI de grupos + nombre + acceso desde el lobby`

---

## Verificación final del Plan 4

- [ ] `pnpm test` verde (nuevos: auth, plays, groups + GameClient ampliado).
- [ ] `pnpm build` compila.
- [ ] Anonymous sign-in habilitado; al abrir la app se crea sesión sin pedir nada.
- [ ] Jugar guarda una fila en `plays`; re-entrar a `/jugar` el mismo día muestra el resultado desde la base.
- [ ] Crear grupo genera código; unirse con el código agrega al usuario a `group_members`; un usuario puede estar en 2+ grupos.
- [ ] RLS: un usuario solo ve grupos donde es miembro (probar que un código ajeno no expone otros grupos).

**Entregable:** identidad + persistencia + grupos multi. Listo para el Plan 5 (rankings: leer `plays` JOIN `group_members` por hoy/semana/temporada, podio, streaks) y Plan 6 (chat).

---

## Self-review (cobertura vs. spec §3 y §2-grupos)

- Auth anónima instantánea → Task 0/2. ✓ (Google diferido, documentado)
- Score único por usuario/día replicado a grupos → `plays` PK(user,date) + JOIN; sin duplicar. ✓
- Crear/unirse por código, multi-grupo → RPCs + RLS. ✓
- Gating server-side "ya jugaste" → `unique(user,date)` + getMyPlay. ✓
- Nombre visible del jugador → user_metadata + group_members.display_name. ✓
- RLS sin recursión → helper `is_member` SECURITY DEFINER. ✓
- Vinculación Google/Apple → backlog (requiere setup del usuario). ⚠️ documentado.
- Riesgo identidad anónima por dispositivo → documentado; se mitiga al vincular cuenta (backlog).
