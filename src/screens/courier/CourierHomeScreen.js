import React, { useState } from 'react';
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
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../navigation/routes';

// Vector Icon Helpers for Bottom Tab Bar
const TabIcon = ({ name, active }) => {
  const color = active ? '#00796B' : '#9CA3AF';

  switch (name) {
    case 'jobs':
      return (
        <View style={styles.tabIconBox}>
          {/* Home / Briefcase outline shape */}
          <View
            style={[
              styles.homeRoof,
              { borderBottomColor: color },
            ]}
          />
          <View
            style={[
              styles.homeBase,
              { borderColor: color },
            ]}
          />
        </View>
      );
    case 'route':
      return (
        <View style={styles.tabIconBox}>
          {/* Plus / Navigation Cross */}
          <View style={[styles.routeCrossH, { backgroundColor: color }]} />
          <View style={[styles.routeCrossV, { backgroundColor: color }]} />
        </View>
      );
    case 'alerts':
      return (
        <View style={styles.tabIconBox}>
          {/* Speech bubble / notification outline */}
          <View style={[styles.alertBubble, { borderColor: color }]}>
            <View style={[styles.alertTail, { borderTopColor: color }]} />
          </View>
        </View>
      );
    case 'profile':
      return (
        <View style={styles.tabIconBox}>
          {/* User outline */}
          <View style={[styles.userHead, { borderColor: color }]} />
          <View style={[styles.userShoulders, { borderColor: color }]} />
        </View>
      );
    default:
      return null;
  }
};

