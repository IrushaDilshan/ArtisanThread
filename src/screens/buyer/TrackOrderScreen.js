import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../constants/theme';
import {
  getDemoCourierCoordinate,
  TRACKING_DEMO_LOCATIONS,
} from '../../constants/trackingDemo';
import { isSupabaseConfigured, supabase } from '../../services/supabase';
import TrackOrderMap from './TrackOrderMap';

const normalizeDelivery = (value) =>
  Array.isArray(value) ? value[0] || null : value || null;

const isUuid = (value) =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );

const normalizeOrderStatus = (status) => {
  const normalized = String(status || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  if (normalized === 'PAYMENT_CONFIRMED') return 'CONFIRMED';
  if (normalized === 'COURIER_ASSIGNED') return 'COURIER_ASSIGNED';
  return normalized;
};

const normalizeDeliveryStatus = (delivery) => {
  switch (String(delivery?.status || '').trim().toUpperCase()) {
    case 'ASSIGNED':
      return delivery.courier_id ||
        delivery.courier ||
        delivery.courier_profile ||
        delivery.courier_name
        ? 'COURIER_ASSIGNED'
        : '';
    case 'ARRIVED_AT_ARTISAN':
      return 'COURIER_ASSIGNED';
    case 'PICKED_UP':
    case 'IN_TRANSIT':
      return 'IN_TRANSIT';
    case 'DELIVERED':
      return 'DELIVERED';
    default:
      return '';
  }
};

const resolveTrackingStatus = (orderStatus, deliveryInfo) => {
  const order = normalizeOrderStatus(orderStatus);
  const delivery = normalizeDeliveryStatus(deliveryInfo);
  if (order === 'CANCELLED' || delivery === 'DELIVERED') {
    return order === 'CANCELLED' ? 'CANCELLED' : 'DELIVERED';
  }

  const progression = [
    'PENDING',
    'CONFIRMED',
    'CRAFTING',
    'READY_FOR_PICKUP',
    'COURIER_ASSIGNED',
    'IN_TRANSIT',
    'DELIVERED',
  ];
  const orderIndex = progression.indexOf(order);
  const deliveryIndex = progression.indexOf(delivery);
  return deliveryIndex > orderIndex
    ? delivery
    : order || delivery || 'PENDING';
};

const asCoordinate = (latitude, longitude) => {
  if (
    latitude === null ||
    latitude === undefined ||
    latitude === '' ||
    longitude === null ||
    longitude === undefined ||
    longitude === ''
  ) {
    return null;
  }
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }
  return { latitude: lat, longitude: lng };
};

const getCoordinate = (value) => {
  if (!value || typeof value !== 'object') return null;

  const direct = asCoordinate(
    value.latitude ?? value.lat ?? value.current_lat ?? value.pickup_lat ?? value.dropoff_lat,
    value.longitude ?? value.lng ?? value.lon ?? value.current_lng ?? value.pickup_lng ?? value.dropoff_lng
  );
  if (direct) return direct;

  const geoCoordinates = value.coordinates;
  if (Array.isArray(geoCoordinates) && geoCoordinates.length >= 2) {
    const geoPoint = asCoordinate(geoCoordinates[1], geoCoordinates[0]);
    if (geoPoint) return geoPoint;
  }

  return (
    getCoordinate(value.current_location) ||
    getCoordinate(value.currentLocation) ||
    getCoordinate(value.location) ||
    getCoordinate(value.coords) ||
    null
  );
};

const getAddressLabel = (value) => {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return 'Address not provided';
  if (value.address && typeof value.address === 'object') {
    return getAddressLabel(value.address);
  }
  return [
    value.full_name || value.fullName || value.name || value.recipient,
    value.address_line1 || value.addressLine1 || value.street,
    value.address_line2 || value.addressLine2,
    typeof value.address === 'string' ? value.address : null,
    value.city || value.town,
    value.district,
    value.postal_code || value.postalCode,
  ]
    .filter(Boolean)
    .join(', ') || value.label || 'Address not provided';
};

