# Plan 6 — Chat Grupal (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development o superpowers:executing-plans.

**Goal:** Cada grupo tiene un chat: los miembros envían mensajes de texto que aparecen **en tiempo real** para los demás, y pueden reaccionar a un mensaje con un emoji (👍 ❤️ 😂 🔥). Ruta `/grupos/[id]/chat`, enlazada desde la página del grupo.

**Architecture:** Tablas `chat_messages` y `message_reactions` con RLS (solo miembros). Los mensajes nuevos llegan por **Supabase Realtime** (las tablas se agregan a la publicación `supabase_realtime`). El `display_name` se denormaliza en cada mensaje para render directo. Reacciones: toggle (insert/delete) con conteo; se refrescan al cargar y tras la propia acción (sin realtime para reacciones en V1). Datos reales requieren auth anónima habilitada (Plan 4 Task 0); código y tests no.

**Tech Stack:** Supabase Postgres + Realtime · Next.js client components · Vitest.

---

## Estructura de archivos
- `app-web/supabase/migrations/0007_chat.sql` — tablas, RLS, publicación realtime.
- `app-web/src/lib/chat.ts` — `sendMessage`, `getMessages`, `subscribeMessages`, `toggleReaction`, `getReactionCounts`.
- `app-web/src/components/chat/ChatView.tsx` — lista + input + reacciones.
- `app-web/src/app/grupos/[id]/chat/page.tsx` — ruta del chat.
- Modificar `app-web/src/app/grupos/[id]/page.tsx` — botón "💬 Chat" hacia el chat.

---

## Task 1: Esquema de chat (migración 0007)

**Files:** Create `app-web/supabase/migrations/0007_chat.sql`

- [ ] **Step 1: Escribir**
```sql
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  display_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_group_idx on public.chat_messages(group_id, created_at);

create table if not exists public.message_reactions (
  message_id uuid not null references public.chat_messages(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  emoji text not null,
  primary key (message_id, user_id, emoji)
);

alter table public.chat_messages enable row level security;
alter table public.message_reactions enable row level security;

-- mensajes: leer/escribir si eres miembro del grupo
create policy chat_read on public.chat_messages for select
  using (public.is_member(group_id, auth.uid()));
create policy chat_insert on public.chat_messages for insert
  with check (public.is_member(group_id, auth.uid()) and user_id = auth.uid());

-- reacciones: leer si eres miembro del grupo del mensaje; escribir/borrar las propias
create policy react_read on public.message_reactions for select
  using (exists (
    select 1 from public.chat_messages m
    where m.id = message_reactions.message_id and public.is_member(m.group_id, auth.uid())
  ));
create policy react_insert on public.message_reactions for insert
  with check (user_id = auth.uid() and exists (
    select 1 from public.chat_messages m
    where m.id = message_reactions.message_id and public.is_member(m.group_id, auth.uid())
  ));
create policy react_delete on public.message_reactions for delete
  using (user_id = auth.uid());

-- realtime para mensajes nuevos
alter publication supabase_realtime add table public.chat_messages;
```

- [ ] **Step 2: Aplicar** (MCP `apply_migration` name `chat`, project `xbwlqebqcyifearzcasj`). Si la tabla ya está en la publicación, el ADD puede fallar; en ese caso quitar esa línea y reaplicar.
- [ ] **Step 3: Verificar** tablas + que `chat_messages` está en la publicación:
```sql
select tablename from pg_publication_tables where pubname='supabase_realtime' and tablename='chat_messages';
```
Expected: 1 fila.
- [ ] **Step 4: Commit** — `feat(db): chat (mensajes + reacciones + realtime)`

---

## Task 2: Capa de datos del chat (TDD)

**Files:** Create `app-web/src/lib/chat.ts` + test.

