import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROUTES } from '../../navigation/routes';
import { courierService } from '../../services/courierService';

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

export const FixAddressScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('jobs');
  const [selectedProblem, setSelectedProblem] = useState('Address not found');
  const [landmarkText, setLandmarkText] = useState('');
  const [pinPosition, setPinPosition] = useState({ x: 215, y: 78 });
  const [isSent, setIsSent] = useState(false);
  const [deliveryData, setDeliveryData] = useState(null);

  const trackingId = route?.params?.trackingId || 'ATH-9942-PY';

  useEffect(() => {
    let isMounted = true;
    courierService.verifyTrackingCode(trackingId).then((del) => {
      if (isMounted && del) {
        setDeliveryData(del);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [trackingId]);

  const artisanName = deliveryData?.pickup_address?.name
    ? deliveryData.pickup_address.name.split(' ')[0]
    : 'Malsha';
  const pickupCity = deliveryData?.pickup_address?.city || 'Payagala';
  const pickupStreet = deliveryData?.pickup_address?.address_line1 || 'Temple Road';

  const problemOptions = [
    'Address not found',
    'No landmark given',
    'Wrong phone number',
    'Nobody at gate',
    'Road blocked / inaccessible',
  ];

  const landmarkChips = [
    '⚡ Beside the temple',
    '⚡ Yellow gate',
    '⚡ 200m past junction',
    '⚡ Opposite BOC bank',
  ];

  // Registered pin fixed reference on map canvas
  const registeredPin = { x: 110, y: 68 };

  // Calculate approximate distance offset in meters
  const dx = pinPosition.x - registeredPin.x;
  const dy = pinPosition.y - registeredPin.y;
  const offsetMeters = Math.max(25, Math.round(Math.sqrt(dx * dx + dy * dy) * 2.2));

  const handleMapPress = (e) => {
    const { locationX, locationY } = e.nativeEvent;
    if (locationX !== undefined && locationY !== undefined) {
      // Keep pin neatly within canvas boundaries
      const clampedX = Math.max(30, Math.min(locationX, 330));
      const clampedY = Math.max(35, Math.min(locationY, 185));
      setPinPosition({ x: clampedX, y: clampedY });
    }
  };

  const handleSnapToGps = () => {
    setPinPosition({ x: 235, y: 88 });
  };

  const handleOpenGoogleMaps = () => {
    const lat = deliveryData?.pickup_lat || 6.773;
    const lng = deliveryData?.pickup_lng || 79.8816;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch(() => {});
  };

  const handleSendCorrection = () => {
    setIsSent(true);

    // Save correction in courier service
    courierService.updateCourierLocation(trackingId, 6.7732, 79.882).catch(() => {});

    Alert.alert(
      'Correction Sent! 🎉',
      `${artisanName} has received your live GPS pin (~${offsetMeters}m correction) and landmark alert: "${
        landmarkText || 'Pin relocated'
      }". You can now proceed with your pickup.`,
      [
        {
          text: 'Return to Pickup',
          onPress: () => navigation?.goBack(),
        },
      ]
    );
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

      {/* 1. Header Section */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 8) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fix this address</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.headerSubtitle}>
          Tell the artisan what's wrong. They get it instantly.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Problem Selection ("What's the problem?") */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>What's the problem?</Text>
          <View style={styles.problemGrid}>
            {problemOptions.map((opt) => {
              const isSelected = selectedProblem === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setSelectedProblem(opt)}
                  activeOpacity={0.8}
                  style={[
                    styles.problemChip,
                    isSelected ? styles.problemChipActive : styles.problemChipInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.problemChipText,
                      isSelected ? styles.problemChipTextActive : styles.problemChipTextInactive,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. Interactive Realistic Map Pinning Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.mapSectionHeaderRow}>
            <Text style={styles.sectionHeading}>Drop a pin where you actually are</Text>
            <Text style={styles.mapHintBadge}>👆 Tap map to drop</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.96}
            onPress={handleMapPress}
            style={styles.mapBox}
          >
            {/* Map Canvas Background */}
            <View style={styles.mapCanvas}>
              {/* Coastal/River water curve */}
              <View style={styles.mapWater} />

              {/* Green Park Areas */}
              <View style={[styles.mapPark, { top: 12, left: 14, width: 75, height: 42 }]} />
              <View style={[styles.mapPark, { bottom: 18, right: 35, width: 90, height: 42 }]} />

              {/* Roads Network */}
              <View style={[styles.mapRoadH, { top: 44 }]} />
              <View style={[styles.mapRoadH, { top: 104 }]} />
              <View style={[styles.mapRoadV, { left: 95 }]} />
              <View style={[styles.mapRoadV, { right: 85 }]} />
              <View style={styles.mapRoadDiagonal} />

              {/* Authentic Sri Lankan Road Labels */}
              <Text style={[styles.mapLabel, { top: 18, left: 108 }]}>A2 GALLE ROAD</Text>
              <Text style={[styles.mapLabel, { top: 52, right: 28 }]}>
                {pickupStreet.toUpperCase()}
              </Text>
              <Text style={[styles.mapLabel, { top: 88, left: 24 }]}>
                {pickupCity.toUpperCase()} JUNCTION
              </Text>
              <Text style={[styles.mapLabel, { bottom: 26, right: 32 }]}>
                RAILWAY STATION RD
              </Text>

              {/* Pin 1: Registered Pin (Gray with Error Cross Circle) */}
              <View
                style={[
                  styles.registeredPinContainer,
                  { left: registeredPin.x - 16, top: registeredPin.y - 20 },
                ]}
              >
                <View style={styles.errorHighlightCircle}>
                  <Text style={styles.errorCross}>✕</Text>
                </View>
                <View style={styles.grayPinOuter}>
                  <View style={styles.grayPinDot} />
                </View>
                <View style={styles.grayPinPoint} />
                <View style={styles.registeredLabelCard}>
                  <Text style={styles.registeredLabel}>⚠️ Registered (Wrong)</Text>
                </View>
              </View>

              {/* Pin 2: Your Pin (Dark Green with Radar Pulse Ring) */}
              <View
                style={[
                  styles.yourPinContainer,
                  { left: pinPosition.x - 15, top: pinPosition.y - 32 },
                ]}
              >
                <View style={styles.radarPulseRing} />
                <View style={styles.greenPinOuter}>
                  <View style={styles.greenPinDot} />
                </View>
                <View style={styles.greenPinPoint} />
                <View style={styles.yourPinCallout}>
                  <Text style={styles.yourPinLabel}>📍 Your Pin (~{offsetMeters}m)</Text>
                </View>
              </View>
            </View>

            {/* Top-Left Floating Badge: Distance offset */}
            <View style={styles.offsetBadge}>
              <Text style={styles.offsetBadgeText}>📏 ~{offsetMeters}m from registered</Text>
            </View>

            {/* Top-Right Floating Badge: Live GPS Mode */}
            <View style={styles.gpsModeBadge}>
              <Text style={styles.gpsModeBadgeText}>🟢 GPS Pin Active</Text>
            </View>

            {/* Bottom-Right Overlay Pill Button: "Snap to live GPS" */}
            <TouchableOpacity
              onPress={handleSnapToGps}
              activeOpacity={0.8}
              style={styles.holdToMoveBadge}
            >
              <Text style={styles.holdToMoveText}>🎯 Snap to my location</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Quick Map Action Row */}
          <View style={styles.mapQuickActionsRow}>
            <TouchableOpacity
              onPress={handleSnapToGps}
              activeOpacity={0.7}
              style={styles.mapQuickActionChip}
            >
              <Text style={styles.mapQuickActionChipText}>📍 Reset to Current GPS</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleOpenGoogleMaps}
              activeOpacity={0.7}
              style={styles.mapQuickActionChip}
            >
              <Text style={styles.mapQuickActionChipText}>🗺️ Open Google Maps ↗</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Landmark Input Box ("Add a landmark (optional)") */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>Add a landmark (optional)</Text>

          {/* Quick Landmark Suggestion Chips */}
          <View style={styles.landmarkChipsRow}>
            {landmarkChips.map((chip, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setLandmarkText(chip.replace('⚡ ', ''))}
                activeOpacity={0.7}
                style={styles.landmarkSuggestChip}
              >
                <Text style={styles.landmarkSuggestText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.landmarkInputContainer}>
            <TextInput
              style={styles.landmarkTextInput}
              placeholder="Yellow gate beside the temple, 200 m past the Payagala junction."
              placeholderTextColor="#9EA8A6"
              multiline
              numberOfLines={3}
              value={landmarkText}
              onChangeText={setLandmarkText}
            />
          </View>
        </View>

        {/* 5. In-App Alert Notice Banner */}
        <View style={styles.noticeBanner}>
          <View style={styles.infoIconCircle}>
            <Text style={styles.infoIconText}>i</Text>
          </View>
          <Text style={styles.noticeText}>
            {artisanName} gets this correction as an in-app alert and an SMS within 60 seconds.
          </Text>
        </View>

        {/* 6. Primary Action Button */}
        <TouchableOpacity
          onPress={handleSendCorrection}
          activeOpacity={0.88}
          style={[styles.sendButton, isSent && styles.sendButtonSent]}
        >
          <Text style={styles.sendButtonText}>
            {isSent ? 'Correction Sent ✓' : 'Send correction'}
          </Text>
        </TouchableOpacity>
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
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    paddingLeft: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // ----------------------------------------------------
  // 2. Problem Selection
  // ----------------------------------------------------
  sectionContainer: {
    marginTop: 16,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111E1C',
    marginBottom: 10,
  },
  problemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  problemChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  problemChipActive: {
    backgroundColor: '#004D40',
  },
  problemChipInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  problemChipText: {
    fontSize: 12,
  },
  problemChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  problemChipTextInactive: {
    color: '#6B7280',
    fontWeight: '500',
  },

  // ----------------------------------------------------
  // 3. Interactive Map Pinning
  // ----------------------------------------------------
  mapSectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mapHintBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00796B',
  },
  mapBox: {
    height: 200,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
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
    height: 11,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  mapRoadV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 11,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
  },
  mapRoadDiagonal: {
    position: 'absolute',
    left: -20,
    top: 45,
    width: 280,
    height: 9,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-22deg' }],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  mapLabel: {
    position: 'absolute',
    fontSize: 8.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },

  // Registered Pin (Gray with Error Cross Circle)
  registeredPinContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 5,
  },
  errorHighlightCircle: {
    position: 'absolute',
    top: -6,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(239, 68, 68, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  errorCross: {
    color: 'rgba(239, 68, 68, 0.4)',
    fontSize: 16,
    fontWeight: '700',
  },
  grayPinOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  grayPinDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
  },
  grayPinPoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#9CA3AF',
    marginTop: -2,
    zIndex: 2,
  },
  registeredLabelCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EF4444',
    marginTop: 2,
  },
  registeredLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#DC2626',
  },

  // Your Pin (Dark Green with Radar Pulse Ring)
  yourPinContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 15,
  },
  radarPulseRing: {
    position: 'absolute',
    top: -6,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 77, 64, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 77, 64, 0.4)',
  },
  greenPinOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#004D40',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  greenPinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  greenPinPoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#004D40',
    marginTop: -2,
  },
  yourPinCallout: {
    backgroundColor: '#004D40',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  yourPinLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Floating Badges on Map
  offsetBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  offsetBadgeText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
  },
  gpsModeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBE6C9',
  },
  gpsModeBadgeText: {
    color: '#065F46',
    fontSize: 10,
    fontWeight: '700',
  },

  // Hold to move pin pill button
  holdToMoveBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  holdToMoveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#004D40',
  },

  // Map Quick Actions
  mapQuickActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  mapQuickActionChip: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapQuickActionChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#004D40',
  },

  // ----------------------------------------------------
  // 4. Landmark Input Box
  // ----------------------------------------------------
  landmarkChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  landmarkSuggestChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  landmarkSuggestText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },

  landmarkInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 76,
  },
  landmarkTextInput: {
    fontSize: 12,
    color: '#111E1C',
    lineHeight: 18,
    textAlignVertical: 'top',
  },

  // ----------------------------------------------------
  // 5. In-App Alert Notice Banner
  // ----------------------------------------------------
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5EE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 14,
    gap: 10,
  },
  infoIconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#004D40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  noticeText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: '#065F46',
    fontWeight: '500',
  },

  // ----------------------------------------------------
  // 6. Primary Action Button
  // ----------------------------------------------------
  sendButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#004D40',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  sendButtonSent: {
    backgroundColor: '#00796B',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ----------------------------------------------------
  // 7. Bottom Navigation Bar
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

export default FixAddressScreen;
