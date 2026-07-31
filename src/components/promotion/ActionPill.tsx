import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { typography } from '../../theme/typography';

type ActionPillProps = {
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon?: keyof typeof Ionicons.glyphMap;
  label: string;
  count?: number;
  active?: boolean;
  disabled?: boolean;
  loading?: boolean;
  tone?: 'primary' | 'accent';
  onPress: () => void;
};

/** Pílula de interação social (curtir / confirmar) usada no detalhe da promoção. */
export function ActionPill({
  icon,
  activeIcon,
  label,
  count,
  active = false,
  disabled = false,
  loading = false,
  tone = 'primary',
  onPress,
}: ActionPillProps) {
  const accent = tone === 'accent' ? colors.secondary : colors.primary;
  const accentBg = tone === 'accent' ? colors.secondaryBg : colors.primaryBg;
  const foreground = active ? colors.textInverse : accent;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={count === undefined ? label : `${label}, ${count}`}
      accessibilityState={{ selected: active, disabled: disabled || loading }}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.pill,
        { backgroundColor: active ? accent : accentBg, borderColor: active ? accent : 'transparent' },
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name={active && activeIcon ? activeIcon : icon} size={17} color={foreground} />
      <Text style={[typography.captionStrong, { color: foreground }]} numberOfLines={1}>
        {label}
      </Text>
      {count !== undefined ? (
        <Text style={[typography.captionStrong, { color: foreground, opacity: 0.8 }]}>{count}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 46,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.85 },
});