- [ ] **Step 1: Test** `src/lib/__tests__/chat.test.ts`:
```ts
import { describe, it, expect, vi } from "vitest";
import { sendMessage, getMessages, toggleReaction } from "@/lib/chat";

describe("chat data layer", () => {
  it("getMessages devuelve los mensajes ordenados", async () => {
    const msgs = [{ id: "m1", body: "hola", display_name: "Fran", user_id: "u1", created_at: "t" }];
    const client = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: msgs, error: null }),
          }),
        }),
      }),
    } as never;
    expect(await getMessages("g1", client)).toEqual(msgs);
  });

  it("sendMessage inserta y lanza en error", async () => {
    const client = {
      from: vi.fn().mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: { message: "boom" } }) }),
    } as never;
    await expect(sendMessage("g1", "u1", "Fran", "hola", client)).rejects.toThrow(/boom/);
  });

  it("toggleReaction inserta cuando no existe", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const client = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }),
        }),
        insert,
      }),
    } as never;
    await toggleReaction("m1", "u1", "🔥", client);
    expect(insert).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: FAIL** → **Step 3: Implementar** `src/lib/chat.ts`:
```ts
import type { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";

export type ChatMessage = {
  id: string;
  user_id: string;
  display_name: string;
  body: string;
  created_at: string;
};

export async function getMessages(
  groupId: string, client: SupabaseClient = getSupabaseClient(),
): Promise<ChatMessage[]> {
  const { data, error } = await client
    .from("chat_messages")
    .select("id, user_id, display_name, body, created_at")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`error leyendo mensajes: ${error.message}`);
  return (data ?? []) as ChatMessage[];
}

export async function sendMessage(
  groupId: string, userId: string, displayName: string, body: string,
  client: SupabaseClient = getSupabaseClient(),
): Promise<void> {
  const { error } = await client.from("chat_messages").insert({
    group_id: groupId, user_id: userId, display_name: displayName, body,
  });
  if (error) throw new Error(`error enviando mensaje: ${error.message}`);
}

