import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../constants/theme';

const LocationMarker = ({ icon, label, color }) => (
  <View style={[styles.marker, { borderColor: color }]}>
    <Text style={styles.markerIcon}>{icon}</Text>
    <Text style={[styles.markerLabel, { color }]}>{label}</Text>
  </View>
);

const TrackOrderMap = ({
  mapRef,
  locations,
  routeCoordinates,
  initialRegion,
  onMapReady,
}) => {
  if (!initialRegion) {
    return (
      <View style={styles.unavailable}>
        <Text style={styles.unavailableIcon}>📍</Text>
        <Text style={styles.unavailableTitle}>
          Location details are not available yet.
        </Text>
        <Text style={styles.unavailableCopy}>
          Map pins will appear when pickup, courier, or delivery coordinates are
          provided.
        </Text>
      </View>
    );
  }

  return (
    <MapView
      ref={mapRef}
      initialRegion={initialRegion}
      onMapReady={onMapReady}
      style={styles.map}
      showsCompass
      showsScale
    >
      {locations.pickup.coordinate ? (
        <Marker
          coordinate={locations.pickup.coordinate}
          title={
            locations.pickup.simulated
              ? 'Artisan Pickup (demo pin)'
              : 'Artisan Pickup'
          }
          description={
            locations.pickup.simulated
              ? 'Simulated coordinate; not real-time GPS.'
              : locations.pickup.address
          }
        >
          <LocationMarker
            icon="📍"
            label="Artisan Pickup"
            color={COLORS.primary}
          />
        </Marker>
      ) : null}
      {locations.courier.coordinate ? (
        <Marker
          coordinate={locations.courier.coordinate}
          title={
            locations.courier.simulated
              ? 'Courier Location (demo pin)'
              : 'Courier Location'
          }
          description={
            locations.courier.simulated
              ? 'Simulated coordinate; not real-time GPS.'
              : 'Courier location from delivery data'
          }
        >
          <LocationMarker
            icon="🚚"
            label="Courier Location"
            color={COLORS.warning}
          />
        </Marker>
      ) : null}
      {locations.destination.coordinate ? (
        <Marker
          coordinate={locations.destination.coordinate}
          title={
            locations.destination.simulated
              ? 'Buyer Delivery Location (demo pin)'
              : 'Buyer Delivery Location'
          }
          description={
            locations.destination.simulated
              ? 'Simulated coordinate; not real-time GPS.'
              : locations.destination.address
          }
        >
          <LocationMarker
            icon="🏠"
            label="Buyer Delivery"
            color={COLORS.success}
          />
        </Marker>
      ) : null}
      {routeCoordinates.length > 1 ? (
        <Polyline
          coordinates={routeCoordinates}
          strokeColor={COLORS.primary}
          strokeWidth={4}
        />
      ) : null}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  unavailable: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  unavailableIcon: {
    fontSize: 32,
  },
  unavailableTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  unavailableCopy: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  marker: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  markerIcon: {
    fontSize: 16,
  },
  markerLabel: {
    fontSize: 10,
    fontWeight: '800',
  },
});

export default TrackOrderMap;
