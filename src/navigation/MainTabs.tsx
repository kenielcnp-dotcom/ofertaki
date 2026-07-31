import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator, type BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { FeedScreen } from '../screens/feed/FeedScreen';
import { ListaScreen } from '../screens/lista/ListaScreen';
import { CreatePromotionScreen } from '../screens/promotion/CreatePromotionScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts, shadows } from '../theme/typography';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={[styles.label, focused && styles.labelFocused]} numberOfLines={1}>
      {label}
    </Text>
  );
}

function tabIcon(
  name: keyof typeof Ionicons.glyphMap,
  activeName: keyof typeof Ionicons.glyphMap,
) {
  return function TabIcon({ focused, color }: { focused: boolean; color: string }) {
    return <Ionicons name={focused ? activeName : name} size={23} color={color} />;
  };
}

// Botão central elevado: ação principal do app (publicar oferta).
function PublishTabButton({ onPress, accessibilityState, accessibilityLabel }: BottomTabBarButtonProps) {
  const focused = accessibilityState?.selected;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? 'Publicar promoção'}
      accessibilityState={accessibilityState}
      onPress={onPress}
      style={styles.publishWrapper}
    >
      <View style={[styles.publishButton, shadows.floating, focused && styles.publishButtonActive]}>
        <Ionicons name="add" size={30} color={colors.textInverse} />
      </View>
      <Text style={styles.publishLabel}>Publicar</Text>
    </Pressable>
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tab.Screen
        name="Home"
        component={FeedScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Home" focused={focused} />,
          tabBarIcon: tabIcon('home-outline', 'home'),
        }}
      />
      <Tab.Screen
        name="Lista"
        component={ListaScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Lista" focused={focused} />,
          tabBarIcon: tabIcon('list-outline', 'list'),
        }}
      />
      <Tab.Screen
        name="Publicar"
        component={CreatePromotionScreen}
        options={{
          tabBarLabel: () => null,
          tabBarButton: (props) => <PublishTabButton {...props} />,
        }}
      />
      <Tab.Screen
        name="Notificacoes"
        component={NotificationsScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Alertas" focused={focused} />,
          tabBarIcon: tabIcon('notifications-outline', 'notifications'),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Perfil" focused={focused} />,
          tabBarIcon: tabIcon('person-outline', 'person'),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 86 : 68,
    paddingTop: spacing.xs + 2,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 0,
  },
  tabItem: { paddingTop: 2 },
  label: { fontFamily: fonts.bodyRegular, fontSize: 11, color: colors.textSubtle },
  labelFocused: { fontFamily: fonts.bodyBold, color: colors.primary },
  publishWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-start' },
  publishButton: {
    top: -20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.background,
  },
  publishButtonActive: { backgroundColor: colors.secondaryDark },
  publishLabel: {
    top: -16,
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.secondary,
  },
});
