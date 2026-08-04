import { useState } from 'react';
import { aiService, type PromotionImageAnalysis } from '../services/ai.service';

const MIN_CONFIDENCE = 40;

export function useAnalyzePromotionImage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze(base64: string): Promise<PromotionImageAnalysis | null> {
    setAnalyzing(true);
    setError(null);

    const { data, error: invokeError } = await aiService.analyzePromotionImage(base64);
    setAnalyzing(false);

    if (invokeError || !data) {
      setError('Não foi possível analisar a foto agora. Tente novamente.');
      return null;
    }

    if (data.valid && data.confidence < MIN_CONFIDENCE) {
      return {
        valid: false,
        confidence: data.confidence,
        reason: 'Não conseguimos ler os dados com confiança suficiente.',
      };
    }

    return data;
  }

  return { analyze, analyzing, error };
}
