import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  /** Cabeçalho verde de destaque (Home). Caso contrário, fundo claro. */
  tone?: 'brand' | 'light';
  children?: ReactNode;
};

export function ScreenHeader({ title, subtitle, right, tone = 'light', children }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const isBrand = tone === 'brand';

  return (
    <View
      style={[
        styles.container,
        isBrand ? styles.brand : styles.light,
        { paddingTop: insets.top + spacing.md },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.texts}>
          <Text style={[typography.title, isBrand ? styles.titleBrand : styles.titleLight]}>{title}</Text>
          {subtitle ? (
            <Text style={[typography.caption, isBrand ? styles.subtitleBrand : styles.subtitleLight]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  brand: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  light: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  texts: { flex: 1 },
  titleBrand: { color: colors.primaryText },
  titleLight: { color: colors.text },
  subtitleBrand: { color: colors.primaryText, opacity: 0.85, marginTop: 2 },
  subtitleLight: { color: colors.textMuted, marginTop: 2 },
});
