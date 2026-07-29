import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export function SignUpScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, submitting, error } = useAuth();

  async function handleSubmit() {
    const ok = await signUp({ username, email, password });
    if (ok) {
      Alert.alert('Quase lá', 'Confirme seu e-mail para ativar a conta.');
      navigation.navigate('Login');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={typography.title}>Criar conta</Text>
      <View style={styles.form}>
        <Input label="Nome de usuário" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <Input
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input label="Senha" value={password} onChangeText={setPassword} secureTextEntry />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Button label="Cadastrar" loading={submitting} onPress={handleSubmit} />
      </View>
      <Pressable onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Já tem conta? Entrar</Text>
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
