import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
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

export const ConfirmDeliveryScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('jobs');

  // 4-digit OTP state matching screenshot (default: 4, 8, empty, empty)
  const [digits, setDigits] = useState(['4', '8', '', '']);
  const inputRefs = useRef([]);

  // Cash on delivery collected toggle
  const [isCodCollected, setIsCodCollected] = useState(true);

  // Photo upload state
  const [photoTaken, setPhotoTaken] = useState(false);

  // Signature state
  const [hasSignature, setHasSignature] = useState(true);

  const recipient = {
    name: 'Manji Samaranayaka',
    initials: 'MS',
    address: 'No. 21, Gregory Road, Colombo 07',
    phoneTag: '071 *** 4820 verified',
    codAmount: 'Rs. 2,500.00',
  };

  const handleDigitChange = (val, index) => {
    const char = val.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    if (char && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleClearSignature = () => {
    setHasSignature(false);
  };

  const handleMarkDelivered = () => {
    Alert.alert(
      'Delivery Completed! 🎉',
      `Order for ${recipient.name} has been successfully delivered and COD ${recipient.codAmount} recorded.`,
      [
        {
          text: 'Rate Artisan',
          onPress: () => navigation?.navigate?.(ROUTES.COURIER.RATINGS),
        },
        {
          text: 'Back to Manifest',
          onPress: () => navigation?.navigate?.(ROUTES.COURIER.HOME),
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
        <Text style={styles.headerTitle}>Confirm delivery</Text>
        <View style={styles.headerRightDot} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Recipient Info Card */}
        <View style={styles.recipientCard}>
          <View style={styles.recipientRow}>
            {/* Avatar Circle with Initials "MS" */}
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{recipient.initials}</Text>
            </View>

            <View style={styles.recipientInfo}>
              <Text style={styles.recipientName}>{recipient.name}</Text>
              <Text style={styles.recipientAddress}>{recipient.address}</Text>

              {/* Verified Phone Pill Badge */}
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>✓  {recipient.phoneTag}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3. Delivery Verification Code (4-digit OTP) */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Delivery code from the buyer</Text>
          <Text style={styles.sectionSubtitle}>
            Ask them to read the 4 digits in their app.
          </Text>

          {/* 4 OTP Input Boxes */}
          <View style={styles.otpBoxesRow}>
            {digits.map((digit, idx) => {
              const isFilled = Boolean(digit);
              const isCurrent = !digit && (idx === 0 || digits[idx - 1]);
              return (
                <View
                  key={idx}
                  style={[
                    styles.otpBoxWrapper,
                    isFilled && styles.otpBoxWrapperFilled,
                    isCurrent && styles.otpBoxWrapperActive,
                  ]}
                >
                  <TextInput
                    ref={(ref) => (inputRefs.current[idx] = ref)}
                    style={styles.otpInput}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(val) => handleDigitChange(val, idx)}
                    onKeyPress={(e) => handleKeyPress(e, idx)}
                    selectTextOnFocus
                  />
                  {/* Blinking/Cursor indicator for active empty box matching E6 */}
                  {isCurrent && <View style={styles.cursorBar} />}
                </View>
              );
            })}
          </View>
        </View>

        {/* 4. Cash on Delivery (COD) Switch Card */}
        <View style={styles.sectionBlock}>
          <View style={styles.codHeaderRow}>
            <Text style={styles.sectionTitle}>Cash on delivery</Text>
            {isCodCollected && (
              <Text style={styles.codStatusTag}>Collected</Text>
            )}
          </View>

          <View style={styles.codCard}>
            <View style={styles.codTextSide}>
              <Text style={styles.codAmount}>{recipient.codAmount}</Text>
              <Text style={styles.codSubtext}>Settles to Malsha within 24 hours</Text>
            </View>

            {/* Active Green Toggle Switch */}
            <Switch
              value={isCodCollected}
              onValueChange={setIsCodCollected}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#D1D5DB"
            />
          </View>
        </View>

        {/* 5. Photo Upload Proof Area ("Photo of the handover") */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Photo of the handover</Text>

          <TouchableOpacity
            onPress={() => setPhotoTaken(!photoTaken)}
            activeOpacity={0.8}
            style={[
              styles.dashedPhotoCard,
              photoTaken && styles.dashedPhotoCardDone,
            ]}
          >
            <View style={styles.cameraCircle}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
            <Text style={styles.photoMainText}>
              {photoTaken ? 'Photo Captured ✓ (Tap to replace)' : 'Take a photo'}
            </Text>
            <Text style={styles.photoSubText}>
              Needed when nobody signs for the parcel
            </Text>
          </TouchableOpacity>
        </View>

        {/* 6. Recipient Signature Box */}
        <View style={styles.signatureCard}>
          <View style={styles.signatureHeaderRow}>
            <Text style={styles.signatureTitle}>Recipient signature</Text>
            <TouchableOpacity onPress={handleClearSignature} activeOpacity={0.7}>
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>

          {/* Signature Canvas Area */}
          <TouchableOpacity
            onPress={() => setHasSignature(true)}
            activeOpacity={0.9}
            style={styles.signatureCanvasArea}
          >
            {hasSignature ? (
              <View style={styles.signatureWaveContainer}>
                {/* Wavy Signature Path Graphic matching E6 */}
                <View style={styles.signatureWaveArc1} />
                <View style={styles.signatureWaveArc2} />
                <View style={styles.signatureWaveArc3} />
              </View>
            ) : (
              <Text style={styles.signaturePlaceholder}>
                Sign here with finger...
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 7. Bottom Primary Action Button */}
        <TouchableOpacity
          onPress={handleMarkDelivered}
          activeOpacity={0.88}
          style={styles.deliverBtn}
        >
          <Text style={styles.deliverBtnText}>Mark as delivered</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 8. Bottom Tab Navigation Bar */}
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
  headerRightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // ----------------------------------------------------
  // 2. Recipient Info Card
  // ----------------------------------------------------
  recipientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDF2F0',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D6EBE4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#004D40',
    fontWeight: '800',
    fontSize: 14,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111E1C',
    letterSpacing: -0.2,
  },
  recipientAddress: {
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

  // ----------------------------------------------------
  // 3. Delivery Code Section
  // ----------------------------------------------------
  sectionBlock: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111E1C',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 10,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  otpBoxWrapper: {
    flex: 1,
    height: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  otpBoxWrapperFilled: {
    borderColor: '#004D40',
  },
  otpBoxWrapperActive: {
    borderColor: '#004D40',
  },
  otpInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: '#111E1C',
  },
  cursorBar: {
    position: 'absolute',
    width: 2,
    height: 22,
    backgroundColor: '#00796B',
  },

  // ----------------------------------------------------
  // 4. Cash on Delivery (COD) Switch Card
  // ----------------------------------------------------
  codHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codStatusTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00796B',
  },
  codCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#EDF2F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codTextSide: {
    flex: 1,
  },
  codAmount: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111E1C',
    letterSpacing: -0.3,
  },
  codSubtext: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },

  // ----------------------------------------------------
  // 5. Photo of the Handover
  // ----------------------------------------------------
  dashedPhotoCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    backgroundColor: '#FAFAF9',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  dashedPhotoCardDone: {
    borderColor: '#004D40',
    backgroundColor: '#E0F2F1',
  },
  cameraCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D6EBE4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cameraIcon: {
    fontSize: 18,
  },
  photoMainText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#004D40',
  },
  photoSubText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },

  // ----------------------------------------------------
  // 6. Recipient Signature Box
  // ----------------------------------------------------
  signatureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EDF2F0',
    padding: 14,
    marginTop: 18,
  },
  signatureHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  signatureTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111E1C',
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706', // Orange / Gold
  },
  signatureCanvasArea: {
    height: 52,
    justifyContent: 'center',
  },
  signatureWaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    gap: -4,
  },
  signatureWaveArc1: {
    width: 32,
    height: 20,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 2.5,
    borderTopColor: '#111E1C',
    transform: [{ rotate: '15deg' }],
  },
  signatureWaveArc2: {
    width: 36,
    height: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomWidth: 2.5,
    borderBottomColor: '#111E1C',
    marginTop: 8,
  },
  signatureWaveArc3: {
    width: 34,
    height: 26,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 2.5,
    borderTopColor: '#111E1C',
    transform: [{ rotate: '-10deg' }],
  },
  signaturePlaceholder: {
    fontSize: 12,
    color: '#CBD5E1',
    fontStyle: 'italic',
    paddingLeft: 8,
  },

  // ----------------------------------------------------
  // 7. Bottom Primary Action Button
  // ----------------------------------------------------
  deliverBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#004D40',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  deliverBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ----------------------------------------------------
  // 8. Bottom Navigation Bar
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

export default ConfirmDeliveryScreen;
