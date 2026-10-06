import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { RoleSwitcher } from '../../components/RoleSwitcher';

const ARTISAN_ORDERS = [
  {
    id: 'AT-1049',
    item: 'Indigo Silk Scarf (Qty 2)',
    buyer: 'Maya Lin',
    destination: 'Portland, OR',
    due: 'Today, 3:30 PM',
    status: 'Crafting Complete',
    stage: 'Awaiting Courier Handover',
  },
  {
    id: 'AT-1048',
    item: 'Ceramic Matcha Bowl',
    buyer: 'Julian Moore',
    destination: 'Seattle, WA',
    due: 'Tomorrow',
    status: 'In Production',
    stage: 'Kiln Firing (Stage 2/3)',
  },
  {
    id: 'AT-1045',
    item: 'Sashiko Coaster Set',
    buyer: 'Sarah Jenkins',
    destination: 'San Francisco, CA',
    due: 'Sep 27',
    status: 'Dispatched',
    stage: 'Handed to Courier Marcus',
  },
];

export const ArtisanOrdersScreen = () => {
  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Fulfillment & Dispatch"
        subtitle="Manage custom crafting and courier handoffs"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <RoleSwitcher />

        <View style={styles.list}>
          {ARTISAN_ORDERS.map((ord) => (
            <Card key={ord.id} style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.orderId}>Order #{ord.id}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{ord.status}</Text>
                </View>
              </View>

              <Text style={styles.itemTitle}>{ord.item}</Text>
              <Text style={styles.client}>For {ord.buyer} • Ship to {ord.destination}</Text>

              <View style={styles.stepBox}>
                <Text style={styles.stepLabel}>CURRENT STAGE:</Text>
                <Text style={styles.stepVal}>{ord.stage}</Text>
              </View>

              {ord.status === 'Crafting Complete' && (
                <Button
                  title="Mark Ready for Courier Pickup"
                  variant="primary"
                  size="small"
                  style={styles.actionBtn}
                />
              )}
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
  list: {
    gap: 12,
    marginTop: 10,
  },
  card: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  statusBadge: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  client: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  stepBox: {
    backgroundColor: '#F4F7F6',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
  },
  stepVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  actionBtn: {
    marginTop: 10,
  },
});

export default ArtisanOrdersScreen;
