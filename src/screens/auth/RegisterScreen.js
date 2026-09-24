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

export const RegisterScreen = ({ navigation, route }) => {
  const { login } = useAuth();
  const initialRole = route?.params?.defaultRole || ROLES.BUYER;
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [craftOrVehicle, setCraftOrVehicle] = useState('');

  const roles = [
    { key: ROLES.BUYER, label: 'Buyer', icon: '🛍️' },
    { key: ROLES.ARTISAN, label: 'Artisan', icon: '🎨' },
    { key: ROLES.COURIER, label: 'Courier', icon: '📦' },
  ];

  const handleRegister = () => {
    login(selectedRole, {
      name: fullName || (selectedRole === ROLES.BUYER ? 'New Collector' : selectedRole === ROLES.ARTISAN ? 'Studio Artisan' : 'Delivery Partner'),
      email: email || `${selectedRole}@artisanthread.com`,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Join ArtisanThread</Text>
          <Text style={styles.screenSubtitle}>Create your bespoke membership account</Text>
        </View>

        <Card style={styles.formCard} elevation="medium">
          <Text style={styles.label}>SELECT MEMBERSHIP TYPE</Text>
          <View style={styles.roleTabs}>
            {roles.map((r) => {
              const active = selectedRole === r.key;
              return (
                <TouchableOpacity
                  key={r.key}
                  onPress={() => setSelectedRole(r.key)}
                  style={[styles.roleTab, active && styles.roleTabActive]}
                >
                  <Text style={styles.tabIcon}>{r.icon}</Text>
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name / Studio Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Clara Oswald or Blue Earth Pottery"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="name@artisanthread.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {selectedRole === ROLES.ARTISAN && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Primary Craft Specialty</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Handloom Textiles, Ceramic Tableware"
                value={craftOrVehicle}
                onChangeText={setCraftOrVehicle}
              />
            </View>
          )}

          {selectedRole === ROLES.COURIER && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Delivery Vehicle Type</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Cargo Van, Electric Scooter, Bicycle"
                value={craftOrVehicle}
                onChangeText={setCraftOrVehicle}
              />
            </View>
          )}

          <Button
            title={`Create ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Account`}
            onPress={handleRegister}
            style={styles.registerBtn}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.AUTH.LOGIN)}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </Card>
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
    paddingVertical: SPACING.md,
  },
  header: {
    marginVertical: SPACING.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  backArrow: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
  },
  screenSubtitle: {
    fontSize: 13,
    color: '#80CBC4',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  roleTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#FAFCFB',
  },
  roleTabActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: '#FAFCFB',
  },
  registerBtn: {
    marginTop: 8,
    marginBottom: 16,
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
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default RegisterScreen;
