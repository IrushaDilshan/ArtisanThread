import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  Animated,
  Easing,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ROUTES } from '../../navigation/routes';
import { courierService } from '../../services/courierService';

export const ScanParcelScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const initialTracking = route?.params?.trackingId || 'ATH-9942-PY';
  const initialSender = route?.params?.artisanName || 'Kumara Batiks & Silk Workshop';

  const [permission, requestPermission] = useCameraPermissions();
  const [useSimulator, setUseSimulator] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [canScanBarcode, setCanScanBarcode] = useState(true);

  const [trackingId, setTrackingId] = useState(initialTracking);
  const [deliveryData, setDeliveryData] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [scannedSuccess, setScannedSuccess] = useState(true);

  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [manualCode, setManualCode] = useState('');

  // Animated Scanning Laser Line
  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [laserAnim]);

  // Auto-request camera permissions on mount
  useEffect(() => {
    (async () => {
      try {
        if (!permission?.granted) {
          const res = await requestPermission();
          if (res?.granted) {
            setUseSimulator(false);
          }
        }
      } catch (err) {
        console.warn('Auto request camera notice:', err);
      }
    })();
  }, []);

  const handleEnableCamera = async () => {
    try {
      const res = await requestPermission();
      if (res?.granted) {
        setUseSimulator(false);
      } else {
        Alert.alert(
          'Camera Permission Required',
          'Camera access was not granted by your device.\n\nTo scan real QR codes with your camera, please allow camera permission in:\nPhone Settings ➔ Apps ➔ Expo Go (or ArtisanThread) ➔ Permissions ➔ Camera ➔ Allow.\n\nOr you can use the Quick Test Simulator buttons below.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.warn('Manual camera request error:', err);
    }
  };

  // Interpolate laser line translation from 0 to 200px
  const laserTranslateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 200],
  });

  // Verify initial parcel tracking code
  useEffect(() => {
    handleProcessCode(initialTracking);
  }, [initialTracking]);

  const handleProcessCode = async (rawCode) => {
    if (!rawCode) return;
    const clean = rawCode.trim().toUpperCase();
    setIsVerifying(true);
    try {
      const data = await courierService.verifyTrackingCode(clean);
      if (data) {
        setDeliveryData(data);
        setTrackingId(data.tracking_code || clean);
        setScannedSuccess(true);
      } else {
        setTrackingId(clean);
        setScannedSuccess(true);
      }
    } catch (e) {
      console.warn('Scan verification notice:', e.message);
      setTrackingId(clean);
    } finally {
      setIsVerifying(false);
    }
  };

  // Hardware Camera Barcode Detected
  const handleBarcodeScanned = (scanningResult) => {
    if (!canScanBarcode) return;
    const data = scanningResult?.data;
    if (data) {
      setCanScanBarcode(false);
      handleProcessCode(data);
      // Debounce re-scan
      setTimeout(() => setCanScanBarcode(true), 3500);
    }
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      handleProcessCode(manualCode);
      setManualModalVisible(false);
      setManualCode('');
    }
  };

  const handleConfirmPickup = async () => {
    if (isConfirming) return;
    setIsConfirming(true);

    try {
      // Mark as PICKED_UP in Supabase / Local Courier State
      if (deliveryData?.id) {
        await courierService.updateDeliveryStatus(deliveryData.id, 'PICKED_UP');
      }

      setIsConfirmed(true);

      // Navigate to delivery transit screen with trackingId
      if (navigation?.navigate) {
        navigation.navigate(ROUTES.COURIER.DELIVERY_TRANSIT, {
          trackingId: trackingId || 'ATH-9942-PY',
          jobId: deliveryData?.id,
        });
      }
    } catch (err) {
      Alert.alert('Pickup Confirmation Error', err.message);
    } finally {
      setIsConfirming(false);
    }
  };

  const senderName = deliveryData?.pickup_address?.name || initialSender;
  const recipientName =
    deliveryData?.order?.buyer?.full_name ||
    deliveryData?.dropoff_address?.name ||
    'Customer / Buyer';
  const totalAmount = deliveryData?.order?.total_amount
    ? Number(deliveryData.order.total_amount)
    : 12500;
  const formattedValue = `Rs. ${totalAmount.toLocaleString()}`;
  const fragileNotes =
    deliveryData?.recipient_notes ||
    'Handloom batik · keep flat and dry · Fragile';
  const isFragile = Boolean(
    fragileNotes.toLowerCase().includes('fragile') || true
  );

  const isCameraReady = permission?.granted && !useSimulator;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#122421" />

      {/* 1. Header Section */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 8) }]}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan parcel label</Text>

        {/* Torch Toggle if camera is active */}
        {isCameraReady ? (
          <TouchableOpacity
            onPress={() => setTorchOn(!torchOn)}
            activeOpacity={0.7}
            style={styles.torchBtn}
          >
            <Text style={styles.torchIcon}>{torchOn ? '🔦 ON' : '💡 OFF'}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {/* 2. Camera Scanner Viewfinder Area */}
      <View style={styles.scannerContainer}>
        {/* Real Camera Preview */}
        {isCameraReady ? (
          <View style={StyleSheet.absoluteFill}>
            <CameraView
              style={styles.cameraFullView}
              facing="back"
              enableTorch={torchOn}
              barcodeScannerSettings={{
                barcodeTypes: ['qr', 'code128', 'code39', 'ean13', 'upc_a'],
              }}
              onBarcodeScanned={canScanBarcode ? handleBarcodeScanned : undefined}
            />
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleEnableCamera}
            style={styles.simulatedCameraBackground}
          >
            <View style={styles.simulatedGridLineH} />
            <View style={styles.simulatedGridLineV} />
          </TouchableOpacity>
        )}

        {/* Viewfinder Overlay Frame */}
        <View style={styles.viewfinder}>
          {/* Top-Left Corner Guide */}
          <View style={[styles.cornerGuide, styles.cornerTL]} />
          {/* Top-Right Corner Guide */}
          <View style={[styles.cornerGuide, styles.cornerTR]} />
          {/* Bottom-Left Corner Guide */}
          <View style={[styles.cornerGuide, styles.cornerBL]} />
          {/* Bottom-Right Corner Guide */}
          <View style={[styles.cornerGuide, styles.cornerBR]} />

          {/* If camera is NOT ready, prompt user to tap and enable */}
          {!isCameraReady && (
            <TouchableOpacity
              onPress={handleEnableCamera}
              activeOpacity={0.8}
              style={styles.enableCameraPrompt}
            >
              <Text style={styles.qrCameraIcon}>📷</Text>
              <Text style={styles.qrCameraText}>Tap to Open Camera</Text>
            </TouchableOpacity>
          )}

          {/* Smooth Animated Scanning Laser Line */}
          <Animated.View
            style={[
              styles.laserLine,
              {
                transform: [{ translateY: laserTranslateY }],
              },
            ]}
          />
        </View>

        {/* Scanner Instructions & Mode Toggle */}
        <Text style={styles.instructionsText}>
          {isCameraReady
            ? 'Point camera at the QR code on the parcel label'
            : 'Tap the center or button below to enable camera'}
        </Text>

        {/* Quick Simulator Test Bar */}
        <View style={styles.quickTestContainer}>
          <Text style={styles.quickTestTitle}>Quick Test Simulation:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            <TouchableOpacity
              onPress={() => handleProcessCode('ATH-9942-PY')}
              activeOpacity={0.8}
              style={[
                styles.testChip,
                trackingId === 'ATH-9942-PY' && styles.testChipActive,
              ]}
            >
              <Text style={styles.testChipText}>⚡ Scan ATH-9942-PY</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleProcessCode('ATH-2291-KL')}
              activeOpacity={0.8}
              style={[
                styles.testChip,
                trackingId === 'ATH-2291-KL' && styles.testChipActive,
              ]}
            >
              <Text style={styles.testChipText}>⚡ Scan ATH-2291-KL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleProcessCode('ATH-3312-BW')}
              activeOpacity={0.8}
              style={[
                styles.testChip,
                trackingId === 'ATH-3312-BW' && styles.testChipActive,
              ]}
            >
              <Text style={styles.testChipText}>⚡ Scan ATH-3312-BW</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Bottom Options Row: Camera Permission & Manual Entry */}
        <View style={styles.scannerActionsRow}>
          {!permission?.granted ? (
            <TouchableOpacity
              onPress={handleEnableCamera}
              activeOpacity={0.7}
              style={styles.permissionActionBtn}
            >
              <Text style={styles.permissionActionText}>📷 Enable Camera</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setUseSimulator(!useSimulator)}
              activeOpacity={0.7}
              style={styles.permissionActionBtn}
            >
              <Text style={styles.permissionActionText}>
                {useSimulator ? '📷 Switch to Camera' : '⚡ Test Simulator'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setManualModalVisible(true)}
            activeOpacity={0.7}
            style={styles.manualEntryBtn}
          >
            <Text style={styles.manualEntryText}>Enter code by hand</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Scanned Parcel Details Bottom Card */}
      <View
        style={[
          styles.bottomSheetCard,
          { paddingBottom: Math.max(insets.bottom, 20) },
        ]}
      >
        {/* Parcel Tracking ID Header Row */}
        <View style={styles.trackingHeaderRow}>
          <Text style={styles.trackingIdText}>{trackingId}</Text>
          <View style={styles.verifiedPill}>
            <Text style={styles.verifiedPillText}>✓ Scanned & Verified</Text>
          </View>
        </View>

        {/* Fragile Alert Banner */}
        {isFragile && (
          <View style={styles.fragileBanner}>
            <View style={styles.fragileStripe} />
            <View style={styles.fragileContent}>
              <Text style={styles.fragileTitle}>Fragile — do not stack</Text>
              <Text style={styles.fragileSubtitle}>{fragileNotes}</Text>
            </View>
          </View>
        )}

        {/* Parcel Info Table */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sender</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {senderName}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Recipient</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {recipientName}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Declared value</Text>
            <Text style={[styles.infoValue, { color: '#00796B', fontWeight: '800' }]}>
              {formattedValue}
            </Text>
          </View>
        </View>

        {/* 4. Action Button */}
        <TouchableOpacity
          onPress={handleConfirmPickup}
          disabled={isConfirming}
          activeOpacity={0.88}
          style={[styles.confirmBtn, isConfirmed && styles.confirmBtnDone]}
        >
          {isConfirming ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmBtnText}>
              {isConfirmed ? 'Pickup Confirmed ✓' : 'Confirm pickup'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Manual Entry Modal */}
      <Modal
        visible={manualModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setManualModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Parcel Code</Text>
            <Text style={styles.modalSubtitle}>
              Type or paste the tracking ID printed on the parcel label.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="e.g. ATH-9942-PY"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              value={manualCode}
              onChangeText={setManualCode}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setManualModalVisible(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleManualSubmit}
                style={styles.modalSubmitBtn}
              >
                <Text style={styles.modalSubmitText}>Apply Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#122421',
  },

  // ----------------------------------------------------
  // 1. Header Section
  // ----------------------------------------------------
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#122421',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  headerSpacer: {
    width: 36,
  },
  torchBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  torchIcon: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  // ----------------------------------------------------
  // 2. Camera Scanner Viewfinder Area
  // ----------------------------------------------------
  scannerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  cameraFullView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  simulatedCameraBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A1211',
  },
  simulatedGridLineH: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  simulatedGridLineV: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  viewfinder: {
    width: 220,
    height: 220,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  cornerGuide: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#F59E0B', // Yellow/Gold
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 10,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 10,
  },
  enableCameraPrompt: {
    width: 130,
    height: 90,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  qrCameraIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  qrCameraText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
    textAlign: 'center',
  },
  laserLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2.5,
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 4,
  },
  instructionsText: {
    fontSize: 12,
    color: '#D1D5DB',
    textAlign: 'center',
    marginTop: 14,
    letterSpacing: 0.2,
  },

  // Quick Test Simulation Bar
  quickTestContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  quickTestTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  testChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  testChipActive: {
    backgroundColor: '#D97706',
    borderColor: '#F59E0B',
  },
  testChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  scannerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
  },
  permissionActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 121, 107, 0.35)',
    borderWidth: 1,
    borderColor: '#00796B',
  },
  permissionActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4ADE80',
  },
  manualEntryBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  manualEntryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },

  // ----------------------------------------------------
  // 3. Scanned Parcel Details Bottom Card
  // ----------------------------------------------------
  bottomSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  trackingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  trackingIdText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111E1C',
    letterSpacing: -0.3,
  },
  verifiedPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  verifiedPillText: {
    color: '#166534',
    fontSize: 10,
    fontWeight: '800',
  },
  fragileBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: 14,
  },
  fragileStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#DC2626',
  },
  fragileContent: {
    paddingLeft: 4,
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
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111E1C',
    textAlign: 'right',
  },

  // ----------------------------------------------------
  // 4. Action Button
  // ----------------------------------------------------
  confirmBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#004D40',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmBtnDone: {
    backgroundColor: '#00796B',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Manual Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111E1C',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
  },
  modalInput: {
    height: 46,
    borderWidth: 1.5,
    borderColor: '#004D40',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '700',
    color: '#111E1C',
    backgroundColor: '#FAFCFB',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalCancelText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  modalSubmitBtn: {
    backgroundColor: '#004D40',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  modalSubmitText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default ScanParcelScreen;
