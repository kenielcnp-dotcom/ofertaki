import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/typography';

type AuthHeaderProps = {
  title: string;
  subtitle: string;
};

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.decorativeCircle} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.primary,
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
      paddingBottom: spacing.xl,
      paddingHorizontal: spacing.lg,
      overflow: 'hidden',
    },
    decorativeCircle: {
      position: 'absolute',
      top: -40,
      right: -40,
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: colors.secondaryDark,
      opacity: 0.35,
    },
    title: {
      fontSize: 26,
      fontFamily: fonts.display.bold,
      color: colors.primaryText,
    },
    subtitle: {
      fontSize: 14,
      color: colors.primaryText,
      opacity: 0.85,
      marginTop: spacing.xs,
    },
  });
