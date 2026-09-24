import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { RoleSwitcher } from '../../components/RoleSwitcher';

const ROUTE_STOPS = [
  { step: '1', type: 'Pickup', title: 'Atelier Indigo Crafts', time: '2:15 PM', status: 'Completed' },
  { step: '2', type: 'Pickup', title: 'Oaxaca Woodworks Studio', time: '3:00 PM', status: 'Next Stop' },
  { step: '3', type: 'Drop-off', title: 'Residential Delivery #1', time: '3:45 PM', status: 'Queued' },
  { step: '4', type: 'Drop-off', title: 'Residential Delivery #2', time: '4:30 PM', status: 'Queued' },
];

export const CourierRoutesScreen = () => {
  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Route Optimizer"
        subtitle="Today's optimized logistics stops"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <RoleSwitcher />

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Route Batch: North Corridor #B-12</Text>
          <Text style={styles.summaryMeta}>4 Stops • 18.4 miles • Est. Completion 5:15 PM</Text>
        </Card>

        <View style={styles.timeline}>
          {ROUTE_STOPS.map((stop) => (
            <Card key={stop.step} style={styles.stopCard}>
              <View style={styles.row}>
                <View style={styles.stepBubble}>
                  <Text style={styles.stepNum}>{stop.step}</Text>
                </View>
                <View style={styles.stopDetails}>
                  <Text style={styles.stopType}>{stop.type.toUpperCase()} • {stop.time}</Text>
                  <Text style={styles.stopTitle}>{stop.title}</Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    stop.status === 'Completed' && styles.statusDone,
                    stop.status === 'Next Stop' && styles.statusNext,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      stop.status === 'Completed' && styles.statusTextDone,
                      stop.status === 'Next Stop' && styles.statusTextNext,
                    ]}
                  >
                    {stop.status}
                  </Text>
                </View>
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
  summaryCard: {
    backgroundColor: '#00251A',
    padding: SPACING.md,
    marginVertical: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  summaryMeta: {
    fontSize: 12,
    color: '#80CBC4',
    marginTop: 4,
  },
  timeline: {
    gap: 10,
  },
  stopCard: {
    padding: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  stopDetails: {
    flex: 1,
  },
  stopType: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  stopTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#EAEAEA',
  },
  statusDone: {
    backgroundColor: '#E8F5E9',
  },
  statusNext: {
    backgroundColor: '#FFF4E5',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  statusTextDone: {
    color: '#2E7D32',
  },
  statusTextNext: {
    color: '#ED6C02',
  },
});

export default CourierRoutesScreen;
