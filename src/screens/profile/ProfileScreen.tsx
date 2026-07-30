import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/common/Button';
import { useAuthContext } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { MainTabScreenProps } from '../../navigation/types';

type Props = MainTabScreenProps<'Perfil'>;

export function ProfileScreen({ navigation }: Props) {
  const { profile } = useAuthContext();

  return (
    <View style={styles.container}>
      <Text style={typography.title}>{profile?.username ?? 'Perfil'}</Text>
      <Text style={styles.reputation}>Reputação: {profile?.reputation_score ?? 0} pontos</Text>
      <View style={styles.linkSection}>
        <Button label="Ver ranking" variant="secondary" onPress={() => navigation.navigate('Ranking')} />
      </View>
      <View style={styles.spacer} />
      <Button label="Sair" variant="secondary" onPress={() => authService.signOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  reputation: { color: colors.textMuted, marginTop: spacing.sm },
  linkSection: { marginTop: spacing.lg },
  spacer: { flex: 1 },
});
