import React from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../constants/colors';
import { ROUTES } from '../navigation/routes';

const DESTINATIONS = [
  { route: ROUTES.BUYER.HOME, label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { route: ROUTES.BUYER.CART, label: 'Cart', icon: 'bag-handle-outline', activeIcon: 'bag-handle' },
  { route: ROUTES.BUYER.ORDERS, label: 'Orders', icon: 'cube-outline', activeIcon: 'cube' },
  { route: ROUTES.BUYER.PROFILE, label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];

export const BuyerMember3Footer = ({
  navigation,
  activeRoute,
  confirmBeforeLeave = false,
  paymentInProgress = false,
}) => {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom || 0;
  const tabBottomPad = Math.max(bottomInset, Platform.OS === 'ios' ? 24 : 10);

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
        'Leave checkout?',
        'Your order has not been completed yet.',
        [
          { text: 'Continue Checkout', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: leave },
        ]
      );
      return;
    }

    leave();
  };

  return (
    <View style={[styles.footer, { paddingBottom: tabBottomPad }]}>
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
            <Ionicons
              name={active ? destination.activeIcon : destination.icon}
              size={22}
              color={active ? COLORS.primary : COLORS.textMuted}
            />
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
    paddingTop: 6,
    elevation: 10,
    shadowColor: '#00251A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  destination: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
    paddingVertical: 2,
  },
  label: {
    fontSize: 11,
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

export default BuyerMember3Footer;
