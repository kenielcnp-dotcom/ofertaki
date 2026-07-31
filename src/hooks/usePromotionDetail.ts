import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { promotionsService } from '../services/promotions.service';
import { likesService } from '../services/likes.service';
import { confirmationsService } from '../services/confirmations.service';
import { commentsService } from '../services/comments.service';
import { useAuthContext } from '../contexts/AuthContext';

export function usePromotionDetail(promotionId: string) {
  const { session } = useAuthContext();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  const promotionQuery = useQuery({
    queryKey: ['promotion', promotionId],
    queryFn: async () => {
      const { data, error } = await promotionsService.getById(promotionId);
      if (error) throw error;
      return data;
    },
  });

  const likesQuery = useQuery({
    queryKey: ['likes', promotionId],
    queryFn: async () => {
      const { data, error } = await likesService.listForPromotion(promotionId);
      if (error) throw error;
      return data ?? [];
    },
  });

  const confirmationsQuery = useQuery({
    queryKey: ['confirmations', promotionId],
    queryFn: async () => {
      const { data, error } = await confirmationsService.listForPromotion(promotionId);
      if (error) throw error;
      return data ?? [];
    },
  });

  const commentsQuery = useQuery({
    queryKey: ['comments', promotionId],
    queryFn: async () => {
      const { data, error } = await commentsService.listForPromotion(promotionId);
      if (error) throw error;
      return data ?? [];
    },
  });

  const hasLiked = !!userId && (likesQuery.data ?? []).some((like) => like.user_id === userId);
  const hasConfirmed =
    !!userId && (confirmationsQuery.data ?? []).some((confirmation) => confirmation.user_id === userId);

  function invalidateCounters() {
    queryClient.invalidateQueries({ queryKey: ['promotion', promotionId] });
    queryClient.invalidateQueries({ queryKey: ['likes', promotionId] });
    queryClient.invalidateQueries({ queryKey: ['confirmations', promotionId] });
  }

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Faça login para curtir.');
      const { error } = hasLiked
        ? await likesService.unlike(promotionId, userId)
        : await likesService.like(promotionId, userId);
      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['promotion', promotionId] });
      await queryClient.cancelQueries({ queryKey: ['likes', promotionId] });

      const previousPromotion = queryClient.getQueryData(['promotion', promotionId]);
      const previousLikes = queryClient.getQueryData(['likes', promotionId]);

      // Optimistic: flip hasLiked and adjust counter
      queryClient.setQueryData(['promotion', promotionId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          likes_count: hasLiked
            ? Math.max(0, (old.likes_count ?? 0) - 1)
            : (old.likes_count ?? 0) + 1,
        };
      });

      queryClient.setQueryData(['likes', promotionId], (old: any) => {
        if (!old) return old ?? [];
        if (hasLiked) {
          return old.filter((l: any) => l.user_id !== userId);
        }
        return [...old, { user_id: userId, promotion_id: promotionId, id: 'optimistic', created_at: new Date().toISOString() }];
      });

      return { previousPromotion, previousLikes };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPromotion) {
        queryClient.setQueryData(['promotion', promotionId], context.previousPromotion);
      }
      if (context?.previousLikes) {
        queryClient.setQueryData(['likes', promotionId], context.previousLikes);
      }
    },
    onSettled: invalidateCounters,
  });

  const toggleConfirm = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Faça login para confirmar.');
      const { error } = hasConfirmed
        ? await confirmationsService.unconfirm(promotionId, userId)
        : await confirmationsService.confirm(promotionId, userId);
      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['promotion', promotionId] });
      await queryClient.cancelQueries({ queryKey: ['confirmations', promotionId] });

      const previousPromotion = queryClient.getQueryData(['promotion', promotionId]);
      const previousConfirmations = queryClient.getQueryData(['confirmations', promotionId]);

      // Optimistic: flip hasConfirmed and adjust counter
      queryClient.setQueryData(['promotion', promotionId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          confirmations_count: hasConfirmed
            ? Math.max(0, (old.confirmations_count ?? 0) - 1)
            : (old.confirmations_count ?? 0) + 1,
        };
      });

      queryClient.setQueryData(['confirmations', promotionId], (old: any) => {
        if (!old) return old ?? [];
        if (hasConfirmed) {
          return old.filter((c: any) => c.user_id !== userId);
        }
        return [...old, { user_id: userId, promotion_id: promotionId, id: 'optimistic', created_at: new Date().toISOString() }];
      });

      return { previousPromotion, previousConfirmations };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPromotion) {
        queryClient.setQueryData(['promotion', promotionId], context.previousPromotion);
      }
      if (context?.previousConfirmations) {
        queryClient.setQueryData(['confirmations', promotionId], context.previousConfirmations);
      }
    },
    onSettled: invalidateCounters,
  });

  const addComment = useMutation({
    mutationFn: async (body: string) => {
      if (!userId) throw new Error('Faça login para comentar.');
      const { error } = await commentsService.add(promotionId, userId, body);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', promotionId] });
      queryClient.invalidateQueries({ queryKey: ['promotion', promotionId] });
    },
  });

  return {
    promotion: promotionQuery.data,
    loading: promotionQuery.isLoading,
    isError: promotionQuery.isError,
    refetch: promotionQuery.refetch,
    comments: commentsQuery.data ?? [],
    hasLiked,
    hasConfirmed,
    isAuthor: !!userId && promotionQuery.data?.user_id === userId,
    toggleLike,
    toggleConfirm,
    addComment,
  };
}
