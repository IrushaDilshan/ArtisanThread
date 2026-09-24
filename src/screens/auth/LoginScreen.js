import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, ROLES } from '../../navigation/routes';

export const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState(ROLES.BUYER);
  const [email, setEmail] = useState('curator@artisanthread.com');
  const [password, setPassword] = useState('••••••••');

  const rolePills = [
    { key: ROLES.BUYER, label: 'Buyer', icon: '🛍️', desc: 'Shop crafts' },
    { key: ROLES.ARTISAN, label: 'Artisan', icon: '🎨', desc: 'Manage atelier' },
    { key: ROLES.COURIER, label: 'Courier', icon: '📦', desc: 'Deliver goods' },
  ];

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    if (roleKey === ROLES.BUYER) setEmail('buyer@artisanthread.com');
    if (roleKey === ROLES.ARTISAN) setEmail('artisan.weaver@artisanthread.com');
    if (roleKey === ROLES.COURIER) setEmail('courier.express@artisanthread.com');
  };

  const handleLogin = () => {
    login(selectedRole);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Brand Banner */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🧵</Text>
          </View>
          <Text style={styles.brandTitle}>ArtisanThread</Text>
          <Text style={styles.brandTagline}>Handmade with Soul, Delivered with Care</Text>
        </View>

        {/* Main Auth Card */}
        <Card style={styles.authCard} elevation="medium">
          <Text style={styles.cardHeader}>Welcome Back</Text>
          <Text style={styles.cardSubtitle}>
            Select your account role to sign in to your dashboard
          </Text>

          {/* Quick Role Selector */}
          <Text style={styles.sectionLabel}>SELECT APP ROLE</Text>
          <View style={styles.roleGrid}>
            {rolePills.map((item) => {
              const isSelected = selectedRole === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => handleRoleSelect(item.key)}
                  activeOpacity={0.8}
                  style={[
                    styles.roleCard,
                    isSelected && styles.roleCardSelected,
                  ]}
                >
                  <Text style={styles.roleCardIcon}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.roleCardLabel,
                      isSelected && styles.roleCardLabelSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text style={styles.roleCardDesc}>{item.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Input Fields */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@domain.com"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.passwordRow}>
              <Text style={styles.inputLabel}>Password</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.AUTH.FORGOT_PASSWORD)}
              >
                <Text style={styles.forgotLink}>Forgot?</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.textInput}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter password"
            />
          </View>

          {/* Sign In CTA */}
          <Button
            title={`Enter as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
            onPress={handleLogin}
            variant="primary"
            style={styles.submitBtn}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account yet? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.AUTH.REGISTER, { defaultRole: selectedRole })}
            >
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Demo Helper Banner */}
        <View style={styles.demoHelper}>
          <Text style={styles.demoTitle}>💡 Multi-Role Architecture Demo</Text>
          <Text style={styles.demoText}>
            Tap any role above and hit "Enter" to preview that specific flow. You can also switch roles on-the-fly inside the app.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  brandContainer: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoEmoji: {
    fontSize: 32,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.textInverse,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 14,
    color: '#80CBC4',
    marginTop: 4,
    fontWeight: '500',
  },
  authCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  cardHeader: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  roleGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  roleCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#FAFCFB',
    alignItems: 'center',
  },
  roleCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  roleCardIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  roleCardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  roleCardLabelSelected: {
    color: COLORS.primary,
  },
  roleCardDesc: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  passwordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  forgotLink: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: '#FAFCFB',
  },
  submitBtn: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  demoHelper: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textInverse,
    marginBottom: 4,
  },
  demoText: {
    fontSize: 12,
    color: '#E0F2F1',
    lineHeight: 18,
  },
});

export default LoginScreen;
