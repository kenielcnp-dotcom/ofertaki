import { Fragment, useLayoutEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/common/Button';
import { ErrorState } from '../../components/common/ErrorState';
import { IconButton } from '../../components/common/IconButton';
import { Input } from '../../components/common/Input';
import { Skeleton } from '../../components/common/Skeleton';
import { ReportModal } from '../../components/promotion/ReportModal';
import { StarRating } from '../../components/promotion/StarRating';
import { usePromotionDetail } from '../../hooks/usePromotionDetail';
import { useListaCompras } from '../../hooks/useListaCompras';
import { useReportPromotion } from '../../hooks/useReportPromotion';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { typography, shadows } from '../../theme/typography';
import { formatPrice, formatPublishedAt, formatRelativeTime } from '../../utils/formatters';
import { discountPercent, freshnessTier, qualityLabel, type FreshnessTier } from '../../utils/promotionInsights';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import type { CommentWithAuthor } from '../../types/promotion';

type Props = NativeStackScreenProps<RootStackParamList, 'PromotionDetail'>;

const NOT_FOUND_WARNING_THRESHOLD = 3;

const TIER_META: Record<FreshnessTier, { label: string; icon: keyof typeof Ionicons.glyphMap; bg: string }> = {
  quente: { label: 'OFERTA QUENTE', icon: 'flame', bg: colors.secondary },
  recente: { label: 'Oferta recente', icon: 'leaf', bg: colors.success },
  pode_existir: { label: 'Pode ainda estar disponível', icon: 'help-circle', bg: colors.warning },
  antiga: { label: 'Promoção antiga', icon: 'time', bg: colors.textSubtle },
};

export function PromotionDetailScreen({ route, navigation }: Props) {
  const { promotionId } = route.params;
  const {
    promotion,
    loading,
    isError,
    refetch,
    comments,
    hasLiked,
    hasConfirmed,
    hasVotedNotFound,
    userRating,
    isAuthor,
    toggleLike,
    toggleConfirm,
    toggleNotFound,
    rate,
    addComment,
  } = usePromotionDetail(promotionId);
  const { addItem } = useListaCompras();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<CommentWithAuthor>>(null);
  const [commentBody, setCommentBody] = useState('');
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const { submit: submitReport, submitting: reportSubmitting, error: reportError } =
    useReportPromotion(promotionId);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        !isAuthor ? (
          <IconButton
            icon="flag"
            tone="danger"
            size={34}
            label="Denunciar promoção"
            onPress={() => setReportModalVisible(true)}
          />
        ) : null,
    });
  }, [navigation, isAuthor]);

  if (loading) {
    return (
      <View style={styles.content}>
        <Skeleton height={220} borderRadius={12} style={styles.skeletonImage} />
        <Skeleton height={24} width="70%" style={styles.skeletonLine} />
        <Skeleton height={20} width="30%" style={styles.skeletonLine} />
      </View>
    );
  }

  if (isError || !promotion) {
    return <ErrorState message="Não foi possível carregar essa promoção." onRetry={refetch} />;
  }

  const discount = discountPercent(promotion);
  const savings = promotion.original_price - promotion.price;
  const tier = freshnessTier(promotion);
  const tierMeta = tier ? TIER_META[tier] : null;
  const quality = qualityLabel(discount);
  const author = promotion.profiles;

  return (
    <Fragment>
      <FlatList
        ref={listRef}
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: 96 + insets.bottom }]}
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <Avatar username={item.profiles?.username} avatarUrl={item.profiles?.avatar_url} size={30} />
            <View style={styles.commentBody}>
              <View style={styles.commentHead}>
                <Text style={styles.commentName}>{item.profiles?.username ?? 'Alguém'}</Text>
                <Text style={styles.commentTime}>{formatRelativeTime(item.created_at)}</Text>
              </View>
              <Text style={styles.commentText}>{item.body}</Text>
            </View>
          </View>
        )}
        ListHeaderComponent={
          <View>
            <View style={styles.imageWrap}>
              <Image
                source={{ uri: promotion.image_url }}
                style={styles.image}
                accessible
                accessibilityLabel={`Foto de ${promotion.title}`}
              />
              <View style={styles.imageBadges}>
                {tierMeta ? (
                  <View style={[styles.pill, { backgroundColor: tierMeta.bg }]}>
                    <Ionicons name={tierMeta.icon} size={12} color={colors.textInverse} />
                    <Text style={styles.pillText}>{tierMeta.label}</Text>
                  </View>
                ) : null}
                {promotion.confirmations_count > 0 ? (
                  <View style={[styles.pill, { backgroundColor: colors.primary }]}>
                    <Ionicons name="checkmark" size={12} color={colors.textInverse} />
                    <Text style={styles.pillText}>Confirmada por {promotion.confirmations_count} pessoas</Text>
                  </View>
                ) : null}
                <View style={[styles.pill, styles.pillDark]}>
                  <Ionicons name="time-outline" size={12} color={colors.textInverse} />
                  <Text style={styles.pillText}>Publicada {formatRelativeTime(promotion.created_at)}</Text>
                </View>
                {promotion.not_found_count >= NOT_FOUND_WARNING_THRESHOLD ? (
                  <View style={[styles.pill, { backgroundColor: colors.danger }]}>
                    <Ionicons name="alert" size={12} color={colors.textInverse} />
                    <Text style={styles.pillText}>{promotion.not_found_count} pessoas não encontraram</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <Text style={typography.title}>{promotion.title}</Text>
            {promotion.mercados?.name ? (
              <View style={styles.storeRow}>
                <Ionicons name="storefront" size={14} color={colors.primary} />
                <Text style={styles.storeText}>{promotion.mercados.name}</Text>
              </View>
            ) : null}

            <View style={styles.priceCard}>
              <View>
                <Text style={styles.priceLabel}>PREÇO DA OFERTA</Text>
                <Text style={styles.priceNow}>{formatPrice(promotion.price)}</Text>
                {savings > 0 ? <Text style={styles.priceOld}>{formatPrice(promotion.original_price)}</Text> : null}
              </View>
              {savings > 0 ? (
                <View style={styles.priceRight}>
                  <Text style={styles.priceLabel}>VOCÊ ECONOMIZA</Text>
                  <View style={styles.savingsRow}>
                    <Text style={styles.savingsValue}>{formatPrice(savings)}</Text>
                    <View style={styles.offBadge}>
                      <Text style={styles.offBadgeText}>{discount}% OFF</Text>
                    </View>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${Math.min(discount, 100)}%` }]} />
                  </View>
                  {quality ? (
                    <View style={styles.qualityRow}>
                      <Ionicons name="star" size={11} color={colors.secondaryDark} />
                      <Text style={styles.qualityText}>{quality}</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>

            <View style={styles.trustCard}>
              <View style={styles.trustTop}>
                <View style={styles.trustIcon}>
                  <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
                </View>
                <Text style={styles.trustTitle}>Confiança da comunidade</Text>
              </View>
              <StarRating value={promotion.avg_rating} count={promotion.ratings_count} size={17} />

              <View style={styles.trustStats}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={hasLiked ? 'Descurtir' : 'Curtir'}
                  disabled={isAuthor || toggleLike.isPending}
                  onPress={() => toggleLike.mutate()}
                  style={styles.tstat}
                >
                  <View style={[styles.statIcon, { backgroundColor: hasLiked ? colors.danger : colors.dangerBg }]}>
                    <Ionicons name={hasLiked ? 'heart' : 'heart-outline'} size={14} color={hasLiked ? colors.textInverse : colors.danger} />
                  </View>
                  <Text style={styles.statValue}>{promotion.likes_count}</Text>
                  <Text style={styles.statLabel}>curtiram</Text>
                </Pressable>

                <View style={styles.tstat}>
                  <View style={[styles.statIcon, { backgroundColor: colors.primaryBg }]}>
                    <Ionicons name="chatbubble" size={13} color={colors.primary} />
                  </View>
                  <Text style={styles.statValue}>{promotion.comments_count}</Text>
                  <Text style={styles.statLabel}>comentários</Text>
                </View>

                <View style={styles.tstat}>
                  <View style={[styles.statIcon, { backgroundColor: colors.primaryBg }]}>
                    <Ionicons name="checkmark" size={14} color={colors.primary} />
                  </View>
                  <Text style={styles.statValue}>{promotion.confirmations_count}</Text>
                  <Text style={styles.statLabel}>confirmaram</Text>
                </View>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={hasConfirmed ? 'Remover confirmação' : 'Aproveitei essa oferta'}
              disabled={isAuthor}
              onPress={() => toggleConfirm.mutate()}
              style={[styles.ctaMain, hasConfirmed && styles.ctaMainActive, isAuthor && styles.ctaDisabled]}
            >
              {toggleConfirm.isPending ? (
                <ActivityIndicator color={colors.primaryText} />
              ) : (
                <Fragment>
                  <View style={styles.ctaMainRow}>
                    <Ionicons name="checkmark-circle" size={17} color={colors.primaryText} />
                    <Text style={styles.ctaMainText}>
                      {hasConfirmed ? 'Você aproveitou essa oferta' : 'Aproveitei essa oferta'}
                    </Text>
                  </View>
                  <Text style={styles.ctaSubText}>Ajude a comunidade a economizar!</Text>
                </Fragment>
              )}
            </Pressable>

            <View style={styles.secRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Adicionar à Lista"
                onPress={() => addItem.mutate(promotion.id)}
                disabled={addItem.isPending}
                style={styles.secBtn}
              >
                <View style={[styles.secIcon, { backgroundColor: colors.secondaryBg }]}>
                  <Ionicons name="list" size={15} color={colors.secondaryDark} />
                </View>
                <Text style={styles.secLabel}>Adicionar à Lista</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Comentar"
                onPress={() => listRef.current?.scrollToEnd({ animated: true })}
                style={styles.secBtn}
              >
                <View style={[styles.secIcon, { backgroundColor: colors.primaryBg }]}>
                  <Ionicons name="chatbubble-outline" size={15} color={colors.primary} />
                </View>
                <Text style={styles.secLabel}>Comentar</Text>
              </Pressable>

              {!isAuthor ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={hasVotedNotFound ? 'Desfazer aviso' : 'Não encontrei mais'}
                  onPress={() => toggleNotFound.mutate()}
                  disabled={toggleNotFound.isPending}
                  style={[styles.secBtn, hasVotedNotFound && styles.secBtnActive]}
                >
                  <View style={[styles.secIcon, { backgroundColor: colors.dangerBg }]}>
                    <Ionicons name="close-circle-outline" size={15} color={colors.danger} />
                  </View>
                  <Text style={[styles.secLabel, hasVotedNotFound && styles.secLabelActive]}>Não encontrei mais</Text>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.metaRow}>
              {promotion.departments?.name ? (
                <View style={styles.metaItem}>
                  <View style={styles.metaLbl}>
                    <Ionicons name="pricetags-outline" size={11} color={colors.secondaryDark} />
                    <Text style={styles.metaLblText}>Categoria</Text>
                  </View>
                  <Text style={styles.metaVal}>{promotion.departments.name}</Text>
                </View>
              ) : null}

              {author ? (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLblText}>Publicado por</Text>
                  <View style={styles.authorRow}>
                    <Avatar username={author.username} avatarUrl={author.avatar_url} size={22} />
                    <View>
                      <Text style={styles.metaVal}>{author.username}</Text>
                      <Text style={styles.repCaption}>{author.reputation_score} pontos</Text>
                    </View>
                  </View>
                </View>
              ) : null}

              <View style={styles.metaItem}>
                <View style={styles.metaLbl}>
                  <Ionicons name="time-outline" size={11} color={colors.textSubtle} />
                  <Text style={styles.metaLblText}>Publicado</Text>
                </View>
                <Text style={styles.metaVal}>{formatPublishedAt(promotion.created_at)}</Text>
              </View>
            </View>

            {!isAuthor ? (
              <View style={styles.ratingBlock}>
                <Text style={styles.metaLblText}>{userRating ? 'Sua nota' : 'Avaliar'}</Text>
                <StarRating value={userRating} size={22} onRate={(score) => rate.mutate(score)} />
              </View>
            ) : null}

            {promotion.description ? (
              <View style={styles.descBlock}>
                <Text style={styles.descTitle}>Descrição</Text>
                <Text style={styles.descText}>{promotion.description}</Text>
              </View>
            ) : null}

            <Text style={[typography.subtitle, styles.commentsTitle]}>Comentários ({comments.length})</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>Nenhum comentário ainda.</Text>}
        ListFooterComponent={
          <View style={styles.commentForm}>
            <Input
              label="Comentar"
              value={commentBody}
              onChangeText={setCommentBody}
              placeholder="Escreva um comentário"
            />
            <Button
              label="Enviar"
              loading={addComment.isPending}
              onPress={() => {
                if (commentBody.trim()) {
                  addComment.mutate(commentBody.trim(), { onSuccess: () => setCommentBody('') });
                }
              }}
            />
          </View>
        }
      />

      <View style={[styles.stickyBar, { paddingBottom: spacing.md + insets.bottom }]}>
        <View>
          <Text style={styles.stickyPrice}>{formatPrice(promotion.price)}</Text>
          {savings > 0 ? (
            <Text style={styles.stickySavings}>
              Economize {formatPrice(savings)} ({discount}%)
            </Text>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Aproveitei essa oferta"
          disabled={isAuthor || toggleConfirm.isPending}
          onPress={() => toggleConfirm.mutate()}
          style={[styles.stickyBtn, hasConfirmed && styles.ctaMainActive]}
        >
          <Ionicons name="checkmark-circle" size={16} color={colors.primaryText} />
          <Text style={styles.stickyBtnText}>{hasConfirmed ? 'Aproveitado' : 'Aproveitei essa oferta'}</Text>
        </Pressable>
      </View>

      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        submitting={reportSubmitting}
        error={reportError}
        onSubmit={async (reason, details) => {
          const ok = await submitReport(reason, details || undefined);
          if (ok) setReportModalVisible(false);
        }}
      />
    </Fragment>
  );
}

function Avatar({ username, avatarUrl, size }: { username?: string | null; avatarUrl?: string | null; size: number }) {
  if (avatarUrl) {
    return <Image source={{ uri: avatarUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View
      style={[
        styles.avatarPlaceholder,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.avatarLetter, { fontSize: size * 0.42 }]}>
        {username?.[0]?.toUpperCase() ?? '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  skeletonImage: { marginBottom: spacing.md },
  skeletonLine: { marginBottom: spacing.sm },

  imageWrap: { position: 'relative', marginBottom: spacing.md },
  image: { width: '100%', height: 220, borderRadius: radius.lg, backgroundColor: colors.surface },
  imageBadges: { position: 'absolute', top: spacing.sm, left: spacing.sm, gap: spacing.xs, alignItems: 'flex-start' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    maxWidth: 260,
  },
  pillDark: { backgroundColor: colors.overlay },
  pillText: { ...typography.micro, color: colors.textInverse, fontWeight: '700', flexShrink: 1 },

  storeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  storeText: { ...typography.caption, color: colors.textMuted },

  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.primaryBg,
  },
  priceLabel: { ...typography.micro, color: colors.textSubtle, letterSpacing: 0.4 },
  priceNow: { ...typography.priceLarge, color: colors.text, marginTop: 2 },
  priceOld: { ...typography.caption, color: colors.textSubtle, textDecorationLine: 'line-through' },
  priceRight: { alignItems: 'flex-end' },
  savingsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  savingsValue: { ...typography.subtitle, color: colors.text },
  offBadge: { backgroundColor: colors.secondary, paddingHorizontal: spacing.xs + 2, paddingVertical: 2, borderRadius: radius.pill },
  offBadgeText: { ...typography.micro, color: colors.secondaryText, fontWeight: '700' },
  progressTrack: { width: 130, height: 5, borderRadius: 3, backgroundColor: colors.border, marginTop: spacing.xs, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.secondary },
  qualityRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: spacing.xs },
  qualityText: { ...typography.micro, color: colors.secondaryDark, fontWeight: '700' },

  trustCard: { marginTop: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  trustTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  trustIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
  trustTitle: { ...typography.bodyStrong, color: colors.text },
  trustStats: { flexDirection: 'row', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  tstat: { flex: 1, alignItems: 'center', gap: 4 },
  statIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statValue: { ...typography.bodyStrong, color: colors.text },
  statLabel: { ...typography.micro, color: colors.textSubtle },

  ctaMain: { marginTop: spacing.md, backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', minHeight: 58, justifyContent: 'center' },
  ctaMainActive: { backgroundColor: colors.primaryDark },
  ctaDisabled: { opacity: 0.5 },
  ctaMainRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ctaMainText: { ...typography.bodyStrong, color: colors.primaryText },
  ctaSubText: { ...typography.micro, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  secRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  secBtn: { flex: 1, alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingVertical: spacing.sm + 2 },
  secBtnActive: { backgroundColor: colors.dangerBg, borderColor: colors.danger },
  secIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  secLabel: { ...typography.micro, color: colors.textMuted, fontWeight: '700', textAlign: 'center' },
  secLabelActive: { color: colors.danger },

  metaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  metaItem: { flex: 1 },
  metaLbl: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaLblText: { ...typography.micro, color: colors.textSubtle },
  metaVal: { ...typography.captionStrong, color: colors.text, marginTop: 2 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  repCaption: { ...typography.micro, color: colors.textSubtle },

  ratingBlock: { marginTop: spacing.md, gap: spacing.xs },

  descBlock: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  descTitle: { ...typography.captionStrong, color: colors.text, marginBottom: spacing.xs },
  descText: { ...typography.body, color: colors.textMuted },

  commentsTitle: { marginTop: spacing.lg, marginBottom: spacing.sm },
  comment: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  commentBody: { flex: 1 },
  commentHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  commentName: { ...typography.captionStrong, color: colors.text },
  commentTime: { ...typography.micro, color: colors.textSubtle, marginLeft: 'auto' },
  commentText: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  empty: { color: colors.textMuted, marginBottom: spacing.md },
  commentForm: { marginTop: spacing.md },

  avatarPlaceholder: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontFamily: typography.bodyStrong.fontFamily, color: colors.primaryText },

  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.raised,
  },
  stickyPrice: { ...typography.price, color: colors.text },
  stickySavings: { ...typography.micro, color: colors.secondaryDark, fontWeight: '700' },
  stickyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
  },
  stickyBtnText: { ...typography.captionStrong, color: colors.primaryText },
});
