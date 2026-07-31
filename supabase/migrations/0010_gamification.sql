-- =============================================================
-- Fase 4: Gamificação e Ranking mensal
-- =============================================================

-- 1. Ledger de pontos ------------------------------------------------------
-- Registro de créditos (e, no futuro, débitos) de pontos por usuário.
create table public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  points integer not null check (points <> 0),
  reason text not null check (reason in ('create_promo', 'receive_like', 'receive_confirmation')),
  created_at timestamptz not null default now()
);

create index points_ledger_user_id_idx on public.points_ledger (user_id);
create index points_ledger_created_at_idx on public.points_ledger (created_at);

alter table public.points_ledger enable row level security;

-- RLS: cada usuário só lê os próprios lançamentos.
-- Sem políticas de insert/update/delete: o cliente nunca escreve direto,
-- somente os triggers (security definer) abaixo inserem nesta tabela.
create policy "points_ledger_select_own"
  on public.points_ledger for select
  using (auth.uid() = user_id);

-- 2. Triggers de pontuação --------------------------------------------------

-- +10 ao usuário quando cria uma promoção.
create function public.award_points_create_promo()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.points_ledger (user_id, points, reason)
  values (new.user_id, 10, 'create_promo');
  return new;
end;
$$;

create trigger points_on_promotion_create
  after insert on public.promotions
  for each row execute procedure public.award_points_create_promo();

-- +2 ao autor da promoção quando ela recebe um like.
-- Nunca pontua a própria promoção (auto-curtida é bloqueada pelo RLS, mas
-- este guard duplica a proteção caso um caminho security definer apareça).
create function public.award_points_receive_like()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_author_id uuid;
begin
  select p.user_id into v_author_id
  from public.promotions p
  where p.id = new.promotion_id;

  if v_author_id is not null and v_author_id <> new.user_id then
    insert into public.points_ledger (user_id, points, reason)
    values (v_author_id, 2, 'receive_like');
  end if;
  return new;
end;
$$;

create trigger points_on_like
  after insert on public.likes
  for each row execute procedure public.award_points_receive_like();

-- +1 ao autor da promoção quando ela recebe uma confirmação.
create function public.award_points_receive_confirmation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_author_id uuid;
begin
  select p.user_id into v_author_id
  from public.promotions p
  where p.id = new.promotion_id;

  if v_author_id is not null and v_author_id <> new.user_id then
    insert into public.points_ledger (user_id, points, reason)
    values (v_author_id, 1, 'receive_confirmation');
  end if;
  return new;
end;
$$;

create trigger points_on_confirmation
  after insert on public.confirmations
  for each row execute procedure public.award_points_receive_confirmation();

-- 3. reputation_score espelhado a cada lançamento ----------------------------

create function public.sync_reputation_score()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles
  set reputation_score = reputation_score + new.points
  where id = new.user_id;
  return new;
end;
$$;

create trigger points_ledger_sync_reputation
  after insert on public.points_ledger
  for each row execute procedure public.sync_reputation_score();

-- reputation_score é dado derivado dos triggers: o cliente não pode alterá-lo.
revoke update (reputation_score) on public.profiles from authenticated;

-- 4. Ranking mensal ---------------------------------------------------------
-- Agrega os pontos do mês atual. Retorna os Top N e, opcionalmente, anexa a
-- posição do usuário no fim caso ele esteja fora do Top N (para o rodapé).
create or replace function public.get_monthly_ranking(
  p_limit integer default 50,
  p_user_id uuid default null
)
returns table (
  user_id uuid,
  total_points integer,
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
