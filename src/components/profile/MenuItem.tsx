import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type MenuItemProps = {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  showChevron?: boolean;
};

export function MenuItem({ iconName, title, onPress, showChevron = true }: MenuItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={20} color={colors.textMuted} />
      </View>
      <Text style={[typography.body, styles.title]}>{title}</Text>
      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color={colors.textSubtle} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  pressed: {
    backgroundColor: colors.surface,
  },
  iconContainer: {
    width: 32,
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    color: colors.text,
  },
});
