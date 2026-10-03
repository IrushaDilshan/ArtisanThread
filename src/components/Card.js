import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { SPACING, RADIUS, SHADOWS } from '../constants/theme';

export const Card = ({
  children,
  onPress,
  style,
  elevation = 'subtle', // 'none' | 'subtle' | 'medium'
  bordered = true,
}) => {
  const getShadowStyle = () => {
    if (elevation === 'medium') return SHADOWS.medium;
    if (elevation === 'subtle') return SHADOWS.subtle;
    return {};
  };

  const containerStyle = [
    styles.card,
    getShadowStyle(),
    bordered && styles.bordered,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        style={containerStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  bordered: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
});

export default Card;
