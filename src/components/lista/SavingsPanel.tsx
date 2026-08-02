import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../common/Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatPrice } from '../../utils/formatters';

type SavingsPanelProps = {
  total: number;
  count: number;
};

export function SavingsPanel({ total, count }: SavingsPanelProps) {
  if (count === 0) return null;

  return (
    <Card style={styles.card}>
      <Text style={styles.label}>Economia deste mês</Text>
      <Text style={[typography.priceLarge, styles.total]}>{formatPrice(total)}</Text>
      <Text style={styles.caption}>
        em {count} {count === 1 ? 'compra confirmada' : 'compras confirmadas'}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.primaryBg, marginBottom: spacing.md },
  label: { ...typography.sectionLabel, color: colors.primary },
  total: { color: colors.primaryDark, marginTop: spacing.xs },
  caption: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
});
