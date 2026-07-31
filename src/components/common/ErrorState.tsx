import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { useTheme } from '../../theme/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type ErrorStateProps = {
  message?: string;
  onRetry: () => void;
};

export function ErrorState({ message = 'Não foi possível carregar. Tente novamente.', onRetry }: ErrorStateProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
      <View style={styles.button}>
        <Button label="Tentar novamente" variant="secondary" onPress={onRetry} />
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
    text: { color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md },
    button: { minWidth: 180 },
  });
