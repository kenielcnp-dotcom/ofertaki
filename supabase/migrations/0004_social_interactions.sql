create table public.likes (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.promotions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (promotion_id, user_id)
);

create table public.confirmations (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.promotions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (promotion_id, user_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.promotions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(btrim(body)) > 0),
  created_at timestamptz not null default now()
);

create index likes_promotion_id_idx on public.likes (promotion_id);
create index confirmations_promotion_id_idx on public.confirmations (promotion_id);
create index comments_promotion_id_created_at_idx on public.comments (promotion_id, created_at);

alter table public.likes enable row level security;
alter table public.confirmations enable row level security;
alter table public.comments enable row level security;

-- Leitura pública (curtidas/confirmações/comentários compõem a credibilidade da promoção).
create policy "likes_select_public" on public.likes for select using (true);
create policy "confirmations_select_public" on public.confirmations for select using (true);
create policy "comments_select_public" on public.comments for select using (true);

-- Escrita restrita ao próprio usuário, e nunca na própria promoção (bloqueia auto-curtida/auto-confirmação).
create policy "likes_insert_own_not_author"
  on public.likes for insert
  with check (
    auth.uid() = user_id
    and not exists (
      select 1 from public.promotions p
      where p.id = promotion_id and p.user_id = auth.uid()
    )
  );

create policy "likes_delete_own"
  on public.likes for delete
  using (auth.uid() = user_id);

create policy "confirmations_insert_own_not_author"
  on public.confirmations for insert
  with check (
    auth.uid() = user_id
    and not exists (
      select 1 from public.promotions p
      where p.id = promotion_id and p.user_id = auth.uid()
    )
  );

create policy "confirmations_delete_own"
  on public.confirmations for delete
  using (auth.uid() = user_id);

create policy "comments_insert_own"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "comments_delete_own"
  on public.comments for delete
  using (auth.uid() = user_id);

-- Mantém os contadores desnormalizados em promotions em sincronia, sem depender do cliente.
create function public.adjust_promotion_counter(p_promotion_id uuid, p_column text, p_delta integer)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  execute format('update public.promotions set %I = greatest(%I + $1, 0) where id = $2', p_column, p_column)
    using p_delta, p_promotion_id;
end;
$$;

create function public.likes_count_trigger()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.adjust_promotion_counter(new.promotion_id, 'likes_count', 1);
    return new;
  elsif tg_op = 'DELETE' then
    perform public.adjust_promotion_counter(old.promotion_id, 'likes_count', -1);
    return old;
  end if;
  return null;
end;
$$;

create trigger likes_after_change
  after insert or delete on public.likes
  for each row execute procedure public.likes_count_trigger();

create function public.confirmations_count_trigger()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.adjust_promotion_counter(new.promotion_id, 'confirmations_count', 1);
    return new;
  elsif tg_op = 'DELETE' then
    perform public.adjust_promotion_counter(old.promotion_id, 'confirmations_count', -1);
    return old;
  end if;
  return null;
end;
$$;

create trigger confirmations_after_change
  after insert or delete on public.confirmations
  for each row execute procedure public.confirmations_count_trigger();

create function public.comments_count_trigger()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.adjust_promotion_counter(new.promotion_id, 'comments_count', 1);
    return new;
  elsif tg_op = 'DELETE' then
    perform public.adjust_promotion_counter(old.promotion_id, 'comments_count', -1);
    return old;
  end if;
  return null;
end;
$$;

create trigger comments_after_change
  after insert or delete on public.comments
  for each row execute procedure public.comments_count_trigger();
