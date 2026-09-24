import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { ROUTES, ROLES } from '../../navigation/routes';
import { useAuth } from '../../context/AuthContext';

export const OTPVerificationScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const phoneNumber = route?.params?.phoneNumber || '000000000';
  const role = route?.params?.role || ROLES.BUYER;

  // 6 digits OTP state
  const [otp, setOtp] = useState(['6', '9', '7', '5', '4', '9']);
  const inputRefs = useRef([]);

  // Countdown timer for resend
  const [secondsLeft, setSecondsLeft] = useState(30);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleOtpChange = (value, index) => {
    // Clean to single digit
    const digit = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input if digit entered
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (secondsLeft === 0) {
      setSecondsLeft(30);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleVerify = () => {
    // Navigate to role selection or complete login
    if (navigation?.navigate) {
      navigation.navigate(ROUTES.AUTH.CHOOSE_ROLE, { role });
    } else {
      login(role);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={[styles.container, { paddingTop: Math.max(insets.top, 24) }]}>
          {/* Header Content */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Almost there</Text>
            <Text style={styles.subtitle}>
              Please enter the 6-digit code sent to your number{' '}
              <Text style={styles.phoneHighlight}>{phoneNumber}</Text> for verification.
            </Text>
          </View>

          {/* 6 Individual Square Border Boxes for OTP */}
          <View style={styles.otpContainer}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(ref) => (inputRefs.current[idx] = ref)}
                style={[
                  styles.otpBox,
                  digit ? styles.otpBoxFilled : null,
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(val) => handleOtpChange(val, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Primary Verify Button */}
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              onPress={handleVerify}
              activeOpacity={0.85}
              style={styles.verifyBtn}
            >
              <Text style={styles.sendIcon}>➤</Text>
              <Text style={styles.verifyText}>Verify</Text>
            </TouchableOpacity>
          </View>

          {/* Resend Code Section */}
          <View style={styles.resendSection}>
            <TouchableOpacity
              onPress={handleResend}
              disabled={secondsLeft > 0}
              activeOpacity={0.7}
            >
              <Text style={styles.resendPrompt}>
                Didn't receive any code?{' '}
                <Text style={[styles.resendLink, secondsLeft > 0 && styles.resendLinkDisabled]}>
                  Resend Again
                </Text>
              </Text>
            </TouchableOpacity>

            <Text style={styles.countdownText}>
              Request new code in 00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}s
            </Text>
          </View>

          {/* Bottom Navigation: Round Dark Green Back Button */}
          <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <TouchableOpacity
              onPress={() => navigation?.goBack()}
              activeOpacity={0.8}
              style={styles.roundBackBtn}
            >
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },
  headerSection: {
    marginTop: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111E1C',
    letterSpacing: -0.4,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: '#5A6F6B',
  },
  phoneHighlight: {
    color: '#004D40',
    fontWeight: '700',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 32,
  },
  otpBox: {
    width: 44,
    height: 44,
    borderWidth: 1.5,
    borderColor: '#37474F',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#111E1C',
    backgroundColor: '#FFFFFF',
  },
  otpBoxFilled: {
    borderColor: '#111E1C',
    backgroundColor: '#FAFCFB',
  },
  buttonWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#004D40',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  verifyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  resendSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  resendPrompt: {
    fontSize: 13,
    color: '#111E1C',
    fontWeight: '600',
  },
  resendLink: {
    fontWeight: '700',
    color: '#111E1C',
    textDecorationLine: 'underline',
  },
  resendLinkDisabled: {
    color: '#5A6F6B',
    textDecorationLine: 'none',
  },
  countdownText: {
    fontSize: 11,
    color: '#8B9E9B',
    marginTop: 6,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 16,
  },
  roundBackBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#004D40',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '300',
    marginTop: -4,
    marginRight: 2,
  },
});

export default OTPVerificationScreen;
