-- Fase 2 (item 2/3) das regras do feed: deduplicação de promoções.
-- Decisão já registrada antes: "redireciona pra confirmar" em vez de
-- mesclar linhas no banco — este migration só entrega a busca de
-- candidatos parecidos (mercado + título por similaridade de texto +
-- preço numa faixa próxima); o redirecionamento em si é 100% client-side
-- (chama a `confirmations` que já existe).

create extension if not exists pg_trgm;

create index promotions_title_trgm_idx
  on public.promotions using gin (title gin_trgm_ops);

create or replace function public.find_similar_active_promotions(
  p_market_id uuid,
  p_title text,
  p_price numeric
)
returns setof public.promotions
language sql
stable
as $$
  select *
  from public.promotions
  where status = 'active'
    and market_id = p_market_id
    and similarity(title, p_title) > 0.35
    and price between p_price * 0.8 and p_price * 1.2
  order by similarity(title, p_title) desc
  limit 3;
$$;

comment on function public.find_similar_active_promotions(uuid, text, numeric) is
  'Candidatas a duplicata: mesmo mercado, título parecido (pg_trgm > 0.35) e preço dentro de ±20%. Usado no wizard de publicação para sugerir "confirmar" em vez de criar uma promoção repetida.';

grant execute on function public.find_similar_active_promotions(uuid, text, numeric) to authenticated;
