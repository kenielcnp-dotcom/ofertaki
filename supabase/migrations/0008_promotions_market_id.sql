alter table public.promotions add column market_id uuid references public.mercados (id);

-- Backfill de eventuais linhas de teste antes de tornar a coluna obrigatória.
update public.promotions
set market_id = (select id from public.mercados order by name limit 1)
where market_id is null;

alter table public.promotions alter column market_id set not null;

alter table public.promotions drop column store_name;

create index promotions_market_status_idx on public.promotions (market_id, status, created_at desc);
