import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { PromotionCard } from '../../components/promotion/PromotionCard';
import { usePromotions } from '../../hooks/usePromotions';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { MainTabScreenProps } from '../../navigation/types';

type Props = MainTabScreenProps<'Home'>;

export function FeedScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch, isRefetching } =
    usePromotions(search || undefined);

  const promotions = data?.pages.flat() ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Input
          label="Buscar promoções"
          placeholder="Ex: arroz, fone de ouvido..."
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
      </View>
      {isLoading ? (
        <ActivityIndicator style={styles.loading} color={colors.primary} />
      ) : promotions.length === 0 ? (
        <EmptyState message="Nenhuma promoção ainda. Seja o primeiro a publicar!" />
      ) : (
        <FlatList
          data={promotions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={colors.primary} /> : null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  listContent: { padding: spacing.lg },
  loading: { flex: 1 },
});
