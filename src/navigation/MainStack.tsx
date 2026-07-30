import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import { PromotionDetailScreen } from '../screens/promotion/PromotionDetailScreen';
import { RankingScreen } from '../screens/ranking/RankingScreen';
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
    </Stack.Navigator>
  );
}
