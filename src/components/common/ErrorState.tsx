import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type ErrorStateProps = {
  message?: string;
  onRetry: () => void;
};

export function ErrorState({ message = 'Não foi possível carregar. Tente novamente.', onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
      <View style={styles.button}>
        <Button label="Tentar novamente" variant="secondary" onPress={onRetry} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  text: { color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md },
  button: { minWidth: 180 },
});
