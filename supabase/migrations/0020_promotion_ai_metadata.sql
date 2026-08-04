-- Metadados de assistência por IA na publicação de promoções (Claude Vision
-- via Edge Function analyze-promotion-image). Não trava nada — só registra
-- se a publicação veio de uma foto validada pela IA e com que confiança,
-- pra uso futuro (ex: destacar promoções verificadas).

alter table public.promotions
  add column ai_assisted boolean not null default false,
  add column ai_confidence numeric;
