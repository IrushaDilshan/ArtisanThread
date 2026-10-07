import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/Button';
import { BuyerMember3Footer } from '../../components/BuyerMember3Footer';
import { Card } from '../../components/Card';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { RADIUS, SPACING } from '../../constants/theme';
import { ROUTES } from '../../navigation/routes';
import { orderService } from '../../services/orderService';

const ORDER_STEPS = [
  { status: 'PENDING', title: 'Order Placed', time: 'Sept 26, 10:20 AM', icon: '✓' },
  { status: 'CONFIRMED', title: 'Payment Confirmed', time: 'Sept 26, 10:35 AM', icon: '✓' },
  { status: 'CRAFTING', title: 'Artisan Preparing', time: 'Sept 26, 02:00 PM', icon: '✦' },
  { status: 'READY_FOR_PICKUP', title: 'Ready for Courier Pickup', time: 'Sept 27, 11:00 AM', icon: '□' },
  { status: 'COURIER_ASSIGNED', title: 'Courier Assigned', time: 'Sept 27, 01:15 PM', icon: '↗' },
  { status: 'IN_TRANSIT', title: 'In Transit', time: 'Sept 27, 01:30 PM', icon: '↗' },
  { status: 'DELIVERED', title: 'Delivered', time: 'Estimated: Sept 28, 05:00 PM', icon: '✓' },
];

const CANCELLABLE_STATUSES = ['PENDING', 'CONFIRMED', 'CRAFTING'];

const normalizeStatus = (status) => {
  if (typeof status !== 'string') {
    return 'PENDING';
  }

  const normalized = status.trim().toUpperCase();
  return [
    'PENDING',
    'CONFIRMED',
    'CRAFTING',
    'READY_FOR_PICKUP',
    'IN_TRANSIT',
    'DELIVERED',
    'CANCELLED',
  ].includes(normalized)
    ? normalized
    : 'UNKNOWN';
};

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

const getTotal = (order, checkout) => {
  const provided =
    toAmount(checkout?.totalAmount) ?? toAmount(order?.total_amount);
  if (provided !== null) {
    return provided;
  }

  const items = Array.isArray(checkout?.items)
    ? checkout.items
    : Array.isArray(order?.items)
      ? order.items
      : [];

  if (items.length === 0) {
    return null;
  }

  return items.reduce((total, item) => {
    const price = toAmount(
      item?.price ??
        item?.unit_price ??
        item?.product?.price ??
        item?.product?.unit_price
    );
    const quantity = Number(item?.quantity ?? 1);

    return price !== null && Number.isFinite(quantity) && quantity > 0
      ? total + price * quantity
      : total;
  }, 0);
};

const formatMoney = (amount, currencySymbol = 'Rs. ') =>
  amount === null
    ? `${currencySymbol}—`
    : `${currencySymbol}${amount.toLocaleString('en-US', {
        maximumFractionDigits: 2,
      })}`;

const getFirstItem = (order, checkout) => {
  const items = Array.isArray(checkout?.items)
    ? checkout.items
    : Array.isArray(order?.items)
      ? order.items
      : [];
  return items[0] || {};
};

const getItemTitle = (item) =>
  item?.title ||
  item?.name ||
  item?.product?.title ||
  item?.product?.name ||
  'Handmade Batik Bag';

const getItemImage = (item) =>
  item?.image_url ||
  item?.imageUrl ||
  item?.product?.image_url ||
  item?.product?.imageUrl ||
  null;

const isCancellable = (status) => CANCELLABLE_STATUSES.includes(status);

const hasEscrowHeldPayment = (payment, order) =>
  [payment?.payment_status, payment?.status, order?.payment_status].some(
    (status) => String(status || '').toUpperCase() === 'HELD'
  );

