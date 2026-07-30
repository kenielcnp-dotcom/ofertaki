import { supabase } from './supabase/client';

export const categoriesService = {
  async list() {
    return supabase.from('categories').select('*').eq('is_active', true).order('name');
  },
};
