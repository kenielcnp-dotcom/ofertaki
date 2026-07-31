import { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Input } from '../../components/common/Input';
import { Skeleton } from '../../components/common/Skeleton';
import { useListaCompras } from '../../hooks/useListaCompras';
import { useTheme } from '../../theme/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import type { MainTabScreenProps } from '../../navigation/types';

type Props = MainTabScreenProps<'Lista'>;

function formatPrice(price: number) {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ListaScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { items, loading, isError, refetch, addTextItem, setPurchased, removeItem } = useListaCompras();
  const [newItemText, setNewItemText] = useState('');

  function handleAddTextItem() {
    if (!newItemText.trim()) return;
    addTextItem.mutate(newItemText.trim(), {
      onSuccess: () => setNewItemText(''),
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Input
          label="Novo item"
          value={newItemText}
          onChangeText={setNewItemText}
          placeholder="Digite o nome do item"
          onSubmitEditing={handleAddTextItem}
          returnKeyType="done"
        />
        <Button
          label="Adicionar"
          loading={addTextItem.isPending}
          disabled={!newItemText.trim()}
          onPress={handleAddTextItem}
        />
      </View>

      {loading ? (
        <View style={styles.listContent}>
          <Skeleton height={64} style={styles.skeletonRow} />
          <Skeleton height={64} style={styles.skeletonRow} />
          <Skeleton height={64} style={styles.skeletonRow} />
        </View>
      ) : isError ? (
        <ErrorState message="Não foi possível carregar sua lista." onRetry={refetch} />
      ) : items.length === 0 ? (
        <EmptyState message="Sua lista de compras está vazia. Adicione itens manualmente ou a partir do feed de promoções." />
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const displayTitle = item.promotions?.title ?? item.text ?? 'Item';
            return (
              <Pressable
                style={styles.row}
                onPress={() => {
                  if (item.promotions) {
                    navigation.navigate('PromotionDetail', { promotionId: item.promotions.id });
                  }
                }}
              >
                {item.promotions?.image_url ? (
                  <Image
                    source={{ uri: item.promotions.image_url }}
                    style={styles.image}
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                  />
                ) : null}
                <View style={styles.info}>
                  <Text style={[styles.title, item.is_purchased && styles.titlePurchased]} numberOfLines={2}>
                    {displayTitle}
                  </Text>
                  {item.promotions ? (
                    <Text style={styles.price}>{formatPrice(item.promotions.price)}</Text>
                  ) : null}
                </View>
                <View style={styles.actions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={item.is_purchased ? 'Marcar como não comprado' : 'Marcar como comprado'}
                    onPress={() => setPurchased.mutate({ id: item.id, isPurchased: !item.is_purchased })}
                    hitSlop={8}
                    style={[styles.checkbox, item.is_purchased && styles.checkboxChecked]}
                  >
                    {item.is_purchased ? <Text style={styles.checkboxMark}>✓</Text> : null}
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Remover da lista"
                    onPress={() => removeItem.mutate(item.id)}
                    hitSlop={8}
                  >
                    <Text style={styles.remove}>Remover</Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    form: {
      padding: spacing.lg,
      paddingBottom: 0,
    },
    listContent: { padding: spacing.lg, paddingTop: spacing.sm },
    skeletonRow: { marginBottom: spacing.sm },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    image: { width: 56, height: 56, borderRadius: radius.sm, backgroundColor: colors.surface },
    info: { flex: 1, marginLeft: spacing.md },
    title: { color: colors.text, fontWeight: '600' },
    titlePurchased: { textDecorationLine: 'line-through', color: colors.textMuted },
    price: { color: colors.primary, marginTop: spacing.xs },
    actions: { alignItems: 'center', gap: spacing.sm },
    checkbox: {
      width: 28,
      height: 28,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: { backgroundColor: colors.success, borderColor: colors.success },
    checkboxMark: { color: colors.primaryText, fontWeight: '700' },
    remove: { color: colors.danger, fontSize: 12 },
  });