const TimelineStep = ({ step, state, isLast, time }) => {
  const isComplete = state === 'complete';
  const isCurrent = state === 'current';

  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineRail}>
        <View
          style={[
            styles.timelineDot,
            isComplete && styles.completeDot,
            isCurrent && styles.currentDot,
          ]}
        >
          <Text
            style={[
              styles.dotIcon,
              isComplete && styles.completeDotIcon,
              isCurrent && styles.currentDotIcon,
            ]}
          >
            {isComplete ? '✓' : isCurrent ? step.icon : ''}
          </Text>
        </View>
        {!isLast ? (
          <View
            style={[
              styles.timelineLine,
              isComplete && styles.completeLine,
            ]}
          />
        ) : null}
      </View>
      <View style={styles.stepCopy}>
        <Text
          style={[
            styles.stepTitle,
            isCurrent && styles.currentStepTitle,
            state === 'upcoming' && styles.upcomingStepTitle,
          ]}
        >
          {step.title}
        </Text>
        <Text
          style={[
            styles.stepTime,
            state === 'upcoming' && styles.upcomingStepTime,
          ]}
        >
          {time || step.time}
        </Text>
      </View>
    </View>
  );
};

export const OrderStatusScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { user, isLiveBackend } = useAuth();
  const order = route?.params?.order || {};
  const orderRef = useRef(order);
  orderRef.current = order;
  const checkout = route?.params?.checkout || {};
  const payment = route?.params?.payment || {};
  const incomingStatus = normalizeStatus(
    order.status || payment.order_status || 'PENDING'
  );
  const [currentStatus, setCurrentStatus] = useState(incomingStatus);
  const [statusBeforeCancel, setStatusBeforeCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const statusRef = useRef(incomingStatus);
  const item = getFirstItem(order, checkout);
  const itemImage = getItemImage(item);
  const title = order.title || getItemTitle(item);
  const total = useMemo(() => getTotal(order, checkout), [order, checkout]);
  const paymentMethodValue =
    payment.payment_method ||
    payment.method ||
    order.payment_method ||
    checkout.paymentMethod ||
    '';
  const paymentStatusValue = String(
    payment.payment_status || payment.status || order.payment_status || ''
  ).toUpperCase();
  const isCashOnDelivery =
    /cash|delivery|cod/i.test(String(paymentMethodValue)) ||
    paymentStatusValue === 'CASH_ON_DELIVERY';
  const paymentMethodLabel = isCashOnDelivery
    ? 'Cash on Delivery'
    : paymentMethodValue
      ? 'Secure Escrow Payment'
      : hasEscrowHeldPayment(payment, order)
        ? 'Secure Escrow Payment'
        : 'Not provided';
  const paymentStatusLabel = isCashOnDelivery
    ? 'Pending'
    : hasEscrowHeldPayment(payment, order)
      ? 'Held in Escrow'
      : paymentStatusValue === 'REFUND_INITIATED'
        ? 'Refund Initiated'
        : paymentStatusValue === 'REFUNDED'
          ? 'Refunded'
          : paymentStatusValue === 'CONFIRMED' ||
              paymentStatusValue === 'PAID'
            ? 'Confirmed'
            : 'Pending';
  const orderNumber =
    order.order_number || order.orderNumber || order.id || '0xT23456';
  const orderId = order.id;
  const canCancelOrder = isCancellable(currentStatus);
  const activeStepIndex = ORDER_STEPS.findIndex(
    (step) => step.status === currentStatus
  );
  const cancelledStepIndex =
    currentStatus === 'CANCELLED'
      ? ORDER_STEPS.findIndex((step) => step.status === statusBeforeCancel)
      : -1;
  const visibleSteps =
    currentStatus === 'CANCELLED'
      ? ORDER_STEPS.slice(0, cancelledStepIndex + 1)
      : ORDER_STEPS;
  const completedThrough =
    currentStatus === 'CANCELLED' ? cancelledStepIndex : activeStepIndex - 1;

  useEffect(() => {
    statusRef.current = incomingStatus;
    setCurrentStatus(incomingStatus);
  }, [incomingStatus]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      if (!isLiveBackend || !user?.id || !orderId) {
        return () => {
          isActive = false;
        };
      }

      orderService
        .getBuyerOrders(user.id)
        .then((orders) => {
          if (!isActive) {
            return;
          }

          const latestOrder = orders.find(
            (candidate) => String(candidate.id) === String(orderId)
          );
          if (latestOrder) {
            const latestStatus = normalizeStatus(latestOrder.status);
            statusRef.current = latestStatus;
            setCurrentStatus(latestStatus);
            navigation.setParams({
              order: { ...orderRef.current, ...latestOrder },
            });
          }
        })
        .catch((error) => {
          if (isActive) {
            Alert.alert(
              'Unable to refresh order',
              error?.message || 'Please try again later.'
            );
          }
        });

      return () => {
        isActive = false;
      };
    }, [isLiveBackend, navigation, orderId, user?.id])
  );

  const getStepTime = (step, index) => {
    if (index === 0 && order.created_at) {
      return new Date(order.created_at).toLocaleString();
    }
    if (step.status === 'CONFIRMED' && payment.created_at) {
      return new Date(payment.created_at).toLocaleString();
    }
    if (step.status === 'DELIVERED') {
      const estimate =
        order.delivery?.estimated_arrival ||
        order.estimated_arrival ||
        order.estimated_delivery;
      return estimate ? `Estimated: ${estimate}` : step.time;
    }
    return step.time;
  };

  const handleCancelOrder = () => {
    if (!canCancelOrder || !isCancellable(statusRef.current)) {
      Alert.alert(
        'Cancellation unavailable',
        'This order can no longer be cancelled.'
      );
      return;
    }
    if (cancelling || showCancelConfirmation) return;

    setShowCancelConfirmation(true);
  };

  const handleConfirmCancellation = async () => {
    if (!isCancellable(statusRef.current)) {
      setShowCancelConfirmation(false);
      Alert.alert(
        'Cancellation Unavailable',
        'This order can no longer be cancelled.'
      );
      return;
    }
    if (cancelling) return;

    const currentPaymentStatus = hasEscrowHeldPayment(payment, order)
      ? 'HELD'
      : String(
          payment.payment_status ||
            payment.status ||
            order.payment_status ||
            'NOT_PAID'
        ).toUpperCase();
    const refundRequired = currentPaymentStatus === 'HELD';
    const refundStatus = refundRequired ? 'REFUND_INITIATED' : 'NOT_REQUIRED';
    const refundId = refundRequired ? `refund_demo_${Date.now()}` : null;
    const storedPaymentStatus = refundRequired ? 'refund_initiated' : null;

    setCancelling(true);
    try {
      let updatedOrder = { ...order, status: 'CANCELLED' };
      if (orderId) {
        const cancelledOrder = await orderService.cancelOrder(
          orderId,
          storedPaymentStatus
        );
        if (isLiveBackend) {
          updatedOrder = { ...updatedOrder, ...cancelledOrder };
        } else {
          updatedOrder = {
            ...updatedOrder,
            ...cancelledOrder,
            status: 'CANCELLED',
          };
        }
      }

      setStatusBeforeCancel(statusRef.current);
      statusRef.current = 'CANCELLED';
      setCurrentStatus('CANCELLED');
      setShowCancelConfirmation(false);

      navigation.navigate(ROUTES.BUYER.ORDER_CANCELLED, {
        order: updatedOrder,
        checkout,
        payment: {
          ...payment,
          status: refundRequired ? 'REFUND_INITIATED' : currentPaymentStatus,
          payment_status: refundStatus,
          refund_status: refundStatus,
          refund_amount: refundRequired ? total : null,
          refund_id: refundId,
        },
        refund: {
          status: refundStatus,
          amount: refundRequired ? total : null,
          id: refundId,
        },
        cardLast4: route?.params?.cardLast4,
      });
    } catch (error) {
      const unavailable =
        error?.code === 'PGRST116' ||
        error?.code === 'ORDER_NOT_CANCELLABLE';
      Alert.alert(
        unavailable ? 'Cancellation Unavailable' : 'Unable to cancel order',
        unavailable
          ? 'This order can no longer be cancelled.'
          : error?.message || 'Please try again later.'
      );
    } finally {
      setCancelling(false);
    }
  };

  const handleTrackOrder = () => {
    navigation.navigate(ROUTES.BUYER.TRACK_ORDER, {
      order,
      checkout,
      delivery: route?.params?.delivery || order.delivery,
      payment,
      currentStatus,
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Status</Text>
        <TouchableOpacity
          accessibilityLabel="More order options"
          accessibilityRole="button"
          onPress={() =>
            Alert.alert('Order options', 'No additional options are available.')
          }
          style={styles.headerButton}
        >
          <Text style={styles.menuIcon}>•••</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, SPACING.lg) + 72 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.productCard}>
          {itemImage ? (
            <Image source={{ uri: itemImage }} style={styles.productImage} />
          ) : (
            <View style={styles.productImageFallback}>
              <Text style={styles.productFallbackIcon}>
                {item?.icon || '👜'}
              </Text>
            </View>
          )}
          <View style={styles.productInfo}>
            <Text numberOfLines={2} style={styles.productTitle}>
              {title}
            </Text>
            <Text style={styles.productPrice}>
              {formatMoney(total, checkout.currencySymbol || 'Rs. ')}
            </Text>
            <Text style={styles.orderNumber}>Order {orderNumber}</Text>
          </View>
        </Card>

        <Card style={styles.paymentCard}>
          <View style={styles.paymentSummaryRow}>
            <Text style={styles.paymentSummaryLabel}>Payment Method</Text>
            <Text style={styles.paymentSummaryValue}>
              {paymentMethodLabel}
            </Text>
          </View>
          <View style={styles.paymentSummaryRow}>
            <Text style={styles.paymentSummaryLabel}>Payment Status</Text>
            <Text style={styles.paymentSummaryValue}>
              {paymentStatusLabel}
            </Text>
          </View>
        </Card>

        <Card style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>
          {visibleSteps.map((step, index) => {
            const state =
              currentStatus === 'DELIVERED' && index === ORDER_STEPS.length - 1
                ? 'complete'
                : currentStatus === 'CANCELLED'
                  ? index <= completedThrough
                    ? 'complete'
                    : 'upcoming'
                  : index < activeStepIndex
                    ? 'complete'
                    : index === activeStepIndex
                      ? 'current'
                      : 'upcoming';

            return (
              <TimelineStep
                key={step.status}
                step={
                  isCashOnDelivery && step.status === 'CONFIRMED'
                    ? { ...step, title: 'Order Confirmed' }
                    : step
                }
                state={state}
                isLast={
                  index === visibleSteps.length - 1 &&
                  currentStatus !== 'CANCELLED'
                }
                time={getStepTime(step, index)}
              />
            );
          })}

          {currentStatus === 'CANCELLED' ? (
            <TimelineStep
              step={{
                title: 'Order Cancelled',
                time: 'Cancelled by buyer',
                icon: '×',
              }}
              state="current"
              isLast
              time="Cancelled by buyer"
            />
          ) : (
            <View style={styles.timelineEndSpace} />
          )}
        </Card>

        {currentStatus === 'CANCELLED' ? (
          <View style={styles.successMessage}>
            <Text style={styles.successMessageTitle}>Order Cancelled</Text>
            <Text style={styles.successMessageCopy}>
              Your order has been cancelled successfully.
            </Text>
          </View>
        ) : null}

        {currentStatus !== 'CANCELLED' ? (
          <>
            <Button
              title="Track Order"
              onPress={handleTrackOrder}
              style={styles.actionButton}
            />
            <Button
              title="Cancel Order"
              onPress={handleCancelOrder}
              disabled={cancelling}
              style={styles.cancelButton}
              loading={cancelling}
            />
          </>
        ) : null}
        {!canCancelOrder && currentStatus !== 'CANCELLED' ? (
          <Text style={styles.cancelHint}>
            Orders cannot be cancelled after preparation is complete.
          </Text>
        ) : null}
        <Text style={styles.simulationNote}>
          Order and escrow status are simulated for this application.
        </Text>
      </ScrollView>

      <BuyerMember3Footer
        navigation={navigation}
        activeRoute={ROUTES.BUYER.ORDERS}
      />

      <Modal
        animationType="fade"
        onRequestClose={() => setShowCancelConfirmation(false)}
        transparent
        visible={showCancelConfirmation}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmationCard}>
            <View style={styles.warningIconWrap}>
              <Text style={styles.warningIcon}>!</Text>
            </View>
            <Text style={styles.confirmationTitle}>Cancel Order?</Text>
            <Text style={styles.confirmationMessage}>
              Are you sure you want to cancel this order?
            </Text>
            <Text style={styles.confirmationPaymentNote}>
              {hasEscrowHeldPayment(payment, order)
                ? 'Your payment is currently held in escrow. Refund eligibility will be checked according to the cancellation policy.'
                : 'No payment has been held for this order, so no payment refund is required.'}
            </Text>
            <Button
              title="Keep Order"
              disabled={cancelling}
              onPress={() => setShowCancelConfirmation(false)}
              style={styles.keepOrderButton}
              textStyle={styles.keepOrderText}
              variant="secondary"
            />
            <Button
              title="Confirm Cancellation"
              disabled={cancelling}
              loading={cancelling}
              onPress={handleConfirmCancellation}
              style={styles.confirmCancelButton}
            />
          </View>
        </View>
      </Modal>
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
  headerButton: {
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
  headerTitle: {
    color: COLORS.textPrimary,
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
  menuIcon: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  scrollContent: {
    gap: SPACING.md,
    padding: SPACING.md,
  },
  productCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.md,
  },
  paymentCard: {
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  paymentSummaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  paymentSummaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  paymentSummaryValue: {
    color: COLORS.textPrimary,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  productImage: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    height: 78,
    width: 78,
  },
  productImageFallback: {
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    borderRadius: RADIUS.md,
    height: 78,
    justifyContent: 'center',
    width: 78,
  },
  productFallbackIcon: {
    fontSize: 34,
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  productPrice: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  orderNumber: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  timelineCard: {
    padding: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 62,
  },
  timelineRail: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 28,
  },
  timelineDot: {
    alignItems: 'center',
    backgroundColor: '#E7ECEA',
    borderColor: '#D5DEDA',
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  completeDot: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  currentDot: {
    backgroundColor: COLORS.textPrimary,
    borderColor: COLORS.textPrimary,
  },
  dotIcon: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '800',
  },
  completeDotIcon: {
    color: COLORS.textInverse,
  },
  currentDotIcon: {
    color: COLORS.textInverse,
  },
  timelineLine: {
    backgroundColor: '#D8E0DD',
    flex: 1,
    marginVertical: 3,
    minHeight: 26,
    width: 2,
  },
  completeLine: {
    backgroundColor: COLORS.primary,
  },
  stepCopy: {
    flex: 1,
    paddingBottom: SPACING.sm,
    paddingTop: 2,
  },
  stepTitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  currentStepTitle: {
    color: COLORS.textPrimary,
    fontWeight: '800',
  },
  upcomingStepTitle: {
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  stepTime: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  upcomingStepTime: {
    color: '#AAB5B1',
  },
  timelineEndSpace: {
    height: 1,
  },
  successMessage: {
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  successMessageTitle: {
    color: COLORS.success,
    fontSize: 15,
    fontWeight: '800',
  },
  successMessageCopy: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  actionButton: {
    marginTop: SPACING.xs,
  },
  cancelButton: {
    marginTop: -SPACING.xs,
  },
  cancelHint: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: -SPACING.sm,
    textAlign: 'center',
  },
  simulationNote: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: COLORS.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  confirmationCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    maxWidth: 420,
    padding: SPACING.lg,
    width: '100%',
  },
  warningIconWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    borderColor: COLORS.warning,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  warningIcon: {
    color: COLORS.warning,
    fontSize: 32,
    fontWeight: '800',
  },
  confirmationTitle: {
    color: COLORS.textPrimary,
    fontSize: 21,
    fontWeight: '800',
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  confirmationMessage: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  confirmationPaymentNote: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: SPACING.md,
    padding: SPACING.md,
    textAlign: 'center',
  },
  keepOrderButton: {
    alignSelf: 'stretch',
    backgroundColor: '#E0E6E4',
    marginTop: SPACING.lg,
  },
  keepOrderText: {
    color: COLORS.textMuted,
  },
  confirmCancelButton: {
    alignSelf: 'stretch',
    marginTop: SPACING.sm,
  },
});

export default OrderStatusScreen;
