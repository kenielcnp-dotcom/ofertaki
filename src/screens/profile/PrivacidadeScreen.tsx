import { StyleSheet, View } from 'react-native';
import { EmptyState } from '../../components/common/EmptyState';
import { colors } from '../../theme/colors';

export function PrivacidadeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <EmptyState 
          icon="shield-half-outline" 
          title="Privacidade" 
          message="Controle seus dados e preferências (em breve)."
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundAlt },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
});
