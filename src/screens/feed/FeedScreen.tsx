import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { IconButton } from '../../components/common/IconButton';
import { PromotionCard } from '../../components/promotion/PromotionCard';
import { PromotionCardSkeleton } from '../../components/promotion/PromotionCardSkeleton';
import { DepartmentChips } from '../../components/promotion/DepartmentChips';
import { FilterModal } from '../../components/promotion/FilterModal';
import { usePromotions } from '../../hooks/usePromotions';
import { useListaCompras } from '../../hooks/useListaCompras';
import { useDepartments } from '../../hooks/useDepartments';
import { useMarkets } from '../../hooks/useMarkets';
import { useNotifications } from '../../hooks/useNotifications';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { PromotionSort } from '../../services/promotions.service';
import type { MainTabScreenProps } from '../../navigation/types';

type Props = MainTabScreenProps<'Home'>;

export function FeedScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [marketId, setMarketId] = useState<string | null>(null);
  const [sort, setSort] = useState<PromotionSort>('recent');
  const [filterVisible, setFilterVisible] = useState(false);

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = usePromotions(search || undefined, {
    departmentId: departmentId ?? undefined,
    marketId: marketId ?? undefined,
    sort,
  });
  const { items: listItems, addItem, removeItem } = useListaCompras();
  const { departments } = useDepartments();
  const { markets } = useMarkets();
  const { unreadCount } = useNotifications();

  const promotions = data?.pages.flat() ?? [];
  const hasActiveFilters = !!marketId || sort !== 'recent';

  const savedListItemByPromotion = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of listItems) {
      if (item.promotion_id) map.set(item.promotion_id, item.id);
    }
    return map;
  }, [listItems]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        tone="brand"
        title="Ofertaki"
        titleNode={
          <Text style={[typography.title, styles.logotype]}>
            Ofert
            <Text style={styles.logotypeAccent}>aki</Text>
          </Text>
        }
        subtitle="As melhores ofertas perto de você"
        right={
          <View style={styles.headerIcons}>
            <IconButton
              icon="trophy-outline"
              tone="onDark"
              label="Ver ranking"
              onPress={() => navigation.navigate('Ranking')}
            />
            <View>
              <IconButton
                icon="notifications-outline"
                tone="onDark"
                label="Ver alertas"
                onPress={() => navigation.navigate('Notificacoes')}
              />
              {unreadCount > 0 ? <View style={styles.badgeDot} /> : null}
            </View>
            <IconButton
              icon="person-outline"
              tone="onDark"
              label="Ver perfil"
              onPress={() => navigation.navigate('Perfil')}
            />
          </View>
        }
      >
        <View style={styles.searchRow}>
          <View style={styles.searchInput}>
            <Input
              rounded
              icon="search-outline"
              placeholder="Busque por arroz, café, carne..."
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              returnKeyType="search"
            />
          </View>
          <View>
            <IconButton
              icon="funnel"
              tone="primary"
              label="Filtrar e ordenar"
              onPress={() => setFilterVisible(true)}
              style={styles.filterButton}
            />
            {hasActiveFilters ? <View style={styles.badgeDot} /> : null}
          </View>
        </View>

        <View style={styles.chipsWrapper}>
          <DepartmentChips departments={departments} selectedId={departmentId} onSelect={setDepartmentId} />
        </View>
      </ScreenHeader>

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        markets={markets}
        marketId={marketId}
        sort={sort}
        onApply={(nextMarketId, nextSort) => {
          setMarketId(nextMarketId);
          setSort(nextSort);
        }}
      />

      {isLoading ? (
        <View style={styles.listContent}>
          <PromotionCardSkeleton />
          <PromotionCardSkeleton />
          <PromotionCardSkeleton />
        </View>
      ) : isError ? (
        <ErrorState message="Não foi possível carregar as promoções." onRetry={refetch} />
      ) : promotions.length === 0 ? (
        <EmptyState
          icon={search ? 'search-outline' : 'pricetags-outline'}
          title={search ? 'Nada encontrado' : 'Nenhuma promoção ainda'}
          message={
            search
              ? 'Tente buscar por outro produto ou marca.'
              : 'Seja o primeiro a publicar uma oferta e ganhe pontos por isso.'
          }
        />
      ) : (
        <FlatList
          data={promotions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const savedItemId = savedListItemByPromotion.get(item.id);
            return (
              <PromotionCard
                promotion={item}
                onPress={() => navigation.navigate('PromotionDetail', { promotionId: item.id })}
                isSaved={!!savedItemId}
                onToggleSave={() => (savedItemId ? removeItem.mutate(savedItemId) : addItem.mutate(item.id))}
              />
            );
          }}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={colors.primary} style={styles.footerLoader} />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundAlt },
  logotype: { color: colors.primaryText },
  logotypeAccent: { color: colors.secondary },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  badgeDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.secondary,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  searchInput: { flex: 1 },
  filterButton: { borderRadius: 24 },
  chipsWrapper: { marginTop: spacing.sm, marginBottom: -spacing.xs },
  listContent: { padding: spacing.lg, paddingBottom: spacing.xl },
  footerLoader: { marginVertical: spacing.md },
});
