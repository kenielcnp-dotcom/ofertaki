import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Skeleton } from '../../components/common/Skeleton';
import { useNotifications } from '../../hooks/useNotifications';
import { useTheme } from '../../theme/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { notifications, unreadCount, loading, isError, refetch, isRefetching, markAsRead, markAllAsRead } =
    useNotifications();

  if (loading) {
    return (
      <View style={styles.content}>
        <Skeleton height={56} style={styles.skeletonRow} />
        <Skeleton height={56} style={styles.skeletonRow} />
        <Skeleton height={56} style={styles.skeletonRow} />
      </View>
    );
  }

  if (isError) {
    return <ErrorState message="Não foi possível carregar as notificações." onRetry={refetch} />;
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
          <Text style={[typography.body, styles.bodyText]}>{describe(item)}</Text>
        </Pressable>
      )}
    />
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    content: { padding: spacing.lg, backgroundColor: colors.background },
    skeletonRow: { marginBottom: spacing.sm },
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
    bodyText: { color: colors.text },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginRight: spacing.sm,
    },
  });
