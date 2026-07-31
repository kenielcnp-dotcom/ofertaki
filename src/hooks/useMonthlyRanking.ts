import { useQuery } from '@tanstack/react-query';
import { rankingService } from '../services/ranking.service';
import { useAuthContext } from '../contexts/AuthContext';

export const RANKING_LIMIT = 50;

export function useMonthlyRanking() {
  const { session } = useAuthContext();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['ranking', 'monthly', userId],
    queryFn: async () => {
      const { data, error } = await rankingService.getMonthlyRanking(RANKING_LIMIT, userId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}
