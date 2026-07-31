import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { IconButton } from '../../components/common/IconButton';
import { PromotionCard } from '../../components/promotion/PromotionCard';
import { PromotionCardSkeleton } from '../../components/promotion/PromotionCardSkeleton';
import { usePromotions } from '../../hooks/usePromotions';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { MainTabScreenProps } from '../../navigation/types';

type Props = MainTabScreenProps<'Home'>;

export function FeedScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = usePromotions(search || undefined);

  const promotions = data?.pages.flat() ?? [];

  return (
    <View style={styles.container}>
      <ScreenHeader
        tone="brand"
        title="Ofertaki"
        subtitle="As melhores ofertas perto de você"
        right={
          <IconButton
            icon="trophy-outline"
            tone="onDark"
            label="Ver ranking"
            onPress={() => navigation.navigate('Ranking')}
          />
        }
      >
        <View style={styles.searchWrapper}>
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
      </ScreenHeader>

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
          renderItem={({ item }) => (
            <PromotionCard
              promotion={item}
              onPress={() => navigation.navigate('PromotionDetail', { promotionId: item.id })}
            />
          )}
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
  searchWrapper: { marginTop: spacing.md, marginBottom: -spacing.xs },
  listContent: { padding: spacing.lg, paddingBottom: spacing.xl },
  footerLoader: { marginVertical: spacing.md },
});
