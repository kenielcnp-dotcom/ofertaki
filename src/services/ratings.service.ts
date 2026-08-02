import { supabase } from './supabase/client';

export const ratingsService = {
  async listForPromotion(promotionId: string) {
    return supabase.from('ratings').select('*').eq('promotion_id', promotionId);
  },

  async rate(promotionId: string, userId: string, score: number) {
    return supabase
      .from('ratings')
      .upsert({ promotion_id: promotionId, user_id: userId, score }, { onConflict: 'promotion_id,user_id' });
  },
};
