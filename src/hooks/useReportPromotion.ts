import { useState } from 'react';
import { reportsService } from '../services/reports.service';
import { useAuthContext } from '../contexts/AuthContext';
import type { ReportReason } from '../types/promotion';

export function useReportPromotion(promotionId: string) {
  const { session } = useAuthContext();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(reason: ReportReason, details?: string) {
    if (!session) {
      setError('Faça login para denunciar.');
      return false;
    }
    setSubmitting(true);
    setError(null);
    const { error: submitError } = await reportsService.create(promotionId, session.user.id, reason, details);
    setSubmitting(false);
    if (submitError) {
      setError('Não foi possível enviar a denúncia. Você já denunciou esta promoção?');
      return false;
    }
    return true;
  }

  return { submit, submitting, error };
}
