import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type ErrorStateProps = {
  message?: string;
  onRetry: () => void;
};

export function ErrorState({
  message = 'Não foi possível carregar. Tente novamente.',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="cloud-offline-outline" size={30} color={colors.danger} />
      </View>
      <Text style={styles.title}>Algo deu errado</Text>
      <Text style={styles.text}>{message}</Text>
      <View style={styles.button}>
        <Button label="Tentar novamente" icon="refresh" variant="secondary" onPress={onRetry} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { ...typography.subtitle, color: colors.text },
  text: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  button: { minWidth: 200, marginTop: spacing.lg },
});
