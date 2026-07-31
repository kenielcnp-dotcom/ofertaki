import { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import type { MonthlyRankingRow } from '../../types/ranking';

// Ouro, Prata e Bronze para os 3 primeiros colocados.
const TOP_3_BADGE_COLORS: Record<number, string> = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32',
};

type RankingItemProps = {
  row: MonthlyRankingRow;
  isCurrentUser?: boolean;
};

export function RankingItem({ row, isCurrentUser = false }: RankingItemProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isTop3 = row.rank <= 3;
  const badgeColor = isTop3 ? TOP_3_BADGE_COLORS[row.rank] : colors.surface;
  const badgeTextColor = isTop3 ? colors.text : colors.textMuted;
  const name = row.display_name || row.username;

  return (
    <View style={[styles.container, isCurrentUser && styles.currentUser]}>
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Text style={[styles.badgeText, { color: badgeTextColor }]}>{row.rank}</Text>
      </View>

      {row.avatar_url ? (
        <Image source={{ uri: row.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarLetter}>{row.username[0]?.toUpperCase() ?? '?'}</Text>
        </View>
      )}

      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.points}>{row.total_points} pts</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.sm,
    },
    currentUser: {
      backgroundColor: colors.surface,
    },
    badge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    badgeText: {
      fontWeight: '700',
      fontSize: 14,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: spacing.md,
      backgroundColor: colors.surface,
    },
    avatarPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    avatarLetter: {
      color: colors.primaryText,
      fontWeight: '700',
      fontSize: 16,
    },
    name: {
      flex: 1,
      color: colors.text,
      fontWeight: '600',
      fontSize: 15,
    },
    points: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: 15,
      marginLeft: spacing.sm,
    },
  });
