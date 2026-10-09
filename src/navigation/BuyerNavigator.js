import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ROUTES } from './routes';

import { MarketplaceScreen } from '../screens/buyer/MarketplaceScreen';
import { CartScreen } from '../screens/buyer/CartScreen';
import { ProductDetailScreen } from '../screens/buyer/ProductDetailScreen';
import { WishlistScreen } from '../screens/buyer/WishlistScreen';
import { ChatScreen } from '../screens/buyer/ChatScreen';
import { OrdersScreen } from '../screens/buyer/OrdersScreen';
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
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom || 0;
  const tabBottomPad = Math.max(bottomInset, Platform.OS === 'ios' ? 24 : 10);
  const tabHeight = 54 + tabBottomPad;

  return (
    <Tab.Navigator
      initialRouteName={ROUTES.BUYER.HOME}
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.borderLight,
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: tabBottomPad,
          paddingTop: 6,
          elevation: 10,
          shadowColor: '#00251A',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name={ROUTES.BUYER.HOME}
        component={MarketplaceScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.BUYER.CART}
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'bag-handle' : 'bag-handle-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.BUYER.ORDERS}
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'cube' : 'cube-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.BUYER.PROFILE}
        component={BuyerProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} color={color} size={size} />
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
      {/* Main Buyer Tabs (Home, Cart, Orders, Profile) */}
      <Stack.Screen
        name="BuyerTabs"
        component={BuyerTabs}
      />

      {/* Cart & Orders directly registered in Stack to support direct navigation */}
      <Stack.Screen
        name={ROUTES.BUYER.CART}
        component={CartScreen}
      />
      <Stack.Screen
        name={ROUTES.BUYER.ORDERS}
        component={OrdersScreen}
      />

      {/* Product Detail, Wishlist, Chat */}
      <Stack.Screen
        name={ROUTES.BUYER.PRODUCT_DETAIL}
        component={ProductDetailScreen}
      />

      <Stack.Screen
        name={ROUTES.BUYER.WISHLIST}
        component={WishlistScreen}
      />

      <Stack.Screen
        name={ROUTES.BUYER.CHAT}
        component={ChatScreen}
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

export default BuyerNavigator;