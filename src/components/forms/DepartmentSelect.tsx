import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { typography } from '../../theme/typography';
import type { Department } from '../../types/promotion';

type Props = {
  departments: Department[];
  value: string | null;
  onChange: (departmentId: string) => void;
  error?: string;
};

export function DepartmentSelect({ departments, value, onChange, error }: Props) {
  const [open, setOpen] = useState(false);
  const selected = departments.find((department) => department.id === value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Departamento</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Selecionar departamento"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.field,
          !!error && styles.fieldError,
          pressed && styles.fieldPressed,
        ]}
      >
        <Ionicons
          name={(selected?.icon as keyof typeof Ionicons.glyphMap) ?? 'pricetags-outline'}
          size={18}
          color={selected ? colors.primary : colors.textSubtle}
        />
        <Text style={selected ? styles.fieldText : styles.placeholder} numberOfLines={1}>
          {selected ? selected.name : 'Selecione o departamento'}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.grabber} />
            <Text style={styles.sheetTitle}>Selecione o departamento</Text>
            <FlatList
              data={departments}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => {
                const isSelected = item.id === value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={item.name}
                    style={styles.option}
                    onPress={() => {
                      onChange(item.id);
                      setOpen(false);
                    }}
                  >
                    <View style={styles.optionIcon}>
                      <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={16} color={colors.primary} />
                    </View>
                    <Text style={styles.optionText}>{item.name}</Text>
                    {isSelected ? (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { ...typography.captionStrong, color: colors.text, marginBottom: spacing.xs + 2 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundAlt,
  },
  fieldPressed: { borderColor: colors.primary, backgroundColor: colors.background },
  fieldError: { borderColor: colors.danger, backgroundColor: colors.dangerBg },
  fieldText: { ...typography.body, color: colors.text, flex: 1 },
  placeholder: { ...typography.body, color: colors.textSubtle, flex: 1 },
  error: { ...typography.micro, color: colors.danger, marginTop: spacing.xs },
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    maxHeight: '65%',
  },
  grabber: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.md,
  },
  sheetTitle: { ...typography.subtitle, color: colors.text, marginBottom: spacing.md },
  separator: { height: 1, backgroundColor: colors.border },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: { ...typography.body, color: colors.text, flex: 1 },
});
