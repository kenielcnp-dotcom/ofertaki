import { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../common/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { typography } from '../../theme/typography';
import type { Market } from '../../types/promotion';
import type { PromotionSort } from '../../services/promotions.service';

const SORT_OPTIONS: { value: PromotionSort; label: string }[] = [
  { value: 'relevance', label: 'Mais relevante' },
  { value: 'recent', label: 'Mais recente' },
  { value: 'confirmed', label: 'Mais confirmado' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  markets: Market[];
  marketId: string | null;
  sort: PromotionSort;
  onApply: (marketId: string | null, sort: PromotionSort) => void;
};

export function FilterModal({ visible, onClose, markets, marketId, sort, onApply }: Props) {
  const [draftMarketId, setDraftMarketId] = useState(marketId);
  const [draftSort, setDraftSort] = useState(sort);

  useEffect(() => {
    if (visible) {
      setDraftMarketId(marketId);
      setDraftSort(sort);
    }
  }, [visible, marketId, sort]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.grabber} />
          <Text style={styles.sheetTitle}>Filtrar e ordenar</Text>

          <Text style={styles.sectionLabel}>Mercado</Text>
          <FlatList
            data={[{ id: null, name: 'Todos os mercados' } as { id: string | null; name: string }, ...markets]}
            keyExtractor={(item) => item.id ?? 'all'}
            scrollEnabled={false}
            renderItem={({ item }) => {
              const isSelected = item.id === draftMarketId;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={item.name}
                  style={styles.option}
                  onPress={() => setDraftMarketId(item.id)}
                >
                  <Ionicons
                    name={item.id ? 'storefront' : 'apps'}
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.optionText}>{item.name}</Text>
                  {isSelected ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
                </Pressable>
              );
            }}
          />

          <Text style={styles.sectionLabel}>Ordenar por</Text>
          {SORT_OPTIONS.map((option) => {
            const isSelected = option.value === draftSort;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={option.label}
                style={styles.option}
                onPress={() => setDraftSort(option.value)}
              >
                <Ionicons name="swap-vertical" size={16} color={colors.primary} />
                <Text style={styles.optionText}>{option.label}</Text>
                {isSelected ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
              </Pressable>
            );
          })}

          <Button
            label="Aplicar filtros"
            onPress={() => {
              onApply(draftMarketId, draftSort);
              onClose();
            }}
            style={styles.applyButton}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    maxHeight: '80%',
  },
  grabber: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.md,
  },
  sheetTitle: { ...typography.subtitle, color: colors.text, marginBottom: spacing.sm },
  sectionLabel: {
    ...typography.captionStrong,
    color: colors.textMuted,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
  },
  optionText: { ...typography.body, color: colors.text, flex: 1 },
  applyButton: { marginTop: spacing.lg },
});
