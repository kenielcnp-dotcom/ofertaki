create table public.lista_compras (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  promotion_id uuid not null references public.promotions (id) on delete cascade,
  is_purchased boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, promotion_id)
);

create index lista_compras_user_id_idx on public.lista_compras (user_id, created_at desc);

alter table public.lista_compras enable row level security;

-- Lista de compras é privada: só o dono enxerga e mexe nos próprios itens.
create policy "lista_compras_select_own"
  on public.lista_compras for select
  using (auth.uid() = user_id);

create policy "lista_compras_insert_own"
  on public.lista_compras for insert
  with check (auth.uid() = user_id);

create policy "lista_compras_update_own"
  on public.lista_compras for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "lista_compras_delete_own"
  on public.lista_compras for delete
  using (auth.uid() = user_id);
