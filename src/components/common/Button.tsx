import { ActivityIndicator, Pressable, StyleSheet, StyleProp, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { typography, shadows } from '../../theme/typography';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

const SIZES: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { height: 40, paddingHorizontal: spacing.md, fontSize: 14 },
  md: { height: 50, paddingHorizontal: spacing.lg, fontSize: 15 },
  lg: { height: 56, paddingHorizontal: spacing.lg, fontSize: 16 },
};

const FOREGROUND: Record<ButtonVariant, string> = {
  primary: colors.primaryText,
  secondary: colors.text,
  accent: colors.secondaryText,
  ghost: colors.primary,
  danger: colors.danger,
};

export function Button({
  label,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = true,
  style,
}: ButtonProps) {
  const dimensions = SIZES[size];
  const foreground = FOREGROUND[variant];
  const isBlocked = !!disabled || !!loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isBlocked, busy: !!loading }}
      onPress={onPress}
      disabled={isBlocked}
      style={({ pressed }) => [
        styles.base,
        {
          height: dimensions.height,
          paddingHorizontal: dimensions.paddingHorizontal,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        styles[variant],
        variant === 'primary' || variant === 'accent' ? shadows.card : null,
        pressed && !isBlocked && styles.pressed,
        isBlocked && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={dimensions.fontSize + 3} color={foreground} /> : null}
          <Text style={[typography.button, { color: foreground, fontSize: dimensions.fontSize }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  primary: { backgroundColor: colors.primary },
  accent: { backgroundColor: colors.secondary },
  secondary: {
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  ghost: { backgroundColor: 'transparent' },
  danger: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.45 },
});
