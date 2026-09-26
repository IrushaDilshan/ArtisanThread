import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { RoleSwitcher } from '../../components/RoleSwitcher';
import { useAuth } from '../../context/AuthContext';

export const ArtisanDashboardScreen = () => {
  const { user } = useAuth();

  const metrics = [
    { label: 'Active Crafts', val: '24', icon: '🏺' },
    { label: 'Orders Pending', val: '7', icon: '⏳' },
    { label: 'Monthly Sales', val: '$3,840', icon: '📈' },
    { label: 'Atelier Rating', val: '4.9★', icon: '✨' },
  ];

  const recentOrders = [
    { id: '#AT-1049', item: 'Indigo Silk Scarf (Qty 2)', buyer: 'Maya Lin', status: 'Needs Packaging' },
    { id: '#AT-1048', item: 'Ceramic Matcha Bowl', buyer: 'Julian Moore', status: 'Ready for Courier' },
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={user?.atelierName || 'Atelier Dashboard'}
        subtitle="Craftsmanship overview & workshop activity"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <RoleSwitcher />

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          {metrics.map((m, idx) => (
            <Card key={idx} style={styles.metricCard}>
              <Text style={styles.metricIcon}>{m.icon}</Text>
              <Text style={styles.metricVal}>{m.val}</Text>
              <Text style={styles.metricLabel}>{m.label}</Text>
            </Card>
          ))}
        </View>

        {/* Atelier Craftsmanship Status */}
        <Card style={styles.noticeCard}>
          <Text style={styles.noticeTag}>COURIER PICKUP WINDOW</Text>
          <Text style={styles.noticeTitle}>Courier Scheduled Today at 4:00 PM</Text>
          <Text style={styles.noticeDesc}>
            Driver Marcus Vance will arrive to collect 3 packaged parcel orders.
          </Text>
        </Card>

        {/* Recent Inquiries & Orders */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Atelier Orders To Fulfill</Text>
        </View>

        <View style={styles.ordersList}>
          {recentOrders.map((ord) => (
            <Card key={ord.id} style={styles.orderRow}>
              <View>
                <Text style={styles.ordId}>{ord.id}</Text>
                <Text style={styles.ordItem}>{ord.item}</Text>
                <Text style={styles.ordBuyer}>Client: {ord.buyer}</Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{ord.status}</Text>
              </View>
            </Card>
          ))}
        </View>
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  metricCard: {
    width: '48%',
    padding: SPACING.md,
  },
  metricIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  noticeCard: {
    backgroundColor: '#FAF5EE',
    borderColor: '#E8D8C3',
    marginVertical: 14,
    padding: SPACING.md,
  },
  noticeTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8D5B28',
    letterSpacing: 0.8,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4A341D',
    marginTop: 4,
  },
  noticeDesc: {
    fontSize: 12,
    color: '#6E553D',
    marginTop: 2,
  },
  sectionHeader: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  ordersList: {
    gap: 8,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  ordId: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  ordItem: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  ordBuyer: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statusPill: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default ArtisanDashboardScreen;
