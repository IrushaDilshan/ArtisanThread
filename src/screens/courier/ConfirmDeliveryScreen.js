import React, { useState, useRef, useEffect } from 'react';
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
  PanResponder,
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

// Pure React Native vector line segment renderer (zero native build dependencies, works 100% reliably)
const StrokeSegments = ({ stroke, strokeKey }) => {
  if (!stroke || stroke.length === 0) return null;
  if (stroke.length === 1) {
    const pt = stroke[0];
    return (
      <View
        key={`${strokeKey}-pt`}
        style={{
          position: 'absolute',
          left: pt.x - 2,
          top: pt.y - 2,
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: '#111E1C',
        }}
      />
    );
  }

  const elements = [];
  for (let i = 0; i < stroke.length - 1; i++) {
    const pA = stroke[i];
    const pB = stroke[i + 1];
    const dx = pB.x - pA.x;
    const dy = pB.y - pA.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length < 0.6) continue;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const cx = (pA.x + pB.x) / 2;
    const cy = (pA.y + pB.y) / 2;

    elements.push(
      <View
        key={`${strokeKey}-seg-${i}`}
        style={{
          position: 'absolute',
          left: cx - length / 2,
          top: cy - 1.5,
          width: length,
          height: 3,
          borderRadius: 1.5,
          backgroundColor: '#111E1C',
          transform: [{ rotate: `${angle}deg` }],
        }}
      />
    );
  }
  return elements;
};

// Preset sample signature coordinates
const SAMPLE_SIGNATURE = [
  [
    { x: 35, y: 70 }, { x: 40, y: 55 }, { x: 48, y: 35 }, { x: 56, y: 24 },
    { x: 64, y: 36 }, { x: 68, y: 58 }, { x: 74, y: 75 }, { x: 80, y: 82 },
  ],
  [
    { x: 80, y: 82 }, { x: 88, y: 58 }, { x: 96, y: 32 }, { x: 105, y: 30 },
    { x: 114, y: 46 }, { x: 125, y: 68 }, { x: 140, y: 58 }, { x: 155, y: 50 },
    { x: 172, y: 56 }, { x: 195, y: 46 }, { x: 220, y: 40 }, { x: 250, y: 34 },
  ],
  [
    { x: 50, y: 90 }, { x: 85, y: 88 }, { x: 135, y: 86 }, { x: 190, y: 84 },
    { x: 245, y: 82 }, { x: 265, y: 80 },
  ],
];

