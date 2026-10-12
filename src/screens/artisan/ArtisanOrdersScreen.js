import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { orderService } from '../../services/orderService';

export const ArtisanOrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // ALL | PENDING | SHIPPED | DELIVERED
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const data = await orderService.getArtisanOrders();
      setOrders(data || []);
      // Keep selectedOrder in sync if modal is open
      if (selectedOrder) {
        const found = (data || []).find((o) => o.id === selectedOrder.id);
        if (found) setSelectedOrder(found);
      }
    } catch (e) {
      console.warn('Error loading artisan orders:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedOrder]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const isPendingStatus = (s) =>
    !s ||
    s === 'PENDING' ||
    s === 'CONFIRMED' ||
    s === 'CRAFTING' ||
    s === 'READY_FOR_PICKUP';

  // Compute Order Summary Counts dynamically
  const summaryCounts = {
    all: orders.length,
    pending: orders.filter((o) => isPendingStatus(o.status)).length,
    shipped: orders.filter((o) => o.status === 'SHIPPED').length,
    delivered: orders.filter((o) => o.status === 'DELIVERED').length,
  };

  // Filter orders by summary status selection
  const filteredOrders = orders.filter((ord) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'PENDING') return isPendingStatus(ord.status);
    return ord.status === selectedFilter;
  });

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedOrder) return;

    try {
      const isShipped = newStatus === 'SHIPPED' || newStatus === 'COURIER_ASSIGNED';
      let extra = {};
      if (isShipped && !selectedOrder.assignedCourier) {
        extra = {
          assignedCourier: 'Marcus Vance',
          tracking_code: selectedOrder.tracking_code || `ATH-${Math.floor(1000 + Math.random() * 9000)}-LK`,
        };
      }
      const updated = await orderService.updateOrderStatus(selectedOrder.id, newStatus);
      if (newStatus === 'DELIVERED') {
        await orderService.updatePaymentStatus(selectedOrder.id, 'released');
      }
      const mergedOrder = { ...selectedOrder, ...updated, ...extra, status: newStatus };
      const updatedOrders = orders.map((o) =>
        o.id === selectedOrder.id ? mergedOrder : o
      );
      setOrders(updatedOrders);
      setSelectedOrder(mergedOrder);
    } catch (e) {
      Alert.alert('Status Error', e.message);
    }
  };

  const handleAssignCourier = async (orderToAssign) => {
    if (!orderToAssign || assigning) return;

    try {
      setAssigning(true);
      const courierPartner = {
        id: 'usr_courier_01',
        name: 'Marcus Vance',
        vehicle: 'Electric Cargo Van #402',
      };

      const { updatedOrder, delivery } = await orderService.assignCourierToOrder(
        orderToAssign.id,
        courierPartner
      );

      const nextOrders = orders.map((o) =>
        o.id === orderToAssign.id ? updatedOrder : o
      );
      setOrders(nextOrders);
      setSelectedOrder(updatedOrder);

      Alert.alert(
        'Courier Assigned! 🚚',
        `Order #${updatedOrder.id} has been dispatched to courier partner ${courierPartner.name}.\n\nTracking ID: ${updatedOrder.tracking_code}\n\nThis delivery is now live in the Courier Daily Jobs dashboard!`
      );
    } catch (err) {
      Alert.alert('Assignment Error', err.message || 'Unable to assign courier.');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Fulfillment & Orders"
        subtitle="Manage client orders, customer details & dispatch status"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Top Order Summary Filter List */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryHeaderTitle}>Order Summary & Filter</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.summaryScroll}
          >
            {[
              { key: 'ALL', label: 'All Orders', count: summaryCounts.all, color: COLORS.primary },
              { key: 'PENDING', label: 'Pending', count: summaryCounts.pending, color: '#ED6C02' },
              { key: 'SHIPPED', label: 'Shipped', count: summaryCounts.shipped, color: '#0288D1' },
              { key: 'DELIVERED', label: 'Delivered', count: summaryCounts.delivered, color: '#2E7D32' },
            ].map((filter) => {
              const isSelected = selectedFilter === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  onPress={() => setSelectedFilter(filter.key)}
                  activeOpacity={0.8}
                  style={[
                    styles.summaryCard,
                    isSelected && { borderColor: filter.color, backgroundColor: '#F0F7F5' },
                  ]}
                >
                  <Text style={[styles.summaryCount, { color: filter.color }]}>{filter.count}</Text>
                  <Text style={[styles.summaryLabel, isSelected && styles.summaryLabelActive]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Orders List Section */}
        <View style={styles.listSectionHeader}>
          <Text style={styles.listSectionTitle}>
            {selectedFilter === 'ALL'
              ? 'All Customer Orders'
              : `${selectedFilter.charAt(0) + selectedFilter.slice(1).toLowerCase()} Orders`}
          </Text>
          <Text style={styles.listSectionCount}>{filteredOrders.length} items</Text>
        </View>

        <View style={styles.list}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 24 }} />
          ) : filteredOrders.length === 0 ? (
            <View style={styles.emptyOrdersContainer}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyText}>No {selectedFilter.toLowerCase()} orders found</Text>
            </View>
          ) : (
            filteredOrders.map((ord) => {
              const pending = isPendingStatus(ord.status);
              const displayStatus = pending ? 'PENDING' : ord.status;
              const hasCourier = Boolean(ord.assignedCourier);

              return (
                <TouchableOpacity
                  key={ord.id}
                  onPress={() => setSelectedOrder(ord)}
                  activeOpacity={0.85}
                >
                  <Card style={styles.card}>
                    <View style={styles.header}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.orderId}>#{ord.id}</Text>
                        {ord.payment_status === 'held' && (
                          <View style={styles.escrowTag}>
                            <Text style={styles.escrowTagText}>🛡️ Escrow Held</Text>
                          </View>
                        )}
                        {ord.payment_status === 'cash_on_delivery' && (
                          <View style={styles.codTag}>
                            <Text style={styles.codTagText}>💵 COD</Text>
                          </View>
                        )}
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          displayStatus === 'PENDING' && styles.statusBadgePending,
                          displayStatus === 'SHIPPED' && styles.statusBadgeShipped,
                          displayStatus === 'DELIVERED' && styles.statusBadgeDelivered,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            displayStatus === 'PENDING' && styles.statusTextPending,
                            displayStatus === 'SHIPPED' && styles.statusTextShipped,
                            displayStatus === 'DELIVERED' && styles.statusTextDelivered,
                          ]}
                        >
                          {displayStatus}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.orderContentRow}>
                      <Image
                        source={{ uri: ord.photo }}
                        style={styles.craftThumb}
                        resizeMode="cover"
                      />

                      <View style={styles.orderMainInfo}>
                        <Text style={styles.itemTitle}>{ord.item}</Text>
                        <Text style={styles.priceText}>{ord.price}</Text>
                        <Text style={styles.clientText}>👤 Client: {ord.buyer}</Text>
                        <Text style={styles.destText}>📍 {ord.destination}</Text>
                      </View>
                    </View>

                    {hasCourier && (
                      <View style={styles.courierBanner}>
                        <Text style={styles.courierBannerText}>
                          🚚 Assigned: {ord.assignedCourier} · {ord.tracking_code}
                        </Text>
                      </View>
                    )}

                    <View style={styles.cardFooterRow}>
                      <Text style={styles.viewDetailsLink}>Tap for Customer & Order Details →</Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Customer & Order Details Pop-up Modal Window */}
      <Modal
        visible={!!selectedOrder}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <>
                <View style={styles.modalHeaderRow}>
                  <View>
                    <Text style={styles.modalTitle}>Order #{selectedOrder.id}</Text>
                    <Text style={styles.modalSubtitle}>Order & Customer Fulfillment Details</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedOrder(null)}
                    style={styles.closeBtn}
                  >
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                  {/* Current Status Pill */}
                  <View style={styles.modalStatusRow}>
                    <Text style={styles.modalStatusLabel}>Current Fulfillment Status:</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        isPendingStatus(selectedOrder.status) && styles.statusBadgePending,
                        selectedOrder.status === 'SHIPPED' && styles.statusBadgeShipped,
                        selectedOrder.status === 'DELIVERED' && styles.statusBadgeDelivered,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          isPendingStatus(selectedOrder.status) && styles.statusTextPending,
                          selectedOrder.status === 'SHIPPED' && styles.statusTextShipped,
                          selectedOrder.status === 'DELIVERED' && styles.statusTextDelivered,
                        ]}
                      >
                        {isPendingStatus(selectedOrder.status) ? 'PENDING' : selectedOrder.status}
                      </Text>
                    </View>
                  </View>

                  {/* Highlighted Dispatch to Courier Section */}
                  {isPendingStatus(selectedOrder.status) ? (
                    <Card style={styles.assignCourierCard}>
                      <View style={styles.assignCourierHeader}>
                        <Text style={styles.assignCourierTitle}>🚚 DISPATCH WITH COURIER</Text>
                        <View style={styles.fastTag}>
                          <Text style={styles.fastTagText}>Recommended</Text>
                        </View>
                      </View>
                      <Text style={styles.assignCourierDesc}>
                        Assign this order to partner courier for workshop pickup and direct delivery to customer.
                      </Text>

                      <View style={styles.courierPartnerBox}>
                        <View style={styles.courierAvatar}>
                          <Text style={styles.courierAvatarText}>MV</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.courierName}>Marcus Vance</Text>
                          <Text style={styles.courierDetails}>⚡ Electric Cargo Van #402 · 4.98★</Text>
                          <Text style={styles.courierRoute}>📍 Ready in Kandy & Central Zone</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.assignCourierBtn}
                        onPress={() => handleAssignCourier(selectedOrder)}
                        activeOpacity={0.85}
                        disabled={assigning}
                      >
                        {assigning ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.assignCourierBtnText}>
                            Assign to Marcus Vance & Dispatch 📦
                          </Text>
                        )}
                      </TouchableOpacity>
                    </Card>
                  ) : (
                    <Card style={styles.assignedCard}>
                      <Text style={styles.assignedCardTitle}>🚚 COURIER PARTNER ASSIGNED</Text>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Assigned Courier:</Text>
                        <Text style={styles.detailValHighlight}>
                          {selectedOrder.assignedCourier || 'Marcus Vance'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Tracking Code:</Text>
                        <Text style={styles.detailValHighlight}>
                          {selectedOrder.tracking_code || 'ATH-9942-PY'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Courier Status:</Text>
                        <Text style={styles.detailValNote}>
                          Active in Courier Daily Jobs dashboard
                        </Text>
                      </View>
                    </Card>
                  )}

                  {/* Customer Details Card Section */}
                  <Card style={styles.detailsCard}>
                    <Text style={styles.detailsHeaderTitle}>👤 CUSTOMER DETAILS</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Buyer Name:</Text>
                      <Text style={styles.detailVal}>{selectedOrder.buyer}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Contact Phone:</Text>
                      <Text style={styles.detailValHighlight}>{selectedOrder.phone}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Shipping Address:</Text>
                      <Text style={styles.detailVal}>{selectedOrder.destination}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Payment Method:</Text>
                      <Text style={styles.detailVal}>
                        {selectedOrder.payment_method || 'Secure Escrow Payment'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Delivery Notes:</Text>
                      <Text style={styles.detailValNote}>{selectedOrder.notes}</Text>
                    </View>
                  </Card>

                  {/* Order Details Card Section */}
                  <Card style={styles.detailsCard}>
                    <Text style={styles.detailsHeaderTitle}>📦 ORDER & CRAFT DETAILS</Text>
                    <View style={styles.craftDetailRow}>
                      <Image
                        source={{ uri: selectedOrder.photo }}
                        style={styles.modalCraftThumb}
                        resizeMode="cover"
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalItemTitle}>{selectedOrder.item}</Text>
                        <Text style={styles.modalPriceText}>{selectedOrder.price}</Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Order Date:</Text>
                      <Text style={styles.detailVal}>{selectedOrder.date}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Estimated Handoff:</Text>
                      <Text style={styles.detailVal}>{selectedOrder.due}</Text>
                    </View>
                  </Card>
                </ScrollView>

                {/* Status Action Buttons */}
                <View style={styles.actionButtonsContainer}>
                  <Text style={styles.actionHeaderTitle}>Timeline Status Progression:</Text>
                  <View style={styles.statusButtonsRow}>
                    <TouchableOpacity
                      onPress={() => handleUpdateStatus('CRAFTING')}
                      activeOpacity={0.8}
                      style={[
                        styles.statusActionBtn,
                        styles.btnPending,
                        selectedOrder.status === 'CRAFTING' && styles.btnActiveSelected,
                      ]}
                    >
                      <Text style={styles.statusActionBtnText}>🎨 Crafting</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleUpdateStatus('READY_FOR_PICKUP')}
                      activeOpacity={0.8}
                      style={[
                        styles.statusActionBtn,
                        styles.btnPending,
                        selectedOrder.status === 'READY_FOR_PICKUP' && styles.btnActiveSelected,
                      ]}
                    >
                      <Text style={styles.statusActionBtnText}>📦 Ready</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleUpdateStatus('SHIPPED')}
                      activeOpacity={0.8}
                      style={[
                        styles.statusActionBtn,
                        styles.btnShipped,
                        (selectedOrder.status === 'SHIPPED' || selectedOrder.status === 'COURIER_ASSIGNED') && styles.btnActiveSelected,
                      ]}
                    >
                      <Text style={styles.statusActionBtnText}>🚚 Shipped</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleUpdateStatus('DELIVERED')}
                      activeOpacity={0.8}
                      style={[
                        styles.statusActionBtn,
                        styles.btnDelivered,
                        selectedOrder.status === 'DELIVERED' && styles.btnActiveSelected,
                      ]}
                    >
                      <Text style={styles.statusActionBtnText}>✅ Delivered</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
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
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  // Top Order Summary Bar
  summaryContainer: {
    marginTop: 10,
    marginBottom: 8,
  },
  summaryHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  summaryScroll: {
    gap: 10,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    minWidth: 84,
  },
  summaryCount: {
    fontSize: 18,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  summaryLabelActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },

  // Orders List Header
  listSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  listSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  listSectionCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  // Orders List & Cards
  list: {
    gap: 12,
  },
  card: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  escrowTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  escrowTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D32',
  },
  codTag: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E65100',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgePending: {
    backgroundColor: '#FFF8E1',
  },
  statusBadgeShipped: {
    backgroundColor: '#E1F5FE',
  },
  statusBadgeDelivered: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusTextPending: {
    color: '#ED6C02',
  },
  statusTextShipped: {
    color: '#0288D1',
  },
  statusTextDelivered: {
    color: '#2E7D32',
  },

  orderContentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  craftThumb: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.md,
    backgroundColor: '#F3F4F6',
  },
  orderMainInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  clientText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  destText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },

  courierBanner: {
    marginTop: 8,
    backgroundColor: '#E0F2FE',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
  },
  courierBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
  },

  cardFooterRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    alignItems: 'flex-end',
  },
  viewDetailsLink: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },

  emptyOrdersContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  // Modal Window Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    maxHeight: '90%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: RADIUS.full,
    backgroundColor: '#F3F4F6',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modalScroll: {
    marginBottom: 10,
  },
  modalStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: RADIUS.md,
    marginBottom: 12,
  },
  modalStatusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // Assign Courier Card
  assignCourierCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    borderWidth: 1.5,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: 12,
  },
  assignCourierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  assignCourierTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
    letterSpacing: 0.6,
  },
  fastTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fastTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  assignCourierDesc: {
    fontSize: 11,
    color: '#14532D',
    marginBottom: 10,
    lineHeight: 16,
  },
  courierPartnerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 12,
  },
  courierAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#00796B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  courierAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  courierName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  courierDetails: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  courierRoute: {
    fontSize: 10,
    color: '#047857',
    marginTop: 2,
    fontWeight: '600',
  },
  assignCourierBtn: {
    backgroundColor: '#00796B',
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00796B',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  assignCourierBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Assigned Card
  assignedCard: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: 12,
  },
  assignedCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0369A1',
    letterSpacing: 0.6,
    marginBottom: 6,
  },

  // Modal Details Cards
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  detailsHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  detailVal: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
    maxWidth: '65%',
    textAlign: 'right',
  },
  detailValHighlight: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  detailValNote: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    maxWidth: '65%',
    textAlign: 'right',
  },
  craftDetailRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  modalCraftThumb: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    backgroundColor: '#F3F4F6',
  },
  modalItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalPriceText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },

  // Action Buttons
  actionButtonsContainer: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  actionHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusActionBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  btnPending: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFE082',
  },
  btnShipped: {
    backgroundColor: '#E1F5FE',
    borderColor: '#81D4FA',
  },
  btnDelivered: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
  },
  btnActiveSelected: {
    borderWidth: 2.5,
    borderColor: COLORS.textPrimary,
  },
  statusActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});

export default ArtisanOrdersScreen;
