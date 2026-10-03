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

// Interactive Vector Live Navigation Map Preview
const NavigationMapPreview = ({
  onOpenMaps,
  buyerName,
  dropoffCity,
  dropoffStreet,
  eta = '11:20 · 8.4 km',
}) => (
  <TouchableOpacity
    activeOpacity={0.92}
    onPress={onOpenMaps}
    style={styles.mapContainer}
  >
    {/* Map Canvas Background */}
    <View style={styles.mapCanvas}>
      {/* Coastal/River water stream */}
      <View style={styles.mapWater} />

      {/* Green Nature / Park Patches */}
      <View style={[styles.mapPark, { top: 16, left: 16, width: 75, height: 42 }]} />
      <View style={[styles.mapPark, { bottom: 32, right: 28, width: 90, height: 38 }]} />

      {/* Roads */}
      <View style={[styles.mapRoadH, { top: 46 }]} />
      <View style={[styles.mapRoadH, { top: 104 }]} />
      <View style={[styles.mapRoadV, { left: 95 }]} />
      <View style={[styles.mapRoadV, { right: 85 }]} />
      <View style={styles.mapRoadDiagonal} />

      {/* Local Road & Landmark Labels */}
      <Text style={[styles.mapLabel, { top: 18, left: 105 }]}>A2 GALLE ROAD</Text>
      <Text style={[styles.mapLabel, { top: 88, left: 24 }]}>
        {dropoffStreet ? dropoffStreet.toUpperCase() : 'DUPLICATION RD'}
      </Text>
      <Text style={[styles.mapLabel, { bottom: 42, right: 34 }]}>
        {dropoffCity ? dropoffCity.toUpperCase() : 'COLOMBO 03'}
      </Text>

      {/* Dynamic Driving Route Polyline from Courier to Customer */}
      <View style={styles.routePolyline} />
      <View style={styles.routePolylineSegment} />

      {/* Courier Position Marker (In Transit) */}
      <View style={styles.courierLocationMarker}>
        <View style={styles.courierRadarRing} />
        <View style={styles.courierCenterDot} />
        <View style={styles.courierLabelPill}>
          <Text style={styles.courierLabelText}>🛵 You (In Transit)</Text>
        </View>
      </View>

      {/* Customer Destination Pin Marker */}
      <View style={styles.destinationPinWrapper}>
        <View style={styles.destinationCallout}>
          <Text style={styles.destinationCalloutText} numberOfLines={1}>
            📍 Buyer: {buyerName || 'Customer'}
          </Text>
        </View>
        <View style={styles.pinOuter}>
          <View style={styles.pinInnerDot} />
        </View>
        <View style={styles.pinPoint} />
        <View style={styles.pinShadow} />
      </View>
    </View>

    {/* Floating Top-Left ETA Badge: "ETA 11:20 · 8.4 km" */}
    <View style={styles.etaBadge}>
      <Text style={styles.etaBadgeText}>⏱ ETA {eta}</Text>
    </View>

    {/* Floating Top-Right Live GPS Badge */}
    <View style={styles.gpsBadge}>
      <Text style={styles.gpsBadgeText}>🟢 GPS Live Navigation</Text>
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

export const DeliveryTransitScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('route');
  const [hasArrived, setHasArrived] = useState(false);
  const [deliveryData, setDeliveryData] = useState(null);

  const trackingId = route?.params?.trackingId || 'ATH-9942-PY';

  // Load active delivery details dynamically
  useEffect(() => {
    let isMounted = true;
    courierService.verifyTrackingCode(trackingId).then((data) => {
      if (isMounted && data) {
        setDeliveryData(data);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [trackingId]);

  const buyerName =
    deliveryData?.order?.buyer?.full_name ||
    deliveryData?.dropoff_address?.name ||
    'Nimal Jayasuriya';
  const buyerPhone =
    deliveryData?.order?.buyer?.phone ||
    deliveryData?.dropoff_address?.phone ||
    '077 123 4567';
  const pickupCity = deliveryData?.pickup_address?.city || 'Payagala';
  const dropoffCity = deliveryData?.dropoff_address?.city || 'Colombo 03';
  const dropoffStreet = deliveryData?.dropoff_address?.address_line1 || '28/4 Galle Road';
  const dropoffLat = deliveryData?.dropoff_lat || 6.9271;
  const dropoffLng = deliveryData?.dropoff_lng || 79.8612;
  const totalAmount = deliveryData?.order?.total_amount
    ? Number(deliveryData.order.total_amount)
    : 12500;
  const formattedCod = `Rs. ${totalAmount.toLocaleString()}`;

  // Launch Google Maps GPS Turn-by-Turn Navigation to Buyer destination
  const handleNavigate = () => {
    const lat = dropoffLat;
    const lng = dropoffLng;
    const label = encodeURIComponent(`${buyerName} - Delivery Dropoff`);

    const googleNavIntent = `google.navigation:q=${lat},${lng}&mode=d`;
    const googleWebUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    const appleMapsUrl = `maps:0,0?q=${label}@${lat},${lng}`;

    const targetUrl = Platform.OS === 'ios' ? appleMapsUrl : googleNavIntent;

    Linking.canOpenURL(targetUrl)
      .then((supported) => {
        if (supported) return Linking.openURL(targetUrl);
        return Linking.openURL(googleWebUrl);
      })
      .catch(() => {
        Linking.openURL(googleWebUrl).catch(() => {
          Alert.alert('Navigation', 'Unable to launch Google Maps.');
        });
      });
  };

  const handleCallBuyer = () => {
    Linking.openURL(`tel:${buyerPhone.replace(/\s+/g, '')}`).catch(() => {});
  };

  const handleCantComplete = () => {
    if (navigation?.navigate) {
      navigation.navigate(ROUTES.COURIER.DELIVERY_FAILED, {
        trackingId,
      });
    }
  };

  const handleArrived = () => {
    setHasArrived(true);
    if (navigation?.navigate) {
      navigation.navigate(ROUTES.COURIER.CONFIRM_DELIVERY, {
        trackingId,
        buyerName,
        totalAmount,
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

      {/* 1. Header Bar with Back Button & Tracking ID */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 8) }]}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{trackingId}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Live Navigation Map Preview */}
        <NavigationMapPreview
          onOpenMaps={handleNavigate}
          buyerName={buyerName}
          dropoffCity={dropoffCity}
          dropoffStreet={dropoffStreet}
          eta="11:20 · 8.4 km"
        />

        {/* 2. Buyer Notification Banner */}
        <View style={styles.buyerNoticeBanner}>
          <View style={styles.noticeCheckCircle}>
            <Text style={styles.noticeCheckmark}>✓</Text>
          </View>
          <View style={styles.noticeTextContainer}>
            <Text style={styles.noticeTitle}>Buyer notified by SMS and in-app</Text>
            <Text style={styles.noticeSubtitle}>
              Sent to {buyerPhone ? `${buyerPhone.slice(0, 3)} *** ${buyerPhone.slice(-4)}` : '077 *** 4567'} at 09:41:06
            </Text>
          </View>
        </View>

        {/* 3. Delivery Progress Timeline Card */}
        <Text style={styles.sectionHeading}>Delivery progress</Text>
        <View style={styles.progressCard}>
          {/* Step 1: Completed */}
          <View style={styles.timelineRow}>
            <View style={styles.indicatorCol}>
              <View style={styles.stepDoneCircle}>
                <Text style={styles.stepDoneCheck}>✓</Text>
              </View>
              <View style={styles.verticalLineActive} />
            </View>
            <View style={styles.stepTextContent}>
              <Text style={styles.stepTitle}>Picked up from workshop</Text>
              <Text style={styles.stepSubtitle}>09:38 · {pickupCity}</Text>
            </View>
          </View>

          {/* Step 2: Active */}
          <View style={styles.timelineRow}>
            <View style={styles.indicatorCol}>
              <View style={styles.stepActiveOuter}>
                <View style={styles.stepActiveInner} />
              </View>
              <View style={styles.verticalLinePending} />
            </View>
            <View style={styles.stepTextContent}>
              <Text style={styles.stepTitle}>In transit to {dropoffCity}</Text>
              <Text style={styles.stepSubtitle}>Updated just now</Text>
            </View>
          </View>

          {/* Step 3: Pending */}
          <View style={[styles.timelineRow, { marginBottom: 0 }]}>
            <View style={styles.indicatorCol}>
              <View style={styles.stepPendingCircle} />
            </View>
            <View style={styles.stepTextContent}>
              <Text style={styles.stepTitlePending}>Delivered to buyer</Text>
              <Text style={styles.stepSubtitlePending}>Waiting</Text>
            </View>
          </View>
        </View>

        {/* 4. Cash on Delivery (COD) Collection Box */}
        <View style={styles.codCard}>
          <Text style={styles.codTitle}>Collect {formattedCod} on delivery</Text>
          <Text style={styles.codSubtitle}>
            Cash on delivery · exact change preferred
          </Text>
        </View>

        {/* 5. Action Area & Action Buttons */}
        <View style={styles.actionSection}>
          {/* Red Link: Can't complete this delivery */}
          <TouchableOpacity
            onPress={handleCantComplete}
            activeOpacity={0.7}
            style={styles.cantCompleteLinkWrapper}
          >
            <Text style={styles.cantCompleteLinkText}>
              Can't complete this delivery
            </Text>
          </TouchableOpacity>

          {/* Side-by-Side Action Buttons: Navigate | Call buyer | I've arrived */}
          <View style={styles.buttonRow}>
            {/* Left: Navigate GPS */}
            <TouchableOpacity
              onPress={handleNavigate}
              activeOpacity={0.8}
              style={styles.navigateBtn}
            >
              <Text style={styles.navigateIcon}>🧭</Text>
              <Text style={styles.navigateBtnText}>Navigate</Text>
            </TouchableOpacity>

            {/* Middle: Call buyer */}
            <TouchableOpacity
              onPress={handleCallBuyer}
              activeOpacity={0.8}
              style={styles.callBuyerBtn}
            >
              <Text style={styles.callBuyerBtnText}>📞 Call buyer</Text>
            </TouchableOpacity>

            {/* Right: I've arrived */}
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

      {/* 6. Bottom Tab Navigation Bar */}
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
  headerContainer: {
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
  headerSpacer: {
    width: 36,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // ----------------------------------------------------
  // 1. Live Navigation Map Preview
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
  // 2. Buyer Notification Banner
  // ----------------------------------------------------
  buyerNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5EE',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  noticeCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeCheckmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  noticeTextContainer: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  noticeSubtitle: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },

  // ----------------------------------------------------
  // 3. Delivery Progress Timeline Card
  // ----------------------------------------------------
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111E1C',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDF2F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  stepDoneCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#00796B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDoneCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  verticalLineActive: {
    width: 2,
    height: 28,
    backgroundColor: '#00796B',
    marginTop: 4,
  },
  stepActiveOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#004D40',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#B2DFDB',
  },
  stepActiveInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  verticalLinePending: {
    width: 2,
    height: 28,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  stepPendingCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  stepTextContent: {
    flex: 1,
    paddingTop: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111E1C',
  },
  stepSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  stepTitlePending: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  stepSubtitlePending: {
    fontSize: 11,
    color: '#D1D5DB',
    marginTop: 2,
  },

  // ----------------------------------------------------
  // 4. Cash on Delivery (COD) Collection Box
  // ----------------------------------------------------
  codCard: {
    backgroundColor: '#FEF9EE',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  codTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  codSubtitle: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 3,
  },

  // ----------------------------------------------------
  // 5. Action Buttons & Red Direction Link
  // ----------------------------------------------------
  actionSection: {
    marginTop: 14,
    paddingHorizontal: 16,
  },
  cantCompleteLinkWrapper: {
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 8,
  },
  cantCompleteLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626', // Red direction link
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  navigateBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#004D40',
    backgroundColor: '#F0FDF4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navigateIcon: {
    fontSize: 14,
  },
  navigateBtnText: {
    color: '#004D40',
    fontSize: 13,
    fontWeight: '700',
  },
  callBuyerBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#004D40',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBuyerBtnText: {
    color: '#004D40',
    fontSize: 13,
    fontWeight: '700',
  },
  arrivedBtn: {
    flex: 1.2,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#004D40',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  arrivedBtnDone: {
    backgroundColor: '#00796B',
  },
  arrivedBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // ----------------------------------------------------
  // 6. Bottom Navigation Bar
  // ----------------------------------------------------
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

export default DeliveryTransitScreen;
