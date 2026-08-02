import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const STAR_VALUES = [1, 2, 3, 4, 5];

type Props = {
  value: number;
  size?: number;
  /** Quando presente, as estrelas viram tocáveis e chamam onRate(score). */
  onRate?: (score: number) => void;
  /** Mostra "avg (count)" ao lado, ex: "4,8 (152)". */
  count?: number;
};

export function StarRating({ value, size = 16, onRate, count }: Props) {
  const interactive = !!onRate;

  return (
    <View style={styles.row} accessibilityLabel={`Nota ${value.toLocaleString('pt-BR')} de 5`}>
      <View style={styles.stars}>
        {STAR_VALUES.map((star) => {
          const filled = star <= Math.round(value);
          const icon = filled ? 'star' : 'star-outline';
          return interactive ? (
            <Pressable
              key={star}
              accessibilityRole="button"
              accessibilityLabel={`Avaliar com ${star} estrela${star > 1 ? 's' : ''}`}
              hitSlop={6}
              onPress={() => onRate(star)}
              style={styles.starButton}
            >
              <Ionicons name={icon} size={size} color={colors.gold} />
            </Pressable>
          ) : (
            <Ionicons key={star} name={icon} size={size} color={colors.gold} />
          );
        })}
      </View>
      {count !== undefined ? (
        <Text style={styles.count}>
          {value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ({count})
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  stars: { flexDirection: 'row' },
  starButton: { padding: 2 },
  count: { ...typography.micro, color: colors.textMuted },
});
