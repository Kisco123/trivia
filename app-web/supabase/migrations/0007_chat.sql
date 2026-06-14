-- Plan 6 — chat grupal (mensajes + reacciones + realtime)
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

create policy chat_read on public.chat_messages for select
  using (public.is_member(group_id, auth.uid()));
create policy chat_insert on public.chat_messages for insert
  with check (public.is_member(group_id, auth.uid()) and user_id = auth.uid());

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
