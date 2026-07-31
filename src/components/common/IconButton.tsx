import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';

type IconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  label: string;
  size?: number;
  tone?: 'neutral' | 'primary' | 'danger' | 'onDark';
  style?: StyleProp<ViewStyle>;
};

const TONES = {
  neutral: { bg: colors.surface, fg: colors.text },
  primary: { bg: colors.primaryBg, fg: colors.primary },
  danger: { bg: colors.dangerBg, fg: colors.danger },
  onDark: { bg: 'rgba(255,255,255,0.18)', fg: colors.textInverse },
};

export function IconButton({ icon, onPress, label, size = 40, tone = 'neutral', style }: IconButtonProps) {
  const palette = TONES[tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size, borderRadius: radius.pill, backgroundColor: palette.bg },
        pressed && styles.pressed,
        style,
      ]}
    >
      <View pointerEvents="none">
        <Ionicons name={icon} size={size * 0.5} color={palette.fg} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
});
