import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { ROLES } from '../navigation/routes';
import { useAuth } from '../context/AuthContext';

export const RoleSwitcher = ({ style }) => {
  const { role, switchRole } = useAuth();

  const roleOptions = [
    { key: ROLES.BUYER, label: 'Buyer', icon: '🛍️' },
    { key: ROLES.ARTISAN, label: 'Artisan', icon: '🎨' },
    { key: ROLES.COURIER, label: 'Courier', icon: '📦' },
  ];

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.headerLabel}>SWITCH PREVIEW ROLE</Text>
      <View style={styles.buttonRow}>
        {roleOptions.map((opt) => {
          const isActive = role === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => switchRole(opt.key)}
              style={[
                styles.roleButton,
                isActive && styles.activeButton,
              ]}
              activeOpacity={0.8}
            >
              <Text style={styles.roleIcon}>{opt.icon}</Text>
              <Text
                style={[
                  styles.roleText,
                  isActive && styles.activeText,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: '#F0F4F3',
    gap: 4,
  },
  activeButton: {
    backgroundColor: COLORS.primary,
  },
  roleIcon: {
    fontSize: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default RoleSwitcher;
