import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton } from '../common/Skeleton';
import { useTheme } from '../../theme/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';

export function PromotionCardSkeleton() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      marginBottom: spacing.md,
      overflow: 'hidden',
      backgroundColor: colors.card,
    },
    body: { padding: spacing.md },
    line: { marginTop: spacing.xs },
  });
