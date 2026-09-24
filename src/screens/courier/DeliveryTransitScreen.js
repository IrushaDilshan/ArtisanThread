import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROUTES } from '../../navigation/routes';

// Vector Live Navigation Map Preview
const NavigationMapPreview = () => (
  <View style={styles.mapContainer}>
    {/* Map Canvas Background */}
    <View style={styles.mapCanvas}>
      {/* Green Parks */}
      <View style={[styles.mapPark, { top: 12, left: 14, width: 75, height: 42 }]} />
      <View style={[styles.mapPark, { bottom: 12, right: 35, width: 90, height: 42 }]} />

      {/* Roads */}
      <View style={[styles.mapRoadH, { top: 40 }]} />
      <View style={[styles.mapRoadH, { top: 92 }]} />
      <View style={[styles.mapRoadV, { left: 95 }]} />
      <View style={[styles.mapRoadV, { right: 85 }]} />
      <View style={styles.mapRoadDiagonal} />

      {/* Labels */}
      <Text style={[styles.mapLabel, { top: 16, right: 90 }]}>SANTA CLARA</Text>
      <Text style={[styles.mapLabel, { top: 22, right: 18 }]}>W HEDDING ST</Text>
      <Text style={[styles.mapLabel, { top: 56, right: 32 }]}>ROSE GARDEN</Text>
      <Text style={[styles.mapLabel, { top: 76, left: 110 }]}>MOORPARK AVE</Text>
      <Text style={[styles.mapLabel, { top: 80, right: 28 }]}>W SAN CARLOS</Text>

      {/* Highway Shields */}
      <View style={[styles.highwayShield, { bottom: 26, left: 24 }]}>
        <Text style={styles.highwayNumber}>82</Text>
      </View>
      <View style={[styles.highwayShield, { bottom: 18, right: 20 }]}>
        <Text style={styles.highwayNumber}>280</Text>
      </View>

      {/* Route Polyline Graphic */}
      {/* Start Courier Point Ring */}
      <View style={styles.courierStartRing}>
        <View style={styles.courierStartInner} />
      </View>

      {/* Polyline Path Segments */}
      <View style={styles.routePolylineSegmentV1} />
      <View style={styles.routePolylineSegmentH} />
      <View style={styles.routePolylineSegmentV2} />

      {/* Red Map Pin Marker at Destination */}
      <View style={styles.destinationPinWrapper}>
        <View style={styles.pinOuter}>
          <View style={styles.pinInnerDot} />
        </View>
        <View style={styles.pinPoint} />
        <View style={styles.pinShadow} />
      </View>
    </View>

    {/* Floating Top-Left ETA Badge: "ETA 11:20 · 8.4 km" */}
    <View style={styles.etaBadge}>
      <Text style={styles.etaBadgeText}>ETA 11:20 · 8.4 km</Text>
    </View>
  </View>
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
  const [activeTab, setActiveTab] = useState('route'); // "Route" tab active in E5
  const [hasArrived, setHasArrived] = useState(false);

  const trackingId = route?.params?.trackingId || 'ATH-2291-KL';
  const buyerPhone = '071 482 0123';

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
      });
    }
  };

  const handleTabPress = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === 'jobs' && navigation?.navigate) {
      navigation.navigate(ROUTES.COURIER.HOME);
    } else if (tabKey === 'route' && navigation?.navigate) {
      navigation.navigate(ROUTES.COURIER.ROUTES);
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
        <NavigationMapPreview />

        {/* 2. Buyer Notification Banner */}
        <View style={styles.buyerNoticeBanner}>
          <View style={styles.noticeCheckCircle}>
            <Text style={styles.noticeCheckmark}>✓</Text>
          </View>
          <View style={styles.noticeTextContainer}>
            <Text style={styles.noticeTitle}>Buyer notified by SMS and in-app</Text>
            <Text style={styles.noticeSubtitle}>Sent to 071 *** 4820 at 09:41:06</Text>
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
              <Text style={styles.stepSubtitle}>09:38 · Payagala</Text>
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
              <Text style={styles.stepTitle}>In transit to Colombo 07</Text>
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
          <Text style={styles.codTitle}>Collect Rs. 2,500.00 on delivery</Text>
          <Text style={styles.codSubtitle}>
            Cash on delivery · exact change preferred
          </Text>
        </View>

        {/* 5. Action Area & Red Direction Link */}
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

          {/* Side-by-Side Action Buttons */}
          <View style={styles.buttonRow}>
            {/* Left Button: Call buyer */}
            <TouchableOpacity
              onPress={handleCallBuyer}
              activeOpacity={0.8}
              style={styles.callBuyerBtn}
            >
              <Text style={styles.callBuyerBtnText}>Call buyer</Text>
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
    height: 180,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  mapCanvas: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F7F8F7',
  },
  mapPark: {
    position: 'absolute',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  mapRoadH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 9,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8E6',
  },
  mapRoadV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 9,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8E6',
  },
  mapRoadDiagonal: {
    position: 'absolute',
    left: -20,
    top: 40,
    width: 260,
    height: 7,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-25deg' }],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8E6',
  },
  mapLabel: {
    position: 'absolute',
    fontSize: 8.5,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  highwayShield: {
    position: 'absolute',
    backgroundColor: '#1E40AF',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E53935',
  },
  highwayNumber: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },

  // Polyline Route Graphic
  courierStartRing: {
    position: 'absolute',
    left: 48,
    bottom: 22,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: '#004D40',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  courierStartInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#004D40',
  },
  routePolylineSegmentV1: {
    position: 'absolute',
    left: 55,
    bottom: 38,
    width: 4,
    height: 60,
    backgroundColor: '#004D40',
    zIndex: 4,
    borderTopLeftRadius: 3,
  },
  routePolylineSegmentH: {
    position: 'absolute',
    left: 55,
    top: 80,
    width: 165,
    height: 4,
    backgroundColor: '#004D40',
    zIndex: 4,
    borderRadius: 2,
  },
  routePolylineSegmentV2: {
    position: 'absolute',
    right: 76,
    top: 28,
    width: 4,
    height: 56,
    backgroundColor: '#004D40',
    zIndex: 4,
    borderTopRightRadius: 3,
  },
  destinationPinWrapper: {
    position: 'absolute',
    top: 14,
    right: 70,
    alignItems: 'center',
    zIndex: 6,
  },
  pinOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
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
    borderTopColor: '#E53935',
    marginTop: -2,
  },
  pinShadow: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    marginTop: 1,
  },

  // Floating ETA Badge
  etaBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  etaBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111E1C',
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
    gap: 12,
    marginTop: 4,
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
    fontSize: 14,
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
