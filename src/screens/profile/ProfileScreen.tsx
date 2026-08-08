import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { MenuItem } from '../../components/profile/MenuItem';
import { useAuthContext } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { typography } from '../../theme/typography';
import type { MainTabScreenProps } from '../../navigation/types';

type Props = MainTabScreenProps<'Perfil'>;

function StatItem({ icon, title, value }: { icon: keyof typeof Feather.glyphMap; title: string; value: string | number }) {
  return (
    <View style={styles.statItem}>
      <Feather name={icon} size={20} color={colors.textMuted} />
      <Text style={[typography.micro, styles.statTitle, styles.statTitleCenter]} numberOfLines={2}>
        {title}
      </Text>
      <Text style={[typography.bodyStrong, { color: colors.primary }]}>{value}</Text>
    </View>
  );
}

export function ProfileScreen({ navigation }: Props) {
  const { profile } = useAuthContext();
  const userName = profile?.username || 'Usuário';
  const reputation = profile?.reputation_score || 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Avatar name={userName} size={72} ring />
          <View style={styles.avatarBadge}>
            <Ionicons name="camera" size={12} color={colors.background} />
          </View>
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={typography.title}>{userName}</Text>
            <Badge label="Caçador Bronze" tone="accent" icon="medal" />
          </View>
          <Text style={typography.caption}>Membro desde abr. 2024</Text>
        </View>
      </View>

      {/* Trust & Reputation Card */}
      <Card style={styles.trustCard} padded={false}>
        <View style={styles.trustRow}>
          <View style={styles.trustCol}>
            <View style={styles.trustTitleRow}>
              <Feather name="star" size={16} color={colors.textMuted} />
              <Text style={typography.caption}>Reputação</Text>
            </View>
            <Text style={[typography.bodyStrong, { color: colors.primary }]}>{reputation} pontos</Text>
          </View>
          <View style={styles.dividerVertical} />
          <View style={styles.trustCol}>
            <View style={styles.trustTitleRow}>
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.textMuted} />
              <Text style={typography.caption}>Confiança</Text>
            </View>
            <View style={styles.verifiedRow}>
              <Text style={[typography.bodyStrong, { color: colors.primary }]}>Conta verificada</Text>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            </View>
          </View>
        </View>
        <View style={styles.trustFooter}>
          <Button 
            label="Ver ranking" 
            variant="secondary" 
            icon="trophy-outline"
            onPress={() => navigation.navigate('Ranking')} 
          />
        </View>
      </Card>

      {/* Privacy Note */}
      <View style={styles.privacyNote}>
        <Feather name="lock" size={14} color={colors.textMuted} />
        <Text style={[typography.caption, { color: colors.textMuted, flex: 1 }]}>
          Suas informações estão protegidas e nunca serão compartilhadas.
          <Text style={{ color: colors.secondary }}> Saiba mais sobre nossa Política de Privacidade.</Text>
        </Text>
      </View>

      {/* Minhas atividades */}
      <View style={styles.section}>
        <Text style={[typography.subtitle, styles.sectionTitle]}>Minhas atividades</Text>
        <Card padded={false}>
          <View style={styles.statsRow}>
            <StatItem icon="tag" title="Promoções publicadas" value={3} />
            <StatItem icon="check-square" title="Confirmações feitas" value={12} />
            <StatItem icon="heart" title="Curtidas recebidas" value={7} />
            <StatItem icon="bookmark" title="Itens salvos" value={18} />
          </View>
          <View style={styles.dividerHorizontal} />
          <MenuItem iconName="checkmark-done-circle-outline" title="Histórico de confirmações" onPress={() => navigation.navigate('HistoricoConfirmacoes')} />
          <MenuItem iconName="bookmark-outline" title="Itens salvos" onPress={() => navigation.navigate('ItensSalvos')} />
          <MenuItem iconName="pricetag-outline" title="Minhas promoções" onPress={() => navigation.navigate('MinhasPromocoes')} />
          <MenuItem iconName="notifications-outline" title="Notificações" onPress={() => navigation.navigate('Notificacoes')} />
        </Card>
      </View>

      {/* Conta e segurança */}
      <View style={styles.section}>
        <Text style={[typography.subtitle, styles.sectionTitle]}>Conta e segurança</Text>
        <Card padded={false}>
          <MenuItem iconName="person-outline" title="Editar perfil" onPress={() => navigation.navigate('EditarPerfil')} />
          <MenuItem iconName="shield-half-outline" title="Privacidade" onPress={() => navigation.navigate('Privacidade')} />
          <MenuItem iconName="lock-closed-outline" title="Segurança" onPress={() => navigation.navigate('Seguranca')} />
        </Card>
      </View>

      {/* Sobre o Ofertaki */}
      <View style={styles.section}>
        <Text style={[typography.subtitle, styles.sectionTitle]}>Sobre o Ofertaki</Text>
        <Card padded={false}>
          <MenuItem iconName="information-circle-outline" title="Como funciona" onPress={() => navigation.navigate('ComoFunciona')} />
          <MenuItem iconName="people-outline" title="Regras da comunidade" onPress={() => navigation.navigate('RegrasComunidade')} />
          <MenuItem iconName="help-circle-outline" title="Ajuda e suporte" onPress={() => navigation.navigate('AjudaSuporte')} />
          <MenuItem iconName="document-text-outline" title="Termos de uso" onPress={() => navigation.navigate('TermosUso')} />
          <MenuItem iconName="shield-checkmark-outline" title="Política de privacidade" onPress={() => navigation.navigate('PoliticaPrivacidade')} />
        </Card>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Button 
          label="Sair da conta" 
          variant="secondary" 
          icon="log-out-outline"
          onPress={() => authService.signOut()} 
        />
        <Text style={[typography.caption, styles.versionText]}>Versão 1.0.0</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.text,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  trustCard: {
    marginBottom: spacing.md,
  },
  trustRow: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  trustCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  trustTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dividerVertical: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  trustFooter: {
    padding: spacing.md,
    paddingTop: 0,
  },
  privacyNote: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statTitle: {
    color: colors.textMuted,
    minHeight: 28,
  },
  statTitleCenter: {
    textAlign: 'center',
  },
  dividerHorizontal: {
    height: 1,
    backgroundColor: colors.border,
  },
  footer: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  versionText: {
    textAlign: 'center',
    color: colors.textMuted,
  },
});
