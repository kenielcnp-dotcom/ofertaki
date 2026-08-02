import { supabase } from './supabase/client';

export const departmentsService = {
  async list() {
    return supabase.from('departments').select('*').eq('is_active', true).order('sort_order');
  },
};
