import React, { useState } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROUTES } from '../../navigation/routes';

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

export const FixAddressScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('jobs');
  const [selectedProblem, setSelectedProblem] = useState('Address not found');
  const [landmarkText, setLandmarkText] = useState('');
  const [pinPosition, setPinPosition] = useState({ x: 200, y: 80 });
  const [isSent, setIsSent] = useState(false);

  const problemOptions = [
    'Address not found',
    'No landmark given',
    'Wrong phone number',
    'Nobody at gate',
  ];

  const handleMapPress = (e) => {
    const { locationX, locationY } = e.nativeEvent;
    if (locationX && locationY) {
      setPinPosition({ x: locationX, y: locationY });
    }
  };

  const handleSendCorrection = () => {
    setIsSent(true);
    Alert.alert(
      'Correction Sent!',
      'Malsha has received your live GPS pin and landmark alert. You can now proceed with your pickup.',
      [
        {
          text: 'Return to Pickup',
          onPress: () => navigation?.goBack(),
        },
      ]
    );
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

        {/* 3. Interactive Map Pinning Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>Drop a pin where you actually are</Text>

          <TouchableOpacity
            activeOpacity={0.95}
            onPress={handleMapPress}
            style={styles.mapBox}
          >
            {/* Map Canvas Background */}
            <View style={styles.mapCanvas}>
              {/* Green Park Areas */}
              <View style={[styles.mapPark, { top: 12, left: 14, width: 75, height: 42 }]} />
              <View style={[styles.mapPark, { bottom: 12, right: 35, width: 90, height: 42 }]} />

              {/* Roads */}
              <View style={[styles.mapRoadH, { top: 38 }]} />
              <View style={[styles.mapRoadH, { top: 88 }]} />
              <View style={[styles.mapRoadV, { left: 95 }]} />
              <View style={[styles.mapRoadV, { right: 85 }]} />
              <View style={styles.mapRoadDiagonal} />

              {/* Labels */}
              <Text style={[styles.mapLabel, { top: 16, right: 90 }]}>SANTA CLARA</Text>
              <Text style={[styles.mapLabel, { top: 22, right: 18 }]}>W HEDDING ST</Text>
              <Text style={[styles.mapLabel, { top: 56, right: 32 }]}>ROSE GARDEN</Text>
              <Text style={[styles.mapLabel, { top: 72, left: 110 }]}>MOORPARK AVE</Text>
              <Text style={[styles.mapLabel, { top: 76, right: 28 }]}>W SAN CARLOS</Text>

              {/* Highway Shields */}
              <View style={[styles.highwayShield, { bottom: 26, left: 24 }]}>
                <Text style={styles.highwayNumber}>82</Text>
              </View>
              <View style={[styles.highwayShield, { bottom: 18, right: 20 }]}>
                <Text style={styles.highwayNumber}>280</Text>
              </View>

              {/* Pin 1: Registered Pin (Gray with Error Cross Circle) */}
              <View style={styles.registeredPinContainer}>
                <View style={styles.errorHighlightCircle}>
                  <Text style={styles.errorCross}>✕</Text>
                </View>
                <View style={styles.grayPinOuter}>
                  <View style={styles.grayPinDot} />
                </View>
                <View style={styles.grayPinPoint} />
                <Text style={styles.registeredLabel}>Registered</Text>
              </View>

              {/* Pin 2: Your Pin (Dark Green with Dot) */}
              <View
                style={[
                  styles.yourPinContainer,
                  { left: pinPosition.x - 14, top: pinPosition.y - 32 },
                ]}
              >
                <View style={styles.greenPinOuter}>
                  <View style={styles.greenPinDot} />
                </View>
                <View style={styles.greenPinPoint} />
                <Text style={styles.yourPinLabel}>Your pin</Text>
              </View>
            </View>

            {/* Bottom-Right Overlay Pill Button: "Hold to move pin" */}
            <View style={styles.holdToMoveBadge}>
              <Text style={styles.holdToMoveText}>Hold to move pin</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 4. Landmark Input Box ("Add a landmark (optional)") */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>Add a landmark (optional)</Text>
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
            Malsha gets this correction as an in-app alert and an SMS within 60 seconds.
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
  mapBox: {
    height: 185,
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

  // Registered Pin (Gray)
  registeredPinContainer: {
    position: 'absolute',
    top: 48,
    left: 110,
    alignItems: 'center',
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
  registeredLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },

  // Your Pin (Dark Green)
  yourPinContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
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
  yourPinLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#004D40',
    marginTop: 2,
  },

  // Hold to move pin pill button
  holdToMoveBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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

  // ----------------------------------------------------
  // 4. Landmark Input Box
  // ----------------------------------------------------
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
