import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../../components/common/Button';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { typography } from '../../../theme/typography';

type Props = {
  onViewFeed: () => void;
  onPublishAnother: () => void;
};

const POINTS_EARNED = 10;

export function PublishStep({ onViewFeed, onPublishAnother }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Ionicons name="pricetag-outline" size={30} color={colors.success} />
      </View>
      <Text style={styles.title}>Promoção publicada!</Text>
      <Text style={styles.subtitle}>Sua contribuição já está no feed ajudando outras pessoas a economizar.</Text>

      <View style={styles.pointsPill}>
        <Text style={styles.pointsText}>✨ +{POINTS_EARNED} pontos</Text>
      </View>

      <View style={styles.actions}>
        <Button label="Ver no feed" onPress={onViewFeed} />
        <Button label="Publicar outra" variant="secondary" onPress={onPublishAnother} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.successBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { ...typography.title, color: colors.text, textAlign: 'center' },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  pointsPill: {
    backgroundColor: colors.secondaryBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    marginTop: spacing.lg,
  },
  pointsText: { ...typography.bodyStrong, color: colors.secondaryDark },
  actions: { width: '100%', gap: spacing.sm, marginTop: spacing.xl },
});
