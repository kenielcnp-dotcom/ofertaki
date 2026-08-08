import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import { PromotionDetailScreen } from '../screens/promotion/PromotionDetailScreen';
import { RankingScreen } from '../screens/ranking/RankingScreen';
import { HistoricoConfirmacoesScreen } from '../screens/profile/HistoricoConfirmacoesScreen';
import { ItensSalvosScreen } from '../screens/profile/ItensSalvosScreen';
import { MinhasPromocoesScreen } from '../screens/profile/MinhasPromocoesScreen';
import { EditarPerfilScreen } from '../screens/profile/EditarPerfilScreen';
import { PrivacidadeScreen } from '../screens/profile/PrivacidadeScreen';
import { SegurancaScreen } from '../screens/profile/SegurancaScreen';
import { ComoFuncionaScreen } from '../screens/profile/ComoFuncionaScreen';
import { RegrasComunidadeScreen } from '../screens/profile/RegrasComunidadeScreen';
import { AjudaSuporteScreen } from '../screens/profile/AjudaSuporteScreen';
import { TermosUsoScreen } from '../screens/profile/TermosUsoScreen';
import { PoliticaPrivacidadeScreen } from '../screens/profile/PoliticaPrivacidadeScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="PromotionDetail"
        component={PromotionDetailScreen}
        options={{ title: 'Promoção' }}
      />
      <Stack.Screen name="Ranking" component={RankingScreen} options={{ title: 'Ranking' }} />
      
      {/* Profile Screens */}
      <Stack.Screen name="HistoricoConfirmacoes" component={HistoricoConfirmacoesScreen} options={{ title: 'Histórico' }} />
      <Stack.Screen name="ItensSalvos" component={ItensSalvosScreen} options={{ title: 'Itens Salvos' }} />
      <Stack.Screen name="MinhasPromocoes" component={MinhasPromocoesScreen} options={{ title: 'Minhas Promoções' }} />
      <Stack.Screen name="EditarPerfil" component={EditarPerfilScreen} options={{ title: 'Editar Perfil' }} />
      <Stack.Screen name="Privacidade" component={PrivacidadeScreen} options={{ title: 'Privacidade' }} />
      <Stack.Screen name="Seguranca" component={SegurancaScreen} options={{ title: 'Segurança' }} />
      <Stack.Screen name="ComoFunciona" component={ComoFuncionaScreen} options={{ title: 'Como Funciona' }} />
      <Stack.Screen name="RegrasComunidade" component={RegrasComunidadeScreen} options={{ title: 'Regras' }} />
      <Stack.Screen name="AjudaSuporte" component={AjudaSuporteScreen} options={{ title: 'Ajuda e Suporte' }} />
      <Stack.Screen name="TermosUso" component={TermosUsoScreen} options={{ title: 'Termos de Uso' }} />
      <Stack.Screen name="PoliticaPrivacidade" component={PoliticaPrivacidadeScreen} options={{ title: 'Política de Privacidade' }} />
    </Stack.Navigator>
  );
}
