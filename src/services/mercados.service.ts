import { supabase } from './supabase/client';

export const mercadosService = {
  async list() {
    return supabase.from('mercados').select('*').eq('is_active', true).order('name');
  },
};
