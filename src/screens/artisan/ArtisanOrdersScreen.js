import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

const INITIAL_ORDERS = [
  {
    id: 'AT-1049',
    item: 'Indigo Silk Scarf (Qty 2)',
    price: 'LKR 25,000',
    buyer: 'Maya Lin',
    phone: '+94 77 123 4567',
    destination: '42 Ward Place, Colombo 07',
    date: 'Oct 7, 2026',
    due: 'Today, 3:30 PM',
    status: 'PENDING', // PENDING | SHIPPED | DELIVERED
    notes: 'Please pack in eco-friendly gift box with custom silk ribbon.',
    photo: 'https://images.unsplash.com/photo-1606760227091-3dd850d97f1d?w=400',
  },
  {
    id: 'AT-1048',
    item: 'Ceramic Matcha Bowl',
    price: 'LKR 8,500',
    buyer: 'Julian Moore',
    phone: '+94 71 987 6543',
    destination: 'Station Road, Kalutara',
    date: 'Oct 6, 2026',
    due: 'Tomorrow, 11:00 AM',
    status: 'PENDING',
    notes: 'Fragile ceremonial craft piece. Double bubble wrap required.',
    photo: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400',
  },
  {
    id: 'AT-1045',
    item: 'Sashiko Coaster Set',
    price: 'LKR 4,200',
    buyer: 'Sarah Jenkins',
    phone: '+94 76 555 4321',
    destination: 'Beach Road, Beruwala',
    date: 'Sep 27, 2026',
    due: 'Delivered',
    status: 'DELIVERED',
    notes: 'Direct handoff at workshop studio.',
    photo: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=400',
  },
  {
    id: 'AT-1042',
    item: 'Hand-carved Teak Stool',
    price: 'LKR 24,000',
    buyer: 'Manji Samaranayaka',
    phone: '+94 77 888 9900',
    destination: 'Peradeniya Road, Kandy',
    date: 'Oct 5, 2026',
    due: 'In Transit',
    status: 'SHIPPED',
    notes: 'Handed to Courier Partner Marcus Vance.',
    photo: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=400',
  },
  {
    id: 'AT-1039',
    item: 'Hand-loomed Cotton Cushion',
    price: 'LKR 6,800',
    buyer: 'Nimali Fernando',
    phone: '+94 75 444 3322',
    destination: 'Main Street, Galle',
    date: 'Oct 4, 2026',
    due: 'In Transit',
    status: 'SHIPPED',
    notes: 'Express courier tracking #ATH-9942-PY.',
    photo: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=400',
  },
  {
    id: 'AT-1034',
    item: 'Botanical Dye Tapestry',
    price: 'LKR 18,500',
    buyer: 'Kavinda Perera',
    phone: '+94 72 111 2233',
    destination: 'Negombo Road, Kurunegala',
    date: 'Oct 1, 2026',
    due: 'Delivered',
    status: 'DELIVERED',
    notes: 'Customer signed digital receipt.',
    photo: 'https://images.unsplash.com/photo-1606760227091-3dd850d97f1d?w=400',
  },
];

