import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export function RegrasComunidadeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.body, styles.paragraph]}>
          Para mantermos o Ofertaki um lugar confiável e agradável para todos, pedimos que siga nossas regras básicas:
        </Text>
        
        <Text style={[typography.subtitle, styles.subtitle]}>1. Seja verdadeiro</Text>
        <Text style={[typography.body, styles.paragraph]}>
          Publique apenas ofertas reais. Não manipule fotos ou insira preços incorretos propositalmente. Promoções falsas podem levar ao banimento da conta.
        </Text>

        <Text style={[typography.subtitle, styles.subtitle]}>2. Mantenha o respeito</Text>
        <Text style={[typography.body, styles.paragraph]}>
          Não toleramos ofensas, discurso de ódio ou assédio nos comentários. A comunidade é um lugar para ajudar uns aos outros a economizar.
        </Text>

        <Text style={[typography.subtitle, styles.subtitle]}>3. Use a ferramenta de denúncia</Text>
        <Text style={[typography.body, styles.paragraph]}>
          Se encontrar uma promoção com preço errado, produto esgotado ou conteúdo impróprio, use a opção de "Denunciar". Com 5 denúncias, a oferta é removida automaticamente.
        </Text>

        <Text style={[typography.subtitle, styles.subtitle]}>4. Sem spam</Text>
        <Text style={[typography.body, styles.paragraph]}>
          Evite publicar a mesma oferta repetidas vezes ou divulgar links comerciais não relacionados ao propósito do aplicativo.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundAlt },
  content: { padding: spacing.lg },
  subtitle: { marginTop: spacing.md, marginBottom: spacing.sm, color: colors.text },
  paragraph: { color: colors.textMuted, marginBottom: spacing.md },
});