const getInitials = (name) =>
  String(name || 'C')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const getVehicleLabel = (courier, delivery) => {
  const metadata = courier?.metadata || {};
  const type =
    courier?.vehicle_type ||
    metadata.vehicle_type ||
    metadata.vehicleType ||
    metadata.vehicle ||
    delivery?.vehicle_type ||
    '';
  const number =
    courier?.vehicle_number ||
    metadata.vehicle_number ||
    metadata.vehicleNumber ||
    delivery?.vehicle_number ||
    '';

  if (typeof type === 'string' && typeof number === 'string' && type && number) {
    return `${type} → ${number}`;
  }
  if (typeof type === 'string' && type) return type;
  if (typeof number === 'string' && number) return number;
  return 'Vehicle details not provided';
};

const getStatusInfo = (status) => {
  switch (String(status || '').toUpperCase()) {
    case 'PENDING':
      return { title: 'Order Placed', subtitle: 'Pickup details will appear here when available.' };
    case 'CONFIRMED':
      return { title: 'Payment Confirmed', subtitle: 'Your order is confirmed.' };
    case 'CRAFTING':
      return { title: 'Artisan is preparing your order', subtitle: 'The artisan is working on your order.' };
    case 'READY_FOR_PICKUP':
      return { title: 'Ready for Courier Pickup', subtitle: 'Your order is waiting for courier pickup.' };
    case 'COURIER_ASSIGNED':
      return { title: 'Courier Assigned', subtitle: 'A courier has been assigned to your order.' };
    case 'IN_TRANSIT':
      return { title: 'On the way', subtitle: 'Arriving in 15 mins' };
    case 'DELIVERED':
      return { title: 'Delivered', subtitle: 'Your order has been delivered.' };
    case 'CANCELLED':
      return { title: 'Order Cancelled', subtitle: 'Active tracking and courier contact are unavailable.' };
    default:
      return { title: 'Order Tracking', subtitle: 'Tracking information will appear when available.' };
  }
};