export const ArtisanOrdersScreen = () => {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // ALL | PENDING | SHIPPED | DELIVERED
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Compute Order Summary Counts dynamically
  const summaryCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'PENDING').length,
    shipped: orders.filter((o) => o.status === 'SHIPPED').length,
    delivered: orders.filter((o) => o.status === 'DELIVERED').length,
  };

  // Filter orders by summary status selection
  const filteredOrders = orders.filter((ord) => {
    if (selectedFilter === 'ALL') return true;
    return ord.status === selectedFilter;
  });

  const handleUpdateStatus = (newStatus) => {
    if (!selectedOrder) return;

    const updatedOrders = orders.map((o) =>
      o.id === selectedOrder.id ? { ...o, status: newStatus } : o
    );

    setOrders(updatedOrders);
    setSelectedOrder({ ...selectedOrder, status: newStatus });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Fulfillment & Orders"
        subtitle="Manage client orders, customer details & dispatch status"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyOrdersContainer}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyText}>No {selectedFilter.toLowerCase()} orders found</Text>
            </View>
          ) : (
            filteredOrders.map((ord) => (
              <TouchableOpacity
                key={ord.id}
                onPress={() => setSelectedOrder(ord)}
                activeOpacity={0.85}
              >
                <Card style={styles.card}>
                  <View style={styles.header}>
                    <Text style={styles.orderId}>#{ord.id}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        ord.status === 'PENDING' && styles.statusBadgePending,
                        ord.status === 'SHIPPED' && styles.statusBadgeShipped,
                        ord.status === 'DELIVERED' && styles.statusBadgeDelivered,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          ord.status === 'PENDING' && styles.statusTextPending,
                          ord.status === 'SHIPPED' && styles.statusTextShipped,
                          ord.status === 'DELIVERED' && styles.statusTextDelivered,
                        ]}
                      >
                        {ord.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.orderContentRow}>
                    <Image source={{ uri: ord.photo }} style={styles.craftThumb} resizeMode="cover" />

                    <View style={styles.orderMainInfo}>
                      <Text style={styles.itemTitle}>{ord.item}</Text>
                      <Text style={styles.priceText}>{ord.price}</Text>
                      <Text style={styles.clientText}>👤 Client: {ord.buyer}</Text>
                      <Text style={styles.destText}>📍 {ord.destination}</Text>
                    </View>
                  </View>

                  <View style={styles.cardFooterRow}>
                    <Text style={styles.viewDetailsLink}>Tap for Customer & Order Details →</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
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
                        selectedOrder.status === 'PENDING' && styles.statusBadgePending,
                        selectedOrder.status === 'SHIPPED' && styles.statusBadgeShipped,
                        selectedOrder.status === 'DELIVERED' && styles.statusBadgeDelivered,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          selectedOrder.status === 'PENDING' && styles.statusTextPending,
                          selectedOrder.status === 'SHIPPED' && styles.statusTextShipped,
                          selectedOrder.status === 'DELIVERED' && styles.statusTextDelivered,
                        ]}
                      >
                        {selectedOrder.status}
                      </Text>
                    </View>
                  </View>

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
                  <Text style={styles.actionHeaderTitle}>Update Order Status:</Text>
                  <View style={styles.statusButtonsRow}>
                    <TouchableOpacity
                      onPress={() => handleUpdateStatus('PENDING')}
                      activeOpacity={0.8}
                      style={[
                        styles.statusActionBtn,
                        styles.btnPending,
                        selectedOrder.status === 'PENDING' && styles.btnActiveSelected,
                      ]}
                    >
                      <Text style={styles.statusActionBtnText}>🟡 Pending</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleUpdateStatus('SHIPPED')}
                      activeOpacity={0.8}
                      style={[
                        styles.statusActionBtn,
                        styles.btnShipped,
                        selectedOrder.status === 'SHIPPED' && styles.btnActiveSelected,
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
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 95,
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: 20,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  summaryLabelActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },

  // List Header
  listSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 10,
    marginBottom: 8,
  },
  listSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  listSectionCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  list: {
    gap: 12,
  },
  emptyOrdersContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  card: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  statusBadgePending: {
    backgroundColor: '#FFF4E5',
  },
  statusBadgeShipped: {
    backgroundColor: '#E1F5FE',
  },
  statusBadgeDelivered: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
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
    alignItems: 'center',
  },
  craftThumb: {
    width: 54,
    height: 54,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
  },
  orderMainInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
  clientText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  destText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  cardFooterRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  viewDetailsLink: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Modal Window Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '88%',
    padding: SPACING.lg,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modalScroll: {
    paddingVertical: 12,
  },
  modalStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalStatusLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },

  detailsCard: {
    padding: SPACING.md,
    marginBottom: 12,
  },
  detailsHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  detailValHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  detailValNote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    flex: 1,
    textAlign: 'right',
  },

  craftDetailRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalCraftThumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  modalItemTitle: {
    fontSize: 15,
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
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  actionHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusActionBtn: {
    flex: 1,
    paddingVertical: 10,
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
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});

export default ArtisanOrdersScreen;
