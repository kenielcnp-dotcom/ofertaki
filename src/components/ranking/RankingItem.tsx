import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { typography, fonts, shadows } from '../../theme/typography';
import { formatPoints } from '../../utils/formatters';
import type { MonthlyRankingRow } from '../../types/ranking';

// Ouro, Prata e Bronze para os 3 primeiros colocados.
const TOP_3: Record<number, { color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  1: { color: colors.gold, icon: 'trophy' },
  2: { color: colors.silver, icon: 'medal' },
  3: { color: colors.bronze, icon: 'medal' },
};

type RankingItemProps = {
  row: MonthlyRankingRow;
  isCurrentUser?: boolean;
};

export function RankingItem({ row, isCurrentUser = false }: RankingItemProps) {
  const medal = TOP_3[row.rank];
  const name = row.display_name || row.username;

  return (
    <View
      style={[
        styles.container,
        isCurrentUser && styles.currentUser,
        !!medal && styles.top3,
        !!medal && shadows.card,
      ]}
    >
      <View style={[styles.badge, medal ? { backgroundColor: medal.color } : styles.badgeDefault]}>
        {medal ? (
          <Ionicons name={medal.icon} size={16} color={colors.textInverse} />
        ) : (
          <Text style={styles.badgeText}>{row.rank}</Text>
        )}
      </View>

      {row.avatar_url ? (
        <Image source={{ uri: row.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarLetter}>{row.username[0]?.toUpperCase() ?? '?'}</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.handle} numberOfLines={1}>
          @{row.username}
        </Text>
      </View>

      {isCurrentUser ? (
        <View style={styles.youChip}>
          <Text style={styles.youText}>Você</Text>
        </View>
      ) : null}

      <Text style={styles.points}>{formatPoints(row.total_points)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },
  top3: { backgroundColor: colors.surfaceElevated },
  currentUser: {
    backgroundColor: colors.primaryBg,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDefault: { backgroundColor: colors.surface },
  badgeText: { fontFamily: fonts.displayBold, fontSize: 14, color: colors.textMuted },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  avatarLetter: { fontFamily: fonts.displayBold, color: colors.primaryText, fontSize: 17 },
  info: { flex: 1 },
  name: { ...typography.bodyStrong, color: colors.text },
  handle: { ...typography.micro, color: colors.textSubtle, marginTop: 1 },
  youChip: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  youText: { ...typography.micro, color: colors.primaryText },
  points: { ...typography.captionStrong, color: colors.primary },
});
