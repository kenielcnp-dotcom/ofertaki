create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete restrict,
  title text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  image_url text not null,
  store_name text,
  status text not null default 'active' check (status in ('active', 'expired', 'removed')),
  expires_at timestamptz,
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  confirmations_count integer not null default 0,
  reports_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index promotions_status_created_at_idx on public.promotions (status, created_at desc);
create index promotions_category_status_idx on public.promotions (category_id, status);
create index promotions_user_id_idx on public.promotions (user_id);

alter table public.promotions enable row level security;

create policy "promotions_select_active_or_own"
  on public.promotions for select
  using (status = 'active' or auth.uid() = user_id);

create policy "promotions_insert_own"
  on public.promotions for insert
  with check (auth.uid() = user_id);

create policy "promotions_update_own"
  on public.promotions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "promotions_delete_own"
  on public.promotions for delete
  using (auth.uid() = user_id);

create trigger promotions_set_updated_at
  before update on public.promotions
  for each row execute procedure public.set_updated_at();

-- Contadores e dono nunca são editáveis pelo cliente, mesmo pelo próprio autor via UPDATE.
-- Revoga o privilégio de coluna do role "authenticated" (usado pelo PostgREST/client);
-- as triggers security definer de curtidas/comentários/confirmações rodam como dono da
-- função e não são afetadas por este REVOKE, então continuam podendo atualizar os contadores.
revoke update (likes_count, comments_count, confirmations_count, reports_count, user_id)
  on public.promotions from authenticated;
