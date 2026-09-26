import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { RoleSwitcher } from '../../components/RoleSwitcher';

export const CourierEarningsScreen = () => {
  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Courier Earnings"
        subtitle="Delivery payouts and artisan tips summary"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <RoleSwitcher />

        <Card style={styles.heroCard}>
          <Text style={styles.heroSub}>TODAY'S NET EARNINGS</Text>
          <Text style={styles.heroAmount}>$142.50</Text>
          <Text style={styles.heroTrips}>6 Deliveries Completed • 0 Delays</Text>
        </Card>

        <View style={styles.statsRow}>
          <Card style={styles.statBox}>
            <Text style={styles.statVal}>$840.00</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </Card>
          <Card style={styles.statBox}>
            <Text style={styles.statVal}>$45.00</Text>
            <Text style={styles.statLabel}>Buyer Tips</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>Recent Trip Payouts</Text>
        <Card style={styles.tripCard}>
          <View style={styles.tripRow}>
            <View>
              <Text style={styles.tripId}>Trip #8491 (Fragile Ceramic)</Text>
              <Text style={styles.tripTime}>Delivered 1:40 PM • 4.2 miles</Text>
            </View>
            <Text style={styles.tripPay}>+$28.00</Text>
          </View>
        </Card>
        <Card style={styles.tripCard}>
          <View style={styles.tripRow}>
            <View>
              <Text style={styles.tripId}>Trip #8487 (Textiles Pickup)</Text>
              <Text style={styles.tripTime}>Delivered 11:20 AM • 8.1 miles</Text>
            </View>
            <Text style={styles.tripPay}>+$34.50</Text>
          </View>
        </Card>
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
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginVertical: 10,
    alignItems: 'center',
  },
  heroSub: {
    fontSize: 11,
    color: '#80CBC4',
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFF',
    marginVertical: 4,
  },
  heroTrips: {
    fontSize: 13,
    color: '#E0F2F1',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  tripCard: {
    padding: SPACING.md,
    marginBottom: 8,
  },
  tripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripId: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  tripTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tripPay: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
});

export default CourierEarningsScreen;
