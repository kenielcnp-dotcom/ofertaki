import { ImageBackground, StyleSheet, Text, View, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/common/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

// TODO: trocar por require('../../../assets/welcome-bg.jpg') assim que o
// arquivo da foto (time de design) for adicionado em assets/.
const BACKGROUND_IMAGE: number | null = null;

function Background({ children, style }: ViewProps) {
  if (BACKGROUND_IMAGE) {
    return (
      <ImageBackground source={BACKGROUND_IMAGE} style={style}>
        {children}
      </ImageBackground>
    );
  }
  return <View style={[style, styles.backgroundFallback]}>{children}</View>;
}

export function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Background style={styles.background}>
      <LinearGradient
        colors={['rgba(15,51,30,0)', 'rgba(15,51,30,0.55)', 'rgba(15,51,30,0.92)']}
        style={styles.gradient}
      >
        <View style={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.wordmarkRow}>
            <Text style={styles.wordmarkPrimary}>OFERT</Text>
            <Text style={styles.wordmarkSecondary}>AKI</Text>
            <Ionicons name="location" size={20} color={colors.secondary} style={styles.pin} />
          </View>

          <View style={styles.buttons}>
            <Button
              label="Login"
              onPress={() => navigation.navigate('Login')}
              style={[styles.pillButton, { backgroundColor: colors.secondary }]}
            />
            <Button
              label="Cadastrar"
              onPress={() => navigation.navigate('SignUp')}
              style={styles.pillButton}
            />
          </View>
        </View>
      </LinearGradient>
    </Background>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  backgroundFallback: { backgroundColor: colors.primaryDark },
  gradient: { flex: 1, justifyContent: 'flex-end' },
  content: { paddingHorizontal: spacing.lg },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  wordmarkPrimary: { fontSize: 28, fontWeight: '700', color: colors.primaryLight, letterSpacing: 1 },
  wordmarkSecondary: { fontSize: 28, fontWeight: '700', color: colors.secondary, letterSpacing: 1 },
  pin: { marginLeft: spacing.xs, marginBottom: 14 },
  buttons: { gap: spacing.md },
  pillButton: { borderRadius: 28, minHeight: 56 },
});
