import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '../services/categories.service';

export function useCategories() {
  const query = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await categoriesService.list();
      if (error) throw error;
      return data ?? [];
    },
  });

  return { categories: query.data ?? [], loading: query.isLoading };
}
