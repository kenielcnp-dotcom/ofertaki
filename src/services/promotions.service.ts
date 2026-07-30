import { supabase } from './supabase/client';
import type { TablesInsert } from '../types/database.types';

const PAGE_SIZE = 20;

export const promotionsService = {
  async list({ page = 0, search }: { page?: number; search?: string } = {}) {
    let query = supabase
      .from('promotions')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    return query;
  },

  async getById(id: string) {
    return supabase.from('promotions').select('*').eq('id', id).single();
  },

  async create(input: TablesInsert<'promotions'>) {
    return supabase.from('promotions').insert(input).select().single();
  },
};

export { PAGE_SIZE as PROMOTIONS_PAGE_SIZE };
