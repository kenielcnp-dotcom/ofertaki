import { supabase } from './supabase/client';

const BUCKET = 'promotion-images';

export const storageService = {
  async uploadPromotionImage(userId: string, localUri: string) {
    const response = await fetch(localUri);
    const arrayBuffer = await response.arrayBuffer();
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, arrayBuffer, { contentType: 'image/jpeg' });

    if (error) {
      return { data: null, error };
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { data: data.publicUrl, error: null };
  },
};
