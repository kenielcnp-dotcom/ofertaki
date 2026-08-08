import { StyleSheet, View } from 'react-native';
import { EmptyState } from '../../components/common/EmptyState';
import { colors } from '../../theme/colors';

export function SegurancaScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <EmptyState 
          icon="lock-closed-outline" 
          title="Segurança" 
          message="Gerencie senhas e autenticação (em breve)."
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundAlt },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
});
