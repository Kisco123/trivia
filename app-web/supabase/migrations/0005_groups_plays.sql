-- Plan 4 — grupos, plays, RLS y RPCs
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

create table if not exists public.plays (
  user_id uuid not null references auth.users(id),
  date date not null,
  score int not null,
  correct_count int not null,
  created_at timestamptz not null default now(),
  primary key (user_id, date)
);

-- Helper SECURITY DEFINER para evitar recursión de RLS en group_members.
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

create policy groups_read on public.groups for select
  using (public.is_member(id, auth.uid()));

create policy gm_read on public.group_members for select
  using (public.is_member(group_id, auth.uid()));

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

create policy plays_insert on public.plays for insert
  with check (user_id = auth.uid());

-- RPC: crear grupo (grupo + dueño como miembro + código).
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

-- RPC: unirse por código.
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
