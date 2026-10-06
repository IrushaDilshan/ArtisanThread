import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

export const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your registered email and we'll send you an artisan access recovery link.
        </Text>

        <Card style={styles.card} elevation="medium">
          {sent ? (
            <View style={styles.sentContainer}>
              <Text style={styles.sentIcon}>📬</Text>
              <Text style={styles.sentTitle}>Recovery Email Sent</Text>
              <Text style={styles.sentDesc}>
                Instructions to reset your password have been delivered to {email || 'your email'}.
              </Text>
              <Button
                title="Return to Login"
                variant="primary"
                onPress={() => navigation.goBack()}
                style={styles.actionBtn}
              />
            </View>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="name@artisanthread.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <Button
                title="Send Recovery Link"
                onPress={() => setSent(true)}
                style={styles.actionBtn}
              />

              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Back to Sign In</Text>
              </TouchableOpacity>
            </>
          )}
        </Card>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    padding: SPACING.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  backArrow: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 13,
    color: '#80CBC4',
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.medium,
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
  actionBtn: {
    marginTop: 8,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  cancelText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  sentContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  sentIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  sentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sentDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
});

export default ForgotPasswordScreen;
