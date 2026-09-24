import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { RoleSwitcher } from '../../components/RoleSwitcher';

const ORDERS = [
  {
    id: 'ORD-9821',
    item: 'Indigo Dyed Handloom Scarf',
    artisan: 'Kenji Takahashi',
    courier: 'Courier Marcus Vance (In Transit)',
    status: 'In Transit',
    eta: 'Tomorrow, 2:30 PM',
    price: '$84.00',
    progress: 75,
  },
  {
    id: 'ORD-8942',
    item: 'Wabi-Sabi Ceramic Teapot',
    artisan: 'Elena Rostova',
    courier: 'Awaiting Courier Pickup',
    status: 'Crafting Complete',
    eta: 'Sep 28',
    price: '$120.00',
    progress: 40,
  },
];

export const BuyerOrdersScreen = () => {
  return (
    <View style={styles.container}>
      <ScreenHeader
        title="My Orders & Shipments"
        subtitle="Track handmade crafts on their way to you"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <RoleSwitcher />

        <View style={styles.listSection}>
          {ORDERS.map((order) => (
            <Card key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <Text style={styles.itemName}>{order.item}</Text>
                </View>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Artisan Studio:</Text>
                <Text style={styles.val}>{order.artisan}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Courier Partner:</Text>
                <Text style={styles.val}>{order.courier}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Estimated Arrival:</Text>
                <Text style={styles.valHighlight}>{order.eta}</Text>
              </View>

              {/* Progress bar */}
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${order.progress}%` }]} />
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.price}>{order.price}</Text>
                <Text style={styles.trackLink}>Live Map View →</Text>
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
  listSection: {
    gap: 12,
    marginTop: 8,
  },
  orderCard: {
    padding: SPACING.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  val: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  valHighlight: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#E0E6E4',
    borderRadius: 3,
    marginTop: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  trackLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default BuyerOrdersScreen;
