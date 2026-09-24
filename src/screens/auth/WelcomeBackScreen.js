import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, ROLES } from '../../navigation/routes';

export const WelcomeBackScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES.BUYER);

  const handleSendOTP = () => {
    // Navigate to OTP verification screen (A5)
    navigation?.navigate(ROUTES.AUTH.OTP_VERIFICATION, {
      phoneNumber: mobileNumber || '000000000',
      role: selectedRole,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Scooter Courier Graphic (Screen A4) */}
        <View style={styles.heroSection}>
          <View style={styles.scooterContainer}>
            {/* Courier Figure */}
            <View style={styles.riderWrapper}>
              {/* Helmet */}
              <View style={styles.helmet}>
                <View style={styles.visor} />
              </View>
              {/* Jacket */}
              <View style={styles.riderJacket} />
            </View>

            {/* Scooter Body & Parcel Box */}
            <View style={styles.scooterRow}>
              {/* Parcel Box on Back */}
              <View style={styles.cargoBox}>
                <View style={styles.cargoTape} />
              </View>

              {/* Red Scooter Body */}
              <View style={styles.scooterBody}>
                <View style={styles.scooterHandle} />
                <View style={styles.scooterSeat} />
                <View style={styles.scooterFront} />
              </View>
            </View>

            {/* Scooter Wheels */}
            <View style={styles.wheelsRow}>
              <View style={styles.wheel}>
                <View style={styles.wheelHub} />
              </View>
              <View style={styles.wheel}>
                <View style={styles.wheelHub} />
              </View>
            </View>
          </View>
        </View>

        {/* Headings */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>sign in to access your account</Text>
        </View>

        {/* Mobile Number Input with Clear Icon (Screen A4) */}
        <View style={styles.inputContainer}>
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter 10-digit number"
                placeholderTextColor="#A0A0A0"
                keyboardType="phone-pad"
                value={mobileNumber}
                onChangeText={setMobileNumber}
              />
              {mobileNumber.length > 0 && (
                <TouchableOpacity
                  onPress={() => setMobileNumber('')}
                  style={styles.clearBtn}
                >
                  <Text style={styles.clearIcon}>⊗</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Text style={styles.helperText}>We'll send an OTP to this number</Text>
        </View>

        {/* Quick Role Selection for Seamless Pair Programming & Testing */}
        <View style={styles.roleSelectionSection}>
          <Text style={styles.roleHeaderLabel}>SIGN IN AS:</Text>
          <View style={styles.roleTabs}>
            {[
              { key: ROLES.BUYER, label: 'Buyer', icon: '🛍️' },
              { key: ROLES.ARTISAN, label: 'Artisan', icon: '🎨' },
              { key: ROLES.COURIER, label: 'Courier', icon: '📦' },
            ].map((r) => {
              const active = selectedRole === r.key;
              return (
                <TouchableOpacity
                  key={r.key}
                  onPress={() => setSelectedRole(r.key)}
                  style={[styles.roleTab, active && styles.roleTabActive]}
                >
                  <Text style={styles.roleTabIcon}>{r.icon}</Text>
                  <Text style={[styles.roleTabText, active && styles.roleTabTextActive]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Send OTP Action Button */}
        <TouchableOpacity
          onPress={handleSendOTP}
          activeOpacity={0.88}
          style={styles.sendOtpBtn}
        >
          <Text style={styles.sendOtpText}>➤  Send OTP</Text>
        </TouchableOpacity>

        {/* Footer Link: New Member? Register now */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>New Member? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.AUTH.CREATE_ACCOUNT)}
          >
            <Text style={styles.registerLink}>Register now</Text>
          </TouchableOpacity>
        </View>

        {/* Back to Onboarding link for preview convenience */}
        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.AUTH.ONBOARDING)}
          style={styles.onboardingLink}
        >
          <Text style={styles.onboardingLinkText}>← Replay Onboarding (A1 - A3)</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  heroSection: {
    marginVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scooterContainer: {
    width: 200,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  riderWrapper: {
    alignItems: 'center',
    marginBottom: -10,
    zIndex: 4,
  },
  helmet: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E53935',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visor: {
    position: 'absolute',
    right: 4,
    top: 10,
    width: 14,
    height: 12,
    backgroundColor: '#37474F',
    borderRadius: 4,
  },
  riderJacket: {
    width: 44,
    height: 38,
    backgroundColor: '#26C6DA',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: -4,
  },
  scooterRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    zIndex: 3,
  },
  cargoBox: {
    width: 58,
    height: 48,
    backgroundColor: '#D4A373',
    borderRadius: 6,
    marginRight: 6,
    position: 'relative',
  },
  cargoTape: {
    position: 'absolute',
    left: 24,
    top: 0,
    bottom: 0,
    width: 10,
    backgroundColor: '#3E2723',
    opacity: 0.35,
  },
  scooterBody: {
    width: 90,
    height: 44,
    backgroundColor: '#D32F2F',
    borderRadius: 12,
    position: 'relative',
  },
  scooterHandle: {
    position: 'absolute',
    top: -16,
    right: 12,
    width: 14,
    height: 20,
    backgroundColor: '#9E9E9E',
    borderTopRightRadius: 4,
  },
  scooterSeat: {
    position: 'absolute',
    top: -8,
    left: 10,
    width: 32,
    height: 10,
    backgroundColor: '#212121',
    borderRadius: 5,
  },
  scooterFront: {
    position: 'absolute',
    right: 4,
    top: 4,
    width: 20,
    height: 24,
    backgroundColor: '#B71C1C',
    borderRadius: 6,
  },
  wheelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 130,
    marginTop: -8,
    zIndex: 1,
  },
  wheel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#424242',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#E0E0E0',
  },
  wheelHub: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#BDBDBD',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  inputCard: {
    backgroundColor: '#ECEFF1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputLabel: {
    fontSize: 11,
    color: '#78909C',
    fontWeight: '600',
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#263238',
    fontWeight: '600',
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 16,
    color: '#78909C',
  },
  helperText: {
    fontSize: 11,
    color: '#90A4AE',
    marginTop: 6,
    marginLeft: 4,
  },
  roleSelectionSection: {
    width: '100%',
    marginVertical: 10,
  },
  roleHeaderLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#78909C',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  roleTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 4,
  },
  roleTabActive: {
    borderColor: '#0B5D48',
    backgroundColor: '#E0F2F1',
  },
  roleTabIcon: {
    fontSize: 13,
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#546E7A',
  },
  roleTabTextActive: {
    color: '#0B5D48',
    fontWeight: '700',
  },
  sendOtpBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0B5D48',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 20,
    shadowColor: '#0B5D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  sendOtpText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  footerText: {
    fontSize: 13,
    color: '#616161',
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00796B',
  },
  onboardingLink: {
    marginTop: 24,
    paddingVertical: 8,
  },
  onboardingLinkText: {
    fontSize: 12,
    color: '#78909C',
    fontWeight: '600',
  },
});

export default WelcomeBackScreen;