export const TrackOrderScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const order = route?.params?.order || {};
  const checkout = route?.params?.checkout || {};
  const orderId = order.id;
  const routeDelivery = useMemo(
    () => normalizeDelivery(route?.params?.delivery || order.delivery),
    [order.delivery, route?.params?.delivery]
  );
  const [delivery, setDelivery] = useState(routeDelivery);
  const [courierProfile, setCourierProfile] = useState(
    routeDelivery?.courier_profile || routeDelivery?.courier || null
  );
  const [loadingDelivery, setLoadingDelivery] = useState(false);
  const [orderStatus, setOrderStatus] = useState(
    normalizeOrderStatus(route?.params?.currentStatus || order.status || 'PENDING')
  );
  const [shippingAddress, setShippingAddress] = useState(
    checkout.shippingAddress || order.shipping_address || null
  );
  const [trackingError, setTrackingError] = useState(null);
  const status = resolveTrackingStatus(orderStatus, delivery);
  const statusInfo = getStatusInfo(status);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      let isFirstRefresh = true;
      setDelivery(routeDelivery);
      setCourierProfile(
        routeDelivery?.courier_profile || routeDelivery?.courier || null
      );
      setOrderStatus(
        normalizeOrderStatus(
          route?.params?.currentStatus || order.status || 'PENDING'
        )
      );
      setShippingAddress(
        checkout.shippingAddress || order.shipping_address || null
      );

      if (!isSupabaseConfigured || !isUuid(orderId)) {
        return () => {
          isActive = false;
        };
      }

      setLoadingDelivery(true);
      const refreshTracking = async () => {
        try {
          const [orderResult, deliveryResult] = await Promise.all([
            supabase
              .from('orders')
              .select('status, shipping_address')
              .eq('id', orderId)
              .maybeSingle(),
            supabase
              .from('deliveries')
              .select('*')
              .eq('order_id', orderId)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle(),
          ]);
          if (orderResult.error) throw orderResult.error;
          if (deliveryResult.error) throw deliveryResult.error;
          if (!isActive) return;

          if (orderResult.data?.status) {
            setOrderStatus(normalizeOrderStatus(orderResult.data.status));
          }
          if (orderResult.data?.shipping_address) {
            setShippingAddress(orderResult.data.shipping_address);
          }
          if (deliveryResult.data) {
            setDelivery(deliveryResult.data);
            setCourierProfile(
              deliveryResult.data.courier_profile ||
                deliveryResult.data.courier ||
                null
            );
          }
          setTrackingError(null);
        } catch (error) {
          if (isActive) {
            setTrackingError(
              error?.message || 'Unable to refresh tracking information.'
            );
          }
        } finally {
          if (isActive && isFirstRefresh) {
            setLoadingDelivery(false);
            isFirstRefresh = false;
          }
        }
      };

      refreshTracking();
      const refreshTimer = setInterval(refreshTracking, 15000);

      return () => {
        isActive = false;
        clearInterval(refreshTimer);
      };
    }, [
      checkout.shippingAddress,
      order.id,
      order.shipping_address,
      order.status,
      orderId,
      route?.params?.currentStatus,
      routeDelivery,
    ])
  );

  useEffect(() => {
    const courierId = delivery?.courier_id;
    if (!isUuid(courierId) || !isSupabaseConfigured) return undefined;

    let isActive = true;
    supabase
      .from('profiles')
      .select('id, full_name, phone, avatar_url, metadata')
      .eq('id', courierId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) throw error;
        if (isActive && data) setCourierProfile(data);
      })
      .catch((error) => {
        if (isActive) {
          Alert.alert(
            'Unable to load courier details',
            error?.message || 'Please try again later.'
          );
        }
      });

    return () => {
      isActive = false;
    };
  }, [delivery?.courier_id]);

  const locations = useMemo(() => {
    const items = Array.isArray(checkout.items)
      ? checkout.items
      : Array.isArray(order.items)
        ? order.items
        : [];
    const artisanLocation =
      items[0]?.product?.artisan?.location ||
      items[0]?.artisan?.location ||
      null;
    const pickupAddress = delivery?.pickup_address || artisanLocation;
    const buyerAddress =
      shippingAddress || checkout.shippingAddress || order.shipping_address;
    const actualPickup = getCoordinate(delivery?.pickup_address) ||
      asCoordinate(delivery?.pickup_lat, delivery?.pickup_lng) ||
      getCoordinate(artisanLocation);
    const actualCourier = getCoordinate(delivery?.current_location) ||
      getCoordinate(delivery?.currentLocation) ||
      getCoordinate({
        current_lat: delivery?.current_lat,
        current_lng: delivery?.current_lng,
      }) ||
      getCoordinate(courierProfile?.current_location);
    const actualDestination = getCoordinate(buyerAddress) ||
      getCoordinate(delivery?.dropoff_address) ||
      asCoordinate(delivery?.dropoff_lat, delivery?.dropoff_lng);
    const courierCanAppear = [
      'READY_FOR_PICKUP',
      'COURIER_ASSIGNED',
      'IN_TRANSIT',
      'DELIVERED',
    ].includes(status);
    const pickup = actualPickup || TRACKING_DEMO_LOCATIONS.artisanPickup;
    const destination =
      actualDestination || TRACKING_DEMO_LOCATIONS.buyerDestination;
    const courier = !courierCanAppear
      ? null
      : status === 'DELIVERED'
        ? destination
        : actualCourier || getDemoCourierCoordinate(status);

    return {
      pickup: {
        coordinate: pickup,
        address: actualPickup
          ? getAddressLabel(pickupAddress)
          : pickupAddress
            ? `${getAddressLabel(pickupAddress)} (demo map pin)`
            : 'Simulated Colombo pickup point',
        simulated: !actualPickup,
      },
      courier: {
        coordinate: courier,
        simulated: Boolean(
          courier &&
            (status === 'DELIVERED' || !actualCourier)
        ),
      },
      destination: {
        coordinate: destination,
        address: actualDestination
          ? getAddressLabel(buyerAddress || delivery?.dropoff_address)
          : buyerAddress
            ? `${getAddressLabel(buyerAddress)} (demo map pin)`
            : 'Simulated Colombo delivery destination',
        simulated: !actualDestination,
      },
    };
  }, [
    checkout.items,
    checkout.shippingAddress,
    courierProfile,
    delivery,
    order.items,
    order.shipping_address,
    shippingAddress,
    status,
  ]);

  const points = useMemo(
    () =>
      [
        locations.pickup.coordinate,
        locations.courier.coordinate,
        locations.destination.coordinate,
      ].filter(Boolean),
    [locations]
  );

  const mapInitialRegion = points[0]
    ? {
        ...points[0],
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      }
    : null;

  const fitMapToLocations = useCallback(() => {
    if (points.length > 1) {
      mapRef.current?.fitToCoordinates(points, {
        animated: true,
        edgePadding: { top: 48, right: 48, bottom: 48, left: 48 },
      });
    }
  }, [points]);

  useEffect(() => {
    if (points.length < 2) return undefined;
    const timer = setTimeout(fitMapToLocations, 250);
    return () => clearTimeout(timer);
  }, [fitMapToLocations, points.length]);

  const handleContactCourier = () => {
    const courierName =
      courierProfile?.full_name ||
      courierProfile?.name ||
      delivery?.courier_name ||
      delivery?.driver_name ||
      'Courier';
    const phone =
      courierProfile?.phone ||
      courierProfile?.contact_number ||
      delivery?.courier_phone ||
      delivery?.courier?.phone ||
      delivery?.driver?.phone ||
      delivery?.driver?.contact_number;
    if (!phone) {
      Alert.alert('Contact Courier', 'Courier contact details are not available yet.');
      return;
    }
    Alert.alert('Contact Courier', `${courierName}\n${phone}`);
  };

  const courierAssigned = Boolean(
    delivery?.courier_id ||
      delivery?.courier ||
      delivery?.courier_profile ||
      delivery?.courier_name ||
      delivery?.driver_name ||
      delivery?.driver ||
      courierProfile?.id ||
      courierProfile?.full_name ||
      courierProfile?.name ||
      ['COURIER_ASSIGNED', 'IN_TRANSIT', 'DELIVERED'].includes(status)
  );
  const courierName =
    courierProfile?.full_name ||
    courierProfile?.name ||
    delivery?.courier?.full_name ||
    delivery?.courier?.name ||
    delivery?.courier_name ||
    delivery?.driver?.full_name ||
    delivery?.driver?.name ||
    delivery?.driver_name ||
    null;
  const courierPhone =
    courierProfile?.phone ||
    courierProfile?.contact_number ||
    delivery?.courier_phone ||
    delivery?.courier?.phone ||
    delivery?.driver?.phone ||
    delivery?.driver?.contact_number ||
    null;
  const avatarUrl =
    courierProfile?.avatar_url ||
    courierProfile?.profile_image ||
    courierProfile?.avatar ||
    delivery?.courier?.avatar_url ||
    delivery?.courier?.profile_image ||
    delivery?.driver?.avatar_url ||
    delivery?.courier_avatar ||
    null;
  const routeCoordinates = points;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, SPACING.lg) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mapFrame}>
          <TrackOrderMap
            mapRef={mapRef}
            locations={locations}
            routeCoordinates={routeCoordinates}
            initialRegion={mapInitialRegion}
            onMapReady={fitMapToLocations}
          />
          {loadingDelivery ? (
            <View style={styles.loadingBadge}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading delivery</Text>
            </View>
          ) : null}
        </View>
        {trackingError ? (
          <Text style={styles.trackingError}>
            Tracking could not refresh: {trackingError}
          </Text>
        ) : null}

        <View style={styles.locationList}>
          <LocationSummary
            icon="📍"
            title="Artisan Pickup"
            detail={locations.pickup.address}
          />
          <LocationSummary
            icon="🚚"
            title="Courier Location"
            detail={
              locations.courier.simulated
                ? 'Simulated courier position (not GPS)'
                : locations.courier.coordinate
                  ? 'Current location from delivery data'
                  : 'Courier not assigned yet'
            }
          />
          <LocationSummary
            icon="🏠"
            title="Buyer Delivery Location"
            detail={locations.destination.address}
          />
        </View>
        <Text style={styles.demoNotice}>
          Demo map pins are used when real coordinates are unavailable. They
          are not live GPS locations.
        </Text>

        <Card style={styles.statusCard}>
          <View style={styles.statusIconWrap}>
            <Text style={styles.statusIcon}>🚚</Text>
          </View>
          <View style={styles.statusCopy}>
            <Text style={styles.statusTitle}>{statusInfo.title}</Text>
            <Text style={styles.statusSubtitle}>{statusInfo.subtitle}</Text>
            {delivery?.estimated_arrival && status === 'IN_TRANSIT' ? (
              <Text style={styles.estimatedArrival}>
                Estimated arrival: {new Date(delivery.estimated_arrival).toLocaleString()}
              </Text>
            ) : null}
          </View>
        </Card>

        <Card style={styles.courierCard}>
          <Text style={styles.sectionTitle}>Courier Details</Text>
          {courierAssigned ? (
            courierName || courierPhone || avatarUrl ? (
              <View style={styles.courierRow}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarInitials}>
                      {getInitials(courierName)}
                    </Text>
                  </View>
                )}
                <View style={styles.courierCopy}>
                  <Text style={styles.courierName}>
                    {courierName || 'Courier details unavailable'}
                  </Text>
                  <Text style={styles.courierVehicle}>
                    {getVehicleLabel(courierProfile, delivery)}
                  </Text>
                  <Text style={styles.courierPhone}>
                    {courierPhone || 'Phone number not provided'}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.courierNotAssigned}>
                Courier assigned; profile details are not available yet.
              </Text>
            )
          ) : (
            <Text style={styles.courierNotAssigned}>
              Courier not assigned yet
            </Text>
          )}
        </Card>

        {courierAssigned && courierPhone && status !== 'CANCELLED' ? (
          <Button
            title="Contact Courier"
            onPress={handleContactCourier}
            style={styles.contactButton}
          />
        ) : null}
      </ScrollView>
    </View>
  );
};

