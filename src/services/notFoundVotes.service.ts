import { supabase } from './supabase/client';

export const notFoundVotesService = {
  async listForPromotion(promotionId: string) {
    return supabase.from('promotion_not_found_votes').select('*').eq('promotion_id', promotionId);
  },

  async vote(promotionId: string, userId: string) {
    return supabase.from('promotion_not_found_votes').insert({ promotion_id: promotionId, user_id: userId });
  },

  async unvote(promotionId: string, userId: string) {
    return supabase
      .from('promotion_not_found_votes')
      .delete()
      .eq('promotion_id', promotionId)
      .eq('user_id', userId);
  },
};
