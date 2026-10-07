import React, { useMemo, useState } from 'react';
import {
	Alert,
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../navigation/routes';

const FILTERS = ['All orders', 'In progress', 'Completed'];

const ORDERS = [
	{
		id: '#AT-29481',
		date: 'Placed 17 Sep 2026',
		status: 'Shipped',
		statusType: 'shipped',
		product: 'Handmade Batik Silk Saree',
		seller: "Malsha's Crafts",
		quantity: 1,
		arrival: 'Arrives by 21 Sep',
		total: '12,800',
		image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e3?auto=format&fit=crop&w=400&q=85',
	},
	{
		id: '#AT-29104',
		date: 'Placed 11 Sep 2026',
		status: 'In transit',
		statusType: 'transit',
		product: 'Dumbara Handloom Bag',
		seller: 'Kandyan Loom House',
		quantity: 1,
		arrival: 'Left Colombo hub',
		total: '5,000',
		image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=400&q=85',
	},
	{
		id: '#AT-28376',
		date: 'Placed 28 Aug 2026',
		status: 'Delivered',
		statusType: 'delivered',
		product: 'Hand-carved Lacquer Elephant',
		seller: 'Laksha Artisans',
		quantity: 1,
		arrival: 'Delivered 02 Sep',
		total: '3,500',
		image: 'https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?auto=format&fit=crop&w=400&q=85',
	},
];

export const OrdersScreen = ({ navigation }) => {
	const [selectedFilter, setSelectedFilter] = useState('All orders');
	const [searchOpen, setSearchOpen] = useState(false);
	const [search, setSearch] = useState('');

	const visibleOrders = useMemo(() => {
		const query = search.trim().toLowerCase();
		return ORDERS.filter((order) => {
			const matchesFilter = selectedFilter === 'All orders'
				|| (selectedFilter === 'In progress' && order.statusType !== 'delivered')
				|| (selectedFilter === 'Completed' && order.statusType === 'delivered');
			const matchesSearch = !query || `${order.id} ${order.product} ${order.seller} ${order.status}`.toLowerCase().includes(query);
			return matchesFilter && matchesSearch;
		});
	}, [search, selectedFilter]);

	const viewDetails = (order) => {
		navigation?.navigate?.(ROUTES.BUYER.PRODUCT_DETAIL, {
			product: { name: order.product, artisan: order.seller, price: order.total, image: order.image },
		});
	};

	const handleOrderAction = (order) => {
		if (order.statusType === 'delivered') {
			Alert.alert('Leave a review', `Share your experience with ${order.seller}.`);
			return;
		}
		Alert.alert('Delivery tracking', `${order.id} is ${order.status.toLowerCase()}.\n${order.arrival}.`);
	};

	return (
		<SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
			<View style={styles.screen}>
				<View style={styles.header}>
					<Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => navigation?.goBack?.()} style={styles.iconButton}>
						<Ionicons name="arrow-back" size={21} color={COLORS.textPrimary} />
					</Pressable>
					<Text style={styles.title}>My Orders</Text>
					<Pressable accessibilityRole="button" accessibilityLabel={searchOpen ? 'Close search' : 'Search orders'} onPress={() => { setSearchOpen((open) => !open); setSearch(''); }} style={styles.iconButton}>
						<Ionicons name={searchOpen ? 'close' : 'search-outline'} size={21} color={COLORS.textPrimary} />
					</Pressable>
				</View>

				{searchOpen && (
					<View style={styles.searchBar}>
						<Ionicons name="search-outline" size={17} color={COLORS.textMuted} />
						<TextInput
							autoFocus
							accessibilityLabel="Search orders"
							placeholder="Search order or product..."
							placeholderTextColor={COLORS.textMuted}
							value={search}
							onChangeText={setSearch}
							style={styles.searchInput}
						/>
					</View>
					)}

				<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
					{FILTERS.map((filter) => {
						const active = filter === selectedFilter;
						return (
							<Pressable key={filter} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => setSelectedFilter(filter)} style={[styles.filterPill, active && styles.filterPillActive]}>
								<Text style={[styles.filterText, active && styles.filterTextActive]}>{filter}</Text>
							</Pressable>
						);
					})}
				</ScrollView>

				<ScrollView style={styles.orderList} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
					{visibleOrders.map((order) => (
						<View key={order.id} style={styles.orderCard}>
							<View style={styles.cardHeader}>
								<View>
									<Text style={styles.orderId}>Order {order.id}</Text>
									<Text style={styles.orderDate}>{order.date}</Text>
								</View>
								<View style={[styles.statusBadge, styles[`status_${order.statusType}`]]}>
									<Text style={[styles.statusText, styles[`statusText_${order.statusType}`]]}>{order.status}</Text>
								</View>
							</View>

							<View style={styles.productRow}>
								<Image source={{ uri: order.image }} style={styles.productImage} resizeMode="cover" />
								<View style={styles.productInfo}>
									<Text numberOfLines={2} style={styles.productName}>{order.product}</Text>
									<Text numberOfLines={1} style={styles.sellerName}>{order.seller}</Text>
									<Text style={styles.quantity}>Qty {order.quantity}</Text>
									<Text style={[styles.arrival, order.statusType === 'transit' && styles.transitArrival]}>{order.arrival}</Text>
								</View>
							</View>

							<View style={styles.cardFooter}>
								<View style={styles.totalBlock}>
									<Text style={styles.totalLabel}>Order total</Text>
									<Text style={styles.totalPrice}>LKR {order.total}</Text>
								</View>
								<Pressable accessibilityRole="button" onPress={() => viewDetails(order)} style={styles.secondaryAction}>
									<Text style={styles.secondaryActionText}>View details</Text>
								</Pressable>
								<Pressable accessibilityRole="button" onPress={() => handleOrderAction(order)} style={styles.primaryAction}>
									<Text style={styles.primaryActionText}>{order.statusType === 'delivered' ? 'Review' : 'Track'}</Text>
								</Pressable>
							</View>
						</View>
					))}
					{visibleOrders.length === 0 && (
						<View style={styles.emptyState}>
							<Ionicons name="receipt-outline" size={30} color={COLORS.textMuted} />
							<Text style={styles.emptyTitle}>No matching orders</Text>
							<Text style={styles.emptyCopy}>Try another filter or search term.</Text>
						</View>
					)}
				</ScrollView>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: '#F8F8F7' },
	screen: { flex: 1, backgroundColor: '#F8F8F7' },
	header: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
	iconButton: { width: 34, height: 34, borderRadius: 18, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#ECEEEC', alignItems: 'center', justifyContent: 'center' },
	title: { color: '#151918', fontSize: 16, fontWeight: '800' },
	searchBar: { flexDirection: 'row', alignItems: 'center', height: 40, marginHorizontal: 15, marginBottom: 8, paddingHorizontal: 11, gap: 7, backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
	searchInput: { flex: 1, paddingVertical: 0, color: COLORS.textPrimary, fontSize: 12 },
	filters: { alignItems: 'center', paddingHorizontal: 14, paddingTop: 6, paddingBottom: 10, gap: 7 },
	filterPill: { height: 30, paddingHorizontal: 13, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E8EAE8' },
	filterPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
	filterText: { color: COLORS.textPrimary, fontSize: 10, fontWeight: '600' },
	filterTextActive: { color: '#FFF' },
	orderList: { flex: 1 },
	listContent: { paddingHorizontal: 14, paddingBottom: 16, gap: 10 },
	orderCard: { backgroundColor: '#FFF', borderRadius: 13, borderWidth: 1, borderColor: '#E9EBE9', padding: 9 },
	cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
	orderId: { color: '#222725', fontSize: 10, fontWeight: '800' },
	orderDate: { color: COLORS.textMuted, fontSize: 8, marginTop: 2 },
	statusBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12 },
	status_shipped: { backgroundColor: '#E6F4F1' },
	status_transit: { backgroundColor: '#FFF4DE' },
	status_delivered: { backgroundColor: '#E6F4EA' },
	statusText: { fontSize: 8, fontWeight: '700' },
	statusText_shipped: { color: '#286F65' },
	statusText_transit: { color: '#9A6A1B' },
	statusText_delivered: { color: '#318051' },
	productRow: { flexDirection: 'row', alignItems: 'center', gap: 9, minHeight: 65 },
	productImage: { width: 61, height: 65, borderRadius: 8, backgroundColor: '#ECEDE8' },
	productInfo: { flex: 1, justifyContent: 'center' },
	productName: { color: '#1D2220', fontSize: 11, lineHeight: 14, fontWeight: '800' },
	sellerName: { color: COLORS.textMuted, fontSize: 8, marginTop: 2 },
	quantity: { color: COLORS.textMuted, fontSize: 8, marginTop: 3 },
	arrival: { color: '#347C57', fontSize: 8, fontWeight: '600', marginTop: 3 },
	transitArrival: { color: '#9A6A1B' },
	cardFooter: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 8 },
	totalBlock: { flex: 1, justifyContent: 'center', paddingBottom: 3 },
	totalLabel: { color: COLORS.textMuted, fontSize: 8 },
	totalPrice: { color: '#1E2421', fontSize: 11, fontWeight: '800', marginTop: 2 },
	secondaryAction: { minWidth: 74, height: 34, paddingHorizontal: 8, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: COLORS.primary },
	secondaryActionText: { color: COLORS.primary, fontSize: 9, fontWeight: '700' },
	primaryAction: { minWidth: 64, height: 34, paddingHorizontal: 8, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary },
	primaryActionText: { color: '#FFF', fontSize: 9, fontWeight: '700' },
	emptyState: { alignItems: 'center', paddingVertical: 55 },
	emptyTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700', marginTop: 9 },
	emptyCopy: { color: COLORS.textMuted, fontSize: 11, marginTop: 4 },
});

export default OrdersScreen;
