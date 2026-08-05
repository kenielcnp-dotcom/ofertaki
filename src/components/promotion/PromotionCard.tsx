import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IconButton } from '../common/IconButton';
import { StarRating } from './StarRating';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { typography, shadows } from '../../theme/typography';
import { formatPrice, formatRelativeTime } from '../../utils/formatters';
import { discountPercent, freshnessTier, type FreshnessTier } from '../../utils/promotionInsights';
import type { PromotionWithMarket } from '../../types/promotion';

type Stat = { icon: keyof typeof Ionicons.glyphMap; value: number; label: string };

const NOT_FOUND_WARNING_THRESHOLD = 3;

const TIER_BADGE: Record<FreshnessTier, { label: string; icon: keyof typeof Ionicons.glyphMap; bg: string }> = {
  quente: { label: 'OFERTA QUENTE', icon: 'flame', bg: colors.secondary },
  recente: { label: 'RECENTE', icon: 'leaf', bg: colors.success },
  pode_existir: { label: 'PODE EXISTIR', icon: 'help-circle', bg: colors.warning },
  antiga: { label: 'ANTIGA', icon: 'time', bg: colors.textSubtle },
};

export function PromotionCard({
  promotion,
  onPress,
  isSaved = false,
  onToggleSave,
}: {
  promotion: PromotionWithMarket;
  onPress: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}) {
  const stats: Stat[] = [
    { icon: 'heart', value: promotion.likes_count, label: 'curtidas' },
    { icon: 'checkmark-circle', value: promotion.confirmations_count, label: 'confirmações' },
    { icon: 'chatbubble-ellipses', value: promotion.comments_count, label: 'comentários' },
  ];

  const discount = discountPercent(promotion);
  const savings = promotion.original_price - promotion.price;
  const tier = freshnessTier(promotion);
  const tierBadge = tier ? TIER_BADGE[tier] : null;
  const maybeGone = promotion.not_found_count >= NOT_FOUND_WARNING_THRESHOLD;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${promotion.title}, ${formatPrice(promotion.price)}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, shadows.card, pressed && styles.pressed]}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: promotion.image_url }}
          style={styles.image}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />

        <View style={styles.badgeStack}>
          {tierBadge ? (
            <View style={[styles.tierBadge, { backgroundColor: tierBadge.bg }]}>
              <Ionicons name={tierBadge.icon} size={12} color={colors.textInverse} />
              <Text style={styles.tierBadgeText}>{tierBadge.label}</Text>
            </View>
          ) : null}
          {maybeGone ? (
            <View style={[styles.tierBadge, { backgroundColor: colors.danger }]}>
              <Ionicons name="alert" size={12} color={colors.textInverse} />
              <Text style={styles.tierBadgeText}>Pode ter acabado</Text>
            </View>
          ) : null}
        </View>

        {discount > 0 ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>−{discount}%</Text>
          </View>
        ) : null}

        {promotion.confirmations_count > 0 ? (
          <View style={styles.confirmBadge}>
            <Ionicons name="checkmark-circle" size={12} color={colors.textInverse} />
            <Text style={styles.confirmBadgeText} numberOfLines={1}>
              Confirmado por {promotion.confirmations_count} {promotion.confirmations_count === 1 ? 'pessoa' : 'pessoas'}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <View style={styles.priceRow}>
          <Text style={styles.priceNow}>{formatPrice(promotion.price)}</Text>
          {savings > 0 ? <Text style={styles.priceWas}>{formatPrice(promotion.original_price)}</Text> : null}
        </View>

        {savings > 0 ? (
          <View style={styles.savingsPill}>
            <Ionicons name="pricetag" size={12} color={colors.success} />
            <Text style={styles.savingsText}>Você economiza {formatPrice(savings)}</Text>
          </View>
        ) : null}

        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {promotion.title}
          </Text>
          {onToggleSave ? (
            <IconButton
              icon={isSaved ? 'bookmark' : 'bookmark-outline'}
              tone={isSaved ? 'primary' : 'neutral'}
              size={34}
              label={isSaved ? 'Remover da lista' : 'Salvar na lista'}
              onPress={onToggleSave}
            />
          ) : null}
        </View>

        <View style={styles.metaRow}>
          {promotion.mercados?.name ? (
            <View style={styles.metaItem}>
              <Ionicons name="storefront" size={12} color={colors.textMuted} />
              <Text style={styles.metaText} numberOfLines={1}>
                {promotion.mercados.name}
              </Text>
            </View>
          ) : null}
          {promotion.mercados?.name ? <View style={styles.dot} /> : null}
          <Text style={styles.metaText}>{formatRelativeTime(promotion.created_at)}</Text>
        </View>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.icon} style={styles.stat} accessibilityLabel={`${stat.value} ${stat.label}`}>
              <Ionicons name={stat.icon} size={14} color={colors.textSubtle} />
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
          {promotion.ratings_count > 0 ? (
            <StarRating value={promotion.avg_rating} count={promotion.ratings_count} size={13} />
          ) : null}
          <View style={styles.spacer} />
          <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  imageWrapper: { position: 'relative' },
  image: { width: '100%', height: 176, backgroundColor: colors.surface },
  badgeStack: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    gap: spacing.xs,
    alignItems: 'flex-start',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    ...shadows.raised,
  },
  tierBadgeText: { ...typography.micro, color: colors.textInverse, fontWeight: '700' },
  discountBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    ...shadows.raised,
  },
  discountBadgeText: { ...typography.micro, color: colors.secondaryText, fontWeight: '700' },
  confirmBadge: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  confirmBadgeText: { ...typography.micro, color: colors.textInverse, flexShrink: 1 },
  body: { paddingTop: spacing.md, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, flexWrap: 'wrap' },
  priceNow: { ...typography.priceLarge, color: colors.text },
  priceWas: { ...typography.body, color: colors.textSubtle, textDecorationLine: 'line-through' },
  savingsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.successBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
  },
  savingsText: { ...typography.micro, color: colors.success, fontWeight: '700' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginTop: spacing.sm + 2 },
  title: { ...typography.subtitle, color: colors.text, flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: '65%' },
  metaText: { ...typography.caption, color: colors.textMuted },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textSubtle },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm + 2,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { ...typography.micro, color: colors.textMuted },
  spacer: { flex: 1 },
});
