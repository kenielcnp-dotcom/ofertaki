import { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Input } from '../../components/common/Input';
import { IconButton } from '../../components/common/IconButton';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Skeleton } from '../../components/common/Skeleton';
import { SavingsPanel } from '../../components/lista/SavingsPanel';
import { ShareListModal } from '../../components/lista/ShareListModal';
import { useListaCompras } from '../../hooks/useListaCompras';
import { useListaCompartilhada } from '../../hooks/useListaCompartilhada';
import { useAuthContext } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { typography } from '../../theme/typography';
import { formatPrice } from '../../utils/formatters';
import type { MainTabScreenProps } from '../../navigation/types';

type Props = MainTabScreenProps<'Lista'>;

export function ListaScreen({ navigation }: Props) {
  const { session } = useAuthContext();
  const userId = session?.user.id;
  const { listaId, items, loading, isError, refetch, monthlySavings, addTextItem, setPurchased } =
    useListaCompras();
  const [newItemText, setNewItemText] = useState('');
  const [shareVisible, setShareVisible] = useState(false);
  const { members, loadingMembers, isDono, code, loadingCode, regenerateCode, removeMember, redeemCode } =
    useListaCompartilhada(listaId, shareVisible);

  const pendingItems = useMemo(() => items.filter((item) => !item.is_purchased), [items]);

  function handleAddTextItem() {
    if (!newItemText.trim()) return;
    addTextItem.mutate(newItemText.trim(), {
      onSuccess: () => setNewItemText(''),
    });
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Lista" subtitle="Organize suas compras e economize mais">
        <View style={styles.headerButtonWrap}>
          <IconButton
            icon="people-outline"
            tone="primary"
            label="Compartilhar lista"
            onPress={() => setShareVisible(true)}
          />
          {members.length > 1 ? (
            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>{members.length}</Text>
            </View>
          ) : null}
        </View>
      </ScreenHeader>

      <ShareListModal
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        currentUserId={userId}
        members={members}
        loadingMembers={loadingMembers}
        isDono={isDono}
        code={code}
        loadingCode={loadingCode}
        regenerateCode={regenerateCode}
        removeMember={removeMember}
        redeemCode={redeemCode}
      />

      {monthlySavings.items.length > 0 ? (
        <View style={styles.panelWrapper}>
          <SavingsPanel
            total={monthlySavings.total}
            count={monthlySavings.count}
            items={monthlySavings.items}
            onUndo={(id) => setPurchased.mutate({ id, isPurchased: false })}
          />
        </View>
      ) : null}
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
      ) : pendingItems.length === 0 ? (
        <EmptyState
          icon="checkmark-done-outline"
          title="Tudo comprado por aqui!"
          message="Você aproveitou tudo que estava na lista. Adicione um item novo ou confira o histórico no painel acima."
        />
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={pendingItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const displayTitle = item.promotions?.title ?? item.text ?? 'Item';
            const isPromotionItem = !!item.promotions;
            const addedBy = item.added_by
              ? `adicionado por ${item.added_by.id === userId ? 'você' : item.added_by.username}`
              : null;
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
                  <Text style={styles.title} numberOfLines={2}>
                    {displayTitle}
                  </Text>
                  {item.promotions ? (
                    <Text style={styles.price}>{formatPrice(item.promotions.price)}</Text>
                  ) : null}
                  {addedBy ? <Text style={styles.attribution}>{addedBy}</Text> : null}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={isPromotionItem ? `Aproveitei ${displayTitle}` : `Marcar ${displayTitle} como comprado`}
                  onPress={() => setPurchased.mutate({ id: item.id, isPurchased: true })}
                  hitSlop={6}
                  style={[styles.aproveiteiButton, !isPromotionItem && styles.aproveiteiButtonText]}
                >
                  <Ionicons name="checkmark-circle" size={15} color={colors.textInverse} />
                  <Text style={styles.aproveiteiLabel}>
                    {isPromotionItem ? 'Aproveitei essa oferta' : 'Marcar como comprado'}
                  </Text>
                </Pressable>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerButtonWrap: { position: 'relative' },
  memberBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 3,
    borderRadius: 9,
    backgroundColor: colors.secondary,
    borderWidth: 1.5,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberBadgeText: { color: colors.textInverse, fontSize: 10, fontWeight: '700' },
  panelWrapper: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
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
  image: { width: 56, height: 56, borderRadius: 8, backgroundColor: colors.surface },
  info: { flex: 1, marginLeft: spacing.md, marginRight: spacing.sm },
  title: { color: colors.text, fontWeight: '600' },
  price: { color: colors.primary, marginTop: spacing.xs },
  attribution: { color: colors.textSubtle, fontSize: 11, marginTop: 2 },
  aproveiteiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.secondary,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm - 2,
    paddingHorizontal: spacing.sm + 2,
  },
  aproveiteiButtonText: { backgroundColor: colors.primary },
  aproveiteiLabel: { ...typography.captionStrong, color: colors.textInverse },
});
