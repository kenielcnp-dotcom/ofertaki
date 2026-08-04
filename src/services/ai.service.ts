import { supabase } from './supabase/client';

export type PromotionImageAnalysis =
  | { valid: true; confidence: number; title?: string; price?: number; originalPrice?: number }
  | { valid: false; confidence: number; reason?: string };

export const aiService = {
  async analyzePromotionImage(imageBase64: string, mimeType: string = 'image/jpeg') {
    return supabase.functions.invoke<PromotionImageAnalysis>('analyze-promotion-image', {
      body: { imageBase64, mimeType },
    });
  },
};
