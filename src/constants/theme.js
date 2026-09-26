import { COLORS } from './colors';

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    color: COLORS.textPrimary,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    color: COLORS.textPrimary,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    color: COLORS.textPrimary,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: COLORS.textMuted,
  },
  button: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 9999,
};

export const SHADOWS = {
  subtle: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  strong: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 8,
  },
};

export const THEME = {
  colors: COLORS,
  spacing: SPACING,
  typography: TYPOGRAPHY,
  radius: RADIUS,
  shadows: SHADOWS,
};

export default THEME;
