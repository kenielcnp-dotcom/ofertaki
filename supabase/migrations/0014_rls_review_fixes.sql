-- Revisão final de RLS (Fase 6): promotions.status era editável pelo próprio
-- autor via UPDATE (a policy promotions_update_own só bloqueava contadores e
-- user_id, não status). Isso permitia ao autor reverter manualmente uma
-- promoção removida automaticamente por denúncia (reports_after_insert)
-- de volta para 'active', furando a proteção anti-fraude. A app nunca
-- atualiza status pelo cliente (só o servidor via trigger), então revogar
-- não muda nenhum comportamento hoje.
revoke update (status) on public.promotions from authenticated;
