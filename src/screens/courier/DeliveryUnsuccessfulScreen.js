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
  KeyboardAvoidingView,
  Platform,
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

const REASONS = [
  'Nobody was at the address',
  'Address could not be found',
  'Buyer refused the parcel',
  'Cash was not ready',
];

const RESCHEDULE_TIMES = [
  'Today, 5 pm',
  'Tomorrow am',
  'Tomorrow pm',
];

export const DeliveryUnsuccessfulScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('route');

  // Selected Reason Radio (defaults to "Nobody was at the address" matching UI)
  const [selectedReason, setSelectedReason] = useState('Nobody was at the address');

  // Selected Reschedule Time Chip (defaults to "Today, 5 pm" matching UI)
  const [selectedTime, setSelectedTime] = useState('Today, 5 pm');

  // Detailed note text input
  const [note, setNote] = useState('');

  const trackingId = route?.params?.trackingId || 'ATH-2291-KL';

  const handleReschedule = () => {
    Alert.alert(
      'Delivery Rescheduled ⏱️',
      `Parcel ${trackingId} is scheduled to re-attempt delivery ${selectedTime.toLowerCase()}.\n\nReason: "${selectedReason}"\nBoth buyer and artisan have been updated.`,
      [
        {
          text: 'Back to Jobs',
          onPress: () => navigation?.navigate?.(ROUTES.COURIER.HOME),
        },
      ]
    );
  };

  const handleReturn = () => {
    Alert.alert(
      'Return to Artisan? ↩️',
      `Mark parcel ${trackingId} for return to Malsha Maduwanthi?\n\nReason: "${selectedReason}"`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Return',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Return Initiated',
              `Return manifest updated. Keep parcel safe in transit until handover to artisan.`,
              [
                {
                  text: 'Back to Jobs',
                  onPress: () => navigation?.navigate?.(ROUTES.COURIER.HOME),
                },
              ]
            );
          },
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
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery unsuccessful</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Subtitle description */}
          <Text style={styles.subtitleText}>
            The buyer and Malsha both see whatever you record here, so keep it accurate.
          </Text>

          {/* 2. Reason Selection Radio Group */}
          <Text style={styles.sectionHeading}>Why couldn't it be delivered?</Text>
          <View style={styles.radioGroup}>
            {REASONS.map((reason) => {
              const isSelected = selectedReason === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  onPress={() => setSelectedReason(reason)}
                  activeOpacity={0.8}
                  style={[
                    styles.radioCard,
                    isSelected && styles.radioCardSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                  <Text
                    style={[
                      styles.radioLabel,
                      isSelected && styles.radioLabelSelected,
                    ]}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 3. Reschedule Time Chips ("Try again") */}
          <Text style={styles.sectionHeading}>Try again</Text>
          <View style={styles.chipsRow}>
            {RESCHEDULE_TIMES.map((timeOption) => {
              const isSelected = selectedTime === timeOption;
              return (
                <TouchableOpacity
                  key={timeOption}
                  onPress={() => setSelectedTime(timeOption)}
                  activeOpacity={0.8}
                  style={[
                    styles.chip,
                    isSelected && styles.chipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}
                  >
                    {timeOption}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 4. Detailed Note Input Box ("What happened?") */}
          <Text style={styles.sectionHeading}>What happened?</Text>
          <View style={styles.noteInputCard}>
            <TextInput
              style={styles.noteInput}
              multiline
              numberOfLines={3}
              placeholder="Called twice at 11:24 and 11:31, no answer.&#10;Left a note with the security officer."
              placeholderTextColor="#9CA3AF"
              value={note}
              onChangeText={setNote}
              textAlignVertical="top"
            />
          </View>

          {/* 5. Storage Instruction Banner */}
          <View style={styles.storageBanner}>
            <Text style={styles.storageTitle}>Parcel stays with you overnight</Text>
            <Text style={styles.storageSubtitle}>
              Keep the fragile packaging sealed and flat.
            </Text>
          </View>

          {/* 6. Bottom Action Buttons: Reschedule & Return */}
          <View style={styles.actionButtonsRow}>
            {/* Left Button: Reschedule */}
            <TouchableOpacity
              onPress={handleReschedule}
              activeOpacity={0.88}
              style={styles.rescheduleBtn}
            >
              <Text style={styles.rescheduleBtnText}>Reschedule</Text>
            </TouchableOpacity>

            {/* Right Button: Return */}
            <TouchableOpacity
              onPress={handleReturn}
              activeOpacity={0.88}
              style={styles.returnBtn}
            >
              <Text style={styles.returnBtnText}>Return</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 7. Bottom Tab Navigation Bar */}
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
  keyboardContainer: {
    flex: 1,
  },

  // ----------------------------------------------------
  // 1. Header Section
  // ----------------------------------------------------
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 6,
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
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },
  subtitleText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#6B7280',
    marginBottom: 18,
  },

  // ----------------------------------------------------
  // 2. Reason Selection Radio Group
  // ----------------------------------------------------
  sectionHeading: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#111E1C',
    marginBottom: 10,
    marginTop: 6,
  },
  radioGroup: {
    gap: 8,
    marginBottom: 12,
  },
  radioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  radioCardSelected: {
    borderColor: '#004D40',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },
  radioCircleSelected: {
    borderColor: '#004D40',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#004D40',
  },
  radioLabel: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
    flex: 1,
  },
  radioLabelSelected: {
    color: '#111E1C',
    fontWeight: '700',
  },

  // ----------------------------------------------------
  // 3. Reschedule Time Chips
  // ----------------------------------------------------
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: '#004D40',
    borderColor: '#004D40',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // ----------------------------------------------------
  // 4. Detailed Note Input Box
  // ----------------------------------------------------
  noteInputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 74,
    marginBottom: 14,
  },
  noteInput: {
    fontSize: 12,
    color: '#111E1C',
    lineHeight: 18,
    padding: 0,
    margin: 0,
  },

  // ----------------------------------------------------
  // 5. Storage Instruction Banner
  // ----------------------------------------------------
  storageBanner: {
    backgroundColor: '#FFF7EC',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  storageTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  storageSubtitle: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },

  // ----------------------------------------------------
  // 6. Bottom Action Buttons
  // ----------------------------------------------------
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  rescheduleBtn: {
    flex: 1.3,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#004D40',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  rescheduleBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  returnBtn: {
    flex: 0.9,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
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

export default DeliveryUnsuccessfulScreen;
