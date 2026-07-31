import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { typography, shadows } from '../../theme/typography';
import { formatPrice } from '../../utils/formatters';
import type { PromotionWithMarket } from '../../types/promotion';

type Stat = { icon: keyof typeof Ionicons.glyphMap; value: number; label: string };

export function PromotionCard({
  promotion,
  onPress,
}: {
  promotion: PromotionWithMarket;
  onPress: () => void;
}) {
  const stats: Stat[] = [
    { icon: 'heart', value: promotion.likes_count, label: 'curtidas' },
    { icon: 'checkmark-circle', value: promotion.confirmations_count, label: 'confirmações' },
    { icon: 'chatbubble-ellipses', value: promotion.comments_count, label: 'comentários' },
  ];

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
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>{formatPrice(promotion.price)}</Text>
        </View>
        {promotion.mercados?.name ? (
          <View style={styles.storeChip}>
            <Ionicons name="storefront" size={12} color={colors.primary} />
            <Text style={styles.storeText} numberOfLines={1}>
              {promotion.mercados.name}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {promotion.title}
        </Text>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.icon} style={styles.stat} accessibilityLabel={`${stat.value} ${stat.label}`}>
              <Ionicons name={stat.icon} size={14} color={colors.textSubtle} />
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
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
  priceTag: {
    position: 'absolute',
    left: spacing.md,
    bottom: -14,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    ...shadows.raised,
  },
  priceText: { ...typography.price, fontSize: 18, lineHeight: 22, color: colors.secondaryText },
  storeChip: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '70%',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  storeText: { ...typography.micro, color: colors.primary, flexShrink: 1 },
  body: { paddingTop: spacing.lg, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  title: { ...typography.subtitle, color: colors.text },
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
