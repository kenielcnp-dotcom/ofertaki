import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const LOGO_IMAGE = require('../../../assets/logo.png');

type AuthHeaderProps = {
  title: string;
  subtitle: string;
  showLogo?: boolean;
};

export function AuthHeader({ title, subtitle, showLogo = true }: AuthHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.circleLarge} />
      <View style={styles.circleSmall} />
      <View style={styles.tagIcon}>
        <Ionicons name="pricetags" size={16} color={colors.primaryText} />
      </View>

      {showLogo ? <Image source={LOGO_IMAGE} style={styles.logo} resizeMode="contain" /> : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  circleLarge: {
    position: 'absolute',
    top: -60,
    right: -50,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: colors.secondary,
    opacity: 0.28,
  },
  circleSmall: {
    position: 'absolute',
    bottom: -40,
    left: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.primaryLight,
    opacity: 0.55,
  },
  tagIcon: {
    position: 'absolute',
    top: 64,
    right: 34,
    opacity: 0.6,
  },
  logo: { width: 116, height: 38, marginBottom: spacing.md },
  title: { ...typography.title, color: colors.primaryText },
  subtitle: { ...typography.caption, color: colors.primaryText, opacity: 0.85, marginTop: spacing.xs },
});
