import { useQuery } from '@tanstack/react-query';
import { departmentsService } from '../services/departments.service';

export function useDepartments() {
  const query = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await departmentsService.list();
      if (error) throw error;
      return data ?? [];
    },
  });

  return { departments: query.data ?? [], loading: query.isLoading };
}
