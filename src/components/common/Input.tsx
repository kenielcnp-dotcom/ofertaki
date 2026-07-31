import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { typography } from '../../theme/typography';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Variante compacta usada nas barras de busca (sem label, arredondada). */
  rounded?: boolean;
};

export function Input({
  label,
  error,
  hint,
  icon,
  rounded = false,
  style,
  secureTextEntry,
  multiline,
  ...rest
}: InputProps) {
  const [hidden, setHidden] = useState(!!secureTextEntry);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          rounded && styles.fieldRounded,
          multiline && styles.fieldMultiline,
          focused && styles.fieldFocused,
          !!error && styles.fieldError,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={focused ? colors.primary : colors.textSubtle}
            style={styles.icon}
          />
        ) : null}
        <TextInput
          accessibilityLabel={label ?? rest.placeholder}
          placeholderTextColor={colors.textSubtle}
          style={[styles.input, multiline && styles.inputMultiline, style]}
          secureTextEntry={secureTextEntry ? hidden : undefined}
          multiline={multiline}
          onFocus={(event) => {
            setFocused(true);
            rest.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            rest.onBlur?.(event);
          }}
          {...rest}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
            onPress={() => setHidden((prev) => !prev)}
            hitSlop={10}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View style={styles.messageRow}>
          <Ionicons name="alert-circle" size={13} color={colors.danger} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: {
    ...typography.captionStrong,
    color: colors.text,
    marginBottom: spacing.xs + 2,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundAlt,
  },
  fieldRounded: {
    borderRadius: radius.pill,
    minHeight: 48,
    backgroundColor: colors.surface,
  },
  fieldMultiline: {
    minHeight: 108,
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  fieldFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  fieldError: { borderColor: colors.danger, backgroundColor: colors.dangerBg },
  icon: { marginRight: spacing.sm },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  inputMultiline: { textAlignVertical: 'top', minHeight: 92 },
  messageRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  error: { ...typography.micro, color: colors.danger },
  hint: { ...typography.micro, color: colors.textSubtle, marginTop: spacing.xs },
});
