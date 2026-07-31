import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../components/common/EmptyState';
import { useNotifications } from '../../hooks/useNotifications';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { MainTabScreenProps } from '../../navigation/types';
import type { NotificationWithActor } from '../../types/promotion';

type Props = MainTabScreenProps<'Notificacoes'>;

const MESSAGES: Record<string, string> = {
  like: 'curtiu sua promoção',
  comment: 'comentou na sua promoção',
  confirmation: 'confirmou sua promoção',
};

function describe(notification: NotificationWithActor) {
  const actor = notification.profiles?.username ?? 'Alguém';
  const action = MESSAGES[notification.type] ?? 'interagiu com sua promoção';
  return `${actor} ${action}`;
}

export function NotificationsScreen({ navigation }: Props) {
  const { notifications, unreadCount, loading, refetch, isRefetching, markAsRead, markAllAsRead } =
    useNotifications();

  if (loading) {
    return <ActivityIndicator style={styles.loading} color={colors.primary} />;
  }

  if (notifications.length === 0) {
    return <EmptyState message="Nenhuma notificação por enquanto." />;
  }

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      onRefresh={refetch}
      refreshing={isRefetching}
      ListHeaderComponent={
        unreadCount > 0 ? (
          <Pressable onPress={() => markAllAsRead.mutate()} style={styles.markAllRow}>
            <Text style={styles.markAllText}>Marcar todas como lidas ({unreadCount})</Text>
          </Pressable>
        ) : null
      }
      renderItem={({ item }) => (
        <Pressable
          style={[styles.row, !item.is_read && styles.rowUnread]}
          onPress={() => {
            if (!item.is_read) markAsRead.mutate(item.id);
            if (item.promotion_id) {
              navigation.navigate('PromotionDetail', { promotionId: item.promotion_id });
            }
          }}
        >
          {!item.is_read ? <View style={styles.dot} /> : null}
          <Text style={typography.body}>{describe(item)}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1 },
  content: { padding: spacing.lg },
  markAllRow: { paddingBottom: spacing.md },
  markAllText: { color: colors.primary, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowUnread: { backgroundColor: colors.surface },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
});
