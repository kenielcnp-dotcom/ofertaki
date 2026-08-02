-- =============================================================
-- Campo "valor sem promoção" em promotions + rastreio de quando um
-- item da lista de compras foi marcado como comprado, para dar
-- suporte ao painel de economia mensal na tela de Lista.
-- =============================================================

-- 1. promotions.original_price ------------------------------------------

alter table public.promotions
  add column original_price numeric(10, 2);

-- Backfill: linhas existentes não têm valor original informado; usar o
-- próprio preço como padrão neutro (sem desconto registrado) antes de
-- aplicar NOT NULL — mesmo padrão da migration 0008 para market_id.
update public.promotions
  set original_price = price
  where original_price is null;

alter table public.promotions
  alter column original_price set not null;

alter table public.promotions
  add constraint promotions_original_price_check check (original_price >= price);

-- 2. lista_compras.purchased_at -------------------------------------------
-- Quando o item foi marcado como comprado (created_at é quando foi
-- adicionado à lista, não quando foi comprado). Mantido por trigger, não
-- pelo cliente, para não depender do relógio do dispositivo nem de o
-- client lembrar de zerar ao desmarcar.

alter table public.lista_compras
  add column purchased_at timestamptz;

-- Backfill: itens já marcados como comprados antes desta migration não têm
-- como saber quando de verdade — usa created_at como aproximação razoável.
update public.lista_compras
  set purchased_at = created_at
  where is_purchased and purchased_at is null;

create function public.set_lista_compras_purchased_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.is_purchased and not old.is_purchased then
    new.purchased_at := now();
  elsif not new.is_purchased and old.is_purchased then
    new.purchased_at := null;
  end if;
  return new;
end;
$$;

create trigger lista_compras_set_purchased_at
  before update on public.lista_compras
  for each row execute procedure public.set_lista_compras_purchased_at();

-- Função é trigger-only; segue o padrão de REVOKE das demais SECURITY
-- DEFINER internas (ver migration 0013).
revoke execute on function public.set_lista_compras_purchased_at() from public, anon, authenticated;
