import { StyleSheet, View } from 'react-native';
import { Skeleton } from '../common/Skeleton';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/typography';

export function PromotionCardSkeleton() {
  return (
    <View style={[styles.card, shadows.card]}>
      <Skeleton height={176} borderRadius={0} />
      <View style={styles.body}>
        <Skeleton height={20} width="80%" style={styles.line} />
        <Skeleton height={16} width="45%" style={styles.line} />
        <View style={styles.footer}>
          <Skeleton height={12} width="25%" />
          <Skeleton height={12} width="25%" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  body: { padding: spacing.md, gap: spacing.sm },
  line: { marginTop: spacing.xs },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
