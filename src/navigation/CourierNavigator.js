import React from 'react';
import { Text, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ROUTES } from './routes';
import { CourierDeliveriesScreen } from '../screens/courier/CourierDeliveriesScreen';
import { CourierRoutesScreen } from '../screens/courier/CourierRoutesScreen';
import { CourierEarningsScreen } from '../screens/courier/CourierEarningsScreen';
import { CourierProfileScreen } from '../screens/courier/CourierProfileScreen';
import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();

export const CourierNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName={ROUTES.COURIER.DELIVERIES}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name={ROUTES.COURIER.DELIVERIES}
        component={CourierDeliveriesScreen}
        options={{
          tabBarLabel: 'Deliveries',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>
              📦
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.COURIER.ROUTES}
        component={CourierRoutesScreen}
        options={{
          tabBarLabel: 'Routes',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>
              🗺️
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.COURIER.EARNINGS}
        component={CourierEarningsScreen}
        options={{
          tabBarLabel: 'Earnings',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>
              💵
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.COURIER.PROFILE}
        component={CourierProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>
              🚚
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

export default CourierNavigator;
