import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROUTES } from '../../navigation/routes';
import { courierService } from '../../services/courierService';

// Interactive Vector Map Preview Graphic with Route Polyline and Live Markers
const MapPreview = ({ onOpenMaps, artisanName, pickupCity, pickupStreet, eta = '12 min (4.8 km)' }) => (
  <TouchableOpacity
    activeOpacity={0.92}
    onPress={onOpenMaps}
    style={styles.mapContainer}
  >
    {/* Map Terrain Grid, Water and Parks */}
    <View style={styles.mapCanvas}>
      {/* Coastal/River water stream */}
      <View style={styles.mapWater} />

      {/* Nature / park patches */}
      <View style={[styles.mapPark, { top: 16, left: 16, width: 75, height: 42 }]} />
      <View style={[styles.mapPark, { bottom: 32, right: 28, width: 90, height: 38 }]} />

      {/* Roads Network */}
      <View style={[styles.mapRoadH, { top: 46 }]} />
      <View style={[styles.mapRoadH, { top: 104 }]} />
      <View style={[styles.mapRoadV, { left: 95 }]} />
      <View style={[styles.mapRoadV, { right: 85 }]} />
      <View style={[styles.mapRoadDiagonal]} />

      {/* Road names & Local landmarks */}
      <Text style={[styles.mapLabel, { top: 18, left: 105 }]}>A2 GALLE ROAD</Text>
      <Text style={[styles.mapLabel, { top: 88, left: 24 }]}>{pickupStreet ? pickupStreet.toUpperCase() : 'TEMPLE RD'}</Text>
      <Text style={[styles.mapLabel, { bottom: 42, right: 34 }]}>{pickupCity ? pickupCity.toUpperCase() : 'PAYAGALA'}</Text>

      {/* Dynamic Driving Route Polyline from Courier to Pickup Point */}
      <View style={styles.routePolyline} />
      <View style={styles.routePolylineSegment} />

      {/* Courier Marker (Current Location / You are here) */}
      <View style={styles.courierLocationMarker}>
        <View style={styles.courierRadarRing} />
        <View style={styles.courierCenterDot} />
        <View style={styles.courierLabelPill}>
          <Text style={styles.courierLabelText}>🛵 You (Courier)</Text>
        </View>
      </View>

      {/* Destination Pin (Artisan Workshop) */}
      <View style={styles.destinationPinWrapper}>
        <View style={styles.destinationCallout}>
          <Text style={styles.destinationCalloutText} numberOfLines={1}>
            📍 {artisanName || 'Artisan Workshop'}
          </Text>
        </View>
        <View style={styles.pinOuter}>
          <View style={styles.pinInnerDot} />
        </View>
        <View style={styles.pinPoint} />
        <View style={styles.pinShadow} />
      </View>
    </View>

    {/* Top-Left Floating Badge: "12 min (4.8 km)" */}
    <View style={styles.etaBadge}>
      <Text style={styles.etaBadgeText}>⏱ {eta}</Text>
    </View>

    {/* Top-Right Floating Badge: "GPS pin confirmed" */}
    <View style={styles.gpsBadge}>
      <Text style={styles.gpsBadgeText}>🟢 GPS Pin Confirmed</Text>
    </View>

    {/* Bottom Tap to Open in Google Maps banner */}
    <View style={styles.openMapsBanner}>
      <Text style={styles.openMapsBannerText}>
        🗺️ Tap to open Turn-by-Turn GPS Navigation ↗
      </Text>
    </View>
  </TouchableOpacity>
);

