import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
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

const NOTIFICATION_ITEMS = [
  {
    id: 'n1',
    type: 'pickup',
    title: 'New Pickup Ready',
    description: 'Malsha Maduwanthi has packed ATH-2291-KL (Fragile Batik). Ready at Payagala workshop.',
    time: '10 mins ago',
    unread: true,
  },
  {
    id: 'n2',
    type: 'rescheduled',
    title: 'Delivery Rescheduled',
    description: 'Manji Samaranayaka requested delivery shift to Today, 5:00 PM for Gregory Road order.',
    time: '35 mins ago',
    unread: true,
  },
  {
    id: 'n3',
    type: 'delivered',
    title: 'COD Collected Successfully',
    description: 'Rs. 2,500.00 collected from Colombo 07 recipient and recorded to artisan balance.',
    time: '1 hour ago',
    unread: false,
  },
  {
    id: 'n4',
    type: 'failed',
    title: 'Address Verification Needed',
    description: 'Pin updated by artisan for Temple Road gateway. Check corrected route map.',
    time: '2 hours ago',
    unread: false,
  },
];

export const CourierNotificationsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('alerts');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Enforce Alerts tab as active whenever this screen is focused
  useFocusEffect(
    useCallback(() => {
      setActiveTab('alerts');
    }, [])
  );

  const handleTabPress = (tabKey) => {
    if (tabKey === 'jobs' && navigation?.navigate) {
      navigation.navigate(ROUTES.COURIER.HOME);
    } else if (tabKey === 'route' && navigation?.navigate) {
      navigation.navigate(ROUTES.COURIER.ROUTES);
    } else if (tabKey === 'alerts') {
      setActiveTab('alerts');
    } else if (tabKey === 'profile' && navigation?.navigate) {
      navigation.navigate(ROUTES.COURIER.PROFILE);
    }
  };

  const filteredNotifications =
    selectedFilter === 'all'
      ? NOTIFICATION_ITEMS
      : NOTIFICATION_ITEMS.filter((item) => item.type === selectedFilter);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 1. Header Bar with Back Arrow and Title */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 8) }]}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. "Today's route" Status Card */}
        <View style={styles.statusCard}>
          {/* Card Header Row with Title and Live Badge */}
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeading}>Today's route</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>Live</Text>
            </View>
          </View>

          {/* Subtitle */}
          <Text style={styles.cardSubheading}>
            12 deliveries · 3 pending actions
          </Text>

          {/* Multi-Color Summary Status Chips Grid */}
          <View style={styles.chipsContainer}>
            {/* 1. Green Pill: 3 delivered */}
            <TouchableOpacity
              onPress={() => setSelectedFilter(selectedFilter === 'delivered' ? 'all' : 'delivered')}
              activeOpacity={0.8}
              style={[
                styles.chip,
                styles.deliveredChip,
                selectedFilter === 'delivered' && styles.chipActiveBorder,
              ]}
            >
              <View style={[styles.chipDot, styles.deliveredDot]} />
              <Text style={[styles.chipText, styles.deliveredText]}>
                3 delivered
              </Text>
            </TouchableOpacity>

            {/* 2. Orange Pill: 2 rescheduled */}
            <TouchableOpacity
              onPress={() => setSelectedFilter(selectedFilter === 'rescheduled' ? 'all' : 'rescheduled')}
              activeOpacity={0.8}
              style={[
                styles.chip,
                styles.rescheduledChip,
                selectedFilter === 'rescheduled' && styles.chipActiveBorder,
              ]}
            >
              <View style={[styles.chipDot, styles.rescheduledDot]} />
              <Text style={[styles.chipText, styles.rescheduledText]}>
                2 rescheduled
              </Text>
            </TouchableOpacity>

            {/* 3. Purple Pill: 1 pickup */}
            <TouchableOpacity
              onPress={() => setSelectedFilter(selectedFilter === 'pickup' ? 'all' : 'pickup')}
              activeOpacity={0.8}
              style={[
                styles.chip,
                styles.pickupChip,
                selectedFilter === 'pickup' && styles.chipActiveBorder,
              ]}
            >
              <View style={[styles.chipDot, styles.pickupDot]} />
              <Text style={[styles.chipText, styles.pickupText]}>
                1 pickup
              </Text>
            </TouchableOpacity>

            {/* 4. Red Pill: 1 failed */}
            <TouchableOpacity
              onPress={() => setSelectedFilter(selectedFilter === 'failed' ? 'all' : 'failed')}
              activeOpacity={0.8}
              style={[
                styles.chip,
                styles.failedChip,
                selectedFilter === 'failed' && styles.chipActiveBorder,
              ]}
            >
              <View style={[styles.chipDot, styles.failedDot]} />
              <Text style={[styles.chipText, styles.failedText]}>
                1 failed
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Activity Feed Section */}
        <Text style={styles.sectionTitle}>Recent updates</Text>
        <View style={styles.feedList}>
          {filteredNotifications.map((notif) => (
            <View key={notif.id} style={styles.feedCard}>
              <View style={styles.feedHeaderRow}>
                <View style={styles.feedTitleGroup}>
                  {notif.unread && <View style={styles.unreadIndicator} />}
                  <Text style={styles.feedTitle}>{notif.title}</Text>
                </View>
                <Text style={styles.feedTime}>{notif.time}</Text>
              </View>
              <Text style={styles.feedDescription}>{notif.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 3. Bottom Tab Navigation Bar ("Alerts" active) */}
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
    backgroundColor: '#FAFAF9',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
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
  // 2. "Today's route" Status Card
  // ----------------------------------------------------
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EDF2F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#004D40',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  cardSubheading: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 14,
  },

  // Chips Layout
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipActiveBorder: {
    borderWidth: 1.8,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: '700',
  },

  // Delivered Pill (Green)
  deliveredChip: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  deliveredDot: {
    backgroundColor: '#059669',
  },
  deliveredText: {
    color: '#047857',
  },

  // Rescheduled Pill (Orange)
  rescheduledChip: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  rescheduledDot: {
    backgroundColor: '#D97706',
  },
  rescheduledText: {
    color: '#B45309',
  },

  // Pickup Pill (Purple)
  pickupChip: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  pickupDot: {
    backgroundColor: '#7C3AED',
  },
  pickupText: {
    color: '#6D28D9',
  },

  // Failed Pill (Red)
  failedChip: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  failedDot: {
    backgroundColor: '#DC2626',
  },
  failedText: {
    color: '#B91C1C',
  },

  // Activity Feed
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111E1C',
    marginBottom: 10,
    marginLeft: 2,
  },
  feedList: {
    gap: 10,
  },
  feedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  feedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  feedTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unreadIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00796B',
  },
  feedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111E1C',
  },
  feedTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  feedDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
  },

  // ----------------------------------------------------
  // 3. Bottom Navigation Bar
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

export default CourierNotificationsScreen;
