import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { ROLES } from '../navigation/routes';

const ROLE_CONFIGS = {
  [ROLES.BUYER]: {
    label: 'Buyer',
    icon: '🛍️',
    bg: COLORS.primaryMuted,
    text: COLORS.primary,
  },
  [ROLES.ARTISAN]: {
    label: 'Artisan',
    icon: '🎨',
    bg: COLORS.roles.artisan.light,
    text: COLORS.roles.artisan.primary,
  },
  [ROLES.COURIER]: {
    label: 'Courier',
    icon: '📦',
    bg: COLORS.roles.courier.light,
    text: COLORS.roles.courier.primary,
  },
};

export const RoleBadge = ({ role = ROLES.BUYER, size = 'medium', style }) => {
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS[ROLES.BUYER];
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        isSmall && styles.badgeSmall,
        style,
      ]}
    >
      <Text style={[styles.icon, isSmall && styles.iconSmall]}>{config.icon}</Text>
      <Text
        style={[
          styles.label,
          { color: config.text },
          isSmall && styles.labelSmall,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  icon: {
    fontSize: 13,
  },
  iconSmall: {
    fontSize: 11,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  labelSmall: {
    fontSize: 10,
  },
});

export default RoleBadge;
