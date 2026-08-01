-- =============================================================
-- Fix: get_monthly_ranking retornava "structure of query does not
-- match function result type" (42804) porque a coluna total_points
-- era declarada como integer, mas sum(pl.points) retorna bigint.
-- Isso deixava a RankingScreen presa no skeleton loader pra sempre.
-- =============================================================

drop function if exists public.get_monthly_ranking(integer, uuid);

create function public.get_monthly_ranking(
  p_limit integer default 50,
  p_user_id uuid default null
)
returns table (
  user_id uuid,
  total_points bigint,
  rank bigint,
  display_name text,
  username text,
  avatar_url text
)
language plpgsql
stable
security definer set search_path = public
as $$
declare
  v_month_start timestamptz := date_trunc('month', now());
  v_month_end timestamptz := v_month_start + interval '1 month';
  v_limit integer := greatest(coalesce(p_limit, 50), 0);
begin
  -- Top N do mês atual.
  return query
    select
      r.user_id,
      r.total_points,
      r.rank,
      pr.display_name,
      pr.username,
      pr.avatar_url
    from (
      select
        pl.user_id,
        sum(pl.points) as total_points,
        rank() over (order by sum(pl.points) desc, pl.user_id asc) as rank
      from public.points_ledger pl
      where pl.created_at >= v_month_start and pl.created_at < v_month_end
      group by pl.user_id
    ) r
    left join public.profiles pr on pr.id = r.user_id
    order by r.rank asc
    limit v_limit;

  -- Posição do usuário atual quando ele fica fora do Top N (para o rodapé).
  if p_user_id is not null then
    return query
      select
        r.user_id,
        r.total_points,
        r.rank,
        pr.display_name,
        pr.username,
        pr.avatar_url
      from (
        select
          pl.user_id,
          sum(pl.points) as total_points,
          rank() over (order by sum(pl.points) desc, pl.user_id asc) as rank
        from public.points_ledger pl
        where pl.created_at >= v_month_start and pl.created_at < v_month_end
        group by pl.user_id
      ) r
      left join public.profiles pr on pr.id = r.user_id
      where r.user_id = p_user_id
        and r.rank > v_limit
      limit 1;
  end if;
end;
$$;

-- get_monthly_ranking é a única RPC pública de propósito (ver 0013);
-- mantém o grant explícito depois do drop+create.
grant execute on function public.get_monthly_ranking(integer, uuid) to anon, authenticated;
