import React from 'react';
import { Text, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ROUTES } from './routes';
import { BuyerHomeScreen } from '../screens/buyer/BuyerHomeScreen';
import { BuyerOrdersScreen } from '../screens/buyer/BuyerOrdersScreen';
import { BuyerProfileScreen } from '../screens/buyer/BuyerProfileScreen';
import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();

export const BuyerNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName={ROUTES.BUYER.HOME}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name={ROUTES.BUYER.HOME}
        component={BuyerHomeScreen}
        options={{
          tabBarLabel: 'Marketplace',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>
              🛍️
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.BUYER.ORDERS}
        component={BuyerOrdersScreen}
        options={{
          tabBarLabel: 'Shipments',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>
              📦
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.BUYER.PROFILE}
        component={BuyerProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>
              👤
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

export default BuyerNavigator;
