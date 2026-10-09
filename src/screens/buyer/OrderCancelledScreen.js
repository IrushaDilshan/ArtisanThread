import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/Button';
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

const getAmount = (order, checkout, payment, refund) => {
  const values = [
    refund?.amount,
    payment?.refund_amount,
    checkout?.totalAmount,
    order?.total_amount,
  ];
  for (const value of values) {
    const amount = toAmount(value);
    if (amount !== null) {
      return amount;
    }
  }

  const items = Array.isArray(checkout?.items)
    ? checkout.items
    : Array.isArray(order?.items)
      ? order.items
      : [];

  if (items.length === 0) {
    return null;
  }

  return items.reduce((sum, item) => {
    const price = toAmount(
      item?.price ??
        item?.unit_price ??
        item?.product?.price ??
        item?.product?.unit_price
    );
    const quantity = Number(item?.quantity ?? 1);
    return price !== null && Number.isFinite(quantity) && quantity > 0
      ? sum + price * quantity
      : sum;
  }, 0);
};

const formatMoney = (amount) =>
  amount === null
    ? 'LKR —'
    : `LKR ${amount.toLocaleString('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

const formatRefundStatus = (status) => {
  switch (String(status || '').toUpperCase()) {
    case 'REFUND_INITIATED':
      return 'Refund Initiated';
    case 'REFUNDED':
      return 'Refunded';
    case 'NOT_REQUIRED':
      return 'Not Required';
    default:
      return 'Not Required';
  }
};

const normalizeRefundStatus = (status) => {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'REFUNDED') return 'REFUNDED';
  if (normalized === 'REFUND_INITIATED') return 'REFUND_INITIATED';
  if (normalized === 'NOT_REQUIRED') return 'NOT_REQUIRED';
  return 'NOT_REQUIRED';
};

export const OrderCancelledScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const order = route?.params?.order || {};
  const checkout = route?.params?.checkout || {};
  const payment = route?.params?.payment || {};
  const refund = route?.params?.refund || {};
  const routeRefundStatus = normalizeRefundStatus(
    refund.status ||
      payment.refund_status ||
      payment.payment_status ||
      order.payment_status
  );
  const [refundStatus, setRefundStatus] = useState(routeRefundStatus);
  const orderId = order.id;
  const refundAmount = useMemo(
    () => getAmount(order, checkout, payment, refund),
    [order, checkout, payment, refund]
  );
  const orderNumber =
    order.order_number || order.orderNumber || order.id || '0xT23456';
  const cardLast4 =
    typeof route?.params?.cardLast4 === 'string' &&
    /^\d{4}$/.test(route.params.cardLast4)
      ? route.params.cardLast4
      : null;
  const refundRequired = refundStatus !== 'NOT_REQUIRED';

  useEffect(() => {
    setRefundStatus(routeRefundStatus);
  }, [routeRefundStatus]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      if (!orderId) {
        return () => {
          isActive = false;
        };
      }

      orderService
        .getPaymentStatus(orderId)
        .then((status) => {
          if (isActive && status) {
            setRefundStatus(normalizeRefundStatus(status));
          }
        })
        .catch((error) => {
          if (isActive) {
            Alert.alert(
              'Unable to refresh refund status',
              error?.message || 'Please try again later.'
            );
          }
        });

      return () => {
        isActive = false;
      };
    }, [orderId])
  );

  useEffect(() => {
    if (refundStatus !== 'REFUND_INITIATED') return undefined;

    let isActive = true;
    setTimeout(() => {
      orderService
        .completeSimulatedRefund(orderId)
        .then((completedStatus) => {
          if (!completedStatus) {
            throw new Error('The simulated refund status could not be updated.');
          }
          const nextStatus = normalizeRefundStatus(completedStatus);
          if (isActive) {
            setRefundStatus(nextStatus);
            navigation.setParams({
              order: { ...order, payment_status: nextStatus.toLowerCase() },
              payment: {
                ...payment,
                status: nextStatus,
                payment_status: nextStatus,
                refund_status: nextStatus,
              },
              refund: { ...refund, status: nextStatus },
            });
          }
        })
        .catch((error) => {
          if (isActive) {
            Alert.alert(
              'Unable to complete simulated refund',
              error?.message || 'Please try again later.'
            );
          }
        });
    }, 2500);

    return () => {
      isActive = false;
    };
  }, [navigation, orderId, order, payment, refund, refundStatus]);

  const backToOrders = () => {
    navigation.navigate('BuyerTabs', {
      screen: ROUTES.BUYER.ORDERS,
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
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, SPACING.lg) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.successIconWrap}>
          <Text style={styles.successCheck}>✓</Text>
        </View>

        <Text style={styles.title}>Order Canceled</Text>
        <Text style={styles.orderNumber}>Order {orderNumber}</Text>
        {cardLast4 ? (
          <Text style={styles.cardLast4}>Card ending in {cardLast4}</Text>
        ) : null}

        <Card style={styles.refundCard}>
          <Text style={styles.cardTitle}>Refund Details</Text>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {refundRequired ? 'Refund Amount' : 'Payment Amount'}
            </Text>
            <Text style={styles.amount}>{formatMoney(refundAmount)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Refund Status</Text>
            <Text
              style={[
                styles.refundStatus,
                !refundRequired && styles.noRefundStatus,
              ]}
            >
              {formatRefundStatus(refundStatus)}
            </Text>
          </View>
          {refundRequired ? (
            <View style={styles.estimateSection}>
              {refundStatus === 'REFUNDED' ? (
                <>
                  <Text style={styles.estimateValue}>
                    Refund completed successfully.
                  </Text>
                  <Text style={styles.refundAmountCompleted}>
                    Refunded amount: {formatMoney(refundAmount)}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.estimateLabel}>Refund progress:</Text>
                  <Text style={styles.estimateValue}>
                    The simulated refund is being processed.
                  </Text>
                </>
              )}
              {refund?.id || payment?.refund_id ? (
                <Text style={styles.refundId}>
                  Reference: {refund.id || payment.refund_id}
                </Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.estimateSection}>
              <Text style={styles.noRefundMessage}>
                No payment was held, so a refund is not required.
              </Text>
            </View>
          )}
        </Card>

        <View style={styles.infoBox}>
          <View style={styles.infoIconWrap}>
            <Text style={styles.infoIcon}>i</Text>
          </View>
          <Text style={styles.infoText}>
            {refundRequired
              ? 'This is a simulated refund for demonstration only. No real money has been transferred.'
              : 'This order was cancelled before payment was held. No payment refund is required.'}
          </Text>
        </View>

        <Button
          title="Back to Order"
          onPress={backToOrders}
          size="large"
          style={styles.actionButton}
        />
      </ScrollView>
    </View>
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
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backArrow: {
    color: COLORS.textPrimary,
    fontSize: 34,
    lineHeight: 38,
  },
  headerSpacer: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    padding: SPACING.md,
    paddingTop: SPACING.xl,
  },
  successIconWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.pill,
    height: 68,
    justifyContent: 'center',
    width: 68,
  },
  successCheck: {
    color: COLORS.textInverse,
    fontSize: 40,
    fontWeight: '800',
    lineHeight: 46,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  orderNumber: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  cardLast4: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  refundCard: {
    alignSelf: 'stretch',
    marginTop: SPACING.lg,
    padding: SPACING.md,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    paddingBottom: SPACING.sm,
  },
  divider: {
    backgroundColor: COLORS.borderLight,
    height: 1,
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  detailLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  amount: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  refundStatus: {
    color: COLORS.primary,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: SPACING.sm,
    textAlign: 'right',
  },
  noRefundStatus: {
    color: COLORS.textMuted,
  },
  estimateSection: {
    borderTopColor: COLORS.borderLight,
    borderTopWidth: 1,
    paddingTop: SPACING.md,
  },
  estimateLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  estimateValue: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: SPACING.xs,
  },
  refundAmountCompleted: {
    color: COLORS.success,
    fontSize: 13,
    fontWeight: '700',
    marginTop: SPACING.xs,
  },
  refundId: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: SPACING.sm,
  },
  noRefundMessage: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  infoBox: {
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    padding: SPACING.md,
  },
  infoIconWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  infoIcon: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '800',
  },
  infoText: {
    color: COLORS.textSecondary,
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  actionButton: {
    alignSelf: 'stretch',
    marginTop: SPACING.lg,
  },
});

export default OrderCancelledScreen;
