import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/common/Button';
import { useAuthContext } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import { useTheme } from '../../theme/ThemeContext';
import type { ThemeColors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { MainTabScreenProps } from '../../navigation/types';

type Props = MainTabScreenProps<'Perfil'>;

export function ProfileScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { profile } = useAuthContext();

  return (
    <View style={styles.container}>
      <Text style={[typography.title, styles.title]}>{profile?.username ?? 'Perfil'}</Text>
      <Text style={styles.reputation}>Reputação: {profile?.reputation_score ?? 0} pontos</Text>
      <View style={styles.linkSection}>
        <Button label="Ver ranking" variant="secondary" onPress={() => navigation.navigate('Ranking')} />
      </View>
      <View style={styles.spacer} />
      <Button label="Sair" variant="secondary" onPress={() => authService.signOut()} />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
    title: { color: colors.text },
    reputation: { color: colors.textMuted, marginTop: spacing.sm },
    linkSection: { marginTop: spacing.lg },
    spacer: { flex: 1 },
  });
