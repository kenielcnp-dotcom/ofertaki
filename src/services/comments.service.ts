import { supabase } from './supabase/client';

export const commentsService = {
  async listForPromotion(promotionId: string) {
    return supabase
      .from('comments')
      .select('*')
      .eq('promotion_id', promotionId)
      .order('created_at', { ascending: true });
  },

  async add(promotionId: string, userId: string, body: string) {
    return supabase
      .from('comments')
      .insert({ promotion_id: promotionId, user_id: userId, body })
      .select()
      .single();
  },

  async remove(id: string) {
    return supabase.from('comments').delete().eq('id', id);
  },
};
