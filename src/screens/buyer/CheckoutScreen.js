import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
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
import { useAuth } from '../../context/AuthContext';
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

const formatAddress = (address) => {
  if (typeof address === 'string') {
    return address.trim();
  }

  if (!address || typeof address !== 'object') {
    return '';
  }

  return [
    address.fullName || address.full_name || address.recipient,
    address.line1 || address.addressLine1 || address.address_line1 || address.street,
    address.line2 || address.addressLine2 || address.address_line2,
    [
      address.city,
      address.state || address.region,
      address.postalCode || address.postal_code || address.zip,
    ]
      .filter(Boolean)
      .join(', '),
    address.country,
  ]
    .filter(Boolean)
    .join('\n');
};

const normalizePaymentChoice = (paymentMethod) => {
  const value =
    typeof paymentMethod === 'string'
      ? paymentMethod
      : paymentMethod?.label ||
        paymentMethod?.name ||
        paymentMethod?.type ||
        paymentMethod?.brand ||
        '';

  return /cash|delivery|cod/i.test(value) ? 'cash' : 'escrow';
};

const normalizeItems = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => {
    const price = toAmount(
      item?.price ?? item?.unit_price ?? item?.product?.price
    );
    const quantity = Number(item?.quantity ?? 1);
    const title =
      item?.title || item?.name || item?.product?.title || item?.product?.name;

    return {
      ...item,
      title: typeof title === 'string' ? title.trim() : '',
      quantity,
      price,
      valid:
        typeof title === 'string' &&
        title.trim().length > 0 &&
        price !== null &&
        price > 0 &&
        Number.isInteger(quantity) &&
        quantity > 0,
    };
  });
};

