-- Fase 1 das regras do feed: tipo de promoção + expiração por tempo, e o
-- voto "não encontrei mais" (contraponto de confirmations/likes). Ranking
-- por relevância, deduplicação e reputação negativa ficam pra depois.

alter table public.promotions
  add column promotion_type text not null default 'comum'
    check (promotion_type in ('relampago', 'comum', 'encarte')),
  add column last_confirmed_at timestamptz,
  add column not_found_count integer not null default 0;

revoke update (not_found_count) on public.promotions from authenticated;

-- 1. Tabela de votos "não encontrei mais" ------------------------------
-- Mesmo shape de `confirmations` (0004_social_interactions.sql).

create table public.promotion_not_found_votes (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.promotions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (promotion_id, user_id)
);

create index promotion_not_found_votes_promotion_id_idx
  on public.promotion_not_found_votes (promotion_id);

alter table public.promotion_not_found_votes enable row level security;

create policy "not_found_votes_select_public"
  on public.promotion_not_found_votes for select
  using (true);

create policy "not_found_votes_insert_own_not_author"
  on public.promotion_not_found_votes for insert
  with check (
    auth.uid() = user_id
    and not exists (
      select 1 from public.promotions p
      where p.id = promotion_id and p.user_id = auth.uid()
    )
  );

create policy "not_found_votes_delete_own"
  on public.promotion_not_found_votes for delete
  using (auth.uid() = user_id);

-- 2. Contador protegido — soma 'not_found_count' ao whitelist existente
-- de adjust_promotion_counter (0013_security_lint_fixes.sql).

create or replace function public.adjust_promotion_counter(p_promotion_id uuid, p_column text, p_delta integer)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if p_column not in ('likes_count', 'comments_count', 'confirmations_count', 'not_found_count') then
    raise exception 'invalid counter column: %', p_column;
  end if;
  execute format('update public.promotions set %I = greatest(%I + $1, 0) where id = $2', p_column, p_column)
    using p_delta, p_promotion_id;
end;
$$;

revoke execute on function public.adjust_promotion_counter(uuid, text, integer) from public, anon, authenticated;

create function public.not_found_votes_count_trigger()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.adjust_promotion_counter(new.promotion_id, 'not_found_count', 1);
    return new;
  elsif tg_op = 'DELETE' then
    perform public.adjust_promotion_counter(old.promotion_id, 'not_found_count', -1);
    return old;
  end if;
  return null;
end;
$$;

revoke execute on function public.not_found_votes_count_trigger() from public, anon, authenticated;

create trigger not_found_votes_after_change
  after insert or delete on public.promotion_not_found_votes
  for each row execute procedure public.not_found_votes_count_trigger();

-- 3. Auto-arquivamento em 10 votos, mesmo padrão de reports_after_insert
-- (0011_notifications_reports.sql) — sem mexer em pontos/reputação.

create function public.not_found_votes_after_insert()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.promotions
  set status = 'removed'
  where id = new.promotion_id
    and status = 'active'
    and not_found_count >= 10;

  return new;
end;
$$;

revoke execute on function public.not_found_votes_after_insert() from public, anon, authenticated;

create trigger not_found_votes_on_insert
  after insert on public.promotion_not_found_votes
  for each row execute procedure public.not_found_votes_after_insert();

-- 4. "Aproveitei essa oferta" (confirmations) passa a renovar o relógio
-- de frescor da promoção, usado pelos selos de queda gradual no cliente.

create or replace function public.confirmations_count_trigger()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.adjust_promotion_counter(new.promotion_id, 'confirmations_count', 1);
    update public.promotions set last_confirmed_at = now() where id = new.promotion_id;
    return new;
  elsif tg_op = 'DELETE' then
    perform public.adjust_promotion_counter(old.promotion_id, 'confirmations_count', -1);
    return old;
  end if;
  return null;
end;
$$;
