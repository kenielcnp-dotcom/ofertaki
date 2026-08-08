import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../common/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { typography } from '../../theme/typography';
import { formatPrice, formatRelativeTime } from '../../utils/formatters';
import type { Promotion } from '../../types/promotion';

type Props = {
  visible: boolean;
  candidate: Promotion | null;
  marketName?: string;
  confirming: boolean;
  onConfirmExisting: () => void;
  onPublishAnyway: () => void;
  onClose: () => void;
};

export function DuplicateModal({
  visible,
  candidate,
  marketName,
  confirming,
  onConfirmExisting,
  onPublishAnyway,
  onClose,
}: Props) {
  if (!candidate) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.grabber} />
          <View style={styles.headerRow}>
            <View style={styles.headerIcon}>
              <Ionicons name="copy-outline" size={18} color={colors.secondaryDark} />
            </View>
            <View style={styles.headerTexts}>
              <Text style={styles.title}>Essa oferta já existe?</Text>
              <Text style={styles.subtitle}>Alguém já publicou algo parecido nesse mercado.</Text>
            </View>
          </View>

          <View style={styles.candidateCard}>
            <Image source={{ uri: candidate.image_url }} style={styles.candidateImage} />
            <View style={styles.candidateBody}>
              <Text style={styles.candidateTitle} numberOfLines={2}>
                {candidate.title}
              </Text>
              {marketName ? <Text style={styles.candidateMeta}>{marketName}</Text> : null}
              <View style={styles.candidateFootRow}>
                <Text style={styles.candidatePrice}>{formatPrice(candidate.price)}</Text>
                <Text style={styles.candidateTime}>Publicada {formatRelativeTime(candidate.created_at)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Button
              label="Confirmar essa oferta"
              icon="checkmark-circle"
              loading={confirming}
              onPress={onConfirmExisting}
            />
            <Button label="Publicar mesmo assim" variant="ghost" size="sm" disabled={confirming} onPress={onPublishAnyway} />
            <Button label="Cancelar" variant="ghost" size="sm" disabled={confirming} onPress={onClose} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  grabber: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.md,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.secondaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTexts: { flex: 1 },
  title: { ...typography.subtitle, color: colors.text },
  subtitle: { ...typography.micro, color: colors.textMuted, marginTop: 2 },
  candidateCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  candidateImage: { width: 64, height: 64, borderRadius: radius.sm, backgroundColor: colors.surface },
  candidateBody: { flex: 1, justifyContent: 'center' },
  candidateTitle: { ...typography.bodyStrong, color: colors.text },
  candidateMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  candidateFootRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  candidatePrice: { ...typography.captionStrong, color: colors.secondaryDark },
  candidateTime: { ...typography.micro, color: colors.textSubtle },
  footer: { gap: spacing.xs },
});
