-- =============================================================
-- Fase 5 (parte 1): Notificações e Denúncias
-- =============================================================

-- 1. Notificações ------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete cascade,
  promotion_id uuid references public.promotions (id) on delete cascade,
  type text not null check (type in ('like', 'comment', 'confirmation')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_id_created_at_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Cliente só pode marcar como lida, nunca criar/apagar (isso é feito pelos triggers abaixo).
create policy "notifications_update_own_read_state"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

revoke update (user_id, actor_id, promotion_id, type, created_at) on public.notifications from authenticated;

-- Helper de uso interno (parâmetros explícitos, não um trigger em si) chamado
-- pelos triggers abaixo — não pode acessar NEW diretamente pois não é invocada
-- pelo executor de triggers do Postgres.
create function public.notify_promotion_author(p_promotion_id uuid, p_actor_id uuid, p_type text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_author_id uuid;
begin
  select p.user_id into v_author_id
  from public.promotions p
  where p.id = p_promotion_id;

  if v_author_id is not null and v_author_id <> p_actor_id then
    insert into public.notifications (user_id, actor_id, promotion_id, type)
    values (v_author_id, p_actor_id, p_promotion_id, p_type);
  end if;
end;
$$;

create function public.notify_on_like()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  perform public.notify_promotion_author(new.promotion_id, new.user_id, 'like');
  return new;
end;
$$;

create trigger notifications_on_like
  after insert on public.likes
  for each row execute procedure public.notify_on_like();

create function public.notify_on_confirmation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  perform public.notify_promotion_author(new.promotion_id, new.user_id, 'confirmation');
  return new;
end;
$$;

create trigger notifications_on_confirmation
  after insert on public.confirmations
  for each row execute procedure public.notify_on_confirmation();

create function public.notify_on_comment()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  perform public.notify_promotion_author(new.promotion_id, new.user_id, 'comment');
  return new;
end;
$$;

create trigger notifications_on_comment
  after insert on public.comments
  for each row execute procedure public.notify_on_comment();

alter publication supabase_realtime add table public.notifications;

-- 2. Denúncias ----------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.promotions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null check (reason in ('expired', 'fake', 'wrong_price', 'inappropriate', 'other')),
  details text,
  created_at timestamptz not null default now(),
  unique (promotion_id, user_id)
);

create index reports_promotion_id_idx on public.reports (promotion_id);

alter table public.reports enable row level security;

create policy "reports_select_own"
  on public.reports for select
  using (auth.uid() = user_id);

create policy "reports_insert_own_not_author"
  on public.reports for insert
  with check (
    auth.uid() = user_id
    and not exists (
      select 1 from public.promotions p
      where p.id = promotion_id and p.user_id = auth.uid()
    )
  );

-- Threshold de auto-ocultação: 5 denúncias de usuários diferentes.
create function public.reports_after_insert()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.promotions
  set reports_count = reports_count + 1
  where id = new.promotion_id;

  update public.promotions
  set status = 'removed'
  where id = new.promotion_id
    and status = 'active'
    and reports_count >= 5;

  return new;
end;
$$;

create trigger reports_on_insert
  after insert on public.reports
  for each row execute procedure public.reports_after_insert();
