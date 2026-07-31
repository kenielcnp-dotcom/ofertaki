import { supabase } from './supabase/client';
import type { SignInInput, SignUpInput } from '../utils/validation';

export const authService = {
  async signUp({ username, email, password }: SignUpInput) {
    return supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
  },

  async signIn({ email, password }: SignInInput) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  async signOut() {
    return supabase.auth.signOut();
  },

  async resetPassword(email: string) {
    return supabase.auth.resetPasswordForEmail(email);
  },

  async getSession() {
    return supabase.auth.getSession();
  },
};
