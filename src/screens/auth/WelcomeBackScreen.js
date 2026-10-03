import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROUTES } from '../../navigation/routes';
import { Alert, ActivityIndicator } from 'react-native';
import { supabase, isSupabaseConfigured } from '../../services';
import { authService, formatE164Phone } from '../../services/authService';

export const WelcomeBackScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [mobileNumber, setMobileNumber] = useState(route?.params?.phone || '');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (route?.params?.phone) {
      setMobileNumber(route.params.phone);
    }
  }, [route?.params?.phone]);

  const handleSendOTP = async () => {
    const trimmed = mobileNumber.trim();
    if (!trimmed) {
      Alert.alert('Mobile Number Required', 'Please enter your registered mobile number to sign in.');
      return;
    }

    const cleanPhone = trimmed.replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 8) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid mobile phone number (minimum 8 digits).');
      return;
    }

    const formatted = formatE164Phone(trimmed);

    try {
      setLoading(true);

      if (!isSupabaseConfigured || !supabase) {
        Alert.alert('Configuration Error', 'Supabase backend credentials not found in .env.');
        return;
      }

      // Check if phone number is registered in the database
      const registeredUser = await authService.checkPhoneRegistered(trimmed);

      if (!registeredUser) {
        // Phone number is NOT registered: alert user and provide register button
        Alert.alert(
          'Phone Number Not Registered',
          `The phone number ${trimmed} is not registered. Please register to create an account first.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Register Now',
              style: 'default',
              onPress: () => {
                navigation?.navigate(ROUTES.AUTH.CREATE_ACCOUNT, {
                  phone: trimmed,
                });
              },
            },
          ]
        );
        return;
      }

      // Phone IS registered: proceed to send OTP
      const formatted = formatE164Phone(trimmed);

      try {
        await authService.sendPhoneOtp(formatted);
        Alert.alert('Code Sent!', `A 6-digit verification code has been dispatched to ${formatted}.`);
      } catch (otpErr) {
        console.warn('SMS dispatch notice:', otpErr.message);
      }

      navigation?.navigate(ROUTES.AUTH.OTP_VERIFICATION, {
        phoneNumber: formatted,
        isLoginFlow: true,
        userProfile: registeredUser,
      });
    } catch (err) {
      console.warn('Phone check error:', err.message);
      Alert.alert('Sign In Notice', err.message || 'Could not verify mobile number.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMobileNumber('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexOne}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top, 16),
              paddingBottom: Math.max(insets.bottom, 24),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top 3D Scooter Courier Illustration */}
          <View style={styles.heroSection}>
            <Image
              source={require('../../../assets/images/delivery_courier.png')}
              style={styles.courierImage}
              resizeMode="contain"
            />
          </View>

          {/* Title & Subtitle */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>sign in to access your account</Text>
          </View>

          {/* Mobile Number Input Container */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputCard}>
              <TextInput
                style={styles.textInput}
                placeholder="Mobile Number"
                placeholderTextColor="#6B7280"
                keyboardType="phone-pad"
                value={mobileNumber}
                onChangeText={setMobileNumber}
              />
              <TouchableOpacity
                onPress={handleClear}
                activeOpacity={0.7}
                style={styles.clearTouch}
              >
                <View style={styles.clearCircle}>
                  <Text style={styles.clearX}>✕</Text>
                </View>
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>We'll send an OTP to this number</Text>
          </View>

          {/* Centered Pill Send OTP Button */}
          <TouchableOpacity
            onPress={handleSendOTP}
            disabled={loading}
            activeOpacity={0.88}
            style={styles.sendOtpBtn}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.sendIcon}>➤</Text>
                <Text style={styles.sendOtpText}>Send OTP</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Footer: New Member? Register now */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>New Member? </Text>
            <TouchableOpacity
              onPress={() => navigation?.navigate(ROUTES.AUTH.CREATE_ACCOUNT)}
              activeOpacity={0.7}
            >
              <Text style={styles.registerLink}>Register now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flexOne: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  // 1. Top Courier Illustration
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
  },
  courierImage: {
    width: 250,
    height: 250,
  },

  // 2. Headings
  textContainer: {
    alignItems: 'center',
    marginBottom: 26,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 5,
  },

  // 3. Mobile Number Input
  inputWrapper: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 24,
  },
  inputCard: {
    backgroundColor: '#EBE8F0',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: '#6B7280',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    padding: 0,
  },
  clearTouch: {
    padding: 4,
  },
  clearCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.4,
    borderColor: '#4B5563',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearX: {
    fontSize: 9,
    color: '#4B5563',
    fontWeight: '800',
    marginTop: -0.5,
  },
  helperText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 6,
    marginLeft: 2,
  },

  // 4. Centered Pill Send OTP Button
  sendOtpBtn: {
    width: 175,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#004D40',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 13,
    transform: [{ rotate: '-10deg' }],
  },
  sendOtpText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // 5. Footer Link
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 12.5,
    color: '#374151',
    fontWeight: '500',
  },
  registerLink: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#00796B',
  },
});

export default WelcomeBackScreen;
