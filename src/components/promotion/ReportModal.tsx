import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { typography } from '../../theme/typography';
import type { ReportReason } from '../../types/promotion';

const REASONS: { value: ReportReason; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'expired', label: 'Promoção expirada', icon: 'time-outline' },
  { value: 'fake', label: 'Promoção falsa', icon: 'alert-circle-outline' },
  { value: 'wrong_price', label: 'Preço incorreto', icon: 'pricetag-outline' },
  { value: 'inappropriate', label: 'Conteúdo impróprio', icon: 'eye-off-outline' },
  { value: 'other', label: 'Outro motivo', icon: 'ellipsis-horizontal-circle-outline' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, details: string) => void;
  submitting: boolean;
  error: string | null;
};

export function ReportModal({ visible, onClose, onSubmit, submitting, error }: Props) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.grabber} />
          <View style={styles.headerRow}>
            <View style={styles.headerIcon}>
              <Ionicons name="flag" size={18} color={colors.danger} />
            </View>
            <View style={styles.headerTexts}>
              <Text style={styles.title}>Denunciar promoção</Text>
              <Text style={styles.subtitle}>Sua denúncia é anônima para quem publicou.</Text>
            </View>
          </View>

          <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
            {REASONS.map((option) => {
              const selected = reason === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={option.label}
                  onPress={() => setReason(option.value)}
                  style={[styles.option, selected && styles.optionSelected]}
                >
                  <Ionicons
                    name={option.icon}
                    size={18}
                    color={selected ? colors.primary : colors.textMuted}
                  />
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                    {option.label}
                  </Text>
                  <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected ? <View style={styles.radioDot} /> : null}
                  </View>
                </Pressable>
              );
            })}

            <Input
              label="Detalhes (opcional)"
              value={details}
              onChangeText={setDetails}
              placeholder="Explique o motivo, se quiser"
              multiline
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </ScrollView>

          <View style={styles.footer}>
            <Button
              label="Enviar denúncia"
              variant="danger"
              loading={submitting}
              disabled={!reason}
              onPress={() => reason && onSubmit(reason, details)}
            />
            <Button label="Cancelar" variant="ghost" size="sm" onPress={onClose} />
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
    maxHeight: '88%',
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
    backgroundColor: colors.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTexts: { flex: 1 },
  title: { ...typography.subtitle, color: colors.text },
  subtitle: { ...typography.micro, color: colors.textMuted, marginTop: 2 },
  scroll: { flexGrow: 0 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.backgroundAlt,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryBg },
  optionText: { ...typography.body, color: colors.text, flex: 1 },
  optionTextSelected: { color: colors.primary },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  errorText: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm },
  footer: { gap: spacing.xs, marginTop: spacing.sm },
});
