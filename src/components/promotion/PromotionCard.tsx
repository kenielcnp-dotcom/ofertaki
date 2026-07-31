import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { PromotionWithMarket } from '../../types/promotion';

function formatPrice(price: number) {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function PromotionCard({
  promotion,
  onPress,
}: {
  promotion: PromotionWithMarket;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${promotion.title}, ${formatPrice(promotion.price)}`}
      onPress={onPress}
      style={styles.card}
    >
      <Image
        source={{ uri: promotion.image_url }}
        style={styles.image}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
      <View style={styles.body}>
        <Text style={[typography.subtitle, styles.title]} numberOfLines={2}>
          {promotion.title}
        </Text>
        <Text style={styles.price}>{formatPrice(promotion.price)}</Text>
        {promotion.mercados?.name ? <Text style={styles.store}>{promotion.mercados.name}</Text> : null}
        <View style={styles.metaRow}>
          <Text style={styles.meta}>👍 {promotion.likes_count}</Text>
          <Text style={styles.meta}>✅ {promotion.confirmations_count}</Text>
          <Text style={styles.meta}>💬 {promotion.comments_count}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      marginBottom: spacing.md,
      overflow: 'hidden',
      backgroundColor: colors.card,
    },
    image: { width: '100%', height: 160, backgroundColor: colors.border },
    body: { padding: spacing.md },
    title: { color: colors.text },
    price: { color: colors.primary, fontWeight: '700', fontSize: 16, marginTop: spacing.xs },
    store: { color: colors.textMuted, marginTop: spacing.xs },
    metaRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
    meta: { color: colors.textMuted, fontSize: 13 },
  });
