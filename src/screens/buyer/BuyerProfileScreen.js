import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { RoleSwitcher } from '../../components/RoleSwitcher';
import { useAuth } from '../../context/AuthContext';

export const BuyerProfileScreen = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Buyer Profile"
        subtitle="Manage shipping addresses and preferences"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <RoleSwitcher />

        <Card style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.avatar || 'BP'}</Text>
            </View>
            <View>
              <Text style={styles.name}>{user?.name || 'Artisan Collector'}</Text>
              <Text style={styles.email}>{user?.email || 'buyer@artisanthread.com'}</Text>
              <Text style={styles.location}>📍 {user?.location || 'Portland, OR'}</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.menuCard}>
          <Text style={styles.menuHeading}>SAVED ADDRESSES & PREFERENCES</Text>
          <View style={styles.menuItem}>
            <Text style={styles.menuTitle}>Shipping Destination</Text>
            <Text style={styles.menuSubtitle}>742 Evergreen Terrace, Portland, OR</Text>
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuTitle}>Payment Methods</Text>
            <Text style={styles.menuSubtitle}>Mastercard ending in •••• 4912</Text>
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuTitle}>Eco-Packaging Preference</Text>
            <Text style={styles.menuSubtitle}>Enabled (Plastic-free artisan wraps)</Text>
          </View>
        </Card>

        <Button
          title="Sign Out"
          variant="outline"
          onPress={logout}
          style={styles.logoutBtn}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  profileCard: {
    marginVertical: 10,
    padding: SPACING.md,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  email: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  location: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  menuCard: {
    marginVertical: 10,
    padding: SPACING.md,
  },
  menuHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  menuItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  menuSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    marginTop: SPACING.md,
  },
});

export default BuyerProfileScreen;
