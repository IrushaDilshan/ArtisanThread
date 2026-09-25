import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROLES, ROUTES } from '../../navigation/routes';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

export const ChooseRoleScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { isLiveBackend, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const initialRole = route?.params?.role || route?.params?.preferredRole || ROLES.ARTISAN;
  const [selectedRole, setSelectedRole] = useState(initialRole);

  const roleOptions = [
    {
      key: ROLES.ARTISAN,
      title: 'Artisan (Master Craftsperson)',
      desc: 'Showcase atelier crafts & manage workshop orders',
    },
    {
      key: ROLES.BUYER,
      title: 'Buyer (Art & Craft Lover)',
      desc: 'Discover, collect, and purchase unique handcrafted works',
    },
    {
      key: ROLES.COURIER,
      title: 'Courier Partner (Logistics)',
      desc: 'Handle careful pickups and door-to-door deliveries',
    },
  ];

  const handleRegister = async () => {
    try {
      setLoading(true);
      const name = route?.params?.name || (selectedRole === ROLES.ARTISAN ? 'Atelier Artisan' : selectedRole === ROLES.COURIER ? 'Courier Partner' : 'Artisan Buyer');
      const email = route?.params?.email || `${selectedRole}_${Date.now()}@artisanthread.com`;
      const phone = route?.params?.phone || route?.params?.phoneNumber || '';
      const password = route?.params?.password || 'password123';

      if (!isLiveBackend) {
        Alert.alert('Configuration Error', 'Supabase backend credentials not found in .env.');
        return;
      }

      await authService.register({
        email,
        password,
        fullName: name,
        role: selectedRole,
        metadata: { phone },
      });

      logout();

      Alert.alert(
        'Registration Successful!',
        `Your ${selectedRole} account has been created. Please sign in with your phone number to access your dashboard.`,
        [
          {
            text: 'Sign In with Phone',
            onPress: () => {
              navigation?.navigate(ROUTES.AUTH.WELCOME_BACK, {
                phone,
              });
            },
          },
        ]
      );
    } catch (err) {
      if (err.message?.includes('Email not confirmed') || err.message?.includes('confirmed')) {
        Alert.alert(
          'Registration Successful!',
          `Your ${selectedRole} account has been created. Please sign in with your phone number to access your dashboard.`,
          [
            {
              text: 'Sign In with Phone',
              onPress: () => {
                navigation?.navigate(ROUTES.AUTH.WELCOME_BACK, {
                  phone: route?.params?.phone || '',
                });
              },
            },
          ]
        );
        return;
      }
      console.warn('Registration error:', err.message);
      Alert.alert('Registration Failed', err.message || 'Could not complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
          styles.container,
          {
            paddingTop: Math.max(insets.top, 32),
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
      >
        {/* Top Header */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Select Your Role</Text>
          <Text style={styles.subtitle}>Choose how you will participate in ArtisanThread</Text>
        </View>

        {/* Role Selection Radio Cards */}
        <View style={styles.optionsContainer}>
          {roleOptions.map((opt) => {
            const isSelected = selectedRole === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setSelectedRole(opt.key)}
                activeOpacity={0.85}
                style={[
                  styles.roleCard,
                  isSelected ? styles.roleCardActive : styles.roleCardInactive,
                ]}
              >
                <Text
                  style={[
                    styles.roleCardText,
                    isSelected ? styles.roleCardTextActive : styles.roleCardTextInactive,
                  ]}
                >
                  {opt.title}
                </Text>

                {/* Radio Button Indicator */}
                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterActive,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom Actions Bar */}
        <View style={styles.bottomBar}>
          {/* Round Back Button */}
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            activeOpacity={0.8}
            style={styles.roundBackBtn}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>

          {/* Bottom-Right "Register" Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.88}
            style={styles.registerBtn}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.sendIcon}>➤</Text>
                <Text style={styles.registerText}>Complete Setup</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111E1C',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 18,
    marginVertical: 'auto',
  },
  roleCard: {
    height: 64,
    borderRadius: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleCardActive: {
    backgroundColor: '#B5CBC5',
  },
  roleCardInactive: {
    backgroundColor: '#E5ECE9',
  },
  roleCardText: {
    fontSize: 16,
    letterSpacing: -0.2,
  },
  roleCardTextActive: {
    fontWeight: '700',
    color: '#111E1C',
  },
  roleCardTextInactive: {
    fontWeight: '600',
    color: '#344642',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: '#37474F',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  radioOuterActive: {
    borderColor: '#111E1C',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#111E1C',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#004D40',
    height: 46,
    borderRadius: 23,
    paddingHorizontal: 24,
    gap: 8,
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  registerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default ChooseRoleScreen;
