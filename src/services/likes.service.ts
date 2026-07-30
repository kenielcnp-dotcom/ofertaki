import { supabase } from './supabase/client';

export const likesService = {
  async listForPromotion(promotionId: string) {
    return supabase.from('likes').select('*').eq('promotion_id', promotionId);
  },

  async like(promotionId: string, userId: string) {
    return supabase.from('likes').insert({ promotion_id: promotionId, user_id: userId });
  },

  async unlike(promotionId: string, userId: string) {
    return supabase.from('likes').delete().eq('promotion_id', promotionId).eq('user_id', userId);
  },
};
