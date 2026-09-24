import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { RoleSwitcher } from '../../components/RoleSwitcher';
import { useAuth } from '../../context/AuthContext';

export const CourierProfileScreen = () => {
  const { user, logout } = useAuth();
  const [isOnline, setIsOnline] = useState(true);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Courier Profile"
        subtitle="Manage logistics status and vehicle specs"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <RoleSwitcher />

        <Card style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.avatar || 'MV'}</Text>
            </View>
            <View>
              <Text style={styles.name}>{user?.name || 'Courier Partner'}</Text>
              <Text style={styles.badge}>⚡ {user?.badge || 'Artisan Express Dispatcher'}</Text>
              <Text style={styles.rating}>Customer Rating: {user?.rating || '4.98 ★'}</Text>
            </View>
          </View>
        </Card>

        {/* Dispatch Duty Status */}
        <Card style={styles.card}>
          <View style={styles.dutyRow}>
            <View>
              <Text style={styles.dutyTitle}>Dispatch Availability</Text>
              <Text style={styles.dutySubtitle}>
                {isOnline ? 'Active — Available for pickups' : 'Offline — Not receiving orders'}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: '#767577', true: COLORS.primaryLight }}
              thumbColor={isOnline ? COLORS.primary : '#f4f3f4'}
            />
          </View>
        </Card>

        {/* Vehicle & Equipment */}
        <Card style={styles.card}>
          <Text style={styles.sectionHeader}>VEHICLE & FLEET INFORMATION</Text>
          <View style={styles.itemRow}>
            <Text style={styles.label}>Designated Vehicle:</Text>
            <Text style={styles.val}>{user?.vehicle || 'Electric Cargo Van #402'}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.label}>Fragile Goods Certified:</Text>
            <Text style={styles.val}>Yes (Ceramics & Fine Weaving Level 2)</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.label}>Assigned Depot:</Text>
            <Text style={styles.val}>Metro Artisan Logistics Hub #3</Text>
          </View>
        </Card>

        <Button
          title="Sign Out of Courier Dispatch"
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
    backgroundColor: COLORS.roles.courier.primary,
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
  badge: {
    fontSize: 12,
    color: COLORS.roles.courier.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  rating: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  card: {
    marginVertical: 8,
    padding: SPACING.md,
  },
  dutyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dutyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  dutySubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  itemRow: {
    paddingVertical: 6,
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

export default CourierProfileScreen;
