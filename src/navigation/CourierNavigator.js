import React from 'react';
import { Text, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ROUTES } from './routes';
import { CourierHomeScreen } from '../screens/courier/CourierHomeScreen';
import { PickupRequestScreen } from '../screens/courier/PickupRequestScreen';
import { FixAddressScreen } from '../screens/courier/FixAddressScreen';
import { ScanParcelScreen } from '../screens/courier/ScanParcelScreen';
import { DeliveryTransitScreen } from '../screens/courier/DeliveryTransitScreen';
import { ConfirmDeliveryScreen } from '../screens/courier/ConfirmDeliveryScreen';
import { DeliveryUnsuccessfulScreen } from '../screens/courier/DeliveryUnsuccessfulScreen';
import { CourierRatingScreen } from '../screens/courier/CourierRatingScreen';
import { CourierDeliveriesScreen } from '../screens/courier/CourierDeliveriesScreen';
import { CourierRoutesScreen } from '../screens/courier/CourierRoutesScreen';
import { CourierEarningsScreen } from '../screens/courier/CourierEarningsScreen';
import { CourierProfileScreen } from '../screens/courier/CourierProfileScreen';
import { CourierNotificationsScreen } from '../screens/courier/CourierNotificationsScreen';
import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();

export const CourierNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName={ROUTES.COURIER.HOME}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: { display: 'none' }, // Courier screens provide pixel-perfect bottom bar
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name={ROUTES.COURIER.HOME}
        component={CourierHomeScreen}
      />
      <Tab.Screen
        name={ROUTES.COURIER.PICKUP_REQUEST}
        component={PickupRequestScreen}
      />
      <Tab.Screen
        name={ROUTES.COURIER.FIX_ADDRESS}
        component={FixAddressScreen}
      />
      <Tab.Screen
        name={ROUTES.COURIER.SCAN_PARCEL}
        component={ScanParcelScreen}
      />
      <Tab.Screen
        name={ROUTES.COURIER.DELIVERY_TRANSIT}
        component={DeliveryTransitScreen}
      />
      <Tab.Screen
        name={ROUTES.COURIER.CONFIRM_DELIVERY}
        component={ConfirmDeliveryScreen}
      />
      <Tab.Screen
        name={ROUTES.COURIER.DELIVERY_FAILED}
        component={DeliveryUnsuccessfulScreen}
      />
      <Tab.Screen
        name={ROUTES.COURIER.RATINGS}
        component={CourierRatingScreen}
      />
      <Tab.Screen
        name={ROUTES.COURIER.NOTIFICATIONS}
        component={CourierNotificationsScreen}
      />
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
