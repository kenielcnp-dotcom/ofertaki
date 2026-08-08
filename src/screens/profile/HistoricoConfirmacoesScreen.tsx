import { StyleSheet, View } from 'react-native';
import { EmptyState } from '../../components/common/EmptyState';
import { colors } from '../../theme/colors';

export function HistoricoConfirmacoesScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <EmptyState 
          icon="checkmark-done-circle-outline" 
          title="Nenhuma confirmação" 
          message="Você ainda não confirmou nenhum preço."
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundAlt },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
});
