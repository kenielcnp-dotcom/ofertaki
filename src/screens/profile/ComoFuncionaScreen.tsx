import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export function ComoFuncionaScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.title, styles.title]}>Bem-vindo ao Ofertaki!</Text>
        <Text style={[typography.body, styles.paragraph]}>
          O Ofertaki é uma comunidade focada em compartilhar as melhores promoções de supermercado. Aqui, você economiza de verdade e ajuda outras pessoas a fazerem o mesmo.
        </Text>
        
        <Text style={[typography.subtitle, styles.subtitle]}>1. Publique Ofertas</Text>
        <Text style={[typography.body, styles.paragraph]}>
          Encontrou um preço incrível? Tire uma foto da oferta ou da prateleira, informe o preço e o mercado, e publique para a comunidade. Toda oferta ajuda!
        </Text>

        <Text style={[typography.subtitle, styles.subtitle]}>2. Confirme Preços</Text>
        <Text style={[typography.body, styles.paragraph]}>
          Se você foi ao mercado e viu que a promoção ainda é válida, clique em "Confirmar". Isso aumenta a credibilidade da oferta e ajuda outros usuários a saberem que não perderão a viagem.
        </Text>

        <Text style={[typography.subtitle, styles.subtitle]}>3. Ganhe Pontos e Suba no Ranking</Text>
        <Text style={[typography.body, styles.paragraph]}>
          Sua colaboração vale muito. Ao publicar promoções e receber curtidas e confirmações, você ganha pontos de reputação e sobe no nosso Ranking Mensal.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundAlt },
  content: { padding: spacing.lg },
  title: { marginBottom: spacing.md, color: colors.primary },
  subtitle: { marginTop: spacing.lg, marginBottom: spacing.sm, color: colors.text },
  paragraph: { color: colors.textMuted, marginBottom: spacing.md },
});
