import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/theme';

const TrackOrderMap = ({ locations, initialRegion }) => {
  const hasAnyLocation = Boolean(
    locations.pickup.coordinate ||
      locations.courier.coordinate ||
      locations.destination.coordinate
  );

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📍</Text>
      <Text style={styles.title}>
        {hasAnyLocation
          ? 'Simulated map preview'
          : 'Location details are not available yet.'}
      </Text>
      <Text style={styles.copy}>
        {hasAnyLocation
          ? 'Demo coordinates are used where real coordinates are missing. They are not live GPS.'
          : 'Pickup, courier, or delivery coordinates have not been provided.'}
      </Text>
      {initialRegion ? (
        <View style={styles.locations}>
          {locations.pickup.coordinate ? (
            <Text style={styles.location}>📍 Artisan Pickup</Text>
          ) : null}
          {locations.courier.coordinate ? (
            <Text style={styles.location}>🚚 Courier Location</Text>
          ) : null}
          {locations.destination.coordinate ? (
            <Text style={styles.location}>🏠 Buyer Delivery Location</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#EEF3F1',
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  copy: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  locations: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: SPACING.md,
    padding: SPACING.sm,
  },
  location: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: SPACING.xs,
  },
});

export default TrackOrderMap;
