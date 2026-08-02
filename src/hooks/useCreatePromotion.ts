import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { promotionsService } from '../services/promotions.service';
import { storageService } from '../services/storage.service';
import { categoriesService } from '../services/categories.service';
import { createPromotionSchema, type CreatePromotionInput } from '../utils/validation';
import { useAuthContext } from '../contexts/AuthContext';

const MVP_CATEGORY_SLUG = 'mercado';

export function useCreatePromotion() {
  const { session } = useAuthContext();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(input: CreatePromotionInput) {
    const parsed = createPromotionSchema.safeParse(input);
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
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      original_price: parsed.data.originalPrice,
      image_url: imageUrl,
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
