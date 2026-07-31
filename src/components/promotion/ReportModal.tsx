import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useTheme } from '../../theme/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import type { ReportReason } from '../../types/promotion';

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'expired', label: 'Promoção expirada' },
  { value: 'fake', label: 'Promoção falsa' },
  { value: 'wrong_price', label: 'Preço incorreto' },
  { value: 'inappropriate', label: 'Conteúdo impróprio' },
  { value: 'other', label: 'Outro motivo' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, details: string) => void;
  submitting: boolean;
  error: string | null;
};

export function ReportModal({ visible, onClose, onSubmit, submitting, error }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>Denunciar promoção</Text>

          {REASONS.map((option) => (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              onPress={() => setReason(option.value)}
              style={styles.option}
            >
              <View style={[styles.radio, reason === option.value && styles.radioSelected]} />
              <Text style={styles.optionText}>{option.label}</Text>
            </Pressable>
          ))}

          <Input
            label="Detalhes (opcional)"
            value={details}
            onChangeText={setDetails}
            placeholder="Explique o motivo, se quiser"
            multiline
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            label="Enviar denúncia"
            loading={submitting}
            disabled={!reason}
            onPress={() => reason && onSubmit(reason, details)}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: radius['2xl'],
      borderTopRightRadius: radius['2xl'],
      padding: spacing.lg,
    },
    title: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
    option: { flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingVertical: spacing.sm },
    radio: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: colors.border,
      marginRight: spacing.sm,
    },
    radioSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
    optionText: { color: colors.text, fontSize: 15 },
    errorText: { color: colors.danger, marginTop: spacing.sm },
  });