const RadioChoice = ({ selected, title, subtitle, onPress }) => (
  <TouchableOpacity
    accessibilityRole="radio"
    accessibilityState={{ selected }}
    activeOpacity={0.75}
    onPress={onPress}
    style={[styles.paymentChoice, selected && styles.paymentChoiceSelected]}
  >
    <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
      {selected && <View style={styles.radioInner} />}
    </View>
    <View style={styles.paymentChoiceText}>
      <Text style={styles.paymentChoiceTitle}>{title}</Text>
      <Text style={styles.paymentChoiceSubtitle}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

export const CheckoutScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const params = route?.params || {};
  const [items, setItems] = useState(() => normalizeItems(params.items));
  const [address, setAddress] = useState(() =>
    formatAddress(
      params.shippingAddress ??
        user?.shipping_address ??
        user?.shippingAddress ??
        user?.address ??
        (user?.address_line1 || user?.addressLine1 || user?.street
          ? {
              full_name: user.full_name || user.name,
              address_line1:
                user.address_line1 || user.addressLine1 || user.street,
              address_line2: user.address_line2 || user.addressLine2,
              city: user.city,
              state: user.state || user.region,
              postal_code: user.postal_code || user.postalCode,
              country: user.country,
            }
          : null)
    )
  );
  const [paymentChoice, setPaymentChoice] = useState(() =>
    normalizePaymentChoice(params.paymentMethod)
  );
  const [showValidation, setShowValidation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (params.items) {
      setItems(normalizeItems(params.items));
      setShowValidation(false);
    }
    if (params.shippingAddress !== undefined) {
      setAddress(formatAddress(params.shippingAddress));
    }
    if (params.paymentMethod !== undefined) {
      setPaymentChoice(normalizePaymentChoice(params.paymentMethod));
    }
  }, [params.items, params.paymentMethod, params.shippingAddress]);

  const itemTotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + (item.valid ? item.price * item.quantity : 0),
        0
      ),
    [items]
  );
  const providedTotal = toAmount(params.totalAmount);
  const providedDeliveryFee = toAmount(params.deliveryFee);
  const deliveryFee =
    providedDeliveryFee ??
    (providedTotal !== null && providedTotal > itemTotal
      ? providedTotal - itemTotal
      : 0);
  const totalAmount = itemTotal + deliveryFee;
  const currencySymbol = 'LKR ';
  const money = (amount) =>
    `LKR ${amount.toLocaleString('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  const missingFields = [];

  if (items.length === 0 || items.some((item) => !item.valid)) {
    missingFields.push('a valid item summary');
  }
  if (!address.trim()) {
    missingFields.push('a delivery address');
  }
  if (totalAmount <= 0) {
    missingFields.push('a valid order total');
  }

  const openItemEditor = (index) => {
    setEditing({ type: 'item', index });
    setEditValue(String(items[index].quantity));
  };

  const returnToProductSelection = () => {
    navigation.navigate('BuyerTabs', {
      screen: ROUTES.BUYER.HOME,
      params: {
        checkoutEdit: true,
        checkoutShippingAddress: address,
        checkoutPaymentMethod:
          paymentChoice === 'cash'
            ? 'Cash on Delivery'
            : 'Secure Escrow Payment',
        checkoutDeliveryFee: deliveryFee,
        checkoutCurrencySymbol: currencySymbol,
      },
    });
  };

  const openAddressEditor = () => {
    setEditing({ type: 'address' });
    setEditValue(address);
  };

  const saveEdit = () => {
    if (editing?.type === 'address') {
      setAddress(editValue.trim());
    } else if (editing?.type === 'item') {
      const quantity = Number(editValue);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return;
      }
      setItems((currentItems) =>
        currentItems.map((item, index) =>
          index === editing.index ? { ...item, quantity } : item
        )
      );
    }
    setEditing(null);
  };

  const handleContinue = async () => {
    if (submitting) {
      return;
    }
    setShowValidation(true);
    if (missingFields.length > 0) {
      return;
    }

    const paymentMethod =
      paymentChoice === 'cash'
        ? 'Cash on Delivery'
        : 'Secure Escrow Payment';
    const paymentStatus =
      paymentChoice === 'cash' ? 'cash_on_delivery' : 'pending';
    const checkoutItems = items.map((item) => {
      const checkoutItem = { ...item };
      delete checkoutItem.valid;
      return {
        ...checkoutItem,
        productId: checkoutItem.productId || checkoutItem.id,
      };
    });
    const checkout = {
      items: checkoutItems,
      shippingAddress: address,
      paymentMethod,
      paymentType: paymentChoice,
      itemTotal,
      deliveryFee,
      totalAmount,
      currencySymbol,
    };

    setSubmitting(true);
    try {
      const order = await orderService.createOrder({
        items: checkoutItems,
        shippingAddress: address,
        totalAmount,
        paymentMethod,
      });
      const orderWithPayment = {
        ...order,
        payment_method: paymentChoice === 'cash' ? 'cash_on_delivery' : 'secure_escrow',
        payment_status: order?.payment_status || paymentStatus,
      };
      const payment = {
        method: paymentMethod,
        payment_method: orderWithPayment.payment_method,
        status: paymentStatus.toUpperCase(),
        payment_status: paymentStatus,
        order_status: orderWithPayment.status || 'PENDING',
      };

      navigation.navigate(
        paymentChoice === 'cash'
          ? ROUTES.BUYER.ORDER_STATUS
          : ROUTES.BUYER.SECURE_ESCROW_PAYMENT,
        { checkout, order: orderWithPayment, payment }
      );
    } catch (error) {
      Alert.alert(
        'Unable to place order',
        error?.message || 'Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Text style={styles.headerBack}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.cartBadge}>
          <Text style={styles.cartIcon}>🛒</Text>
          {items.length > 0 && (
            <View style={styles.cartCount}>
              <Text style={styles.cartCountText}>{items.length}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, SPACING.lg) + 72 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionStack}>
          {items.length > 0 ? (
            items.map((item, index) => {
              const imageUrl =
                item.image_url ||
                item.imageUrl ||
                item.image ||
                item.product?.image_url ||
                item.product?.imageUrl ||
                item.product?.image;
              return (
                <Card key={item.id || item.productId || `${item.title}-${index}`} style={styles.itemCard}>
                  {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.productImage} />
                  ) : (
                    <View style={styles.productImageFallback}>
                      <Text style={styles.productFallbackIcon}>
                        {item.icon || item.product?.icon || '🧵'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.itemInfo}>
                    <Text numberOfLines={2} style={styles.itemTitle}>
                      {item.title || 'Item details incomplete'}
                    </Text>
                    <Text style={styles.itemPrice}>
                      {item.price !== null && item.price > 0
                        ? money(item.price)
                        : 'Price unavailable'}
                    </Text>
                    <Text style={styles.itemQuantity}>
                      Qty: {Number.isInteger(item.quantity) ? item.quantity : '—'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={returnToProductSelection}
                    style={styles.editButton}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => openItemEditor(index)}
                    style={styles.quantityButton}
                  >
                    <Text style={styles.editButtonText}>Qty</Text>
                  </TouchableOpacity>
                </Card>
              );
            })
          ) : (
            <Card style={styles.itemCard}>
              <View style={styles.productImageFallback}>
                <Text style={styles.productFallbackIcon}>🧵</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>No items selected</Text>
                <Text style={styles.itemQuantity}>
                  Return to your order to add an item.
                </Text>
              </View>
            </Card>
          )}

          <Card style={styles.addressCard}>
            <View style={styles.cardHeading}>
              <Text style={styles.headingIcon}>📍</Text>
              <Text style={styles.cardHeadingText}>Delivery Address</Text>
            </View>
            <View style={styles.cardDivider} />
            <View style={styles.addressContent}>
              <Text style={styles.addressPin}>📍</Text>
              <Text style={address ? styles.addressText : styles.emptyText}>
                {address || 'Add a delivery address'}
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={openAddressEditor}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </Card>

          <Card style={styles.paymentCard}>
            <View style={styles.cardHeading}>
              <Text style={styles.headingIcon}>▣</Text>
              <Text style={styles.cardHeadingText}>Payment Method</Text>
            </View>
            <View style={styles.cardDivider} />
            <View style={styles.paymentOptions}>
              <RadioChoice
                selected={paymentChoice === 'escrow'}
                title="Secure Escrow Payment"
                subtitle="Pay securely through our escrow system"
                onPress={() => setPaymentChoice('escrow')}
              />
              <RadioChoice
                selected={paymentChoice === 'cash'}
                title="Cash on Delivery"
                subtitle="Pay when you receive the item"
                onPress={() => setPaymentChoice('cash')}
              />
            </View>
            <View style={styles.escrowNotice}>
              <Text style={styles.escrowIcon}>🔒</Text>
              <Text style={styles.escrowText}>
                {paymentChoice === 'escrow'
                  ? 'Your payment is held securely until delivery is confirmed.'
                  : 'Cash payment is due when your order is delivered.'}
              </Text>
            </View>
          </Card>

          <Card style={styles.summaryCard}>
            <View style={styles.cardHeading}>
              <Text style={styles.headingIcon}>▤</Text>
              <Text style={styles.cardHeadingText}>Order Summary</Text>
            </View>
            <View style={styles.cardDivider} />
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Item Total</Text>
              <Text style={styles.summaryValue}>{money(itemTotal)}</Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>
                {providedDeliveryFee === null && providedTotal === null
                  ? 'Calculated at next step'
                  : money(deliveryFee)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryLine}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{money(totalAmount)}</Text>
            </View>
          </Card>
        </View>

        {showValidation && missingFields.length > 0 && (
          <View style={styles.validationBox}>
            <Text style={styles.validationTitle}>
              Complete checkout before continuing:
            </Text>
            <Text style={styles.validationText}>
              {missingFields.map((field) => `• ${field}`).join('\n')}
            </Text>
          </View>
        )}

        <Button
          title="Continue"
          onPress={handleContinue}
          loading={submitting}
          disabled={submitting}
          style={styles.continueButton}
        />
        <Text style={styles.footerNote}>
          No payment is processed on this screen.
        </Text>
      </ScrollView>

      <BuyerMember3Footer
        navigation={navigation}
        activeRoute={ROUTES.BUYER.HOME}
      />

      <Modal
        animationType="fade"
        transparent
        visible={editing !== null}
        onRequestClose={() => setEditing(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.editModal}>
            <Text style={styles.modalTitle}>
              {editing?.type === 'address' ? 'Edit Delivery Address' : 'Edit Quantity'}
            </Text>
            <TextInput
              autoFocus
              multiline={editing?.type === 'address'}
              keyboardType={editing?.type === 'item' ? 'number-pad' : 'default'}
              onChangeText={setEditValue}
              placeholder={
                editing?.type === 'address'
                  ? 'Enter your delivery address'
                  : 'Enter quantity'
              }
              placeholderTextColor={COLORS.textMuted}
              style={[
                styles.editInput,
                editing?.type === 'address' && styles.addressInput,
              ]}
              value={editValue}
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setEditing(null)}
                style={styles.modalButton}
              />
              <Button
                title="Save"
                onPress={saveEdit}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderBottomColor: COLORS.borderLight,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 56,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  headerButton: {
    alignItems: 'center',
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  headerBack: {
    color: COLORS.primary,
    fontSize: 34,
    lineHeight: 36,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
  cartBadge: {
    alignItems: 'center',
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  cartIcon: {
    fontSize: 21,
  },
  cartCount: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    height: 16,
    justifyContent: 'center',
    minWidth: 16,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  cartCountText: {
    color: COLORS.textInverse,
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 3,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  sectionStack: {
    gap: SPACING.sm,
  },
  itemCard: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 92,
    padding: SPACING.sm,
  },
  productImage: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    height: 58,
    width: 58,
  },
  productImageFallback: {
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  productFallbackIcon: {
    fontSize: 27,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
  },
  itemTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  itemPrice: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  itemQuantity: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  editButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    minWidth: 44,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
  },
  quantityButton: {
    alignItems: 'center',
    backgroundColor: COLORS.textSecondary,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    marginLeft: SPACING.xs,
    minWidth: 38,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 6,
  },
  editButtonText: {
    color: COLORS.textInverse,
    fontSize: 11,
    fontWeight: '700',
  },
  addressCard: {
    padding: 0,
  },
  paymentCard: {
    padding: 0,
  },
  cardHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
    minHeight: 35,
    paddingHorizontal: SPACING.sm,
  },
  headingIcon: {
    color: COLORS.textSecondary,
    fontSize: 14,
    width: 17,
  },
  cardHeadingText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  cardDivider: {
    backgroundColor: COLORS.borderLight,
    height: 1,
  },
  addressContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    minHeight: 62,
    padding: SPACING.sm,
  },
  addressPin: {
    fontSize: 22,
  },
  addressText: {
    color: COLORS.textPrimary,
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  emptyText: {
    color: COLORS.textMuted,
    flex: 1,
    fontSize: 12,
  },
  paymentOptions: {
    gap: SPACING.xs,
    padding: SPACING.sm,
  },
  paymentChoice: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 38,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 4,
  },
  paymentChoiceSelected: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
  },
  radioOuter: {
    alignItems: 'center',
    borderColor: COLORS.textMuted,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    height: 16,
    justifyContent: 'center',
    marginRight: SPACING.sm,
    width: 16,
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    height: 8,
    width: 8,
  },
  paymentChoiceText: {
    flex: 1,
  },
  paymentChoiceTitle: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  paymentChoiceSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 9,
    marginTop: 1,
  },
  escrowNotice: {
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    flexDirection: 'row',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  escrowIcon: {
    fontSize: 13,
  },
  escrowText: {
    color: COLORS.primary,
    flex: 1,
    fontSize: 10,
    lineHeight: 14,
  },
  summaryCard: {
    paddingBottom: SPACING.sm,
  },
  summaryLine: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  summaryValue: {
    color: COLORS.textPrimary,
    fontSize: 11,
  },
  summaryDivider: {
    backgroundColor: COLORS.border,
    height: 1,
    marginHorizontal: SPACING.sm,
    marginTop: SPACING.sm,
  },
  totalLabel: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  totalValue: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  validationBox: {
    backgroundColor: COLORS.errorLight,
    borderColor: COLORS.error,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginTop: SPACING.sm,
    padding: SPACING.sm,
  },
  validationTitle: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '700',
  },
  validationText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: SPACING.xs,
  },
  continueButton: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  footerNote: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: COLORS.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  editModal: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    width: '100%',
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  editInput: {
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    minHeight: 44,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  addressInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  modalButton: {
    flex: 1,
  },
});

export default CheckoutScreen;
