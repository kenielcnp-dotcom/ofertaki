import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export function PoliticaPrivacidadeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.title, styles.title]}>Aviso de Privacidade</Text>
        
        <Text style={[typography.body, styles.paragraph]}>
          Privacidade e segurança são prioridades para o Ofertaki. Comprometemo-nos com a transparência do tratamento de dados pessoais dos nossos usuários, em total conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais - LGPD).
        </Text>

        <Text style={[typography.subtitle, styles.subtitle]}>1. Finalidade do Tratamento</Text>
        <Text style={[typography.body, styles.paragraph]}>
          O Ofertaki coleta e armazena dados com a finalidade de:{"\n"}
          - Criar e gerenciar a sua conta de usuário (autenticação).{"\n"}
          - Permitir a publicação e interação com as promoções.{"\n"}
          - Manter o Ranking de usuários baseado em suas interações.{"\n"}
          - Registrar dados estatísticos básicos para melhoria do app.
        </Text>

        <Text style={[typography.subtitle, styles.subtitle]}>2. Quais dados são tratados</Text>
        <Text style={[typography.body, styles.paragraph]}>
          - Dados de autenticação (e-mail, senha criptografada via Supabase).{"\n"}
          - Nome de usuário e pontuação de reputação.{"\n"}
          - Histórico de interações (ofertas publicadas, curtidas, confirmações).
        </Text>

        <Text style={[typography.subtitle, styles.subtitle]}>3. Armazenamento e Segurança</Text>
        <Text style={[typography.body, styles.paragraph]}>
          Os dados pessoais serão armazenados pelo tempo necessário para a prestação do serviço. Utilizamos medidas e soluções técnicas (como RLS - Row Level Security em nosso banco de dados) para garantir a confidencialidade e inviolabilidade dos dados. Apenas você pode editar seu perfil.
        </Text>

        <Text style={[typography.subtitle, styles.subtitle]}>4. Compartilhamento de dados</Text>
        <Text style={[typography.body, styles.paragraph]}>
          O Ofertaki não comercializa nem compartilha seus dados pessoais com terceiros não autorizados. Os dados são processados através do provedor de infraestrutura (Supabase) exclusivamente para o funcionamento do app.
        </Text>

        <Text style={[typography.subtitle, styles.subtitle]}>5. Direitos do Titular (Art. 18 da LGPD)</Text>
        <Text style={[typography.body, styles.paragraph]}>
          Você tem o direito de, a qualquer momento e de forma gratuita:{"\n"}
          - Confirmar a existência de tratamento de dados.{"\n"}
          - Acessar seus dados pessoais.{"\n"}
          - Corrigir dados incompletos ou desatualizados.{"\n"}
          - Solicitar a eliminação dos seus dados (excluindo a conta).
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundAlt },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { marginBottom: spacing.md, color: colors.text, textAlign: 'center' },
  subtitle: { marginTop: spacing.md, marginBottom: spacing.sm, color: colors.primary },
  paragraph: { color: colors.textMuted, marginBottom: spacing.md },
});
