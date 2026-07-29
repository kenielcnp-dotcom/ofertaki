import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, submitting, error } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={typography.title}>Entrar</Text>
      <View style={styles.form}>
        <Input
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input label="Senha" value={password} onChangeText={setPassword} secureTextEntry />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Button label="Entrar" loading={submitting} onPress={() => signIn({ email, password })} />
      </View>
      <Pressable onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.link}>Esqueci minha senha</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  form: { marginTop: spacing.lg },
  errorText: { color: colors.danger, marginBottom: spacing.md },
  link: { color: colors.primary, textAlign: 'center', marginTop: spacing.md },
});
