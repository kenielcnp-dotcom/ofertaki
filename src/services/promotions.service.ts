import { supabase } from './supabase/client';
import type { TablesInsert } from '../types/database.types';
import type { PromotionWithMarket } from '../types/promotion';

const PAGE_SIZE = 20;
const SELECT_WITH_MARKET = '*, mercados (name)';

export const promotionsService = {
  async list({ page = 0, search }: { page?: number; search?: string } = {}) {
    let query = supabase
      .from('promotions')
      .select(SELECT_WITH_MARKET)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const result = await query;
    return { ...result, data: result.data as PromotionWithMarket[] | null };
  },

  async getById(id: string) {
    const result = await supabase.from('promotions').select(SELECT_WITH_MARKET).eq('id', id).single();
    return { ...result, data: result.data as PromotionWithMarket | null };
  },

  async create(input: TablesInsert<'promotions'>) {
    return supabase.from('promotions').insert(input).select().single();
  },
};

export { PAGE_SIZE as PROMOTIONS_PAGE_SIZE };
