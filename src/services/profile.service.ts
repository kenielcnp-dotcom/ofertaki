import { supabase } from './supabase/client';
import type { Profile } from '../types/user';

export const profileService = {
  async getById(id: string) {
    return supabase.from('profiles').select('*').eq('id', id).single();
  },

  async update(id: string, patch: Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'bio'>>) {
    return supabase.from('profiles').update(patch).eq('id', id).select().single();
  },
};
