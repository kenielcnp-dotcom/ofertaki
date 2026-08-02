import { useInfiniteQuery } from '@tanstack/react-query';
import { promotionsService, PROMOTIONS_PAGE_SIZE, type PromotionSort } from '../services/promotions.service';

type PromotionFilters = {
  marketId?: string;
  departmentId?: string;
  sort?: PromotionSort;
};

export function usePromotions(search?: string, filters: PromotionFilters = {}) {
  const { marketId, departmentId, sort = 'recent' } = filters;

  return useInfiniteQuery({
    queryKey: ['promotions', search ?? '', marketId ?? '', departmentId ?? '', sort],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const { data, error } = await promotionsService.list({
        page: pageParam,
        search,
        marketId,
        departmentId,
        sort,
      });
      if (error) throw error;
      return data ?? [];
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PROMOTIONS_PAGE_SIZE ? undefined : allPages.length,
  });
}