export const CourierHomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('jobs');

  const jobs = [
    {
      id: 'job-1',
      type: 'pickup',
      borderHighlight: '#F59E0B', // Orange/Amber
      name: 'Malsha Maduwanthi',
      subtitle: 'Pickup · Payagala, Kalutara',
      details: '2 parcels · 1.4 kg',
      timeBadge: '09:00 - 10:00',
      timeBadgeBg: '#FEF3C7',
      timeBadgeText: '#92400E',
      isFragile: true,
      actionLabel: 'Start',
      actionColor: '#00796B',
    },
    {
      id: 'job-2',
      type: 'delivery',
      borderHighlight: '#10B981', // Green
      name: 'Manji Samaranayaka',
      subtitle: 'Delivery · Colombo 07',
      details: '1 parcel · COD Rs. 2,500.00',
      statusBadge: 'In transit',
      statusBadgeBg: '#D1FAE5',
      statusBadgeText: '#065F46',
      actionLabel: 'Continue',
      actionColor: '#00796B',
    },
    {
      id: 'job-3',
      type: 'pickup',
      borderHighlight: '#9CA3AF', // Gray
      name: 'Nimali Handloom Works',
      subtitle: 'Pickup · Beruwala',
      details: '3 parcels · 2.8 kg',
      statusBadge: 'Scheduled 14:00',
      statusBadgeBg: '#F3F4F6',
      statusBadgeText: '#4B5563',
    },
  ];

  const handleTabPress = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === 'route' && navigation?.navigate) {
      navigation.navigate(ROUTES.COURIER.ROUTES);
    } else if (tabKey === 'profile' && navigation?.navigate) {
      navigation.navigate(ROUTES.COURIER.PROFILE);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#004D40" />

      {/* Main Scroll Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dark Green Header Container (#004D40) */}
        <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 16) }]}>
          {/* Date & Partner Identity */}
          <View style={styles.topRow}>
            <View>
              <Text style={styles.dateText}>Thursday, 24 July</Text>
              <Text style={styles.partnerName}>Kavinda Fernando</Text>
              <Text style={styles.partnerSubtitle}>
                Express Delivery Partner · Kalutara route
              </Text>
            </View>

            {/* Avatar Badge "KF" */}
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarText}>KF</Text>
            </View>
          </View>

          {/* 3 Horizontal Stats Cards inside Header */}
          <View style={styles.statsContainer}>
            {/* Card 1: 6 Pickups */}
            <View style={styles.statCard}>
              <Text style={styles.statValue}>6</Text>
              <Text style={styles.statLabel}>Pickups</Text>
            </View>

            {/* Card 2: 4 Deliveries */}
            <View style={styles.statCard}>
              <Text style={styles.statValue}>4</Text>
              <Text style={styles.statLabel}>Deliveries</Text>
            </View>

            {/* Card 3: Rs. 2,500 COD to collect (Highlighted in Gold) */}
            <View style={styles.statCard}>
              <Text style={styles.statValueGold}>Rs. 2,500</Text>
              <Text style={styles.statLabel}>COD to collect</Text>
            </View>
          </View>
        </View>

        {/* "Today's jobs" Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Today's jobs</Text>
          <TouchableOpacity
            onPress={() => navigation?.navigate?.(ROUTES.COURIER.ROUTES)}
            activeOpacity={0.7}
          >
            <Text style={styles.routeMapLink}>Route map</Text>
          </TouchableOpacity>
        </View>

        {/* Job List Cards */}
        <View style={styles.jobsList}>
          {jobs.map((job) => (
            <View key={job.id} style={styles.jobCard}>
              {/* Left colored border highlight */}
              <View
                style={[
                  styles.leftStripe,
                  { backgroundColor: job.borderHighlight },
                ]}
              />

              <View style={styles.cardMain}>
                {/* Top Row: Name + Badges */}
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.customerName}>{job.name}</Text>

                  {job.timeBadge && (
                    <View
                      style={[
                        styles.badgePill,
                        { backgroundColor: job.timeBadgeBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: job.timeBadgeText },
                        ]}
                      >
                        {job.timeBadge}
                      </Text>
                    </View>
                  )}

                  {job.statusBadge && (
                    <View
                      style={[
                        styles.badgePill,
                        { backgroundColor: job.statusBadgeBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: job.statusBadgeText },
                        ]}
                      >
                        {job.statusBadge}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Subtitle: Location / Type */}
                <Text style={styles.jobSubtitle}>{job.subtitle}</Text>

                {/* Details: Parcels & Weight */}
                <Text style={styles.jobDetails}>{job.details}</Text>

                {/* Bottom Row: Tags & Action */}
                <View style={styles.cardBottomRow}>
                  <View style={styles.tagsContainer}>
                    {job.isFragile && (
                      <View style={styles.fragileBadge}>
                        <Text style={styles.fragileText}>Fragile</Text>
                      </View>
                    )}
                  </View>

                  {job.actionLabel && (
                    <TouchableOpacity
                      onPress={() => {
                        if (job.id === 'job-1' && navigation?.navigate) {
                          navigation.navigate(ROUTES.COURIER.PICKUP_REQUEST);
                        } else if (job.id === 'job-2' && navigation?.navigate) {
                          navigation.navigate(ROUTES.COURIER.DELIVERY_TRANSIT);
                        }
                      }}
                      activeOpacity={0.7}
                      style={styles.actionBtn}
                    >
                      <Text
                        style={[
                          styles.actionBtnText,
                          { color: job.actionColor },
                        ]}
                      >
                        {job.actionLabel}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom Status Message */}
        <Text style={styles.statusFooterMessage}>
          That's every job assigned for today.
        </Text>
      </ScrollView>

      {/* Bottom Navigation Bar */}
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
  scrollContent: {
    paddingBottom: 24,
  },

  // ----------------------------------------------------
  // Header Container (#004D40)
  // ----------------------------------------------------
  headerContainer: {
    backgroundColor: '#004D40',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#80CBC4',
    fontWeight: '500',
    marginBottom: 4,
  },
  partnerName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  partnerSubtitle: {
    fontSize: 11,
    color: '#B2DFDB',
    marginTop: 3,
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00796B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.5,
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#00382E',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  statValueGold: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F59E0B', // Highlighted in yellow/gold
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 10,
    color: '#80CBC4',
    marginTop: 3,
    fontWeight: '500',
  },

  // ----------------------------------------------------
  // "Today's jobs" Section Header
  // ----------------------------------------------------
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111E1C',
    letterSpacing: -0.2,
  },
  routeMapLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00796B',
  },

  // ----------------------------------------------------
  // Job List Cards
  // ----------------------------------------------------
  jobsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EDF2F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  leftStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4.5,
  },
  cardMain: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingLeft: 18,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111E1C',
    letterSpacing: -0.2,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  jobSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },
  jobDetails: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fragileBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  fragileText: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '700',
  },
  actionBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // ----------------------------------------------------
  // Bottom Status Footer Message
  // ----------------------------------------------------
  statusFooterMessage: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },

  // ----------------------------------------------------
  // Bottom Navigation Bar
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

  // Custom Vector Icon Primitives
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

export default CourierHomeScreen;
