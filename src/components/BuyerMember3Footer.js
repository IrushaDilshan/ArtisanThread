import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../constants/colors';
import { ROUTES } from '../navigation/routes';

const DESTINATIONS = [
  { route: ROUTES.BUYER.HOME, label: 'Marketplace', icon: '🛍️' },
  { route: ROUTES.BUYER.ORDERS, label: 'Shipments', icon: '📦' },
  { route: ROUTES.BUYER.PROFILE, label: 'Profile', icon: '👤' },
];

export const BuyerMember3Footer = ({
  navigation,
  activeRoute,
  confirmBeforeLeave = false,
  paymentInProgress = false,
}) => {
  const insets = useSafeAreaInsets();

  const navigateTo = (destination) => {
    if (paymentInProgress) {
      Alert.alert(
        'Payment in progress',
        'Please wait for the payment simulation to finish before leaving.'
      );
      return;
    }

    const leave = () =>
      navigation.navigate('BuyerTabs', { screen: destination });

    if (confirmBeforeLeave) {
      Alert.alert(
        'Leave payment?',
        'Your payment has not been completed yet.',
        [
          { text: 'Continue Payment', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: leave },
        ]
      );
      return;
    }

    leave();
  };

  return (
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {DESTINATIONS.map((destination) => {
        const active = activeRoute === destination.route;
        return (
          <TouchableOpacity
            key={destination.route}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => navigateTo(destination.route)}
            style={styles.destination}
          >
            <Text style={[styles.icon, active && styles.activeText]}>
              {destination.icon}
            </Text>
            <Text
              style={[
                styles.label,
                active ? styles.activeText : styles.inactiveText,
              ]}
            >
              {destination.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  destination: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  icon: {
    fontSize: 19,
    lineHeight: 24,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  activeText: {
    color: COLORS.primary,
  },
  inactiveText: {
    color: COLORS.textMuted,
  },
});
