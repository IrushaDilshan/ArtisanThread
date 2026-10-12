import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ROUTES } from '../../navigation/routes';
import { useAuth } from '../../context/AuthContext';
import { courierService } from '../../services';

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

// Vector Menu Icons
const MenuIcon = ({ type }) => {
  switch (type) {
    case 'vehicle':
      return (
        <View style={styles.menuIconContainer}>
          <View style={styles.vehicleCardBox}>
            <View style={styles.vehicleCardStripe} />
            <View style={styles.vehicleCardChip} />
          </View>
        </View>
      );
    case 'earnings':
      return (
        <View style={styles.menuIconContainer}>
          <Text style={styles.rsSymbol}>Rs</Text>
        </View>
      );
    case 'hours':
      return (
        <View style={styles.menuIconContainer}>
          <View style={styles.clockCircle}>
            <View style={styles.clockHourHand} />
            <View style={styles.clockMinuteHand} />
          </View>
        </View>
      );
    case 'support':
      return (
        <View style={styles.menuIconContainer}>
          <View style={styles.supportPinOuter}>
            <View style={styles.supportPinDot} />
          </View>
          <View style={styles.supportPinLine} />
        </View>
      );
    case 'logout':
      return (
        <View style={[styles.menuIconContainer, styles.logoutIconContainer]}>
          <View style={styles.logoutDoor} />
          <View style={styles.logoutArrowLine} />
          <View style={styles.logoutArrowHead} />
        </View>
      );
    default:
      return null;
  }
};