// Vector Icon Helpers for Bottom Tab Bar
const TabIcon = ({ name, active }) => {
  const color = active ? '#00796B' : '#9CA3AF';

  switch (name) {
    case 'jobs':
      return (
        <View style={styles.tabIconBox}>
          <View style={[styles.homeRoof, { borderBottomColor: color }]} />
          <View style={[styles.homeBase, { borderColor: color }]} />
        </View>
      );
    case 'route':
      return (
        <View style={styles.tabIconBox}>
          <View style={[styles.routeCrossH, { backgroundColor: color }]} />
          <View style={[styles.routeCrossV, { backgroundColor: color }]} />
        </View>
      );
    case 'alerts':
      return (
        <View style={styles.tabIconBox}>
          <View style={[styles.alertBubble, { borderColor: color }]}>
            <View style={[styles.alertTail, { borderTopColor: color }]} />
          </View>
        </View>
      );
    case 'profile':
      return (
        <View style={styles.tabIconBox}>
          <View style={[styles.userHead, { borderColor: color }]} />
          <View style={[styles.userShoulders, { borderColor: color }]} />
        </View>
      );
    default:
      return null;
  }
};

export const PickupRequestScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('jobs');
  const [hasArrived, setHasArrived] = useState(false);
  const [deliveryData, setDeliveryData] = useState(null);

  const initialTrackingId = route?.params?.trackingId || 'ATH-9942-PY';

  // Load delivery details dynamically based on selected delivery
  useEffect(() => {
    let isMounted = true;
    courierService.verifyTrackingCode(initialTrackingId).then((del) => {
      if (isMounted && del) {
        setDeliveryData(del);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [initialTrackingId]);

  const artisanName = deliveryData?.pickup_address?.name || 'Malsha Maduwanthi';
  const artisanInitials = artisanName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'MM';
  const artisanPhone = deliveryData?.pickup_address?.phone || '077 412 6688';
  const pickupCity = deliveryData?.pickup_address?.city || 'Payagala';
  const pickupStreet = deliveryData?.pickup_address?.address_line1 || 'Temple Road';
  const pickupLat = deliveryData?.pickup_lat || 6.5700;
  const pickupLng = deliveryData?.pickup_lng || 79.9800;
  const fragileDetails = deliveryData?.recipient_notes || '2 parcels · 1.4 kg · hand-dyed batik, do not fold';

  const artisan = {
    name: artisanName,
    initials: artisanInitials,
    subtitle: deliveryData?.pickup_address?.details || 'Batik & handicraft workshop',
    phone: artisanPhone,
    address: {
      house: 'No. 142/B',
      street: pickupStreet,
      city: pickupCity,
      district: pickupCity === 'Kandy' ? 'Kandy' : pickupCity === 'Kelaniya' ? 'Gampaha' : 'Kalutara',
      postalCode: '12070',
    },
    fragileDetails: fragileDetails,
  };

  const handleCall = () => {
    Linking.openURL(`tel:${artisan.phone.replace(/\s+/g, '')}`).catch(() => {});
  };

  const handleFixAddress = () => {
    if (navigation?.navigate) {
      navigation.navigate(ROUTES.COURIER.FIX_ADDRESS || 'FixAddressScreen');
    }
  };

  // Launch Google Maps / Device Turn-by-Turn GPS Navigation
  const handleNavigate = () => {
    const lat = pickupLat;
    const lng = pickupLng;
    const label = encodeURIComponent(`${artisan.name} - Pickup`);

    // Android: Google Navigation intent (starts turn-by-turn navigation directly)
    const googleNavIntent = `google.navigation:q=${lat},${lng}&mode=d`;
    // Universal Google Maps directions URL (works on all devices and browsers)
    const googleWebUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    // iOS Apple Maps
    const appleMapsUrl = `maps:0,0?q=${label}@${lat},${lng}`;

    const targetUrl = Platform.OS === 'ios' ? appleMapsUrl : googleNavIntent;

    Linking.canOpenURL(targetUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(targetUrl);
        }
        return Linking.openURL(googleWebUrl);
      })
      .catch(() => {
        Linking.openURL(googleWebUrl).catch(() => {
          Alert.alert('Navigation', 'Unable to launch Google Maps.');
        });
      });
  };

  const handleArrived = () => {
    setHasArrived(true);
    if (navigation?.navigate) {
      navigation.navigate(ROUTES.COURIER.SCAN_PARCEL, {
        trackingId: deliveryData?.tracking_code || initialTrackingId,
        artisanName: artisan.name,
        pickupCity: artisan.address.city,
      });
    }
  };

  const handleTabPress = (tabKey) => {
    if (tabKey === 'jobs' && navigation?.navigate) {
      navigation.navigate(ROUTES.COURIER.HOME);
    } else if (tabKey === 'route' && navigation?.navigate) {
      navigation.navigate(ROUTES.COURIER.ROUTES);
    } else if (tabKey === 'alerts' && navigation?.navigate) {
      navigation.navigate(ROUTES.COURIER.NOTIFICATIONS);
    } else if (tabKey === 'profile' && navigation?.navigate) {
      navigation.navigate(ROUTES.COURIER.PROFILE);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header Bar with Back Button */}
      <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 8) }]}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pickup request</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Map Preview Container with Pin & GPS Badge */}
        <MapPreview
          onOpenMaps={handleNavigate}
          artisanName={artisan.name}
          pickupCity={artisan.address.city}
          pickupStreet={artisan.address.street}
          eta="12 min (4.8 km)"
        />

        {/* 2. Artisan Details Card */}
        <View style={styles.card}>
          <View style={styles.artisanRow}>
            {/* Avatar Circle "MM" */}
            <View style={styles.artisanAvatar}>
              <Text style={styles.artisanAvatarText}>{artisan.initials}</Text>
            </View>

            <View style={styles.artisanInfo}>
              <Text style={styles.artisanName}>{artisan.name}</Text>
              <Text style={styles.artisanSubtitle}>{artisan.subtitle}</Text>

              {/* Verified Artisan Badge */}
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>✓ Verified artisan</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3. Pickup Address Card */}
        <Text style={styles.sectionHeaderTitle}>Pickup address</Text>
        <View style={styles.card}>
          <View style={styles.addressTable}>
            <View style={styles.addressRow}>
              <Text style={styles.addressLabel}>House / building</Text>
              <Text style={styles.addressValue}>{artisan.address.house}</Text>
            </View>

            <View style={styles.addressRow}>
              <Text style={styles.addressLabel}>Street</Text>
              <Text style={styles.addressValue}>{artisan.address.street}</Text>
            </View>

            <View style={styles.addressRow}>
              <Text style={styles.addressLabel}>City</Text>
              <Text style={styles.addressValue}>{artisan.address.city}</Text>
            </View>

            <View style={styles.addressRow}>
              <Text style={styles.addressLabel}>District</Text>
              <Text style={styles.addressValue}>{artisan.address.district}</Text>
            </View>

            <View style={[styles.addressRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.addressLabel}>Postal code</Text>
              <Text style={styles.addressValue}>{artisan.address.postalCode}</Text>
            </View>
          </View>
        </View>

        {/* 4. Contact Card */}
        <View style={styles.card}>
          <View style={styles.contactRow}>
            <View>
              <Text style={styles.contactLabel}>Contact number</Text>
              <View style={styles.phoneBadgeRow}>
                <Text style={styles.contactPhone}>{artisan.phone}</Text>
                <View style={styles.verifiedPhoneBadge}>
                  <Text style={styles.verifiedPhoneText}>✓ Verified</Text>
                </View>
              </View>
            </View>

            {/* Circular Dark Green Phone Call Button */}
            <TouchableOpacity
              onPress={handleCall}
              activeOpacity={0.8}
              style={styles.callButton}
            >
              <Text style={styles.callIcon}>📞</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. Warning Alert Box (Fragile) */}
        <View style={styles.fragileAlertCard}>
          <View style={styles.fragileLeftStripe} />
          <View style={styles.fragileTextContent}>
            <Text style={styles.fragileTitle}>Fragile — handle with care</Text>
            <Text style={styles.fragileSubtitle}>{artisan.fragileDetails}</Text>
          </View>
        </View>

        {/* 6. Action Buttons Area */}
        <View style={styles.actionSection}>
          {/* Text Link: "Can't find this address?" in gold/orange */}
          <TouchableOpacity
            onPress={handleFixAddress}
            activeOpacity={0.7}
            style={styles.fixAddressLinkWrapper}
          >
            <Text style={styles.fixAddressLinkText}>
              Can't find this address?
            </Text>
          </TouchableOpacity>

          {/* Side-by-side action buttons */}
          <View style={styles.buttonRow}>
            {/* Left Button: Navigate */}
            <TouchableOpacity
              onPress={handleNavigate}
              activeOpacity={0.8}
              style={styles.navigateBtn}
            >
              <Text style={styles.navigateIcon}>🧭</Text>
              <Text style={styles.navigateBtnText}>Navigate</Text>
            </TouchableOpacity>

            {/* Right Button: I've arrived */}
            <TouchableOpacity
              onPress={handleArrived}
              activeOpacity={0.88}
              style={[
                styles.arrivedBtn,
                hasArrived && styles.arrivedBtnDone,
              ]}
            >
              <Text style={styles.arrivedBtnText}>
                {hasArrived ? "✓ Arrived" : "I've arrived"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 7. Bottom Navigation Bar */}
      <View
        style={[
          styles.bottomNavBar,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleTabPress('jobs')}
          activeOpacity={0.8}
          style={styles.navTab}
        >
          <TabIcon name="jobs" active={activeTab === 'jobs'} />
          <Text
            style={[
              styles.navTabLabel,
              activeTab === 'jobs' && styles.navTabLabelActive,
            ]}
          >
            Jobs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleTabPress('route')}
          activeOpacity={0.8}
          style={styles.navTab}
        >
          <TabIcon name="route" active={activeTab === 'route'} />
          <Text
            style={[
              styles.navTabLabel,
              activeTab === 'route' && styles.navTabLabelActive,
            ]}
          >
            Route
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleTabPress('alerts')}
          activeOpacity={0.8}
          style={styles.navTab}
        >
          <TabIcon name="alerts" active={activeTab === 'alerts'} />
          <Text
            style={[
              styles.navTabLabel,
              activeTab === 'alerts' && styles.navTabLabelActive,
            ]}
          >
            Alerts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleTabPress('profile')}
          activeOpacity={0.8}
          style={styles.navTab}
        >
          <TabIcon name="profile" active={activeTab === 'profile'} />
          <Text
            style={[
              styles.navTabLabel,
              activeTab === 'profile' && styles.navTabLabelActive,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 32,
    color: '#111E1C',
    fontWeight: '300',
    marginTop: -4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111E1C',
    letterSpacing: -0.2,
  },
  headerRightSpacer: {
    width: 36,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // ----------------------------------------------------
  // 1. Map Preview Container
  // ----------------------------------------------------
  mapContainer: {
    height: 200,
    marginHorizontal: 16,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  mapCanvas: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8FAFC',
  },
  mapWater: {
    position: 'absolute',
    top: -20,
    right: -30,
    width: 140,
    height: 250,
    borderRadius: 70,
    backgroundColor: '#E0F2FE',
    transform: [{ rotate: '15deg' }],
  },
  mapPark: {
    position: 'absolute',
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  mapRoadH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  mapRoadV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 12,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  mapRoadDiagonal: {
    position: 'absolute',
    left: -20,
    top: 55,
    width: 280,
    height: 10,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-22deg' }],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  mapLabel: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  routePolyline: {
    position: 'absolute',
    left: 45,
    bottom: 55,
    width: 130,
    height: 5,
    backgroundColor: '#0284C7',
    borderRadius: 3,
    transform: [{ rotate: '-35deg' }],
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  routePolylineSegment: {
    position: 'absolute',
    right: 65,
    top: 60,
    width: 80,
    height: 5,
    backgroundColor: '#0284C7',
    borderRadius: 3,
    transform: [{ rotate: '40deg' }],
  },
  courierLocationMarker: {
    position: 'absolute',
    bottom: 35,
    left: 28,
    alignItems: 'center',
  },
  courierRadarRing: {
    position: 'absolute',
    top: -6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(2, 132, 199, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.5)',
  },
  courierCenterDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0284C7',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  courierLabelPill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  courierLabelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  destinationPinWrapper: {
    position: 'absolute',
    top: 32,
    right: 48,
    alignItems: 'center',
  },
  destinationCallout: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DC2626',
    marginBottom: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 160,
  },
  destinationCalloutText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  pinOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  pinInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  pinPoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#DC2626',
    marginTop: -2,
  },
  pinShadow: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    marginTop: 1,
  },
  etaBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#0F172A',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  etaBadgeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  gpsBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBE6C9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  gpsBadgeText: {
    color: '#065F46',
    fontSize: 10,
    fontWeight: '700',
  },
  openMapsBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 77, 64, 0.92)',
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openMapsBannerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ----------------------------------------------------
  // Cards & Layout
  // ----------------------------------------------------
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDF2F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },

  // 2. Artisan Details
  artisanRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artisanAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#D6EBE4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  artisanAvatarText: {
    color: '#004D40',
    fontWeight: '800',
    fontSize: 15,
  },
  artisanInfo: {
    flex: 1,
  },
  artisanName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111E1C',
    letterSpacing: -0.2,
  },
  artisanSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  verifiedBadge: {
    backgroundColor: '#E6F7F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00796B',
  },

  // 3. Pickup Address
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111E1C',
    marginHorizontal: 16,
    marginTop: 16,
  },
  addressTable: {
    gap: 8,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  addressLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  addressValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111E1C',
    textAlign: 'right',
  },

  // 4. Contact
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  phoneBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactPhone: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111E1C',
  },
  verifiedPhoneBadge: {
    backgroundColor: '#E6F7F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedPhoneText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00796B',
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#004D40',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  callIcon: {
    fontSize: 17,
  },

  // 5. Fragile Warning Alert Box
  fragileAlertCard: {
    backgroundColor: '#FDF2F2',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  fragileLeftStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#DC2626',
  },
  fragileTextContent: {
    paddingLeft: 6,
  },
  fragileTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B91C1C',
  },
  fragileSubtitle: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 2,
  },

  // 6. Action Area
  actionSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  fixAddressLinkWrapper: {
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 8,
  },
  fixAddressLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706', // Gold / Orange
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  navigateBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#004D40',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  navigateIcon: {
    fontSize: 16,
  },
  navigateBtnText: {
    color: '#004D40',
    fontSize: 14,
    fontWeight: '700',
  },
  arrivedBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#004D40',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  arrivedBtnDone: {
    backgroundColor: '#00796B',
  },
  arrivedBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // 7. Bottom Navigation Bar
  bottomNavBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    flex: 1,
  },
  navTabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 4,
  },
  navTabLabelActive: {
    color: '#00796B',
    fontWeight: '700',
  },
  tabIconBox: {
    width: 24,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: 1,
  },
  homeBase: {
    width: 14,
    height: 9,
    borderWidth: 1.6,
    borderTopWidth: 0,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  routeCrossH: {
    width: 14,
    height: 2,
    borderRadius: 1,
  },
  routeCrossV: {
    position: 'absolute',
    width: 2,
    height: 14,
    borderRadius: 1,
  },
  alertBubble: {
    width: 18,
    height: 14,
    borderRadius: 4,
    borderWidth: 1.6,
    position: 'relative',
  },
  alertTail: {
    position: 'absolute',
    bottom: -4,
    left: 4,
    width: 0,
    height: 0,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  userHead: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.6,
    marginBottom: 2,
  },
  userShoulders: {
    width: 16,
    height: 6,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderWidth: 1.6,
    borderBottomWidth: 0,
  },
});

export default PickupRequestScreen;
