import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, submitting, error } = useAuth();

  return (
    <View style={styles.container}>
      <AuthHeader title="Bem-vindo de volta" subtitle="Entre para ver as melhores ofertas" />
      <View style={styles.form}>
        <Input
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          icon="mail-outline"
          placeholder="seuemail@gmail.com"
        />
        <Input
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          icon="lock-closed-outline"
        />
        <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotLink}>
          <Text style={styles.link}>Esqueci minha senha</Text>
        </Pressable>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Button
          label="Entrar"
          loading={submitting}
          onPress={() => signIn({ email, password })}
          style={styles.pillButton}
        />
      </View>
      <Pressable onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signUpLink}>Não tem conta? Cadastre-se</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  form: { padding: spacing.lg, marginTop: spacing.lg },
  forgotLink: { alignItems: 'flex-end', marginBottom: spacing.md, marginTop: -spacing.xs },
  errorText: { color: colors.danger, marginBottom: spacing.md },
  link: { color: colors.primary, fontSize: 13, textDecorationLine: 'underline' },
  signUpLink: { color: colors.primary, textAlign: 'center', marginTop: spacing.lg },
  pillButton: { borderRadius: 28, minHeight: 56 },
});
