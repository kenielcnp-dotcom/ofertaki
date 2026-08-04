import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export type StepperStep = { key: string; label: string };

type Props = {
  steps: StepperStep[];
  currentIndex: number;
};

const DOT_SIZE = 26;

export function Stepper({ steps, currentIndex }: Props) {
  return (
    <View style={styles.row}>
      {steps.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        const leftDone = index > 0 && index - 1 < currentIndex;
        const rightDone = index < currentIndex;

        return (
          <View key={step.key} style={styles.col}>
            <View style={styles.dotRow}>
              <View style={[styles.halfBar, index === 0 && styles.halfBarHidden, leftDone && styles.halfBarDone]} />
              <View style={[styles.dot, done && styles.dotDone, active && styles.dotActive]}>
                {done ? (
                  <Ionicons name="checkmark" size={13} color={colors.primaryText} />
                ) : (
                  <Text style={[styles.dotText, active && styles.dotTextActive]}>{index + 1}</Text>
                )}
              </View>
              <View
                style={[
                  styles.halfBar,
                  index === steps.length - 1 && styles.halfBarHidden,
                  rightDone && styles.halfBarDone,
                ]}
              />
            </View>
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  col: { flex: 1, alignItems: 'center' },
  dotRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  halfBar: { flex: 1, height: 2, backgroundColor: colors.border },
  halfBarHidden: { backgroundColor: 'transparent' },
  halfBarDone: { backgroundColor: colors.primary },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  dotDone: { backgroundColor: colors.primary },
  dotActive: { backgroundColor: colors.secondary },
  dotText: { ...typography.micro, color: colors.textMuted },
  dotTextActive: { color: colors.secondaryText },
  label: { ...typography.micro, color: colors.textSubtle, marginTop: spacing.xs },
  labelActive: { color: colors.secondaryDark },
});
