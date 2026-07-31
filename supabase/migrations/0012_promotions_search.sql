-- Fase 5 (parte 2): busca full-text, substituindo o ilike simples da Fase 2.
alter table public.promotions
  add column search_vector tsvector generated always as (
    to_tsvector('portuguese', title || ' ' || coalesce(description, ''))
  ) stored;

create index promotions_search_vector_idx on public.promotions using gin (search_vector);
