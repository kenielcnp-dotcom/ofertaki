import { StyleSheet, View } from 'react-native';
import { Skeleton } from '../common/Skeleton';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export function PromotionCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton height={160} borderRadius={0} />
      <View style={styles.body}>
        <Skeleton height={18} width="80%" style={styles.line} />
        <Skeleton height={16} width="40%" style={styles.line} />
        <Skeleton height={13} width="60%" style={styles.line} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  body: { padding: spacing.md },
  line: { marginTop: spacing.xs },
});
