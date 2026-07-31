import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../components/common/EmptyState';
import { RankingItem } from '../../components/ranking/RankingItem';
import { useAuthContext } from '../../contexts/AuthContext';
import { RANKING_LIMIT, useMonthlyRanking } from '../../hooks/useMonthlyRanking';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export function RankingScreen() {
  const { session } = useAuthContext();
  const userId = session?.user.id;
  const { data, isLoading, isError, refetch, isRefetching } = useMonthlyRanking();

  const rows = data ?? [];
  const top = rows.filter((row) => row.rank <= RANKING_LIMIT);
  const userRow = rows.find((row) => row.user_id === userId);
  const userOutsideTop = !!userRow && userRow.rank > RANKING_LIMIT;

  if (isLoading) {
    return <ActivityIndicator style={styles.loading} color={colors.primary} />;
  }

  if (isError) {
    return <EmptyState message="Não foi possível carregar o ranking. Tente novamente." />;
  }

  if (top.length === 0) {
    return <EmptyState message="Nenhum usuário pontuou este mês ainda. Seja o primeiro!" />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={top}
        keyExtractor={(item) => item.user_id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <RankingItem row={item} isCurrentUser={item.user_id === userId} />}
        ListHeaderComponent={<Text style={typography.subtitle}>Melhores do mês</Text>}
        ListFooterComponent={
          userOutsideTop && userRow ? (
            <View style={styles.footer}>
              <Text style={styles.footerTitle}>Sua posição</Text>
              <RankingItem row={userRow} isCurrentUser />
            </View>
          ) : !userRow ? (
            <Text style={styles.footerEmpty}>Você ainda não pontuou este mês.</Text>
          ) : null
        }
        onRefresh={refetch}
        refreshing={isRefetching}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1 },
  listContent: { padding: spacing.lg, gap: spacing.xs },
  footer: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  footerTitle: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 13,
    marginLeft: spacing.md,
  },
  footerEmpty: {
    marginTop: spacing.lg,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
