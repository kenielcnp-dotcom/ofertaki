import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { promotionsService } from '../services/promotions.service';
import { likesService } from '../services/likes.service';
import { confirmationsService } from '../services/confirmations.service';
import { notFoundVotesService } from '../services/notFoundVotes.service';
import { commentsService } from '../services/comments.service';
import { ratingsService } from '../services/ratings.service';
import { useAuthContext } from '../contexts/AuthContext';
import type { CommentWithAuthor } from '../types/promotion';

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
      return (data ?? []) as CommentWithAuthor[];
    },
  });

  const notFoundVotesQuery = useQuery({
    queryKey: ['notFoundVotes', promotionId],
    queryFn: async () => {
      const { data, error } = await notFoundVotesService.listForPromotion(promotionId);
      if (error) throw error;
      return data ?? [];
    },
  });

  const ratingsQuery = useQuery({
    queryKey: ['ratings', promotionId],
    queryFn: async () => {
      const { data, error } = await ratingsService.listForPromotion(promotionId);
      if (error) throw error;
      return data ?? [];
    },
  });

  const hasLiked = !!userId && (likesQuery.data ?? []).some((like) => like.user_id === userId);
  const hasConfirmed =
    !!userId && (confirmationsQuery.data ?? []).some((confirmation) => confirmation.user_id === userId);
  const hasVotedNotFound =
    !!userId && (notFoundVotesQuery.data ?? []).some((vote) => vote.user_id === userId);
  const userRating =
    (userId && (ratingsQuery.data ?? []).find((rating) => rating.user_id === userId)?.score) || 0;

  function invalidateCounters() {
    queryClient.invalidateQueries({ queryKey: ['promotion', promotionId] });
    queryClient.invalidateQueries({ queryKey: ['likes', promotionId] });
    queryClient.invalidateQueries({ queryKey: ['confirmations', promotionId] });
  }

  function invalidateNotFoundVotes() {
    queryClient.invalidateQueries({ queryKey: ['promotion', promotionId] });
    queryClient.invalidateQueries({ queryKey: ['notFoundVotes', promotionId] });
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

  const toggleNotFound = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Faça login para avisar.');
      const { error } = hasVotedNotFound
        ? await notFoundVotesService.unvote(promotionId, userId)
        : await notFoundVotesService.vote(promotionId, userId);
      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['promotion', promotionId] });
      await queryClient.cancelQueries({ queryKey: ['notFoundVotes', promotionId] });

      const previousPromotion = queryClient.getQueryData(['promotion', promotionId]);
      const previousVotes = queryClient.getQueryData(['notFoundVotes', promotionId]);

      queryClient.setQueryData(['promotion', promotionId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          not_found_count: hasVotedNotFound
            ? Math.max(0, (old.not_found_count ?? 0) - 1)
            : (old.not_found_count ?? 0) + 1,
        };
      });

      queryClient.setQueryData(['notFoundVotes', promotionId], (old: any) => {
        if (!old) return old ?? [];
        if (hasVotedNotFound) {
          return old.filter((v: any) => v.user_id !== userId);
        }
        return [...old, { user_id: userId, promotion_id: promotionId, id: 'optimistic', created_at: new Date().toISOString() }];
      });

      return { previousPromotion, previousVotes };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPromotion) {
        queryClient.setQueryData(['promotion', promotionId], context.previousPromotion);
      }
      if (context?.previousVotes) {
        queryClient.setQueryData(['notFoundVotes', promotionId], context.previousVotes);
      }
    },
    onSettled: invalidateNotFoundVotes,
  });

  const rate = useMutation({
    mutationFn: async (score: number) => {
      if (!userId) throw new Error('Faça login para avaliar.');
      const { error } = await ratingsService.rate(promotionId, userId, score);
      if (error) throw error;
    },
    onMutate: async (score: number) => {
      await queryClient.cancelQueries({ queryKey: ['promotion', promotionId] });
      await queryClient.cancelQueries({ queryKey: ['ratings', promotionId] });

      const previousPromotion = queryClient.getQueryData(['promotion', promotionId]);
      const previousRatings = queryClient.getQueryData(['ratings', promotionId]);

      const nextRatings = (() => {
        const current = (previousRatings as { user_id: string; score: number }[] | undefined) ?? [];
        const withoutMine = current.filter((r) => r.user_id !== userId);
        return [...withoutMine, { user_id: userId, promotion_id: promotionId, id: 'optimistic', score, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
      })();
      const avg = nextRatings.length
        ? Math.round((nextRatings.reduce((sum, r) => sum + r.score, 0) / nextRatings.length) * 10) / 10
        : 0;

      queryClient.setQueryData(['ratings', promotionId], nextRatings);
      queryClient.setQueryData(['promotion', promotionId], (old: any) => {
        if (!old) return old;
        return { ...old, avg_rating: avg, ratings_count: nextRatings.length };
      });

      return { previousPromotion, previousRatings };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPromotion) {
        queryClient.setQueryData(['promotion', promotionId], context.previousPromotion);
      }
      if (context?.previousRatings) {
        queryClient.setQueryData(['ratings', promotionId], context.previousRatings);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['promotion', promotionId] });
      queryClient.invalidateQueries({ queryKey: ['ratings', promotionId] });
    },
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
    hasVotedNotFound,
    userRating,
    isAuthor: !!userId && promotionQuery.data?.user_id === userId,
    toggleLike,
    toggleConfirm,
    toggleNotFound,
    rate,
    addComment,
  };
}
