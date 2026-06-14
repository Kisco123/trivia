-- Plan 5 — RPCs de ranking
-- Racha: días consecutivos con play, terminando hoy (o ayer si aún no jugó hoy).
create or replace function public.current_streak(p_user uuid)
returns int language plpgsql stable security definer set search_path = public as $$
declare
  v_streak int := 0;
  v_day date := current_date;
begin
  if not exists (select 1 from public.plays where user_id = p_user and date = current_date) then
    v_day := current_date - 1;
  end if;
  loop
    if exists (select 1 from public.plays where user_id = p_user and date = v_day) then
      v_streak := v_streak + 1;
      v_day := v_day - 1;
    else
      exit;
    end if;
  end loop;
  return v_streak;
end;
$$;

-- Ranking del grupo por período. Solo miembros pueden verlo.
create or replace function public.group_ranking(p_group uuid, p_period text)
returns table(user_id uuid, display_name text, score bigint, days_played bigint, streak int, is_me boolean)
language plpgsql stable security definer set search_path = public as $$
declare
  v_from date;
begin
  if not public.is_member(p_group, auth.uid()) then
    raise exception 'no autorizado';
  end if;
  if p_period = 'hoy' then
    v_from := current_date;
  elsif p_period = 'semana' then
    v_from := date_trunc('week', current_date)::date;
  else
    v_from := (select season_start from public.groups where id = p_group);
  end if;

  return query
  select gm.user_id,
         gm.display_name,
         coalesce(sum(p.score), 0)::bigint,
         count(p.date)::bigint,
         public.current_streak(gm.user_id),
         (gm.user_id = auth.uid())
  from public.group_members gm
  left join public.plays p
    on p.user_id = gm.user_id and p.date >= v_from
  where gm.group_id = p_group
  group by gm.user_id, gm.display_name
  order by 3 desc, 4 desc;
end;
$$;
grant execute on function public.current_streak(uuid) to anon, authenticated;
grant execute on function public.group_ranking(uuid, text) to anon, authenticated;
