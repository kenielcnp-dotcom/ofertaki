import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { promotionsService } from '../services/promotions.service';
import { storageService } from '../services/storage.service';
import { categoriesService } from '../services/categories.service';
import { createPromotionSchema, type CreatePromotionInput } from '../utils/validation';
import { durationForType } from '../utils/promotionInsights';
import { useAuthContext } from '../contexts/AuthContext';
import type { PromotionType } from '../types/promotion';

const MVP_CATEGORY_SLUG = 'mercado';

export type CreatePromotionSubmitInput = CreatePromotionInput & {
  /** Preenchido quando os dados vieram da análise de IA da foto (wizard de publicação). */
  aiAssisted?: boolean;
  aiConfidence?: number;
  promotionType: PromotionType;
  /** Só usado quando promotionType='encarte' — vira `expires_at` direto. */
  validUntil?: Date;
};

function computeExpiresAt(promotionType: PromotionType, validUntil?: Date): string | null {
  if (promotionType === 'encarte') {
    return validUntil ? validUntil.toISOString() : null;
  }
  const duration = durationForType(promotionType);
  return duration ? new Date(Date.now() + duration).toISOString() : null;
}

export function useCreatePromotion() {
  const { session } = useAuthContext();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(input: CreatePromotionSubmitInput) {
    const { aiAssisted, aiConfidence, promotionType, validUntil, ...toValidate } = input;
    const parsed = createPromotionSchema.safeParse(toValidate);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return false;
    }
    if (!session) {
      setError('Faça login para publicar.');
      return false;
    }

    setSubmitting(true);
    setError(null);

    const { data: category, error: categoryError } = await categoriesService.getBySlug(MVP_CATEGORY_SLUG);
    if (categoryError || !category) {
      setSubmitting(false);
      setError('Categoria padrão não encontrada. Tente novamente.');
      return false;
    }

    const { data: imageUrl, error: uploadError } = await storageService.uploadPromotionImage(
      session.user.id,
      parsed.data.imageUri
    );
    if (uploadError || !imageUrl) {
      setSubmitting(false);
      setError('Falha ao enviar a foto. Tente novamente.');
      return false;
    }

    const { error: createError } = await promotionsService.create({
      user_id: session.user.id,
      category_id: category.id,
      market_id: parsed.data.marketId,
      department_id: parsed.data.departmentId,
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      original_price: parsed.data.originalPrice,
      image_url: imageUrl,
      ai_assisted: aiAssisted ?? false,
      ai_confidence: aiConfidence ?? null,
      promotion_type: promotionType,
      expires_at: computeExpiresAt(promotionType, validUntil),
    });

    setSubmitting(false);

    if (createError) {
      setError(createError.message);
      return false;
    }

    queryClient.invalidateQueries({ queryKey: ['promotions'] });
    return true;
  }

  return { submit, submitting, error };
}
