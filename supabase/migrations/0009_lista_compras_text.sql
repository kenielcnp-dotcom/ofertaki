-- Allow text-only items in shopping list (not linked to a promotion)
alter table public.lista_compras
  add column if not exists text text,
  alter column promotion_id drop not null;

-- Remove the unique constraint that required promotion_id
alter table public.lista_compras
  drop constraint if exists lista_compras_promotion_id_key,
  drop constraint if exists lista_compras_user_id_promotion_id_key;

-- Add a more flexible unique constraint: user + promotion_id only when promotion_id is not null
-- (Postgres partial unique index handles this cleanly)
create unique index if not exists lista_compras_user_promotion_unique
  on public.lista_compras (user_id, promotion_id)
  where promotion_id is not null;
