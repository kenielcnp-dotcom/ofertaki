-- =============================================================
-- Lista de compras compartilhada por convite (código)
--
-- Até aqui, cada item de `lista_compras` pertencia direto a um
-- `user_id` — lista 100% individual. Esta migration introduz o
-- conceito de "lista" como entidade própria (`listas`), com membros
-- (`lista_membros`) e convite por código (`lista_convites`), para
-- permitir dividir a mesma lista com outras pessoas (ex: casa).
--
-- Cada usuário pertence a no máximo uma lista por vez (dono da
-- própria, ou convidado em uma de outra pessoa) — não há suporte a
-- múltiplas listas por usuário (decisão de produto, ver
-- .claude/memory/decisions.md).
-- =============================================================

-- 1. Entidades novas ---------------------------------------------------------

create table public.listas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- "Quem pertence a qual lista" é a única fonte de verdade sobre posse —
-- `listas` não guarda owner_id de propósito, pra não duplicar esse fato.
create table public.lista_membros (
  id uuid primary key default gen_random_uuid(),
  lista_id uuid not null references public.listas (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('dono', 'convidado')),
  created_at timestamptz not null default now(),
  unique (user_id)
);

create index lista_membros_lista_id_idx on public.lista_membros (lista_id);

alter table public.listas enable row level security;
alter table public.lista_membros enable row level security;

-- Helpers SECURITY DEFINER: evitam que as policies de `lista_membros`
-- precisem consultar a própria tabela que estão protegendo (padrão
-- recomendado pelo Supabase pra fugir de recursão de RLS).
create function public.my_lista_id()
returns uuid
language sql
stable
security definer set search_path = public
as $$
  select lista_id from public.lista_membros where user_id = auth.uid();
$$;

create function public.is_lista_dono()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (select 1 from public.lista_membros where user_id = auth.uid() and role = 'dono');
$$;

grant execute on function public.my_lista_id() to authenticated;
grant execute on function public.is_lista_dono() to authenticated;

create policy "listas_select_member"
  on public.listas for select
  using (id = public.my_lista_id());

create policy "lista_membros_select_same_lista"
  on public.lista_membros for select
  using (lista_id = public.my_lista_id());

-- Só o dono remove convidados; ninguém remove o dono por aqui.
create policy "lista_membros_delete_by_owner"
  on public.lista_membros for delete
  using (role = 'convidado' and lista_id = public.my_lista_id() and public.is_lista_dono());

-- `listas`/`lista_membros` não têm policy de insert/update para o client —
-- só as funções SECURITY DEFINER abaixo escrevem aqui (mesmo padrão de
-- `notifications`/`points_ledger`: cliente nunca insere direto).

-- 2. `lista_compras` passa a pertencer a uma lista, não a um usuário --------

alter table public.lista_compras
  add column lista_id uuid references public.listas (id) on delete cascade;

-- Backfill: cada usuário que já tinha itens ganha sua própria lista
-- (como dono), e os itens existentes migram para ela.
do $$
declare
  r record;
  v_lista_id uuid;
begin
  for r in select distinct user_id from public.lista_compras where lista_id is null loop
    insert into public.listas default values returning id into v_lista_id;
    insert into public.lista_membros (lista_id, user_id, role) values (v_lista_id, r.user_id, 'dono');
    update public.lista_compras set lista_id = v_lista_id where user_id = r.user_id;
  end loop;
end $$;

alter table public.lista_compras alter column lista_id set not null;

-- `user_id` continua existindo — passa a significar "quem adicionou o
-- item" (attribution), não mais "dono exclusivo da lista".

drop policy "lista_compras_select_own" on public.lista_compras;
drop policy "lista_compras_insert_own" on public.lista_compras;
drop policy "lista_compras_update_own" on public.lista_compras;
drop policy "lista_compras_delete_own" on public.lista_compras;

-- Qualquer membro da lista lê e edita (adiciona/remove/marca) qualquer
-- item — lista realmente colaborativa, não "convidado só lê".
create policy "lista_compras_select_member"
  on public.lista_compras for select
  using (lista_id = public.my_lista_id());

create policy "lista_compras_insert_member"
  on public.lista_compras for insert
  with check (lista_id = public.my_lista_id() and user_id = auth.uid());

create policy "lista_compras_update_member"
  on public.lista_compras for update
  using (lista_id = public.my_lista_id())
  with check (lista_id = public.my_lista_id());

create policy "lista_compras_delete_member"
  on public.lista_compras for delete
  using (lista_id = public.my_lista_id());

-- A unicidade de "promoção já está na lista" agora é por lista, não por
-- usuário (dois membros não podem salvar a mesma promoção duas vezes).
drop index if exists lista_compras_user_promotion_unique;
create unique index lista_compras_lista_promotion_unique
  on public.lista_compras (lista_id, promotion_id)
  where promotion_id is not null;

-- 3. Atribuição de quem comprou (economia continua individual) --------------

alter table public.lista_compras
  add column purchased_by uuid references public.profiles (id) on delete set null;

