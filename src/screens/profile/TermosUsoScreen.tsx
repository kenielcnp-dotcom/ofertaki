import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export function TermosUsoScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.title, styles.title]}>Termos de Uso - Ofertaki</Text>
        
        <Text style={[typography.subtitle, styles.subtitle]}>1. Aceitação do Termo</Text>
        <Text style={[typography.body, styles.paragraph]}>
          Ao utilizar os serviços do aplicativo Ofertaki, o usuário entende que seus dados pessoais serão tratados nas formas descritas no nosso Aviso de Privacidade e concorda com seus termos. São aplicáveis a este serviço a Lei nº 12.965/2014 (Marco Civil da Internet) e a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais - LGPD).
        </Text>

        <Text style={[typography.subtitle, styles.subtitle]}>2. Descrição do serviço</Text>
        <Text style={[typography.body, styles.paragraph]}>
          O Ofertaki é uma plataforma comunitária de compartilhamento de promoções de supermercado. O aplicativo permite aos usuários publicarem ofertas, curtirem, e confirmarem a veracidade dos preços, acumulando pontos no ranking.
        </Text>

        <Text style={[typography.subtitle, styles.subtitle]}>3. Obrigações dos usuários</Text>
        <Text style={[typography.body, styles.paragraph]}>
          O usuário se responsabiliza pela veracidade dos dados e das ofertas informadas. Durante a utilização do serviço, a fim de preservar os direitos de terceiros, o usuário se compromete a fornecer somente seus dados pessoais. O usuário é responsável por eventuais danos causados a outros usuários devido ao descumprimento destas regras ou envio de conteúdo malicioso.
        </Text>

        <Text style={[typography.subtitle, styles.subtitle]}>4. Responsabilidades do Ofertaki</Text>
        <Text style={[typography.body, styles.paragraph]}>
          O Ofertaki atua como intermediário da comunidade e não se responsabiliza por:{"\n"}
          a) Preços alterados pelo supermercado após a publicação.{"\n"}
          b) Falta de estoque dos produtos ofertados.{"\n"}
          c) Uso indevido da plataforma por terceiros.{"\n"}
          Nos comprometemos a cumprir todas as legislações relativas ao uso correto dos dados pessoais e garantir os direitos legais dos usuários.
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