const LocationSummary = ({ icon, title, detail }) => (
  <View style={styles.locationRow}>
    <Text style={styles.locationIcon}>{icon}</Text>
    <View style={styles.locationCopy}>
      <Text style={styles.locationTitle}>{title}</Text>
      <Text style={styles.locationDetail}>{detail}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderBottomColor: COLORS.borderLight,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 58,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backArrow: {
    color: COLORS.textPrimary,
    fontSize: 34,
    lineHeight: 38,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
  headerSpacer: {
    width: 8,
  },
  content: {
    padding: SPACING.md,
  },
  mapFrame: {
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    height: 300,
    overflow: 'hidden',
    position: 'relative',
  },
  trackingError: {
    color: COLORS.error,
    fontSize: 12,
    lineHeight: 18,
    marginTop: SPACING.sm,
  },
  demoNotice: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: SPACING.xs,
  },
  loadingBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    flexDirection: 'row',
    gap: SPACING.xs,
    left: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    position: 'absolute',
    top: SPACING.sm,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  locationList: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  locationRow: {
    alignItems: 'center',
    borderBottomColor: COLORS.borderLight,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 58,
    paddingVertical: SPACING.sm,
  },
  locationIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
    width: 24,
  },
  locationCopy: {
    flex: 1,
  },
  locationTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  locationDetail: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  statusCard: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: SPACING.md,
    padding: SPACING.md,
  },
  statusIconWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    borderRadius: RADIUS.md,
    height: 48,
    justifyContent: 'center',
    marginRight: SPACING.md,
    width: 48,
  },
  statusIcon: {
    fontSize: 24,
  },
  statusCopy: {
    flex: 1,
  },
  statusTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  statusSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: SPACING.xs,
  },
  estimatedArrival: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: SPACING.xs,
  },
  courierCard: {
    marginTop: SPACING.md,
    padding: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: SPACING.md,
  },
  courierRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  avatar: {
    backgroundColor: COLORS.primaryMuted,
    borderRadius: RADIUS.pill,
    height: 58,
    marginRight: SPACING.md,
    width: 58,
  },
  avatarFallback: {
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    borderRadius: RADIUS.pill,
    height: 58,
    justifyContent: 'center',
    marginRight: SPACING.md,
    width: 58,
  },
  avatarInitials: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  courierCopy: {
    flex: 1,
  },
  courierName: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  courierVehicle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  courierPhone: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  contactButton: {
    marginTop: SPACING.md,
  },
});

export default TrackOrderScreen;
