import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/common/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export function AjudaSuporteScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.title, styles.title]}>Como podemos ajudar?</Text>
        <Text style={[typography.body, styles.paragraph]}>
          Se você encontrou algum problema no aplicativo, tem dúvidas sobre como utilizá-lo, ou deseja enviar uma sugestão, nossa equipe está pronta para ajudar.
        </Text>
        
        <View style={styles.contactCard}>
          <Text style={[typography.subtitle, { marginBottom: spacing.xs }]}>E-mail de Suporte</Text>
          <Text style={[typography.body, { color: colors.textMuted }]}>
            suporte@ofertaki.com.br
          </Text>
        </View>

        <Text style={[typography.body, styles.paragraph, { marginTop: spacing.xl }]}>
          Respondemos geralmente em até 48 horas úteis. Para questões sobre denúncias de promoções, o processo é automático após 5 denúncias.
        </Text>

        <Button 
          label="Enviar um e-mail" 
          onPress={() => {}} 
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundAlt },
  content: { padding: spacing.lg },
  title: { marginBottom: spacing.md, color: colors.text },
  paragraph: { color: colors.textMuted, marginBottom: spacing.md },
  contactCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 8,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  }
});
