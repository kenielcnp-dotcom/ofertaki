import { useInfiniteQuery } from '@tanstack/react-query';
import { promotionsService, PROMOTIONS_PAGE_SIZE } from '../services/promotions.service';

export function usePromotions(search?: string) {
  return useInfiniteQuery({
    queryKey: ['promotions', search ?? ''],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const { data, error } = await promotionsService.list({ page: pageParam, search });
      if (error) throw error;
      return data ?? [];
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PROMOTIONS_PAGE_SIZE ? undefined : allPages.length,
  });
}
