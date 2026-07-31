import { Image, ImageBackground, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/common/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const BACKGROUND_IMAGE = require('../../../assets/welcome-bg.jpg');
const LOGO_IMAGE = require('../../../assets/logo.png');

export function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground source={BACKGROUND_IMAGE} style={styles.background}>
      <LinearGradient
        colors={['rgba(15,51,30,0)', 'rgba(15,51,30,0.55)', 'rgba(15,51,30,0.92)']}
        style={styles.gradient}
      >
        <View style={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.wordmarkRow}>
            <Image source={LOGO_IMAGE} style={styles.logo} resizeMode="contain" />
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  gradient: { flex: 1, justifyContent: 'flex-end' },
  content: { paddingHorizontal: spacing.lg },
  wordmarkRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  logo: { width: 180, height: 80 },
  buttons: { gap: spacing.md },
  pillButton: { borderRadius: 28, minHeight: 56 },
});
