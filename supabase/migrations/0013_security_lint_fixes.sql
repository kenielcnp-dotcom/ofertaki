-- =============================================================
-- Correções do Database Linter (Security Advisor)
-- =============================================================

-- 1. function_search_path_mutable: set_updated_at sem search_path fixo.
alter function public.set_updated_at() set search_path = public;

-- 2. public_bucket_allows_listing: bucket público não precisa de policy de
-- SELECT para servir arquivos por URL direta (getPublicUrl não depende de RLS);
-- a policy só habilitava listagem via API, que a app não usa.
drop policy if exists "promotion_images_select_public" on storage.objects;

-- 3. adjust_promotion_counter era chamável via RPC por anon/authenticated e
-- aceitava o nome da coluna como texto livre sem validação — permitia alterar
-- qualquer coluna de promotions (ex: price) via /rest/v1/rpc. Corrige com
-- whitelist + revoga o EXECUTE público (as triggers internas continuam
-- funcionando: security definer roda com o privilégio do dono da função).
create or replace function public.adjust_promotion_counter(p_promotion_id uuid, p_column text, p_delta integer)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if p_column not in ('likes_count', 'comments_count', 'confirmations_count') then
    raise exception 'invalid counter column: %', p_column;
  end if;
  execute format('update public.promotions set %I = greatest(%I + $1, 0) where id = $2', p_column, p_column)
    using p_delta, p_promotion_id;
end;
$$;

revoke execute on function public.adjust_promotion_counter(uuid, text, integer) from public, anon, authenticated;

-- 4. Demais funções security definer de uso interno (só disparadas por
-- trigger) não precisam ser chamáveis via RPC público.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.likes_count_trigger() from public, anon, authenticated;
revoke execute on function public.confirmations_count_trigger() from public, anon, authenticated;
revoke execute on function public.comments_count_trigger() from public, anon, authenticated;
revoke execute on function public.award_points_create_promo() from public, anon, authenticated;
revoke execute on function public.award_points_receive_like() from public, anon, authenticated;
revoke execute on function public.award_points_receive_confirmation() from public, anon, authenticated;
revoke execute on function public.sync_reputation_score() from public, anon, authenticated;
revoke execute on function public.notify_promotion_author(uuid, uuid, text) from public, anon, authenticated;
revoke execute on function public.notify_on_like() from public, anon, authenticated;
revoke execute on function public.notify_on_confirmation() from public, anon, authenticated;
revoke execute on function public.notify_on_comment() from public, anon, authenticated;
revoke execute on function public.reports_after_insert() from public, anon, authenticated;

-- get_monthly_ranking fica de fora de propósito: é a RPC pública usada pelo
-- app (somente leitura, sem parâmetro perigoso).
