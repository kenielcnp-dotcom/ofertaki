import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { Department } from '../../types/promotion';

type Props = {
  departments: Department[];
  selectedId: string | null;
  onSelect: (departmentId: string | null) => void;
};

export function DepartmentChips({ departments, selectedId, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <Chip
        label="Todas"
        icon="pricetags-outline"
        active={selectedId === null}
        onPress={() => onSelect(null)}
      />
      {departments.map((department) => (
        <Chip
          key={department.id}
          label={department.name}
          icon={department.icon as keyof typeof Ionicons.glyphMap}
          active={selectedId === department.id}
          onPress={() => onSelect(department.id)}
        />
      ))}
    </ScrollView>
  );
}

function Chip({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.chip}
    >
      <View style={[styles.avatar, active && styles.avatarActive]}>
        <Ionicons name={icon} size={20} color={active ? colors.secondary : colors.textInverse} />
      </View>
      <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.md, paddingRight: spacing.md },
  chip: { alignItems: 'center', width: 60, gap: spacing.xs },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  avatarActive: { borderColor: colors.secondary },
  label: { ...typography.micro, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  labelActive: { color: colors.secondary, fontWeight: '700' },
});
