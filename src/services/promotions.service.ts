import { supabase } from './supabase/client';
import type { TablesInsert } from '../types/database.types';
import type { PromotionWithMarket } from '../types/promotion';

const PAGE_SIZE = 20;
const SELECT_WITH_MARKET = '*, mercados (name)';

export type PromotionSort = 'recent' | 'confirmed';

export const promotionsService = {
  async list({
    page = 0,
    search,
    marketId,
    departmentId,
    sort = 'recent',
  }: {
    page?: number;
    search?: string;
    marketId?: string;
    departmentId?: string;
    sort?: PromotionSort;
  } = {}) {
    let query = supabase
      .from('promotions')
      .select(SELECT_WITH_MARKET)
      .eq('status', 'active')
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (sort === 'confirmed') {
      query = query
        .order('confirmations_count', { ascending: false })
        .order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (search) {
      query = query.textSearch('search_vector', search, { type: 'websearch', config: 'portuguese' });
    }
    if (marketId) {
      query = query.eq('market_id', marketId);
    }
    if (departmentId) {
      query = query.eq('department_id', departmentId);
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
