import { supabase } from './supabase/client';

export const confirmationsService = {
  async listForPromotion(promotionId: string) {
    return supabase.from('confirmations').select('*').eq('promotion_id', promotionId);
  },

  async confirm(promotionId: string, userId: string) {
    return supabase.from('confirmations').insert({ promotion_id: promotionId, user_id: userId });
  },

  async unconfirm(promotionId: string, userId: string) {
    return supabase
      .from('confirmations')
      .delete()
      .eq('promotion_id', promotionId)
      .eq('user_id', userId);
  },
};
