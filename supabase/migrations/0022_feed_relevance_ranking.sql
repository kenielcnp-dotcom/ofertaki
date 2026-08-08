-- Fase 2 (item 1/3) das regras do feed: ranking por relevância.
-- "Por IA" na especificação original virou, na prática, um score calculado
-- por fórmula (frescor + engajamento), no mesmo espírito de freshnessTier
-- (Fase 1): sem chamada de modelo, sem custo por request, sem cron —
-- calculado na hora da leitura via "computed column" do PostgREST (função
-- que recebe a linha de `promotions` e é exposta como coluna ordenável).

create or replace function public.promotion_relevance_score(p public.promotions)
returns numeric
language sql
stable
as $$
  select
    greatest(0, 1 - (
      extract(epoch from (now() - coalesce(p.last_confirmed_at, p.created_at)))
      / nullif(
          case p.promotion_type
            when 'relampago' then 6 * 3600
            when 'encarte' then greatest(
              extract(epoch from (coalesce(p.expires_at, p.created_at + interval '48 hours') - p.created_at)),
              1
            )
            else 48 * 3600
          end,
          0
        )
    )) * 40
    + least(p.confirmations_count, 20) * 2
    + least(p.likes_count, 20) * 1
    + p.avg_rating * ln(1 + p.ratings_count) * 3
    - least(p.not_found_count, 10) * 2;
$$;

comment on function public.promotion_relevance_score(public.promotions) is
  'Score de relevância do feed: 40% frescor (tempo desde a última confirmação ou publicação, relativo à duração do tipo) + engajamento (confirmações, curtidas, avaliação) - penalidade de "não encontrei mais". Exposto como computed column pelo PostgREST, orderável via ?order=promotion_relevance_score.';

grant execute on function public.promotion_relevance_score(public.promotions) to anon, authenticated;
