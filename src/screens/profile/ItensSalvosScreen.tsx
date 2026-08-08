import { StyleSheet, View } from 'react-native';
import { EmptyState } from '../../components/common/EmptyState';
import { colors } from '../../theme/colors';

export function ItensSalvosScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <EmptyState 
          icon="bookmark-outline" 
          title="Nenhum item salvo" 
          message="As promoções que você salvar aparecerão aqui."
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundAlt },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
});
