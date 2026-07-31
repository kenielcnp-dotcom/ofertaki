import { supabase } from './supabase/client';
import type { ReportReason } from '../types/promotion';

export const reportsService = {
  async create(promotionId: string, userId: string, reason: ReportReason, details?: string) {
    return supabase
      .from('reports')
      .insert({ promotion_id: promotionId, user_id: userId, reason, details })
      .select()
      .single();
  },
};
