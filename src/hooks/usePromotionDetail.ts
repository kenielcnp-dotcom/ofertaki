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
    onSuccess: invalidateCounters,
  });

  const toggleConfirm = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Faça login para confirmar.');
      const { error } = hasConfirmed
        ? await confirmationsService.unconfirm(promotionId, userId)
        : await confirmationsService.confirm(promotionId, userId);
      if (error) throw error;
    },
    onSuccess: invalidateCounters,
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
    comments: commentsQuery.data ?? [],
    hasLiked,
    hasConfirmed,
    isAuthor: !!userId && promotionQuery.data?.user_id === userId,
    toggleLike,
    toggleConfirm,
    addComment,
  };
}
