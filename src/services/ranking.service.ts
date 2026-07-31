import { supabase } from './supabase/client';
import type { MonthlyRankingRow } from '../types/ranking';

export const rankingService = {
  async getMonthlyRanking(limit = 50, userId?: string) {
    const { data, error } = await supabase.rpc('get_monthly_ranking', {
      p_limit: limit,
      p_user_id: userId ?? null,
    });
    return { data: data as MonthlyRankingRow[] | null, error };
  },
};