export const CourierProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'vehicle' | 'earnings' | 'hours' | 'support' | null
  const [deliveries, setDeliveries] = useState([]);

  const loadProfileDeliveries = useCallback(async () => {
    try {
      const data = await courierService.getAssignedDeliveries(user?.id, user);
      if (data && Array.isArray(data)) {
        setDeliveries(data);
      }
    } catch (_) {}
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setActiveTab('profile');
      loadProfileDeliveries();
    }, [loadProfileDeliveries])
  );

  const courierName = user?.name || user?.full_name || 'irusha';
  const initials =
    courierName
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'IR';

  const completedDeliveries = deliveries.filter((d) => d.status === 'DELIVERED').length;
  const activeDeliveries = deliveries.filter((d) => d.status !== 'DELIVERED').length;
  const totalDeliveriesDisplay = user?.metadata?.deliveriesCount
    ? String(Number(user.metadata.deliveriesCount) + completedDeliveries)
    : String(128 + completedDeliveries);

  const totalCod = deliveries.reduce((sum, d) => {
    const isCod =
      d.order?.payment_status === 'cash_on_delivery' ||
      Boolean(d.recipient_notes?.includes('COD'));
    const isDelivered = d.status === 'DELIVERED';
    const amount = Number(d.total_amount || d.order?.total_amount || 0);
    return sum + (isCod || isDelivered ? amount : 0);
  }, 0);

  const estimatedPayout = completedDeliveries * 450 + 2500;

  const courierData = {
    name: courierName,
    initials,
    title: user?.badge || 'Express Delivery Partner',
    subRoute: user?.location || user?.metadata?.vehicle || 'Kalutara & suburbs route',
    deliveries: totalDeliveriesDisplay,
    rating: user?.rating || '4.9 ★',
    onTime: '98%',
    vehicleModel: user?.vehicle || user?.metadata?.vehicle || 'Electric Cargo Van #402',
    plateNumber: user?.metadata?.plate || 'WP CAD-8821',
    licenseNo: user?.metadata?.license || 'B-9284102',
    partnerId: 'CR-KAL-8821',
    phone: user?.phone || '+94 77 234 5678',
    totalCod,
    completedDeliveries,
    activeDeliveries,
    estimatedPayout,
  };

  const handleMenuPress = (menuKey) => {
    if (menuKey === 'logout') {
      Alert.alert(
        'Log Out',
        'Are you sure you want to end your courier shift and log out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Log Out',
            style: 'destructive',
            onPress: () => {
              if (logout) logout();
            },
          },
        ]
      );
    } else {
      setActiveModal(menuKey);
    }
  };

  const handleTabPress = (tabKey) => {
    if (tabKey === 'jobs' && navigation?.navigate) {
      navigation.navigate(ROUTES.COURIER.HOME);
    } else if (tabKey === 'route' && navigation?.navigate) {
      navigation.navigate(ROUTES.COURIER.ROUTES);
    } else if (tabKey === 'alerts' && navigation?.navigate) {
      navigation.navigate(ROUTES.COURIER.NOTIFICATIONS);
    } else if (tabKey === 'profile') {
      setActiveTab('profile');
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 1. Header Bar with Back Arrow and Centered Title */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top + 8, 16) }]}>
        <TouchableOpacity
          onPress={() => {
            if (navigation?.navigate) {
              navigation.navigate(ROUTES.COURIER.HOME);
            } else {
              navigation?.goBack();
            }
          }}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Dark Green Top Profile Card */}
        <View style={styles.profileCard}>
          {/* Avatar Circle with initials "KF" */}
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{courierData.initials}</Text>
          </View>

          {/* Details Section */}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{courierData.name}</Text>
            <Text style={styles.profileSubtitle}>{courierData.title}</Text>
            <Text style={styles.profileRoute}>{courierData.subRoute}</Text>

            {/* On Duty Status Badge (Tappable toggle) */}
            <TouchableOpacity
              onPress={() => setIsOnDuty((prev) => !prev)}
              activeOpacity={0.8}
              style={[
                styles.statusBadge,
                !isOnDuty && { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  !isOnDuty && { color: '#9CA3AF' },
                ]}
              >
                {isOnDuty ? '• On duty' : '○ Off duty'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Horizontal Performance Metrics (3 Stat Cards) */}
        <View style={styles.statsRow}>
          {/* Card 1: Deliveries */}
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{courierData.deliveries}</Text>
            <Text style={styles.statLabel}>Deliveries</Text>
          </View>

          {/* Card 2: Rating */}
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{courierData.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>

          {/* Card 3: On-time */}
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{courierData.onTime}</Text>
            <Text style={styles.statLabel}>On-time</Text>
          </View>
        </View>

        {/* 4. List Menu Buttons */}
        <View style={styles.menuList}>
          {/* Vehicle details */}
          <TouchableOpacity
            onPress={() => handleMenuPress('vehicle')}
            activeOpacity={0.8}
            style={styles.menuItem}
          >
            <View style={styles.menuItemLeft}>
              <MenuIcon type="vehicle" />
              <Text style={styles.menuItemText}>Vehicle details</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Earnings & payouts */}
          <TouchableOpacity
            onPress={() => handleMenuPress('earnings')}
            activeOpacity={0.8}
            style={styles.menuItem}
          >
            <View style={styles.menuItemLeft}>
              <MenuIcon type="earnings" />
              <Text style={styles.menuItemText}>Earnings & payouts</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Working hours */}
          <TouchableOpacity
            onPress={() => handleMenuPress('hours')}
            activeOpacity={0.8}
            style={styles.menuItem}
          >
            <View style={styles.menuItemLeft}>
              <MenuIcon type="hours" />
              <Text style={styles.menuItemText}>Working hours</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Help & support */}
          <TouchableOpacity
            onPress={() => handleMenuPress('support')}
            activeOpacity={0.8}
            style={styles.menuItem}
          >
            <View style={styles.menuItemLeft}>
              <MenuIcon type="support" />
              <Text style={styles.menuItemText}>Help & support</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Log out */}
          <TouchableOpacity
            onPress={() => handleMenuPress('logout')}
            activeOpacity={0.8}
            style={styles.logoutItem}
          >
            <View style={styles.menuItemLeft}>
              <MenuIcon type="logout" />
              <Text style={styles.logoutText}>Log out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Detail Bottom Sheet / Modal (strictly on this screen, no external navigation) */}
      <Modal
        visible={Boolean(activeModal)}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActiveModal(null)}
        >
          <TouchableOpacity
            style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}
            activeOpacity={1}
          >
            {activeModal === 'vehicle' && (
              <View>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>🚚 Vehicle Details</Text>
                  <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.modalBody}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Vehicle Model</Text>
                    <Text style={styles.infoValue}>{courierData.vehicleModel}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>License Plate</Text>
                    <Text style={[styles.infoValue, { fontWeight: '800' }]}>{courierData.plateNumber}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Courier Partner ID</Text>
                    <Text style={styles.infoValue}>{courierData.partnerId}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Driving License</Text>
                    <Text style={styles.infoValue}>{courierData.licenseNo}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Cargo Compartment</Text>
                    <Text style={styles.infoValue}>Double-padded racks for fragile crafts</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Transit Fitness</Text>
                    <Text style={[styles.infoValue, { color: '#059669', fontWeight: '700' }]}>
                      Verified & Inspected ✓
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {activeModal === 'earnings' && (
              <View>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>💵 Earnings & Payouts</Text>
                  <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.modalBody}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{"Today's COD Collections"}</Text>
                    <Text style={[styles.infoValue, { color: '#D97706', fontWeight: '800' }]}>
                      Rs. {courierData.totalCod.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Base Pay Rate</Text>
                    <Text style={styles.infoValue}>LKR 450 per delivered parcel</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{"Today's Dropoffs"}</Text>
                    <Text style={styles.infoValue}>{courierData.completedDeliveries} completed dropoffs</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Estimated Shift Payout</Text>
                    <Text style={[styles.infoValue, { color: '#059669', fontWeight: '800' }]}>
                      LKR {courierData.estimatedPayout.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Payout Bank</Text>
                    <Text style={styles.infoValue}>Commercial Bank · Acc ***4108</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Payout Schedule</Text>
                    <Text style={styles.infoValue}>Weekly direct deposit every Tuesday</Text>
                  </View>
                </View>
              </View>
            )}

            {activeModal === 'hours' && (
              <View>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>⏱ Working Hours & Shift</Text>
                  <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.modalBody}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{"Today's Shift Hours"}</Text>
                    <Text style={styles.infoValue}>08:30 AM – 06:00 PM</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Assigned Route</Text>
                    <Text style={styles.infoValue}>{courierData.subRoute}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Duty Status</Text>
                    <Text style={[styles.infoValue, { color: isOnDuty ? '#059669' : '#6B7280', fontWeight: '700' }]}>
                      {isOnDuty ? '🟢 On Duty (Active)' : '⚪ Off Duty (Paused)'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Active Dispatch Depot</Text>
                    <Text style={styles.infoValue}>Kalutara Regional Fulfillment Hub</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Active Logged Hours</Text>
                    <Text style={styles.infoValue}>5h 22m today</Text>
                  </View>
                </View>
              </View>
            )}

            {activeModal === 'support' && (
              <View>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>📞 Courier Dispatch Support</Text>
                  <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.modalBody}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Dispatch Hotline</Text>
                    <Text style={[styles.infoValue, { color: '#00796B', fontWeight: '800' }]}>011 234 5678</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Rider Assistance</Text>
                    <Text style={styles.infoValue}>24/7 Priority Courier Support</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Central Depot</Text>
                    <Text style={styles.infoValue}>No. 45, Temple Road, Kalutara</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => Linking.openURL('tel:0112345678').catch(() => {})}
                    style={styles.callDispatchBtn}
                  >
                    <Text style={styles.callDispatchBtnText}>📞 Call Dispatch Hotline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity
              onPress={() => setActiveModal(null)}
              style={styles.dismissBtn}
            >
              <Text style={styles.dismissBtnText}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 5. Bottom Tab Navigation Bar (Profile active) */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#111E1C',
    fontWeight: '400',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111E1C',
    letterSpacing: -0.2,
  },
  headerSpacer: {
    width: 36,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },

  // ----------------------------------------------------
  // 2. Dark Green Top Profile Card
  // ----------------------------------------------------
  profileCard: {
    backgroundColor: '#004D40',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#156153',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  profileSubtitle: {
    fontSize: 12,
    color: '#D1FAE5',
    marginTop: 2,
    fontWeight: '500',
  },
  profileRoute: {
    fontSize: 12,
    color: '#A7F3D0',
    marginTop: 1,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6EE7B7',
  },

  // ----------------------------------------------------
  // 3. Performance Metrics
  // ----------------------------------------------------
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111E1C',
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },

  // ----------------------------------------------------
  // 4. List Menu Buttons
  // ----------------------------------------------------
  menuList: {
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111E1C',
  },
  chevron: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.2,
    borderColor: '#FEE2E2',
    marginTop: 2,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },

  // Menu Icons Styling
  menuIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleCardBox: {
    width: 20,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.6,
    borderColor: '#004D40',
    position: 'relative',
    justifyContent: 'center',
  },
  vehicleCardStripe: {
    height: 2,
    backgroundColor: '#004D40',
    marginBottom: 2,
  },
  vehicleCardChip: {
    width: 4,
    height: 3,
    borderRadius: 1,
    backgroundColor: '#004D40',
    marginLeft: 2,
  },
  rsSymbol: {
    fontSize: 13,
    fontWeight: '800',
    color: '#004D40',
  },
  clockCircle: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    borderWidth: 1.6,
    borderColor: '#004D40',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  clockHourHand: {
    position: 'absolute',
    width: 1.6,
    height: 5,
    backgroundColor: '#004D40',
    top: 3,
  },
  clockMinuteHand: {
    position: 'absolute',
    width: 4,
    height: 1.6,
    backgroundColor: '#004D40',
    left: 7.5,
  },
  supportPinOuter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.6,
    borderColor: '#004D40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportPinDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#004D40',
  },
  supportPinLine: {
    width: 1.6,
    height: 5,
    backgroundColor: '#004D40',
    marginTop: -1,
  },
  logoutIconContainer: {
    position: 'relative',
  },
  logoutDoor: {
    width: 12,
    height: 15,
    borderWidth: 1.6,
    borderColor: '#EF4444',
    borderRightWidth: 0,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  logoutArrowLine: {
    position: 'absolute',
    left: 10,
    width: 8,
    height: 1.6,
    backgroundColor: '#EF4444',
  },
  logoutArrowHead: {
    position: 'absolute',
    right: 7,
    width: 0,
    height: 0,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderLeftWidth: 4,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#EF4444',
  },

  // ----------------------------------------------------
  // 5. Bottom Navigation Bar
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

  // ----------------------------------------------------
  // 6. Modal / Bottom Sheet Styles
  // ----------------------------------------------------
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111E1C',
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '700',
  },
  modalBody: {
    paddingVertical: 14,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    maxWidth: '60%',
    textAlign: 'right',
  },
  callDispatchBtn: {
    backgroundColor: '#004D40',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  callDispatchBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  dismissBtn: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  dismissBtnText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default CourierProfileScreen;
