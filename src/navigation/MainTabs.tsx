import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FeedScreen } from '../screens/feed/FeedScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { CreatePromotionScreen } from '../screens/promotion/CreatePromotionScreen';
import { RankingScreen } from '../screens/ranking/RankingScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { colors } from '../theme/colors';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: colors.primary }}>
      <Tab.Screen name="Feed" component={FeedScreen} options={{ title: 'Ofertas' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Buscar' }} />
      <Tab.Screen
        name="CreatePromotion"
        component={CreatePromotionScreen}
        options={{ title: 'Publicar' }}
      />
      <Tab.Screen name="Ranking" component={RankingScreen} options={{ title: 'Ranking' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}
