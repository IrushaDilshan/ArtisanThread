import React from 'react';
import { Text, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ROUTES } from './routes';

import { BuyerHomeScreen } from '../screens/buyer/BuyerHomeScreen';
import { BuyerOrdersScreen } from '../screens/buyer/BuyerOrdersScreen';
import { BuyerProfileScreen } from '../screens/buyer/BuyerProfileScreen';

import { CheckoutScreen } from '../screens/buyer/CheckoutScreen';
import { SecureEscrowPaymentScreen } from '../screens/buyer/SecureEscrowPaymentScreen';
import { PaymentHeldScreen } from '../screens/buyer/PaymentHeldScreen';
import { OrderStatusScreen } from '../screens/buyer/OrderStatusScreen';
import { TrackOrderScreen } from '../screens/buyer/TrackOrderScreen';
import { OrderCancelledScreen } from '../screens/buyer/OrderCancelledScreen';

import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const BuyerTabs = () => {
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
            <Text
              style={[
                styles.tabEmoji,
                focused && styles.tabEmojiFocused,
              ]}
            >
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
            <Text
              style={[
                styles.tabEmoji,
                focused && styles.tabEmojiFocused,
              ]}
            >
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
            <Text
              style={[
                styles.tabEmoji,
                focused && styles.tabEmojiFocused,
              ]}
            >
              👤
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const BuyerNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="BuyerTabs"
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Main Buyer Tabs */}
      <Stack.Screen
        name="BuyerTabs"
        component={BuyerTabs}
      />

      {/* Member 3 - Checkout */}
      <Stack.Screen
        name={ROUTES.BUYER.CHECKOUT}
        component={CheckoutScreen}
      />

      {/* Member 3 - Secure Escrow Payment */}
      <Stack.Screen
        name={ROUTES.BUYER.SECURE_ESCROW_PAYMENT}
        component={SecureEscrowPaymentScreen}
      />

      <Stack.Screen
        name={ROUTES.BUYER.PAYMENT_HELD}
        component={PaymentHeldScreen}
      />

      <Stack.Screen
        name={ROUTES.BUYER.ORDER_STATUS}
        component={OrderStatusScreen}
      />

      <Stack.Screen
        name={ROUTES.BUYER.TRACK_ORDER}
        component={TrackOrderScreen}
      />

      <Stack.Screen
        name={ROUTES.BUYER.ORDER_CANCELLED}
        component={OrderCancelledScreen}
      />
    </Stack.Navigator>
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