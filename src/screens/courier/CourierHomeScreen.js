import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../navigation/routes';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { courierService, orderService } from '../../services';

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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs');
  const [dbJobs, setDbJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCourierJobs = useCallback(async () => {
    try {
      const [data, artisanOrders] = await Promise.all([
        courierService.getAssignedDeliveries(user?.id, user),
        orderService.getArtisanOrders().catch(() => []),
      ]);

      if (data && data.length > 0) {
        const mapped = data.map((d) => {
          const isDelivered = d.status === 'DELIVERED';
          const isRescheduled = d.status === 'RESCHEDULED';
          const isReturned = d.status === 'RETURNED';
          const isPickup =
            (d.status === 'ASSIGNED' || d.status === 'ARRIVED_AT_ARTISAN') &&
            !isDelivered &&
            !isRescheduled &&
            !isReturned;
          const pickupName = d.pickup_address?.name || 'Artisan Workshop';
          const dropoffName = d.dropoff_address?.name || d.order?.buyer?.full_name || 'Customer Delivery';
          const cityName = isPickup ? (d.pickup_address?.city || 'Local') : (d.dropoff_address?.city || 'Local');

          // Match order to retrieve accurate price / totals
          const matchedOrd = (artisanOrders || []).find(
            (o) =>
              (o.id && (o.id === d.order_id || o.id === d.order?.id)) ||
              (o.tracking_code && (o.tracking_code === d.tracking_code || o.tracking_code === d.id)) ||
              (o.order_number && (o.order_number === d.tracking_code || o.order_number === d.order?.order_number))
          );

          let totalAmount = 0;
          if (d.total_amount) {
            totalAmount = Number(d.total_amount);
          } else if (d.order?.total_amount) {
            totalAmount = Number(d.order.total_amount);
          } else if (matchedOrd?.total_amount || matchedOrd?.rawPrice) {
            totalAmount = Number(matchedOrd.total_amount || matchedOrd.rawPrice);
          } else if (d.recipient_notes) {
            const match =
              d.recipient_notes.match(/(?:COD|LKR|Rs\.?)\s*:?\s*LKR\s*([\d,]+)/i) ||
              d.recipient_notes.match(/LKR\s*([\d,]+)/i) ||
              d.recipient_notes.match(/Rs\.?\s*([\d,]+)/i);
            if (match) {
              totalAmount = Number(match[1].replace(/,/g, ''));
            }
          }

          const isCod =
            d.order?.payment_status === 'cash_on_delivery' ||
            matchedOrd?.payment_status === 'cash_on_delivery' ||
            matchedOrd?.payment_method === 'Cash on Delivery' ||
            Boolean(d.recipient_notes?.includes('COD'));

          // Courier Collections: include COD jobs AND all delivered completed jobs
          const codAmount = (isCod || isDelivered) ? totalAmount : 0;

          let borderHighlight = '#10B981';
          if (isDelivered) {
            borderHighlight = '#10B981';
          } else if (isRescheduled) {
            borderHighlight = '#F59E0B';
          } else if (isReturned) {
            borderHighlight = '#EF4444';
          } else if (isPickup) {
            borderHighlight = '#F59E0B';
          }

          let statusBadgeBg = '#D1FAE5';
          let statusBadgeText = '#065F46';
          if (isDelivered) {
            statusBadgeBg = '#D1FAE5';
            statusBadgeText = '#065F46';
          } else if (isRescheduled) {
            statusBadgeBg = '#FEF3C7';
            statusBadgeText = '#B45309';
          } else if (isReturned) {
            statusBadgeBg = '#FEE2E2';
            statusBadgeText = '#B91C1C';
          } else if (isPickup) {
            statusBadgeBg = '#FEF3C7';
            statusBadgeText = '#92400E';
          }

          const timeBadge = isRescheduled
            ? (d.rescheduled_time || 'Tomorrow am')
            : null;
          const timeBadgeBg = '#EFF6FF';
          const timeBadgeText = '#1D4ED8';

          let detailsText =
            d.pickup_address?.details ||
            d.dropoff_address?.details ||
            `Tracking: ${d.tracking_code}`;
          if (isRescheduled) {
            const reasonStr = d.reschedule_reason ? ` · ${d.reschedule_reason}` : '';
            detailsText = `Rescheduled for ${d.rescheduled_time || 'Tomorrow am'}${reasonStr}`;
          } else if (isReturned) {
            detailsText = `Returned · ${d.return_reason || 'Return initiated'}`;
          }

          let actionLabel = null;
          let actionColor = '#00796B';
          if (isDelivered) {
            actionLabel = null;
          } else if (isRescheduled) {
            actionLabel = 'Re-attempt';
            actionColor = '#D97706';
          } else if (isReturned) {
            actionLabel = null;
          } else if (isPickup) {
            actionLabel = 'Start';
            actionColor = '#00796B';
          } else {
            actionLabel = 'Continue';
            actionColor = '#00796B';
          }

          return {
            id: d.id,
            type: isPickup ? 'pickup' : 'delivery',
            borderHighlight,
            name: isPickup ? pickupName : dropoffName,
            subtitle: `${isPickup ? 'Pickup' : 'Delivery'} · ${cityName}`,
            details: detailsText,
            statusBadge: d.status.replace(/_/g, ' ').toUpperCase(),
            statusBadgeBg,
            statusBadgeText,
            timeBadge,
            timeBadgeBg,
            timeBadgeText,
            isDelivered,
            isRescheduled,
            isReturned,
            actionLabel,
            actionColor,
            isFragile: Boolean(d.recipient_notes?.toLowerCase().includes('fragile')),
            codAmount,
            totalAmount,
            trackingId: d.tracking_code,
          };
        });
        setDbJobs(mapped);
      } else {
        setDbJobs([]);
      }
    } catch (e) {
      console.warn('Courier fetch error:', e.message);
      setDbJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Re-fetch live whenever screen gains focus and reset active tab to 'jobs'
  useFocusEffect(
    useCallback(() => {
      setActiveTab('jobs');
      loadCourierJobs();
    }, [loadCourierJobs])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadCourierJobs();
  };

  const handleAssignDemoJobs = async () => {
    try {
      setRefreshing(true);
      await courierService.assignDemoDeliveriesToCourier(user?.id);
      await loadCourierJobs();
      Alert.alert(
        'Deliveries Assigned! 📦',
        'Database demo deliveries have been connected to your courier account. You can now test the complete courier workflow.'
      );
    } catch (e) {
      Alert.alert('Assignment Error', e.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Strictly real data from database (no mock fallback)
  const activeJobs = dbJobs;
  const pickupsCount = activeJobs.filter(
    (j) => j.type === 'pickup' && !j.isDelivered && !j.isRescheduled && !j.isReturned
  ).length;
  const deliveriesCount = activeJobs.filter((j) => j.type === 'delivery').length;
  const totalCod = activeJobs.reduce((sum, j) => sum + (j.codAmount || 0), 0);

  // Dynamic Date & User metadata
  const todayDateString = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const partnerName = user?.name || user?.full_name || 'Kavinda Fernando';
  const partnerSubtitle = user?.location || user?.metadata?.vehicle || 'Express Delivery Partner · Kalutara route';
  const avatarInitials = partnerName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'KF';

  const handleTabPress = (tabKey) => {
    if (tabKey === 'jobs') {
      setActiveTab('jobs');
    } else if (tabKey === 'route' && navigation?.navigate) {
      navigation.navigate(ROUTES.COURIER.ROUTES);
    } else if (tabKey === 'alerts' && navigation?.navigate) {
      navigation.navigate(ROUTES.COURIER.NOTIFICATIONS);
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />
        }
      >
        {/* Dark Green Header Container (#004D40) */}
        <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 16) }]}>
          {/* Date & Partner Identity */}
          <View style={styles.topRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.dateText}>{todayDateString}</Text>
              <Text
                style={styles.partnerName}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {partnerName}
              </Text>
              <Text style={styles.partnerSubtitle} numberOfLines={1}>
                {partnerSubtitle}
              </Text>
            </View>

            {/* Avatar Badge (Tapping navigates to Courier Profile) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation?.navigate(ROUTES.COURIER.PROFILE)}
              style={styles.avatarBadge}
            >
              <Text style={styles.avatarText}>{avatarInitials}</Text>
            </TouchableOpacity>
          </View>

          {/* 3 Horizontal Stats Cards inside Header */}
          <View style={styles.statsContainer}>
            {/* Card 1: Pickups */}
            <View style={styles.statCard}>
              <Text
                style={styles.statValue}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {pickupsCount}
              </Text>
              <Text style={styles.statLabel} numberOfLines={1}>Pickups</Text>
            </View>

            {/* Card 2: Deliveries */}
            <View style={styles.statCard}>
              <Text
                style={styles.statValue}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {deliveriesCount}
              </Text>
              <Text style={styles.statLabel} numberOfLines={1}>Deliveries</Text>
            </View>

            {/* Card 3: COD to collect (Highlighted in Gold) */}
            <View style={styles.statCard}>
              <Text
                style={styles.statValueGold}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                Rs. {totalCod > 0 ? totalCod.toLocaleString() : '0'}
              </Text>
              <Text style={styles.statLabel} numberOfLines={1}>COD Collection</Text>
            </View>
          </View>
        </View>

        {/* "Today's jobs" Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{"Today's jobs"}</Text>
          <TouchableOpacity
            onPress={() => navigation?.navigate?.(ROUTES.COURIER.ROUTES)}
            activeOpacity={0.7}
          >
            <Text style={styles.routeMapLink}>Route map</Text>
          </TouchableOpacity>
        </View>

        {/* Job List Cards */}
        <View style={styles.jobsList}>
          {loading && !refreshing ? (
            <View style={{ paddingVertical: 32, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={{ marginTop: 8, fontSize: 13, color: '#6B7280' }}>
                Fetching live jobs from Supabase...
              </Text>
            </View>
          ) : activeJobs.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateEmoji}>📦</Text>
              <Text style={styles.emptyStateTitle}>No jobs in Supabase database yet</Text>
              <Text style={styles.emptyStateText}>
                Your app is connected to your live Supabase cloud database! Run the starter seed script in your Supabase SQL Editor to populate sample orders and deliveries.
              </Text>
              <TouchableOpacity
                onPress={onRefresh}
                style={styles.refreshDbBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.refreshDbText}>↻ Refresh from Supabase</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAssignDemoJobs}
                style={[styles.refreshDbBtn, { backgroundColor: '#00796B', marginTop: 10 }]}
                activeOpacity={0.8}
              >
                <Text style={styles.refreshDbText}>⚡ Assign Demo Deliveries to My Account</Text>
              </TouchableOpacity>
            </View>
          ) : (
            activeJobs.map((job) => (
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
                    <Text
                      style={styles.customerName}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {job.name}
                    </Text>

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
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.8}
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
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.8}
                        >
                          {job.statusBadge}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Subtitle: Location / Type */}
                  <Text style={styles.jobSubtitle} numberOfLines={1}>
                    {job.subtitle}
                  </Text>

                  {/* Details: Parcels & Weight */}
                  <Text style={styles.jobDetails} numberOfLines={2} ellipsizeMode="tail">
                    {job.details}
                  </Text>

                  {/* Bottom Row: Tags & Action */}
                  <View style={styles.cardBottomRow}>
                    <View style={styles.tagsContainer}>
                      {job.isFragile && (
                        <View style={styles.fragileBadge}>
                          <Text style={styles.fragileText}>Fragile</Text>
                        </View>
                      )}
                    </View>

                    {job.isDelivered ? (
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert(
                            'Delivery Completed 🎉',
                            `Order ${job.trackingId || job.id} for ${job.name} has been successfully delivered and confirmed!`
                          );
                        }}
                        activeOpacity={0.8}
                        style={styles.deliveredPill}
                      >
                        <Text style={styles.deliveredPillText}>✓ Delivered</Text>
                      </TouchableOpacity>
                    ) : job.isReturned ? (
                      <View style={styles.returnedPill}>
                        <Text style={styles.returnedPillText}>↩ Returned</Text>
                      </View>
                    ) : job.actionLabel ? (
                      <TouchableOpacity
                        onPress={() => {
                          if (job.type === 'pickup' && navigation?.navigate) {
                            navigation.navigate(ROUTES.COURIER.PICKUP_REQUEST, {
                              jobId: job.id,
                              trackingId: job.trackingId,
                            });
                          } else if (navigation?.navigate) {
                            navigation.navigate(ROUTES.COURIER.DELIVERY_TRANSIT, {
                              jobId: job.id,
                              trackingId: job.trackingId,
                            });
                          }
                        }}
                        activeOpacity={0.7}
                        style={[
                          styles.actionBtn,
                          job.isRescheduled && styles.reattemptBtn,
                        ]}
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
                    ) : null}
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
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
    gap: 8,
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#00382E',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  statValueGold: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F59E0B', // Highlighted in yellow/gold
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 9.5,
    color: '#80CBC4',
    marginTop: 3,
    fontWeight: '600',
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
    alignItems: 'flex-start',
    gap: 8,
  },
  customerName: {
    flex: 1,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#111E1C',
    letterSpacing: -0.2,
    lineHeight: 20,
    marginRight: 4,
  },
  badgePill: {
    flexShrink: 0,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    maxWidth: '48%',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginRight: 8,
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
    paddingVertical: 4,
    paddingHorizontal: 6,
    flexShrink: 0,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  deliveredPill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveredPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  reattemptBtn: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  returnedPill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnedPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
  },

  // ----------------------------------------------------
  // Bottom Status Footer Message & Empty State
  // ----------------------------------------------------
  emptyStateContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyStateEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  refreshDbBtn: {
    backgroundColor: '#004D40',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  refreshDbText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
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
