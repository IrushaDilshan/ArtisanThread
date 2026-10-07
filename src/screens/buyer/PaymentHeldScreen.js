import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/Button';
import { BuyerMember3Footer } from '../../components/BuyerMember3Footer';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../constants/theme';
import { ROUTES } from '../../navigation/routes';

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

const formatMoney = (amount, currencySymbol = 'Rs. ') =>
  amount === null
    ? 'Not provided'
    : `${currencySymbol}${amount.toLocaleString('en-US', {
        maximumFractionDigits: 2,
      })}`;

const BellIcon = () => (
  <View accessible accessibilityLabel="Notification" style={styles.bellIcon}>
    <View style={styles.bellBody} />
    <View style={styles.bellBase} />
    <View style={styles.bellClapper} />
  </View>
);

export const PaymentHeldScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const checkout = route?.params?.checkout;
  const orderTotal = useMemo(() => getCheckoutTotal(checkout), [checkout]);
  const cardLast4 =
    typeof route?.params?.cardLast4 === 'string' &&
    /^\d{4}$/.test(route.params.cardLast4)
      ? route.params.cardLast4
      : null;

  const viewOrders = () => {
    const currentOrder = route?.params?.order || {};
    const existingStatus =
      typeof currentOrder.status === 'string'
        ? currentOrder.status.toUpperCase()
        : '';
    const orderStatus =
      existingStatus === 'CANCELLED'
        ? 'CANCELLED'
        : !existingStatus || existingStatus === 'PENDING'
          ? 'CONFIRMED'
          : currentOrder.status;

    navigation.navigate(ROUTES.BUYER.ORDER_STATUS, {
      checkout,
      payment: {
        ...(route?.params?.payment || {}),
        method: 'Secure Escrow Payment',
        payment_method: 'secure_escrow',
        status: 'HELD',
        payment_status: 'HELD',
        order_status: orderStatus,
      },
      order: { ...currentOrder, status: orderStatus },
      cardLast4,
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Holding</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, SPACING.lg) + 72 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.confirmation}>
          <View style={styles.successIconWrap}>
            <Text style={styles.successCheck}>✓</Text>
          </View>

          <Text style={styles.successTitle}>Payment Received!</Text>
          <Text style={styles.totalAmount}>
            {formatMoney(orderTotal, checkout?.currencySymbol || 'Rs. ')}
          </Text>

          <View style={styles.statusPill}>
            <Text style={styles.statusText}>HELD</Text>
          </View>

          <Text style={styles.explanation}>
            Your payment is held in escrow and will be released after the order
            is completed and confirmed.
          </Text>
        </View>

        {cardLast4 ? (
          <View style={styles.cardSummary}>
            <Text style={styles.cardSummaryLabel}>Paid with card</Text>
            <Text style={styles.cardSummaryValue}>•••• {cardLast4}</Text>
          </View>
        ) : null}

        <View style={styles.informationCard}>
          <View style={styles.bellIconWrap}>
            <BellIcon />
          </View>
          <View style={styles.informationCopy}>
            <Text style={styles.informationTitle}>Funds are safe with us.</Text>
            <Text style={styles.informationMessage}>
              You’ll be notified once it’s released.
            </Text>
          </View>
        </View>

        <Text style={styles.simulationNote}>
          Your payment is securely held in escrow until order completion.
        </Text>

        <Button
          title="View Order Status"
          onPress={viewOrders}
          size="large"
          style={styles.actionButton}
        />
      </ScrollView>
      <BuyerMember3Footer
        navigation={navigation}
        activeRoute={ROUTES.BUYER.ORDERS}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
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
    alignItems: 'center',
    flexGrow: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl,
  },
  confirmation: {
    alignItems: 'center',
    width: '100%',
  },
  successIconWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.pill,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  successCheck: {
    color: COLORS.textInverse,
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 40,
  },
  successTitle: {
    color: COLORS.textPrimary,
    fontSize: 23,
    fontWeight: '800',
    marginTop: SPACING.lg,
    textAlign: 'center',
    textDecorationLine: 'underline',
    textDecorationColor: COLORS.border,
  },
  totalAmount: {
    color: COLORS.textPrimary,
    fontSize: 27,
    fontWeight: '800',
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  statusPill: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    height: 38,
    justifyContent: 'center',
    marginTop: SPACING.md,
    width: 100,
  },
  statusText: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  explanation: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 24,
    marginTop: SPACING.lg,
    maxWidth: 310,
    textAlign: 'center',
  },
  cardSummary: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'center',
    marginTop: SPACING.md,
    maxWidth: 400,
    width: '100%',
  },
  cardSummaryLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  cardSummaryValue: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  informationCard: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
    minHeight: 106,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  bellIconWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  bellIcon: {
    alignItems: 'center',
    height: 27,
    justifyContent: 'flex-start',
    position: 'relative',
    width: 28,
  },
  bellBody: {
    backgroundColor: COLORS.textPrimary,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    height: 19,
    marginTop: 3,
    width: 19,
  },
  bellBase: {
    backgroundColor: COLORS.textPrimary,
    borderRadius: RADIUS.pill,
    height: 3,
    marginTop: 2,
    width: 25,
  },
  bellClapper: {
    backgroundColor: COLORS.textPrimary,
    borderRadius: RADIUS.pill,
    height: 4,
    marginTop: 1,
    width: 5,
  },
  informationCopy: {
    flex: 1,
  },
  informationTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  informationMessage: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: SPACING.xs,
  },
  simulationNote: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: SPACING.md,
    maxWidth: 330,
    textAlign: 'center',
  },
  actionButton: {
    alignSelf: 'center',
    height: 48,
    justifyContent: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
    paddingVertical: 0,
    width: '90%',
  },
});