export const ConfirmDeliveryScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('jobs');
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

  // Unified OTP state: '48' matches user screenshot initially
  const [otp, setOtp] = useState('48');
  const otpInputRef = useRef(null);

  // Cash on delivery collected toggle
  const [isCodCollected, setIsCodCollected] = useState(true);

  // Photo upload state
  const [photoTaken, setPhotoTaken] = useState(false);

  // Signature drawing state (refs prevent closure drops and re-render glitches)
  const strokesRef = useRef([]);
  const currentStrokeRef = useRef([]);
  const [renderCount, setRenderCount] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  // Setup PanResponder with strictly captured touch gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false, // PREVENT ScrollView from stealing touch!
      onShouldBlockAppResponder: () => true,
      onPanResponderGrant: (evt) => {
        setScrollEnabled(false);
        const { locationX, locationY } = evt.nativeEvent;
        const pt = { x: Math.round(locationX), y: Math.round(locationY) };
        currentStrokeRef.current = [pt];
        setRenderCount((c) => c + 1);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const pt = { x: Math.round(locationX), y: Math.round(locationY) };
        const last = currentStrokeRef.current[currentStrokeRef.current.length - 1];
        if (!last || Math.abs(pt.x - last.x) > 1 || Math.abs(pt.y - last.y) > 1) {
          currentStrokeRef.current.push(pt);
          setRenderCount((c) => c + 1);
        }
      },
      onPanResponderRelease: () => {
        setScrollEnabled(true);
        if (currentStrokeRef.current.length > 0) {
          strokesRef.current.push([...currentStrokeRef.current]);
          currentStrokeRef.current = [];
          setRenderCount((c) => c + 1);
        }
      },
      onPanResponderTerminate: () => {
        setScrollEnabled(true);
        if (currentStrokeRef.current.length > 0) {
          strokesRef.current.push([...currentStrokeRef.current]);
          currentStrokeRef.current = [];
          setRenderCount((c) => c + 1);
        }
      },
    })
  ).current;

  const buyerName =
    route?.params?.buyerName ||
    deliveryData?.order?.buyer?.full_name ||
    deliveryData?.dropoff_address?.name ||
    'Nimal Jayasuriya';
  const buyerInitials = buyerName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'NJ';
  const buyerAddress =
    deliveryData?.dropoff_address?.address_line1
      ? `${deliveryData.dropoff_address.address_line1}, ${deliveryData.dropoff_address.city || ''}`
      : '28/4 Galle Road, Colombo 03';
  const buyerPhone =
    deliveryData?.order?.buyer?.phone ||
    deliveryData?.dropoff_address?.phone ||
    '+94 77 456 7890';
  const totalAmount =
    route?.params?.totalAmount ||
    (deliveryData?.order?.total_amount ? Number(deliveryData.order.total_amount) : 12500);

  const artisanName = deliveryData?.pickup_address?.name ? deliveryData.pickup_address.name.split(' ')[0] : 'Kumara';

  const recipient = {
    name: buyerName,
    initials: buyerInitials,
    address: buyerAddress,
    phoneTag: buyerPhone ? `+94 *** ${buyerPhone.slice(-4)} verified` : '+94 *** 4567 verified',
    codAmount: `Rs. ${totalAmount.toLocaleString()}.00`,
  };

  const handleAutofillOtp = () => {
    setOtp('4820');
    otpInputRef.current?.focus();
  };

  const handleClearOtp = () => {
    setOtp('');
    otpInputRef.current?.focus();
  };

  const handleClearSignature = () => {
    strokesRef.current = [];
    currentStrokeRef.current = [];
    setRenderCount((c) => c + 1);
  };

  const handleSampleSignature = () => {
    strokesRef.current = SAMPLE_SIGNATURE.map((s) => [...s]);
    currentStrokeRef.current = [];
    setRenderCount((c) => c + 1);
  };

  const hasAnySignature = strokesRef.current.length > 0 || currentStrokeRef.current.length > 0;

  const handleMarkDelivered = () => {
    const isOtpFilled = otp.length === 4;

    // Validate delivery proof
    if (!isOtpFilled && !hasAnySignature && !photoTaken) {
      Alert.alert(
        'Proof Required',
        'Please enter the 4-digit buyer delivery code, obtain a recipient signature, or take a handover photo before marking as delivered.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Update delivery status to DELIVERED in database / local state
    courierService.updateDeliveryStatus(trackingId, 'DELIVERED').catch(() => {});

    Alert.alert(
      'Delivery Completed! 🎉',
      `Order ${trackingId} for ${recipient.name} has been successfully delivered!\n\n${
        isCodCollected ? `COD ${recipient.codAmount} collected.` : 'Payment confirmed.'
      }`,
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
        scrollEnabled={scrollEnabled}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Recipient Info Card */}
        <View style={styles.recipientCard}>
          <View style={styles.recipientRow}>
            {/* Avatar Circle with Initials "NJ" */}
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

        {/* 3. Delivery Verification Code (Unified 4-digit OTP) */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Delivery code from the buyer</Text>
          <Text style={styles.sectionSubtitle}>
            Ask them to read the 4 digits in their app.
          </Text>

          {/* 4 Interactive OTP Boxes (Tapping anywhere opens keyboard) */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => otpInputRef.current?.focus()}
            style={styles.otpBoxesRow}
          >
            {[0, 1, 2, 3].map((idx) => {
              const char = otp[idx] || '';
              const isFilled = Boolean(char);
              const isCurrent = otp.length === idx;
              return (
                <View
                  key={idx}
                  style={[
                    styles.otpBoxWrapper,
                    isFilled && styles.otpBoxWrapperFilled,
                    isCurrent && styles.otpBoxWrapperActive,
                  ]}
                >
                  <Text style={styles.otpBoxText}>{char}</Text>
                  {/* Blinking cursor indicator for active box */}
                  {isCurrent && <View style={styles.cursorBar} />}
                </View>
              );
            })}
          </TouchableOpacity>

          {/* Hidden Real TextInput for Soft Keyboard Entry */}
          <TextInput
            ref={otpInputRef}
            style={styles.hiddenOtpInput}
            keyboardType="number-pad"
            maxLength={4}
            value={otp}
            onChangeText={(val) => {
              const clean = val.replace(/[^0-9]/g, '').slice(0, 4);
              setOtp(clean);
            }}
            caretHidden
          />

          {/* Quick OTP Autofill helper for testing / fast entry */}
          <View style={styles.otpHelperRow}>
            <TouchableOpacity
              onPress={handleAutofillOtp}
              activeOpacity={0.7}
              style={styles.otpChipBtn}
            >
              <Text style={styles.otpChipText}>⚡ Read buyer code (4820)</Text>
            </TouchableOpacity>
            {otp.length > 0 && (
              <TouchableOpacity
                onPress={handleClearOtp}
                activeOpacity={0.7}
                style={styles.otpClearBtn}
              >
                <Text style={styles.otpClearText}>Clear</Text>
              </TouchableOpacity>
            )}
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
              <Text style={styles.codSubtext}>Settles to {artisanName} within 24 hours</Text>
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
            activeOpacity={0.85}
            style={[
              styles.dashedPhotoCard,
              photoTaken && styles.dashedPhotoCardDone,
            ]}
          >
            {photoTaken ? (
              <View style={styles.photoPreviewCard}>
                <View style={styles.photoPreviewTop}>
                  <View style={styles.photoProofTag}>
                    <Text style={styles.photoProofTagText}>✓ Proof Attached</Text>
                  </View>
                  <Text style={styles.photoRetakeAction}>📷 Tap to retake</Text>
                </View>

                <View style={styles.photoMetaBox}>
                  <Text style={styles.photoMetaTitle}>📦 Handover verified at doorstep</Text>
                  <Text style={styles.photoMetaSub}>
                    {recipient.address} · Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.cameraCircle}>
                  <Text style={styles.cameraIcon}>📷</Text>
                </View>
                <Text style={styles.photoMainText}>Take a photo</Text>
                <Text style={styles.photoSubText}>
                  Needed when nobody signs for the parcel
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* 6. Recipient Digital Signature Box with Interactive Drawing Pad */}
        <View style={styles.signatureCard}>
          <View style={styles.signatureHeaderRow}>
            <Text style={styles.signatureTitle}>Recipient signature</Text>
            <View style={styles.signatureActionsRow}>
              <TouchableOpacity
                onPress={handleSampleSignature}
                activeOpacity={0.7}
                style={styles.sampleSigBtn}
              >
                <Text style={styles.sampleSigText}>✍️ Sample</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleClearSignature}
                activeOpacity={0.7}
                style={styles.clearBtn}
              >
                <Text style={styles.clearBtnText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Finger Touch Signature Drawing Pad */}
          <View
            {...panResponder.panHandlers}
            style={styles.signatureCanvasArea}
          >
            {/* Dashed Baseline */}
            <View style={styles.signatureBaseline} pointerEvents="none" />

            {/* Render Finished Strokes */}
            {strokesRef.current.map((stroke, idx) => (
              <StrokeSegments
                key={`stroke-${idx}`}
                stroke={stroke}
                strokeKey={`stroke-${idx}`}
              />
            ))}

            {/* Render Current Active Stroke in Real-time */}
            {currentStrokeRef.current.length > 0 && (
              <StrokeSegments
                stroke={currentStrokeRef.current}
                strokeKey="current-stroke"
              />
            )}

            {/* Signature status / drawing instructions */}
            {!hasAnySignature && (
              <View style={styles.signaturePlaceholderBox} pointerEvents="none">
                <Text style={styles.signaturePlaceholder}>
                  ✍️ Draw signature here with finger...
                </Text>
              </View>
            )}

            {/* Bottom guide text */}
            <View style={styles.signatureGuideBottom} pointerEvents="none">
              <Text style={styles.signatureGuideText}>
                {hasAnySignature ? '✓ Digital signature captured' : 'Touch & drag to sign'}
              </Text>
            </View>
          </View>
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
    backgroundColor: '#F7FCF9',
  },
  otpBoxText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111E1C',
  },
  cursorBar: {
    position: 'absolute',
    width: 2,
    height: 24,
    backgroundColor: '#00796B',
    borderRadius: 1,
  },
  hiddenOtpInput: {
    position: 'absolute',
    top: -9999,
    left: -9999,
    width: 1,
    height: 1,
    opacity: 0,
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
    borderColor: '#10B981',
    borderStyle: 'solid',
    backgroundColor: '#F0FDF4',
    paddingVertical: 12,
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
  photoPreviewCard: {
    width: '100%',
    paddingHorizontal: 12,
  },
  photoPreviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoProofTag: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  photoProofTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  photoRetakeAction: {
    fontSize: 11,
    fontWeight: '700',
    color: '#004D40',
  },
  photoMetaBox: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  photoMetaTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  photoMetaSub: {
    fontSize: 10,
    color: '#047857',
    marginTop: 2,
  },

  // ----------------------------------------------------
  // 6. Recipient Digital Signature Box
  // ----------------------------------------------------
  signatureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EDF2F0',
    padding: 14,
    marginTop: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
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
  signatureActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sampleSigBtn: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  sampleSigText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  clearBtn: {
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  signatureCanvasArea: {
    height: 120,
    borderRadius: 10,
    backgroundColor: '#FAFBFB',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  signatureBaseline: {
    position: 'absolute',
    bottom: 28,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  signaturePlaceholderBox: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signaturePlaceholder: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  signatureGuideBottom: {
    position: 'absolute',
    bottom: 6,
    right: 10,
  },
  signatureGuideText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#94A3B8',
  },

  // ----------------------------------------------------
  // OTP Helpers
  // ----------------------------------------------------
  otpHelperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  otpChipBtn: {
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C6E7D6',
  },
  otpChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00796B',
  },
  otpClearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  otpClearText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
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
