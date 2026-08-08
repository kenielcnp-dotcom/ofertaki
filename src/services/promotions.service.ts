import { supabase } from './supabase/client';
import type { TablesInsert } from '../types/database.types';
import type { Promotion, PromotionDetail, PromotionWithMarket } from '../types/promotion';

const PAGE_SIZE = 20;
const SELECT_WITH_MARKET = '*, mercados (name)';
const SELECT_DETAIL = '*, mercados (name), departments (name), profiles (username, reputation_score, avatar_url)';

export type PromotionSort = 'relevance' | 'recent' | 'confirmed';

export const promotionsService = {
  async list({
    page = 0,
    search,
    marketId,
    departmentId,
    sort = 'relevance',
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
      .lt('not_found_count', 5)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (sort === 'confirmed') {
      query = query
        .order('confirmations_count', { ascending: false })
        .order('created_at', { ascending: false });
    } else if (sort === 'relevance') {
      query = query
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- computed column (PostgREST), não existe no tipo gerado da tabela
        .order('promotion_relevance_score' as any, { ascending: false })
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
    const result = await supabase.from('promotions').select(SELECT_DETAIL).eq('id', id).single();
    return { ...result, data: result.data as PromotionDetail | null };
  },

  async create(input: TablesInsert<'promotions'>) {
    return supabase.from('promotions').insert(input).select().single();
  },

  async findSimilar({ marketId, title, price }: { marketId: string; title: string; price: number }) {
    const result = await supabase.rpc('find_similar_active_promotions', {
      p_market_id: marketId,
      p_title: title,
      p_price: price,
    });
    return { ...result, data: result.data as unknown as Promotion[] | null };
  },
};

export { PAGE_SIZE as PROMOTIONS_PAGE_SIZE };
