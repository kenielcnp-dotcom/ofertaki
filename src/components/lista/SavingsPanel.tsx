import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common/Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { typography } from '../../theme/typography';
import { formatPrice } from '../../utils/formatters';
import type { ListaCompraWithPromotion } from '../../services/lista_compras.service';

const MAX_THUMBS = 3;

type SavingsPanelProps = {
  total: number;
  count: number;
  items: ListaCompraWithPromotion[];
  onUndo: (id: string) => void;
};

export function SavingsPanel({ total, count, items, onUndo }: SavingsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  const extraCount = items.length - MAX_THUMBS;

  return (
    <Card style={styles.card}>
      <Text style={styles.label}>Economia deste mês</Text>
      <Text style={[typography.priceLarge, styles.total]}>{formatPrice(total)}</Text>
      <Text style={styles.caption}>
        em {count} {count === 1 ? 'compra confirmada' : 'compras confirmadas'}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={expanded ? 'Fechar histórico do mês' : 'Ver histórico do mês'}
        onPress={() => setExpanded((prev) => !prev)}
        style={styles.corner}
        hitSlop={8}
      >
        <View style={styles.thumbStack}>
          {items.slice(0, MAX_THUMBS).map((item, index) => {
            const label = (item.promotions?.title ?? item.text ?? '?')[0]?.toUpperCase() ?? '?';
            return (
              <View key={item.id} style={[styles.thumb, index > 0 && styles.thumbOverlap]}>
                <Text style={styles.thumbText}>{label}</Text>
              </View>
            );
          })}
          {extraCount > 0 ? (
            <View style={[styles.thumb, styles.thumbMore, styles.thumbOverlap]}>
              <Text style={styles.thumbMoreText}>+{extraCount}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.cornerLabelRow}>
          <Text style={styles.cornerLabel}>{expanded ? 'fechar' : 'ver histórico'}</Text>
          {!expanded ? <Ionicons name="chevron-forward" size={10} color={colors.primaryDark} /> : null}
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.history}>
          {items.map((item) => {
            const title = item.promotions?.title ?? item.text ?? 'Item';
            const priceLabel = item.promotions ? formatPrice(item.promotions.price) : 'sem preço (item de texto)';
            return (
              <View key={item.id} style={styles.historyRow}>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyName} numberOfLines={1}>
                    {title}
                  </Text>
                  <Text style={styles.historyPrice}>{priceLabel}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Desfazer compra de ${title}`}
                  onPress={() => onUndo(item.id)}
                  hitSlop={8}
                >
                  <Text style={styles.undo}>desfazer</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.primaryBg, marginBottom: spacing.md, position: 'relative' },
  label: { ...typography.sectionLabel, color: colors.primary },
  total: { color: colors.primaryDark, marginTop: spacing.xs },
  caption: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  corner: { position: 'absolute', top: spacing.md, right: spacing.md, alignItems: 'flex-end' },
  thumbStack: { flexDirection: 'row' },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.primaryBg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbOverlap: { marginLeft: -8 },
  thumbText: { color: colors.textInverse, fontSize: 10, fontWeight: '700' },
  thumbMore: { backgroundColor: colors.background },
  thumbMoreText: { color: colors.primaryDark, fontSize: 9, fontWeight: '700' },
  cornerLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: spacing.xs },
  cornerLabel: { fontSize: 10, fontWeight: '700', color: colors.primaryDark },
  history: { marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.primaryLight, paddingTop: spacing.sm },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
  },
  historyInfo: { flex: 1, marginRight: spacing.sm },
  historyName: { ...typography.captionStrong, color: colors.text },
  historyPrice: { ...typography.micro, color: colors.textMuted, marginTop: 1 },
  undo: { ...typography.micro, color: colors.textSubtle, textDecorationLine: 'underline' },
});
