import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ROUTES } from './routes';
import { MarketplaceScreen } from '../screens/buyer/MarketplaceScreen';
import { CartScreen } from '../screens/buyer/CartScreen';
import { ProductDetailScreen } from '../screens/buyer/ProductDetailScreen';
import { WishlistScreen } from '../screens/buyer/WishlistScreen';
import { ChatScreen } from '../screens/buyer/ChatScreen';
import { OrdersScreen } from '../screens/buyer/OrdersScreen';
import { BuyerProfileScreen } from '../screens/buyer/BuyerProfileScreen';
import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();

export const BuyerNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName={ROUTES.BUYER.HOME}
      backBehavior="history"
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
        component={MarketplaceScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name={ROUTES.BUYER.CART}
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, size }) => <Ionicons name="cart-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name={ROUTES.BUYER.PRODUCT_DETAIL}
        component={ProductDetailScreen}
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name={ROUTES.BUYER.WISHLIST}
        component={WishlistScreen}
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name={ROUTES.BUYER.CHAT}
        component={ChatScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name={ROUTES.BUYER.ORDERS}
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, size }) => <Ionicons name="cube-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name={ROUTES.BUYER.PROFILE}
        component={BuyerProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
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
  tabLabel: { fontSize: 10, fontWeight: '600' },
});

export default BuyerNavigator;
