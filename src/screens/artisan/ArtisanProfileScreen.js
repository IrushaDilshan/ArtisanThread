import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { RoleSwitcher } from '../../components/RoleSwitcher';
import { useAuth } from '../../context/AuthContext';

export const ArtisanProfileScreen = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Atelier Profile"
        subtitle="Manage master craft verification & payout accounts"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <RoleSwitcher />

        <Card style={styles.card}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.avatar || 'KT'}</Text>
            </View>
            <View>
              <Text style={styles.name}>{user?.name || 'Master Artisan'}</Text>
              <Text style={styles.atelier}>{user?.atelierName || 'Heritage Atelier'}</Text>
              <Text style={styles.badge}>🌿 Certified Traditional Craftsman</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.heading}>STUDIO DETAILS</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Craft Heritage:</Text>
            <Text style={styles.val}>Botanical Indigo & Handloom Weaving</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Workshop Studio:</Text>
            <Text style={styles.val}>Kyoto, Japan / SF Annex</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Direct Courier Hub:</Text>
            <Text style={styles.val}>West Coast Eco-Logistics Depot</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payout Schedule:</Text>
            <Text style={styles.val}>Bi-weekly direct deposit</Text>
          </View>
        </Card>

        <Button
          title="Sign Out of Atelier"
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
  card: {
    marginVertical: 8,
    padding: SPACING.md,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.roles.artisan.primary,
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
  atelier: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badge: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 4,
  },
  heading: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  row: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  label: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  val: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  logoutBtn: {
    marginTop: 16,
  },
});

export default ArtisanProfileScreen;
