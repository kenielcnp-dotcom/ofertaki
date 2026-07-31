import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { authService } from '../../services/auth.service';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    const { error } = await authService.resetPassword(email);
    setSubmitting(false);
    Alert.alert(
      error ? 'Erro' : 'Verifique seu e-mail',
      error ? error.message : 'Enviamos um link de redefinição de senha.'
    );
  }

  return (
    <View style={styles.container}>
      <Text style={typography.title}>Redefinir senha</Text>
      <View style={styles.form}>
        <Input
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Button label="Enviar link" loading={submitting} onPress={handleSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  form: { marginTop: spacing.lg },
});
