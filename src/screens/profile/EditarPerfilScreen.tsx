import { StyleSheet, View } from 'react-native';
import { EmptyState } from '../../components/common/EmptyState';
import { colors } from '../../theme/colors';

export function EditarPerfilScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <EmptyState 
          icon="person-outline" 
          title="Em breve" 
          message="A edição de perfil estará disponível em breve."
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundAlt },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
});
