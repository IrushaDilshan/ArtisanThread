import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/Button';
import { BuyerMember3Footer } from '../../components/BuyerMember3Footer';
import { Card } from '../../components/Card';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../constants/theme';
import { ROUTES } from '../../navigation/routes';
import { orderService } from '../../services/orderService';

const toAmount = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? value : null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const amount = Number(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
};

const getCheckoutTotal = (checkout) => {
  const providedTotal = toAmount(checkout?.totalAmount);
  if (providedTotal !== null) {
    return providedTotal;
  }

  if (!Array.isArray(checkout?.items)) {
    return null;
  }

  return checkout.items.reduce((total, item) => {
    const price = toAmount(
      item?.price ?? item?.unit_price ?? item?.product?.price
    );
    const quantity = Number(item?.quantity ?? 1);

    return price !== null && Number.isFinite(quantity) && quantity > 0
      ? total + price * quantity
      : total;
  }, 0);
};

const formatMoney = (amount, currencySymbol = 'Rs. ') => {
  if (amount === null) {
    return 'Not provided';
  }

  return `${currencySymbol}${amount.toLocaleString('en-US', {
    maximumFractionDigits: 2,
  })}`;
};

const formatCardNumber = (digits) =>
  digits.match(/.{1,4}/g)?.join(' ') || '';

const getCardNumberError = (digits) => {
  if (!digits) {
    return 'Enter your card number.';
  }
  if (digits.length < 12 || digits.length > 19) {
    return 'Enter a card number with 12 to 19 digits.';
  }
  return '';
};

const getExpiryError = (value) => {
  if (!value) {
    return 'Enter your card expiry date.';
  }
  if (!/^\d{2}\/\d{2}$/.test(value)) {
    return 'Enter the expiry date as MM/YY.';
  }

  const [monthText, yearText] = value.split('/');
  const month = Number(monthText);
  const year = 2000 + Number(yearText);
  const now = new Date();

  if (month < 1 || month > 12) {
    return 'Enter a valid expiry month.';
  }
  if (
    year < now.getFullYear() ||
    (year === now.getFullYear() && month < now.getMonth() + 1)
  ) {
    return 'This card has expired.';
  }
  return '';
};

const getCvvError = (value) => {
  if (!value) {
    return 'Enter your CVV.';
  }
  if (!/^\d{3,4}$/.test(value)) {
    return 'CVV must contain 3 or 4 digits.';
  }
  return '';
};

const ProtectionRow = ({ icon, children }) => (
  <View style={styles.protectionRow}>
    <View style={styles.protectionIconWrap}>
      <Text style={styles.protectionIcon}>{icon}</Text>
    </View>
    <Text style={styles.protectionText}>{children}</Text>
    <Text style={styles.rowCheck}>✓</Text>
  </View>
);

