import React from 'react';
import { Text, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ROUTES } from './routes';
import { ArtisanDashboardScreen } from '../screens/artisan/ArtisanDashboardScreen';
import { ArtisanProductsScreen } from '../screens/artisan/ArtisanProductsScreen';
import { ArtisanOrdersScreen } from '../screens/artisan/ArtisanOrdersScreen';
import { ArtisanProfileScreen } from '../screens/artisan/ArtisanProfileScreen';
import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();

export const ArtisanNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName={ROUTES.ARTISAN.DASHBOARD}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name={ROUTES.ARTISAN.DASHBOARD}
        component={ArtisanDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>
              📊
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.ARTISAN.PRODUCTS}
        component={ArtisanProductsScreen}
        options={{
          tabBarLabel: 'My Crafts',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>
              🏺
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.ARTISAN.ORDERS}
        component={ArtisanOrdersScreen}
        options={{
          tabBarLabel: 'Fulfill',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>
              ✂️
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.ARTISAN.PROFILE}
        component={ArtisanProfileScreen}
        options={{
          tabBarLabel: 'Atelier',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>
              🏛️
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.borderLight,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  tabEmoji: {
    fontSize: 20,
    opacity: 0.6,
  },
  tabEmojiFocused: {
    opacity: 1,
    transform: [{ scale: 1.15 }],
  },
});

export default ArtisanNavigator;
