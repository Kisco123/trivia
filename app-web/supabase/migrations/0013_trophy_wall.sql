-- Muro de trofeos: ganador (mayor puntaje) de cada semana ya cerrada del grupo.
-- Se calcula al vuelo desde plays (sin tabla ni cron). Solo miembros.
create or replace function public.group_trophy_wall(p_group uuid)
returns table(week_start date, display_name text, score bigint)
language plpgsql stable security definer set search_path = public as $$
declare
  v_this_week date := date_trunc('week', (now() at time zone 'America/Santiago')::date)::date;
begin
  if not public.is_member(p_group, auth.uid()) then
    raise exception 'no autorizado';
  end if;

  return query
  with member_plays as (
    select gm.user_id, gm.display_name, p.score,
           date_trunc('week', p.date)::date as wk
    from public.group_members gm
    join public.plays p on p.user_id = gm.user_id
    where gm.group_id = p_group
      and date_trunc('week', p.date)::date < v_this_week
  ),
  weekly as (
    select wk, user_id, display_name, sum(score) as total
    from member_plays
    group by wk, user_id, display_name
  ),
  ranked as (
    select wk, display_name as dn, total,
           row_number() over (partition by wk order by total desc) as rn
    from weekly
  )
  select r.wk, r.dn, r.total::bigint
  from ranked r
  where r.rn = 1
  order by r.wk desc
  limit 8;
end;
$$;
grant execute on function public.group_trophy_wall(uuid) to anon, authenticated;
