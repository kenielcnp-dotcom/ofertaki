import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/typography';

type CardProps = {
  children: ReactNode;
  padded?: boolean;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, padded = true, elevated = true, style }: CardProps) {
  return (
    <View style={[styles.card, padded && styles.padded, elevated ? shadows.card : styles.flat, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  padded: { padding: spacing.md },
  flat: { borderWidth: 1, borderColor: colors.border },
});