export function subscribeMessages(
  groupId: string, onInsert: (m: ChatMessage) => void,
  client: SupabaseClient = getSupabaseClient(),
): RealtimeChannel {
  return client
    .channel(`chat:${groupId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "chat_messages", filter: `group_id=eq.${groupId}` },
      (payload) => onInsert(payload.new as ChatMessage),
    )
    .subscribe();
}

export async function toggleReaction(
  messageId: string, userId: string, emoji: string,
  client: SupabaseClient = getSupabaseClient(),
): Promise<void> {
  const { data } = await client
    .from("message_reactions").select("emoji")
    .eq("message_id", messageId).eq("user_id", userId).eq("emoji", emoji)
    .maybeSingle();
  if (data) {
    await client.from("message_reactions").delete()
      .eq("message_id", messageId).eq("user_id", userId).eq("emoji", emoji);
  } else {
    await client.from("message_reactions").insert({ message_id: messageId, user_id: userId, emoji });
  }
}

export async function getReactionCounts(
  messageIds: string[], client: SupabaseClient = getSupabaseClient(),
): Promise<Record<string, Record<string, number>>> {
  if (messageIds.length === 0) return {};
  const { data, error } = await client
    .from("message_reactions").select("message_id, emoji").in("message_id", messageIds);
  if (error) throw new Error(`error leyendo reacciones: ${error.message}`);
  const out: Record<string, Record<string, number>> = {};
  for (const r of (data ?? []) as { message_id: string; emoji: string }[]) {
    out[r.message_id] ??= {};
    out[r.message_id][r.emoji] = (out[r.message_id][r.emoji] ?? 0) + 1;
  }
  return out;
}
```

- [ ] **Step 4: PASS** + **Step 5: Commit** — `feat: capa de datos del chat`

---

## Task 3: ChatView (TDD)

**Files:** Create `app-web/src/components/chat/ChatView.tsx` + test.

Presentacional + interacción: recibe `messages`, `myUserId`, `onSend(body)`, `onReact(messageId, emoji)`, `reactionCounts`. Lista de burbujas (las propias alineadas a la derecha, violeta), input + botón enviar, y bajo cada mensaje un set de emojis para reaccionar con su conteo.

- [ ] **Step 1: Test** `src/components/chat/__tests__/ChatView.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatView } from "@/components/chat/ChatView";

const messages = [
  { id: "m1", user_id: "u1", display_name: "Sofía", body: "¡Gané hoy!", created_at: "t1" },
  { id: "m2", user_id: "me", display_name: "Fran", body: "Por poco", created_at: "t2" },
];

describe("ChatView", () => {
  it("muestra los mensajes", () => {
    render(<ChatView messages={messages} myUserId="me" reactionCounts={{}} onSend={() => {}} onReact={() => {}} />);
    expect(screen.getByText("¡Gané hoy!")).toBeInTheDocument();
    expect(screen.getByText("Por poco")).toBeInTheDocument();
  });
  it("envía un mensaje", () => {
    const onSend = vi.fn();
    render(<ChatView messages={messages} myUserId="me" reactionCounts={{}} onSend={onSend} onReact={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText(/mensaje/i), { target: { value: "hola" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar/i }));
    expect(onSend).toHaveBeenCalledWith("hola");
  });
  it("reacciona a un mensaje", () => {
    const onReact = vi.fn();
    render(<ChatView messages={messages} myUserId="me" reactionCounts={{}} onSend={() => {}} onReact={onReact} />);
    fireEvent.click(screen.getAllByRole("button", { name: "🔥" })[0]);
    expect(onReact).toHaveBeenCalledWith("m1", "🔥");
  });
});
```

- [ ] **Step 2: FAIL** → **Step 3: Implementar** `ChatView.tsx`. Requisitos (fijados por el test):
  - `"use client"`. Props: `{ messages: ChatMessage[]; myUserId: string; reactionCounts: Record<string, Record<string, number>>; onSend: (body: string) => void; onReact: (messageId: string, emoji: string) => void }` (importar `ChatMessage` de `@/lib/chat`).
  - Lista de mensajes: cada uno muestra `display_name` (salvo los propios) y `body`. Mensajes con `user_id === myUserId` alineados a la derecha con fondo violeta; los demás a la izquierda con fondo gris.
  - Input con placeholder que contenga "mensaje" + botón "Enviar"; al enviar llama `onSend(body)` con el texto y limpia el input (ignorar vacío).
  - Bajo cada mensaje, botones para los emojis `["👍","❤️","😂","🔥"]`; al click llaman `onReact(message.id, emoji)`. Mostrar el conteo de `reactionCounts[message.id]?.[emoji]` si > 0.
  - Estilo coherente (dark, violeta). Scroll de la lista si crece.
- [ ] **Step 4: PASS** + **Step 5: Commit** — `feat: ChatView (mensajes + reacciones)`

---

## Task 4: Ruta del chat + enlace

**Files:** Create `app-web/src/app/grupos/[id]/chat/page.tsx`; modify `app-web/src/app/grupos/[id]/page.tsx`.

- [ ] **Step 1: Página** `src/app/grupos/[id]/chat/page.tsx` (`"use client"`):
  - `id` vía `useParams()`. Al montar: `ensureSession()`, `getCurrentUserId()` → `myUserId`; `getMessages(id)` → estado; `getReactionCounts(ids)`; `subscribeMessages(id, append)` y limpiar la suscripción en el cleanup del `useEffect` (`client.removeChannel(channel)` o `channel.unsubscribe()`).
  - `onSend(body)` → `sendMessage(id, myUserId, displayName, body)` (displayName con `getDisplayName()`); el mensaje propio aparece por realtime o se agrega optimistamente.
  - `onReact(mid, emoji)` → `toggleReaction(mid, myUserId, emoji)` y refrescar conteos.
  - Render: header con "← Volver" a `/grupos/[id]` + `<ChatView .../>` dentro de `<main>`.
- [ ] **Step 2: Enlace** — en `src/app/grupos/[id]/page.tsx` añadir un botón/enlace "💬 Chat" (next/link a `/grupos/${id}/chat`) en el encabezado.
- [ ] **Step 3:** `pnpm test` verde + `pnpm build`. **Commit** — `feat: ruta de chat + enlace desde el grupo`

---

## Verificación final del Plan 6
- [ ] `pnpm test` verde (chat data + ChatView).
- [ ] `pnpm build` compila.
- [ ] (Con toggle + 2 sesiones) en un grupo, abrir Chat, escribir desde una sesión y ver el mensaje aparecer en la otra **sin recargar**; reaccionar con emoji y ver el conteo.

**Entregable:** chat grupal en tiempo real con reacciones. **Con esto el spec V1 queda completo** (jugar, identidad, grupos, rankings, chat). Quedan los ítems del backlog para el pitch.

---

## Self-review (cobertura vs. spec §2-chat)
- Chat grupal de texto → tablas + data layer + UI. ✓
- Tiempo real → Supabase Realtime (publicación + subscribeMessages). ✓
- Reacciones con emoji → message_reactions + toggle + conteos. ✓
- Solo miembros → RLS con is_member. ✓
- GIFs → backlog (no V1), coherente con el spec. ✓
- Verificación realtime end-to-end requiere el toggle del Plan 4 — documentado.
