import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const BACKGROUND_IMAGE = require('../../../assets/welcome-bg.jpg');
const LOGO_IMAGE = require('../../../assets/logo.png');

const HIGHLIGHTS: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'pricetags', label: 'Ofertas reais' },
  { icon: 'people', label: 'Feito pela comunidade' },
  { icon: 'trophy', label: 'Ganhe pontos' },
];

export function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground 
      source={BACKGROUND_IMAGE} 
      style={styles.background}
      resizeMode="cover"
      imageStyle={{ width: '100%', height: '100%' }}
    >
      <LinearGradient
        colors={['rgba(15,51,30,0.15)', 'rgba(15,51,30,0.7)', 'rgba(15,51,30,0.97)']}
        locations={[0, 0.45, 1]}
        style={styles.gradient}
      >
        <View style={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Image source={LOGO_IMAGE} style={styles.logo} resizeMode="contain" />

          <Text style={styles.headline}>As melhores ofertas do seu mercado, todo dia.</Text>
          <Text style={styles.sub}>
            Descubra promoções publicadas por quem já esteve no corredor do supermercado — e compartilhe as suas.
          </Text>

          <View style={styles.highlights}>
            {HIGHLIGHTS.map((item) => (
              <View key={item.label} style={styles.highlight}>
                <View style={styles.highlightIcon}>
                  <Ionicons name={item.icon} size={16} color={colors.primaryText} />
                </View>
                <Text style={styles.highlightLabel} numberOfLines={2}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.buttons}>
            <Button
              label="Criar minha conta"
              variant="accent"
              size="lg"
              icon="sparkles"
              onPress={() => navigation.navigate('SignUp')}
            />
            <Button
              label="Já tenho conta"
              variant="ghost"
              size="lg"
              onPress={() => navigation.navigate('Login')}
              style={styles.ghostButton}
            />
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%', backgroundColor: colors.primaryDark },
  gradient: { flex: 1, width: '100%', height: '100%', justifyContent: 'flex-end' },
  content: { paddingHorizontal: spacing.lg },
  logo: { width: 150, height: 54, marginBottom: spacing.lg },
  headline: { ...typography.display, color: colors.primaryText },
  sub: {
    ...typography.body,
    color: colors.primaryText,
    opacity: 0.82,
    marginTop: spacing.sm,
  },
  highlights: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  highlight: { flex: 1, alignItems: 'center', gap: spacing.xs },
  highlightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightLabel: {
    ...typography.micro,
    color: colors.primaryText,
    opacity: 0.85,
    textAlign: 'center',
  },
  buttons: { gap: spacing.sm },
  ghostButton: { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.45)' },
});
