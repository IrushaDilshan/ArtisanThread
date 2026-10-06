import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/theme';
import RoleBadge from './RoleBadge';
import { useAuth } from '../context/AuthContext';

export const ScreenHeader = ({
  title,
  subtitle,
  showRoleBadge = true,
  showRoleSwitcher = false,
  onBack,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  const { role, user, logout } = useAuth();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.brandTitle}>ArtisanThread</Text>
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>

        <View style={styles.rightActions}>
          {showRoleBadge && role && <RoleBadge role={role} size="small" />}
          {rightAction}
        </View>
      </View>

      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {user && (
        <View style={styles.metaRow}>
          <Text style={styles.userGreeting}>
            Logged in as <Text style={styles.userName}>{user.name}</Text>
          </Text>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  backArrow: {
    color: COLORS.textInverse,
    fontSize: 18,
    fontWeight: '700',
  },
  brandTitle: {
    fontSize: 11,
    color: '#80CBC4',
    letterSpacing: 1.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textInverse,
    letterSpacing: -0.3,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#B2DFDB',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  userGreeting: {
    fontSize: 12,
    color: '#E0F2F1',
  },
  userName: {
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  logoutBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  logoutText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ScreenHeader;
