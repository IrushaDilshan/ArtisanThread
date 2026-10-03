import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/colors';
import { SPACING, RADIUS } from '../constants/theme';

export const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'medium',    // 'small' | 'medium' | 'large'
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
        };
      case 'outline':
        return {
          container: styles.outlineContainer,
          text: styles.outlineText,
        };
      case 'ghost':
        return {
          container: styles.ghostContainer,
          text: styles.ghostText,
        };
      case 'danger':
        return {
          container: styles.dangerContainer,
          text: styles.dangerText,
        };
      case 'primary':
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.baseButton,
        variantStyles.container,
        size === 'small' && styles.sizeSmall,
        size === 'large' && styles.sizeLarge,
        disabled && styles.disabledContainer,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.textInverse}
        />
      ) : (
        <>
          {icon ? icon : null}
          <Text
            style={[
              styles.baseText,
              variantStyles.text,
              size === 'small' && styles.textSmall,
              size === 'large' && styles.textLarge,
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    gap: 8,
  },
  baseText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  sizeSmall: {
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  sizeLarge: {
    paddingVertical: 16,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
  },
  textSmall: {
    fontSize: 13,
  },
  textLarge: {
    fontSize: 17,
  },

  // Variants
  primaryContainer: {
    backgroundColor: COLORS.primary,
  },
  primaryText: {
    color: COLORS.textInverse,
  },
  secondaryContainer: {
    backgroundColor: COLORS.primaryMuted,
  },
  secondaryText: {
    color: COLORS.primary,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  outlineText: {
    color: COLORS.primary,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: COLORS.primary,
  },
  dangerContainer: {
    backgroundColor: COLORS.errorLight,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  dangerText: {
    color: COLORS.error,
  },
  disabledContainer: {
    backgroundColor: '#E0E6E4',
    borderColor: '#E0E6E4',
  },
  disabledText: {
    color: '#9EAEA9',
  },
});

export default Button;
