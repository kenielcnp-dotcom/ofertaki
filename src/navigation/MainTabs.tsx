import { Pressable, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator, type BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { FeedScreen } from '../screens/feed/FeedScreen';
import { ListaScreen } from '../screens/lista/ListaScreen';
import { CreatePromotionScreen } from '../screens/promotion/CreatePromotionScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { colors } from '../theme/colors';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={[styles.label, focused && styles.labelFocused]} numberOfLines={1}>
      {label}
    </Text>
  );
}

// Botão central em destaque, aguardando o redesenho visual do time de design.
function PublishTabButton({ children, onPress, accessibilityState, accessibilityLabel }: BottomTabBarButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      onPress={onPress}
      style={styles.publishButtonWrapper}
    >
      {children}
    </Pressable>
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: colors.primary, headerShown: false }}>
      <Tab.Screen
        name="Home"
        component={FeedScreen}
        options={{
          headerShown: true,
          title: 'Ofertaki',
          tabBarLabel: ({ focused }) => <TabLabel label="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Lista"
        component={ListaScreen}
        options={{
          headerShown: true,
          title: 'Lista de compras',
          tabBarLabel: ({ focused }) => <TabLabel label="Lista" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Publicar"
        component={CreatePromotionScreen}
        options={{
          headerShown: true,
          title: 'Publicar promoção',
          tabBarLabel: ({ focused }) => <TabLabel label="Publicar" focused={focused} />,
          tabBarIcon: () => <View style={styles.publishIcon} />,
          tabBarButton: (props) => <PublishTabButton {...props} />,
        }}
      />
      <Tab.Screen
        name="Notificacoes"
        component={NotificationsScreen}
        options={{
          headerShown: true,
          title: 'Notificações',
          tabBarLabel: ({ focused }) => <TabLabel label="Notificações" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          headerShown: true,
          title: 'Perfil',
          tabBarLabel: ({ focused }) => <TabLabel label="Perfil" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11, color: colors.textMuted },
  labelFocused: { color: colors.primary, fontWeight: '600' },
  publishButtonWrapper: {
    top: -12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
  },
});