-- Backfill: antes desta migration a lista era sempre individual, então
-- quem adicionou é sempre quem comprou.
update public.lista_compras
  set purchased_by = user_id
  where is_purchased and purchased_by is null;

create or replace function public.set_lista_compras_purchased_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.is_purchased and not old.is_purchased then
    new.purchased_at := now();
    new.purchased_by := auth.uid();
  elsif not new.is_purchased and old.is_purchased then
    new.purchased_at := null;
    new.purchased_by := null;
  end if;
  return new;
end;
$$;

-- REPLICA IDENTITY FULL: sem isso, eventos de DELETE via Realtime não
-- carregam colunas fora da PK (lista_id incluso) — o filtro por lista_id
-- do client (ver notifications.service.ts para o padrão de canal) não
-- teria como casar no delete.
alter table public.lista_compras replica identity full;

alter publication supabase_realtime add table public.lista_compras;
alter publication supabase_realtime add table public.lista_membros;

-- 4. Convite por código -------------------------------------------------------

create table public.lista_convites (
  id uuid primary key default gen_random_uuid(),
  lista_id uuid not null references public.listas (id) on delete cascade,
  code text not null,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (lista_id),
  unique (code)
);

alter table public.lista_convites enable row level security;
-- Sem nenhuma policy: o código só é lido/gerado via as funções abaixo
-- (o valor retorna no `return` da função, o client nunca faz select
-- direto na tabela) — mesmo espírito de `lista_convites` como
-- implementação interna, não uma tabela de API pública.

-- 5. RPCs públicas -------------------------------------------------------------

create function public.get_or_create_my_lista()
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_lista_id uuid;
begin
  select lista_id into v_lista_id from public.lista_membros where user_id = auth.uid();
  if v_lista_id is not null then
    return v_lista_id;
  end if;

  insert into public.listas default values returning id into v_lista_id;
  insert into public.lista_membros (lista_id, user_id, role) values (v_lista_id, auth.uid(), 'dono');
  return v_lista_id;
end;
$$;

create function public.regenerate_lista_convite()
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  v_lista_id uuid;
  v_code text;
  v_attempts integer := 0;
begin
  select lista_id into v_lista_id from public.lista_membros where user_id = auth.uid() and role = 'dono';
  if v_lista_id is null then
    raise exception 'Só o dono da lista pode gerar convites.';
  end if;

  loop
    v_code := upper(substr(md5(random()::text), 1, 6));
    exit when not exists (select 1 from public.lista_convites where code = v_code);
    v_attempts := v_attempts + 1;
    if v_attempts > 10 then
      raise exception 'Não foi possível gerar um código único, tente novamente.';
    end if;
  end loop;

  insert into public.lista_convites (lista_id, code, created_by)
    values (v_lista_id, v_code, auth.uid())
  on conflict (lista_id) do update set code = excluded.code, created_by = excluded.created_by, created_at = now();

  return v_code;
end;
$$;

create function public.get_or_create_lista_convite()
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  v_lista_id uuid;
  v_code text;
begin
  select lista_id into v_lista_id from public.lista_membros where user_id = auth.uid() and role = 'dono';
  if v_lista_id is null then
    raise exception 'Só o dono da lista pode gerar convites.';
  end if;

  select code into v_code from public.lista_convites where lista_id = v_lista_id;
  if v_code is not null then
    return v_code;
  end if;

  return public.regenerate_lista_convite();
end;
$$;

-- Move o usuário pra lista do código. Bloqueia se a lista atual dele já
-- tem itens ou outras pessoas, pra nunca abandonar dados em silêncio —
-- só troca de lista quando a atual está genuinamente vazia/sozinha.
create function public.redeem_lista_convite(p_code text)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_target_lista_id uuid;
  v_current_lista_id uuid;
begin
  select lista_id into v_target_lista_id
  from public.lista_convites
  where code = upper(trim(p_code));

  if v_target_lista_id is null then
    raise exception 'Código inválido.';
  end if;

  select lista_id into v_current_lista_id from public.lista_membros where user_id = auth.uid();

  if v_current_lista_id = v_target_lista_id then
    return v_target_lista_id;
  end if;

  if v_current_lista_id is not null then
    if exists (select 1 from public.lista_compras where lista_id = v_current_lista_id)
      or exists (select 1 from public.lista_membros where lista_id = v_current_lista_id and user_id <> auth.uid())
    then
      raise exception 'Sua lista atual já tem itens ou outras pessoas — saia dela antes de entrar em outra.';
    end if;

    delete from public.lista_membros where user_id = auth.uid();
  end if;

  insert into public.lista_membros (lista_id, user_id, role) values (v_target_lista_id, auth.uid(), 'convidado');
  return v_target_lista_id;
end;
$$;

grant execute on function public.get_or_create_my_lista() to authenticated;
grant execute on function public.regenerate_lista_convite() to authenticated;
grant execute on function public.get_or_create_lista_convite() to authenticated;
grant execute on function public.redeem_lista_convite(text) to authenticated;
