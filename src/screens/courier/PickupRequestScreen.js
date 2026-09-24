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

// Vector Map Preview Graphic
const MapPreview = () => (
  <View style={styles.mapContainer}>
    {/* Map Terrain Grid & Parks */}
    <View style={styles.mapCanvas}>
      {/* Green park patches */}
      <View style={[styles.mapPark, { top: 12, left: 18, width: 80, height: 45 }]} />
      <View style={[styles.mapPark, { bottom: 10, right: 30, width: 100, height: 40 }]} />

      {/* Roads & Highways */}
      <View style={[styles.mapRoadH, { top: 38 }]} />
      <View style={[styles.mapRoadH, { top: 86 }]} />
      <View style={[styles.mapRoadV, { left: 90 }]} />
      <View style={[styles.mapRoadV, { right: 80 }]} />
      <View style={[styles.mapRoadDiagonal]} />

      {/* Street labels */}
      <Text style={[styles.mapLabel, { top: 24, left: 24 }]}>ROSE GARDEN</Text>
      <Text style={[styles.mapLabel, { top: 72, left: 104 }]}>MOORPARK AVE</Text>
      <Text style={[styles.mapLabel, { top: 48, right: 28 }]}>W SAN CARLOS</Text>

      {/* Highway shield badges */}
      <View style={[styles.highwayShield, { bottom: 30, left: 34 }]}>
        <Text style={styles.highwayNumber}>82</Text>
      </View>
      <View style={[styles.highwayShield, { bottom: 20, right: 24 }]}>
        <Text style={styles.highwayNumber}>280</Text>
      </View>

      {/* Red Location Pin in Center */}
      <View style={styles.centerPinWrapper}>
        <View style={styles.pinOuter}>
          <View style={styles.pinInnerDot} />
        </View>
        <View style={styles.pinPoint} />
        <View style={styles.pinShadow} />
      </View>
    </View>

    {/* Floating Top-Right Badge: "GPS pin confirmed" */}
    <View style={styles.gpsBadge}>
      <Text style={styles.gpsBadgeText}>GPS pin confirmed</Text>
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

export const PickupRequestScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('jobs');
  const [hasArrived, setHasArrived] = useState(false);

  const artisan = {
    name: 'Malsha Maduwanthi',
    initials: 'MM',
    subtitle: 'Batik & handicraft workshop',
    phone: '077 412 6688',
    address: {
      house: 'No. 142/B',
      street: 'Temple Road',
      city: 'Payagala',
      district: 'Kalutara',
      postalCode: '12070',
    },
    fragileDetails: '2 parcels · 1.4 kg · hand-dyed batik, do not fold',
  };

  const handleCall = () => {
    Linking.openURL(`tel:${artisan.phone.replace(/\s+/g, '')}`).catch(() => {});
  };

  const handleFixAddress = () => {
    if (navigation?.navigate) {
      navigation.navigate(ROUTES.COURIER.FIX_ADDRESS || 'FixAddressScreen');
    }
  };

  const handleNavigate = () => {
    // Open maps or route view
    if (navigation?.navigate) {
      navigation.navigate(ROUTES.COURIER.ROUTES);
    }
  };

  const handleArrived = () => {
    setHasArrived(true);
    if (navigation?.navigate) {
      navigation.navigate(ROUTES.COURIER.SCAN_PARCEL);
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
        <MapPreview />

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
    height: 175,
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
    width: 250,
    height: 7,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-25deg' }],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8E6',
  },
  mapLabel: {
    position: 'absolute',
    fontSize: 9,
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
  centerPinWrapper: {
    position: 'absolute',
    top: '46%',
    left: '50%',
    marginLeft: -12,
    marginTop: -24,
    alignItems: 'center',
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
  gpsBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBE6C9',
  },
  gpsBadgeText: {
    color: '#065F46',
    fontSize: 10,
    fontWeight: '700',
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
    alignItems: 'center',
    justifyContent: 'center',
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
