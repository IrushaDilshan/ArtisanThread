import React, { useState } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROUTES } from '../../navigation/routes';

export const ScanParcelScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [trackingId, setTrackingId] = useState('ATH-2291-KL');
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const parcelDetails = {
    sender: 'Malsha Maduwanthi',
    recipient: 'M. Samaranayaka',
    declaredValue: 'Rs. 2,500.00',
    fragileTitle: 'Fragile — do not stack',
    fragileDetails: 'Hand-dyed batik · keep flat and dry',
  };

  const handleConfirmPickup = () => {
    setIsConfirmed(true);
    if (navigation?.navigate) {
      navigation.navigate(ROUTES.COURIER.DELIVERY_TRANSIT, {
        trackingId,
      });
    }
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      setTrackingId(manualCode.trim().toUpperCase());
      setManualModalVisible(false);
      setManualCode('');
    }
  };

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
        <View style={styles.headerSpacer} />
      </View>

      {/* 2. Camera Scanner Viewfinder Area */}
      <View style={styles.scannerContainer}>
        {/* Viewfinder Target */}
        <View style={styles.viewfinder}>
          {/* Top-Left Corner Guide */}
          <View style={[styles.cornerGuide, styles.cornerTL]} />
          {/* Top-Right Corner Guide */}
          <View style={[styles.cornerGuide, styles.cornerTR]} />
          {/* Bottom-Left Corner Guide */}
          <View style={[styles.cornerGuide, styles.cornerBL]} />
          {/* Bottom-Right Corner Guide */}
          <View style={[styles.cornerGuide, styles.cornerBR]} />

          {/* Central Target / QR Silhouette */}
          <View style={styles.qrTargetCenter} />

          {/* Horizontal Laser Guide Line */}
          <View style={styles.laserLine} />
        </View>

        {/* Instructions */}
        <Text style={styles.instructionsText}>
          Point the camera at the QR code on the label
        </Text>

        {/* Clickable Option: Enter code by hand */}
        <TouchableOpacity
          onPress={() => setManualModalVisible(true)}
          activeOpacity={0.7}
          style={styles.manualEntryBtn}
        >
          <Text style={styles.manualEntryText}>Enter the code by hand</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Scanned Parcel Details Bottom Card */}
      <View
        style={[
          styles.bottomSheetCard,
          { paddingBottom: Math.max(insets.bottom, 24) },
        ]}
      >
        {/* Parcel Tracking ID */}
        <Text style={styles.trackingIdText}>{trackingId}</Text>

        {/* Fragile Alert Banner */}
        <View style={styles.fragileBanner}>
          <View style={styles.fragileStripe} />
          <View style={styles.fragileContent}>
            <Text style={styles.fragileTitle}>{parcelDetails.fragileTitle}</Text>
            <Text style={styles.fragileSubtitle}>
              {parcelDetails.fragileDetails}
            </Text>
          </View>
        </View>

        {/* Parcel Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sender</Text>
            <Text style={styles.infoValue}>{parcelDetails.sender}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Recipient</Text>
            <Text style={styles.infoValue}>{parcelDetails.recipient}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Declared value</Text>
            <Text style={styles.infoValue}>{parcelDetails.declaredValue}</Text>
          </View>
        </View>

        {/* 4. Action Button */}
        <TouchableOpacity
          onPress={handleConfirmPickup}
          activeOpacity={0.88}
          style={[styles.confirmBtn, isConfirmed && styles.confirmBtnDone]}
        >
          <Text style={styles.confirmBtnText}>
            {isConfirmed ? 'Pickup Confirmed ✓' : 'Confirm pickup'}
          </Text>
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
              Type the tracking ID printed below the QR barcode.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="e.g. ATH-2291-KL"
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

  // ----------------------------------------------------
  // 2. Camera Scanner Viewfinder Area
  // ----------------------------------------------------
  scannerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#122421',
    paddingBottom: 20,
  },
  viewfinder: {
    width: 210,
    height: 210,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
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
  qrTargetCenter: {
    width: 90,
    height: 90,
    backgroundColor: '#869894',
    borderRadius: 8,
    opacity: 0.85,
  },
  laserLine: {
    position: 'absolute',
    left: 14,
    right: 14,
    height: 2,
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  instructionsText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 20,
    letterSpacing: 0.2,
  },
  manualEntryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  manualEntryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706', // Gold / Orange
  },

  // ----------------------------------------------------
  // 3. Scanned Parcel Details Bottom Card
  // ----------------------------------------------------
  bottomSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  trackingIdText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111E1C',
    letterSpacing: -0.3,
    marginBottom: 12,
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
