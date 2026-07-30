import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../components/common/EmptyState';
import { useListaCompras } from '../../hooks/useListaCompras';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { MainTabScreenProps } from '../../navigation/types';

type Props = MainTabScreenProps<'Lista'>;

function formatPrice(price: number) {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ListaScreen({ navigation }: Props) {
  const { items, setPurchased, removeItem } = useListaCompras();

  if (items.length === 0) {
    return <EmptyState message="Sua lista de compras está vazia. Adicione promoções a partir do feed." />;
  }

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Pressable
          style={styles.row}
          onPress={() =>
            item.promotions && navigation.navigate('PromotionDetail', { promotionId: item.promotions.id })
          }
        >
          {item.promotions?.image_url ? (
            <Image source={{ uri: item.promotions.image_url }} style={styles.image} />
          ) : null}
          <View style={styles.info}>
            <Text style={[styles.title, item.is_purchased && styles.titlePurchased]} numberOfLines={2}>
              {item.promotions?.title ?? 'Promoção removida'}
            </Text>
            {item.promotions ? <Text style={styles.price}>{formatPrice(item.promotions.price)}</Text> : null}
          </View>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={item.is_purchased ? 'Marcar como não comprado' : 'Marcar como comprado'}
              onPress={() => setPurchased.mutate({ id: item.id, isPurchased: !item.is_purchased })}
              style={[styles.checkbox, item.is_purchased && styles.checkboxChecked]}
            >
              {item.is_purchased ? <Text style={styles.checkboxMark}>✓</Text> : null}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remover da lista"
              onPress={() => removeItem.mutate(item.id)}
            >
              <Text style={styles.remove}>Remover</Text>
            </Pressable>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  image: { width: 56, height: 56, borderRadius: 8, backgroundColor: colors.surface },
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
