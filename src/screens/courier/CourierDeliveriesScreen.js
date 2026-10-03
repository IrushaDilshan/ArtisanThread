import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { RoleSwitcher } from '../../components/RoleSwitcher';

const COURIER_JOBS = [
  {
    id: 'PKP-401',
    type: 'PICKUP',
    location: 'Takahashi Handloom & Indigo (Studio #4)',
    address: '450 Craft District Way, Kyoto Annex',
    parcels: '2 fragile parcels (Indigo Scarves)',
    contact: 'Kenji Takahashi',
    urgency: 'Pickup before 4:30 PM',
  },
  {
    id: 'DEL-882',
    type: 'DROP-OFF',
    location: 'Buyer: Maya Lin',
    address: '742 Evergreen Terrace, Portland, OR',
    parcels: '1 custom ceramic bowl',
    contact: 'Recipient: Maya L.',
    urgency: 'Deliver by 6:00 PM',
  },
];

export const CourierDeliveriesScreen = () => {
  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Delivery Dispatch"
        subtitle="Artisan pickups & buyer door-to-door deliveries"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <RoleSwitcher />

        <View style={styles.statusBanner}>
          <View style={styles.indicator} />
          <Text style={styles.statusLabel}>YOU ARE ONLINE • READY FOR DISPATCH</Text>
        </View>

        <View style={styles.list}>
          {COURIER_JOBS.map((job) => {
            const isPickup = job.type === 'PICKUP';
            return (
              <Card key={job.id} style={styles.card}>
                <View style={styles.header}>
                  <View
                    style={[
                      styles.typeBadge,
                      isPickup ? styles.pickupBadge : styles.dropBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        isPickup ? styles.pickupText : styles.dropText,
                      ]}
                    >
                      {job.type}
                    </Text>
                  </View>
                  <Text style={styles.urgency}>{job.urgency}</Text>
                </View>

                <Text style={styles.locName}>{job.location}</Text>
                <Text style={styles.address}>📍 {job.address}</Text>
                <Text style={styles.parcels}>📦 {job.parcels}</Text>
                <Text style={styles.contact}>👤 {job.contact}</Text>

                <View style={styles.actionRow}>
                  <Button
                    title="Open GPS Route"
                    variant="outline"
                    size="small"
                    style={styles.flexBtn}
                  />
                  <Button
                    title={isPickup ? 'Confirm Pickup' : 'Confirm Handover'}
                    variant="primary"
                    size="small"
                    style={styles.flexBtn}
                  />
                </View>
              </Card>
            );
          })}
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
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: RADIUS.md,
    padding: 10,
    marginTop: 6,
    marginBottom: 8,
    gap: 8,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2E7D32',
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2E7D32',
    letterSpacing: 0.5,
  },
  list: {
    gap: 12,
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
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pickupBadge: {
    backgroundColor: '#FFF4E5',
  },
  dropBadge: {
    backgroundColor: '#E3F2FD',
  },
  typeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  pickupText: {
    color: '#E65100',
  },
  dropText: {
    color: '#0D47A1',
  },
  urgency: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  locName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  address: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  parcels: {
    fontSize: 13,
    color: COLORS.textPrimary,
    marginTop: 4,
    fontWeight: '500',
  },
  contact: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  flexBtn: {
    flex: 1,
  },
});

export default CourierDeliveriesScreen;
