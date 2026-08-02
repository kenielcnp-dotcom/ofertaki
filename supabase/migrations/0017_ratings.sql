-- Avaliação por estrelas (1-5): qualquer usuário logado pode avaliar uma
-- promoção, um voto por usuário, pode trocar depois (update). avg_rating e
-- ratings_count em promotions são mantidos por trigger, mesmo padrão de
-- likes_count/confirmations_count (0004) + lockdown de 0013/0014.

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.promotions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (promotion_id, user_id)
);

alter table public.ratings enable row level security;

create policy "ratings_select_public" on public.ratings for select using (true);

create policy "ratings_insert_own_not_author"
  on public.ratings for insert
  with check (
    auth.uid() = user_id
    and not exists (select 1 from public.promotions p where p.id = promotion_id and p.user_id = auth.uid())
  );

create policy "ratings_update_own"
  on public.ratings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "ratings_delete_own"
  on public.ratings for delete
  using (auth.uid() = user_id);

create trigger ratings_set_updated_at
  before update on public.ratings
  for each row execute procedure public.set_updated_at();

alter table public.promotions
  add column avg_rating numeric(2, 1) not null default 0,
  add column ratings_count integer not null default 0;

create function public.ratings_sync_trigger()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target_id uuid := coalesce(new.promotion_id, old.promotion_id);
begin
  update public.promotions p
  set avg_rating = coalesce((select round(avg(score), 1) from public.ratings where promotion_id = target_id), 0),
      ratings_count = (select count(*) from public.ratings where promotion_id = target_id)
  where p.id = target_id;
  return coalesce(new, old);
end;
$$;

create trigger ratings_after_change
  after insert or update or delete on public.ratings
  for each row execute procedure public.ratings_sync_trigger();

revoke execute on function public.ratings_sync_trigger() from public, anon, authenticated;

-- Igual aos demais contadores: só a trigger (security definer) escreve aqui.
revoke update (avg_rating, ratings_count) on public.promotions from authenticated;