export const SecureEscrowPaymentScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const checkout = route?.params?.checkout;
  const orderTotal = useMemo(() => getCheckoutTotal(checkout), [checkout]);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  const updateCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 19);
    setCardNumber(formatCardNumber(digits));
    if (errors.cardNumber) {
      setErrors((current) => ({
        ...current,
        cardNumber: getCardNumberError(digits),
      }));
    }
  };

  const updateExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    const formatted =
      digits.length > 2
        ? `${digits.slice(0, 2)}/${digits.slice(2)}`
        : digits;
    setExpiry(formatted);
    if (errors.expiry) {
      setErrors((current) => ({
        ...current,
        expiry: getExpiryError(formatted),
      }));
    }
  };

  const updateCvv = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setCvv(digits);
    if (errors.cvv) {
      setErrors((current) => ({
        ...current,
        cvv: getCvvError(digits),
      }));
    }
  };

  const handleContinue = () => {
    if (processing) {
      return;
    }

    const digits = cardNumber.replace(/\D/g, '');
    const nextErrors = {
      cardNumber: getCardNumberError(digits),
      expiry: getExpiryError(expiry),
      cvv: getCvvError(cvv),
      terms: termsAccepted ? '' : 'You must agree to the Terms & Conditions.',
    };
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setProcessing(true);
    timeoutRef.current = setTimeout(async () => {
      const incomingOrder = route?.params?.order || {};
      const incomingStatus =
        typeof incomingOrder.status === 'string'
          ? incomingOrder.status.toUpperCase()
          : '';
      const orderStatus =
        !incomingStatus || incomingStatus === 'PENDING'
          ? 'CONFIRMED'
          : incomingStatus;
      let confirmedOrder = {
        ...incomingOrder,
        status: orderStatus,
      };

      try {
        if (incomingOrder.id && incomingStatus === 'PENDING') {
          const updatedOrder = await orderService.updateOrderStatus(
            incomingOrder.id,
            'CONFIRMED'
          );
          const updatedPayment = await orderService.updatePaymentStatus(
            incomingOrder.id,
            'held'
          );
          confirmedOrder = {
            ...confirmedOrder,
            ...updatedOrder,
            ...updatedPayment,
          };
          confirmedOrder.payment_status = 'held';
        }

        setCardNumber('');
        setExpiry('');
        setCvv('');
        setPaymentSuccess(true);
        timeoutRef.current = setTimeout(() => {
          navigation.navigate(ROUTES.BUYER.PAYMENT_HELD, {
            checkout,
            order: confirmedOrder,
            payment: {
              ...(route?.params?.payment || {}),
              method: 'Secure Escrow Payment',
              payment_method: 'secure_escrow',
              status: 'HELD',
              payment_status: 'HELD',
              order_status: confirmedOrder.status,
            },
            cardLast4: digits.slice(-4),
          });
          timeoutRef.current = null;
        }, 1000);
      } catch (error) {
        setProcessing(false);
        Alert.alert(
          'Unable to confirm order',
          error?.message || 'Please try again.'
        );
        timeoutRef.current = null;
      }
    }, 2000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Escrow Payment</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, SPACING.lg) + 72 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!checkout ? (
          <Card style={styles.missingCard}>
            <Text style={styles.errorTitle}>Checkout details unavailable</Text>
            <Text style={styles.bodyText}>
              Return to checkout and try again. Your order information was not
              provided.
            </Text>
            <Button
              title="Back to Checkout"
              variant="outline"
              onPress={() => navigation.goBack()}
              style={styles.fullButton}
            />
          </Card>
        ) : (
          <>
            <View style={styles.intro}>
              <View style={styles.heroIconWrap}>
                <Text style={styles.heroIcon}>🛡️</Text>
              </View>
              <Text style={styles.introTitle}>
                Your payment is secured with escrow protection.
              </Text>
              <Text style={styles.introCopy}>
                We hold your payment until the order is completed and confirmed.
              </Text>
            </View>

            <Card style={styles.totalCard}>
              <View>
                <Text style={styles.totalLabel}>Order Total</Text>
                <Text style={styles.totalCaption}>
                  Payment held securely in escrow
                </Text>
              </View>
              <Text style={styles.totalAmount}>
                {formatMoney(orderTotal, checkout?.currencySymbol || 'Rs. ')}
              </Text>
            </Card>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Card Details</Text>
              <Card style={styles.formCard}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  accessibilityLabel="Card number"
                  keyboardType="number-pad"
                  maxLength={23}
                  onChangeText={updateCardNumber}
                  placeholder="**** **** **** 3456"
                  placeholderTextColor={COLORS.textMuted}
                  style={[
                    styles.input,
                    errors.cardNumber && styles.inputError,
                  ]}
                  value={cardNumber}
                />
                {errors.cardNumber ? (
                  <Text style={styles.fieldError}>{errors.cardNumber}</Text>
                ) : null}

                <View style={styles.rowFields}>
                  <View style={styles.expiryField}>
                    <Text style={styles.inputLabel}>Expiry</Text>
                    <TextInput
                      accessibilityLabel="Card expiry"
                      keyboardType="number-pad"
                      maxLength={5}
                      onChangeText={updateExpiry}
                      placeholder="MM/YY"
                      placeholderTextColor={COLORS.textMuted}
                      style={[
                        styles.input,
                        errors.expiry && styles.inputError,
                      ]}
                      value={expiry}
                    />
                    {errors.expiry ? (
                      <Text style={styles.fieldError}>{errors.expiry}</Text>
                    ) : null}
                  </View>
                  <View style={styles.cvvField}>
                    <Text style={styles.inputLabel}>CVV</Text>
                    <TextInput
                      accessibilityLabel="Card CVV"
                      keyboardType="number-pad"
                      maxLength={4}
                      onChangeText={updateCvv}
                      placeholder="CVV"
                      placeholderTextColor={COLORS.textMuted}
                      secureTextEntry
                      style={[styles.input, errors.cvv && styles.inputError]}
                      value={cvv}
                    />
                    {errors.cvv ? (
                      <Text style={styles.fieldError}>{errors.cvv}</Text>
                    ) : null}
                  </View>
                </View>
                <Text style={styles.temporaryNote}>
                  Card details are used only for this simulated payment and are
                  not saved.
                </Text>
              </Card>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Escrow Protection</Text>
              <Card style={styles.protectionCard}>
                <ProtectionRow icon="🛡️">
                  Payment held securely
                </ProtectionRow>
                <View style={styles.rowDivider} />
                <ProtectionRow icon="🔒">
                  Released after order completion
                </ProtectionRow>
                <View style={styles.rowDivider} />
                <ProtectionRow icon="💳">
                  Supports card and COD
                </ProtectionRow>
              </Card>
            </View>

            <View style={styles.termsBlock}>
              <TouchableOpacity
                accessibilityRole="checkbox"
                accessibilityState={{ checked: termsAccepted }}
                activeOpacity={0.75}
                onPress={() => {
                  setTermsAccepted((accepted) => !accepted);
                  if (!termsAccepted) {
                    setErrors((current) => ({ ...current, terms: '' }));
                  }
                }}
                style={styles.termsRow}
              >
                <View
                  style={[
                    styles.checkbox,
                    termsAccepted && styles.checkboxChecked,
                  ]}
                >
                  {termsAccepted ? (
                    <Text style={styles.checkboxTick}>✓</Text>
                  ) : null}
                </View>
                <Text style={styles.termsText}>
                  I agree the <Text style={styles.termsEmphasis}>Terms &amp; Conditions</Text>
                </Text>
              </TouchableOpacity>
              {errors.terms ? (
                <Text style={styles.fieldError}>{errors.terms}</Text>
              ) : null}
            </View>

            {paymentSuccess ? (
              <View
                accessibilityLiveRegion="polite"
                style={styles.successState}
              >
                <Text style={styles.successTitle}>✓ Payment Successful</Text>
                <Text style={styles.successCopy}>
                  Your payment has been securely held in escrow.
                </Text>
              </View>
            ) : (
              <Button
                title={
                  processing ? 'Processing Payment...' : 'Continue Payment'
                }
                icon={
                  processing ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : null
                }
                disabled={processing}
                onPress={handleContinue}
                size="large"
                style={styles.fullButton}
                textStyle={processing ? styles.processingButtonText : undefined}
              />
            )}
            <Text style={styles.simulationNote}>
              Your payment is securely held in escrow until order completion.
            </Text>
          </>
        )}
      </ScrollView>
      <BuyerMember3Footer
        navigation={navigation}
        activeRoute={ROUTES.BUYER.HOME}
        confirmBeforeLeave={!processing && !paymentSuccess}
        paymentInProgress={processing}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderBottomColor: COLORS.borderLight,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 58,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  backButton: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backArrow: {
    color: COLORS.textPrimary,
    fontSize: 34,
    lineHeight: 38,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
  headerSpacer: {
    width: 8,
  },
  scrollContent: {
    gap: SPACING.md,
    padding: SPACING.md,
  },
  intro: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  heroIconWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    borderRadius: RADIUS.pill,
    height: 76,
    justifyContent: 'center',
    marginBottom: SPACING.md,
    width: 76,
  },
  heroIcon: {
    fontSize: 38,
  },
  introTitle: {
    color: COLORS.textPrimary,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 26,
    maxWidth: 330,
    textAlign: 'center',
  },
  introCopy: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: SPACING.xs,
    maxWidth: 330,
    textAlign: 'center',
  },
  totalCard: {
    alignItems: 'center',
    borderColor: COLORS.primaryMuted,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  totalLabel: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  totalCaption: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 3,
  },
  totalAmount: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '800',
  },
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 2,
  },
  formCard: {
    padding: SPACING.md,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    height: 50,
    paddingHorizontal: SPACING.md,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  fieldError: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 5,
  },
  rowFields: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  expiryField: {
    flex: 1,
  },
  cvvField: {
    flex: 1,
  },
  temporaryNote: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: SPACING.md,
  },
  protectionCard: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  protectionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 54,
  },
  protectionIconWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    borderRadius: RADIUS.sm,
    height: 34,
    justifyContent: 'center',
    marginRight: SPACING.md,
    width: 34,
  },
  protectionIcon: {
    fontSize: 17,
  },
  protectionText: {
    color: COLORS.textPrimary,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  rowCheck: {
    color: COLORS.success,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
  rowDivider: {
    backgroundColor: COLORS.borderLight,
    height: 1,
    marginLeft: 46,
  },
  termsBlock: {
    marginTop: SPACING.xs,
  },
  termsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 36,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: COLORS.border,
    borderRadius: RADIUS.xs,
    borderWidth: 1.5,
    height: 22,
    justifyContent: 'center',
    marginRight: SPACING.sm,
    width: 22,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxTick: {
    color: COLORS.textInverse,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
  termsText: {
    color: COLORS.textSecondary,
    flex: 1,
    fontSize: 13,
  },
  termsEmphasis: {
    color: COLORS.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  fullButton: {
    width: '100%',
  },
  processingButtonText: {
    color: COLORS.primary,
  },
  successState: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    width: '100%',
  },
  successTitle: {
    color: COLORS.success,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  successCopy: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  simulationNote: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: -SPACING.xs,
    textAlign: 'center',
  },
  missingCard: {
    gap: SPACING.sm,
  },
  errorTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  bodyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
});
