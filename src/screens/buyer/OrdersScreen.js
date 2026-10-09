import React, { useMemo, useState } from 'react';
import {
	Alert,
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
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
		location: 'Colombo Atelier',
		quantity: 1,
		arrival: 'Arrives by 21 Sep · In transit with Courier',
		total: '12,800',
		image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=85',
	},
	{
		id: '#AT-29104',
		date: 'Placed 11 Sep 2026',
		status: 'In Transit',
		statusType: 'transit',
		product: 'Dumbara Handloom Bag',
		seller: 'Kandyan Loom House',
		location: 'Kandy Workshop',
		quantity: 1,
		arrival: 'Left Colombo central hub',
		total: '5,000',
		image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=400&q=85',
	},
	{
		id: '#AT-28376',
		date: 'Placed 28 Aug 2026',
		status: 'Delivered',
		statusType: 'delivered',
		product: 'Handcarved Lacquer Wooden Elephant',
		seller: 'Laksha Artisans',
		location: 'Galle Workshop',
		quantity: 1,
		arrival: 'Delivered & Inspected on 02 Sep',
		total: '3,500',
		image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=400&q=85',
	},
];

export const OrdersScreen = ({ navigation }) => {
	const insets = useSafeAreaInsets();
	const [selectedFilter, setSelectedFilter] = useState('All orders');
	const [searchOpen, setSearchOpen] = useState(false);
	const [search, setSearch] = useState('');
	const [failedImages, setFailedImages] = useState({});

	const visibleOrders = useMemo(() => {
		const query = search.trim().toLowerCase();
		return ORDERS.filter((order) => {
			const matchesFilter =
				selectedFilter === 'All orders' ||
				(selectedFilter === 'In progress' && order.statusType !== 'delivered') ||
				(selectedFilter === 'Completed' && order.statusType === 'delivered');
			const matchesSearch =
				!query ||
				`${order.id} ${order.product} ${order.seller} ${order.status}`
					.toLowerCase()
					.includes(query);
			return matchesFilter && matchesSearch;
		});
	}, [search, selectedFilter]);

	const shapeOrderForNavigation = (order) => ({
		...order,
		title: order.product,
		order_number: order.id,
		total_amount: order.total,
		items: [
			{
				title: order.product,
				name: order.product,
				image_url: order.image,
				imageUrl: order.image,
				price: order.total,
				quantity: order.quantity,
				artisan: {
					name: order.seller,
					location: order.location,
				},
				product: {
					title: order.product,
					name: order.product,
					image_url: order.image,
					artisan: {
						name: order.seller,
						location: order.location,
					},
				},
			},
		],
	});

	const viewDetails = (order) => {
		const shaped = shapeOrderForNavigation(order);
		try {
			navigation?.navigate(ROUTES.BUYER.ORDER_STATUS, { orderId: order.id, order: shaped });
		} catch (e) {
			navigation?.navigate(ROUTES.BUYER.PRODUCT_DETAIL, {
				product: { name: order.product, artisan: order.seller, price: order.total, image: order.image },
			});
		}
	};

	const handleOrderAction = (order) => {
		if (order.statusType === 'delivered') {
			Alert.alert(
				'Review Artisan',
				`Thank you for supporting ${order.seller}! Your review helps master artisans grow their craft atelier.`
			);
			return;
		}

		const shaped = shapeOrderForNavigation(order);
		try {
			navigation?.navigate(ROUTES.BUYER.TRACK_ORDER, { orderId: order.id, order: shaped });
		} catch (e) {
			navigation?.navigate(ROUTES.BUYER.ORDER_STATUS, { orderId: order.id, order: shaped });
		}
	};

	const getStatusIcon = (type) => {
		switch (type) {
			case 'shipped':
				return 'cube-outline';
			case 'transit':
				return 'paper-plane-outline';
			case 'delivered':
				return 'checkmark-done-circle-outline';
			default:
				return 'time-outline';
		}
	};

	return (
		<SafeAreaView style={styles.safeArea} edges={['top']}>
			<StatusBar style="dark" backgroundColor="#FFFFFF" />

			<View style={styles.screen}>
				{/* Top Header */}
				<View style={styles.header}>
					<TouchableOpacity
						accessibilityRole="button"
						accessibilityLabel="Go back"
						onPress={() => navigation?.goBack?.()}
						style={styles.headerButton}
					>
						<Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
					</TouchableOpacity>

					<View style={styles.headerCenter}>
						<Text style={styles.headerTitle}>My Orders</Text>
						<View style={styles.orderCountChip}>
							<Text style={styles.orderCountText}>{ORDERS.length} orders</Text>
						</View>
					</View>

					<TouchableOpacity
						accessibilityRole="button"
						accessibilityLabel={searchOpen ? 'Close search' : 'Search orders'}
						onPress={() => {
							setSearchOpen((open) => !open);
							setSearch('');
						}}
						style={styles.headerButton}
					>
						<Ionicons
							name={searchOpen ? 'close' : 'search-outline'}
							size={20}
							color={COLORS.textPrimary}
						/>
					</TouchableOpacity>
				</View>

				{/* Search Bar Input (toggleable) */}
				{searchOpen && (
					<View style={styles.searchBar}>
						<Ionicons name="search" size={17} color={COLORS.textMuted} />
						<TextInput
							autoFocus
							accessibilityLabel="Search orders"
							placeholder="Search order ID, craft, or artisan..."
							placeholderTextColor={COLORS.textMuted}
							value={search}
							onChangeText={setSearch}
							style={styles.searchInput}
						/>
						{search.length > 0 && (
							<TouchableOpacity onPress={() => setSearch('')}>
								<Ionicons name="close-circle" size={17} color={COLORS.textMuted} />
							</TouchableOpacity>
						)}
					</View>
				)}

				{/* Filter Pills with Constrained Height (Prevents Android Gap!) */}
				<View style={styles.filtersContainer}>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						style={styles.filtersScrollStyle}
						contentContainerStyle={styles.filtersScroll}
					>
						{FILTERS.map((filter) => {
							const active = filter === selectedFilter;
							return (
								<TouchableOpacity
									key={filter}
									accessibilityRole="button"
									accessibilityState={{ selected: active }}
									onPress={() => setSelectedFilter(filter)}
									style={[styles.filterPill, active && styles.filterPillActive]}
								>
									<Text style={[styles.filterText, active && styles.filterTextActive]}>
										{filter}
									</Text>
								</TouchableOpacity>
							);
						})}
					</ScrollView>
				</View>

				{/* Orders List Content */}
				<ScrollView
					style={styles.orderList}
					contentContainerStyle={[
						styles.listContent,
						{ paddingBottom: 110 + insets.bottom },
					]}
					showsVerticalScrollIndicator={false}
				>
					{/* Active In-Transit Highlights Banner */}
					{selectedFilter !== 'Completed' && (
						<TouchableOpacity
							style={styles.activeTransitBanner}
							onPress={() =>
								navigation?.navigate(ROUTES.BUYER.TRACK_ORDER, {
									orderId: '#AT-29104',
									order: ORDERS[1],
								})
							}
						>
							<View style={styles.truckIconBadge}>
								<Ionicons name="bicycle" size={18} color="#004D40" />
							</View>
							<View style={{ flex: 1 }}>
								<Text style={styles.transitBannerTitle}>Active Courier Delivery</Text>
								<Text style={styles.transitBannerSubtitle}>
									Dumbara Bag is in transit · Left Colombo central hub
								</Text>
							</View>
							<View style={styles.trackLinkBadge}>
								<Text style={styles.trackLinkText}>Live Map →</Text>
							</View>
						</TouchableOpacity>
					)}

					{/* Order Cards */}
					{visibleOrders.map((order) => {
						const hasImageError = failedImages[order.id];
						return (
							<View key={order.id} style={styles.orderCard}>
								{/* Card Header */}
								<View style={styles.cardHeader}>
									<View>
										<Text style={styles.orderId}>{order.id}</Text>
										<Text style={styles.orderDate}>{order.date}</Text>
									</View>
									<View style={[styles.statusBadge, styles[`status_${order.statusType}`]]}>
										<Ionicons
											name={getStatusIcon(order.statusType)}
											size={13}
											color={
												order.statusType === 'shipped'
													? '#004D40'
													: order.statusType === 'transit'
													? '#E65100'
													: '#2E7D32'
											}
										/>
										<Text
											style={[
												styles.statusText,
												styles[`statusText_${order.statusType}`],
											]}
										>
											{order.status}
										</Text>
									</View>
								</View>

								{/* Product Details Row */}
								<View style={styles.productRow}>
									<View style={styles.productImageWrap}>
										{!hasImageError ? (
											<Image
												source={{ uri: order.image }}
												style={styles.productImage}
												resizeMode="cover"
												onError={() =>
													setFailedImages((prev) => ({ ...prev, [order.id]: true }))
												}
											/>
										) : (
											<View style={styles.fallbackWrap}>
												<Text style={styles.fallbackEmoji}>🏺</Text>
											</View>
										)}
									</View>

									<View style={styles.productInfo}>
										<Text numberOfLines={2} style={styles.productName}>
											{order.product}
										</Text>
										<View style={styles.artisanLocationRow}>
											<Ionicons name="storefront-outline" size={12} color={COLORS.textMuted} />
											<Text numberOfLines={1} style={styles.sellerName}>
												{order.seller}
											</Text>
										</View>
										<Text style={styles.quantity}>Quantity: {order.quantity}</Text>
										<View style={styles.arrivalRow}>
											<Ionicons
												name="time-outline"
												size={12}
												color={order.statusType === 'transit' ? '#E65100' : '#2E7D32'}
											/>
											<Text
												numberOfLines={1}
												style={[
													styles.arrival,
													order.statusType === 'transit' && styles.transitArrival,
												]}
											>
												{order.arrival}
											</Text>
										</View>
									</View>
								</View>

								{/* Card Footer: Total & Actions */}
								<View style={styles.cardFooter}>
									<View style={styles.totalBlock}>
										<Text style={styles.totalLabel}>ORDER TOTAL (ESCROW)</Text>
										<Text style={styles.totalPrice}>LKR {order.total}</Text>
									</View>

									<TouchableOpacity
										accessibilityRole="button"
										onPress={() => viewDetails(order)}
										style={styles.secondaryAction}
									>
										<Text style={styles.secondaryActionText}>View details</Text>
									</TouchableOpacity>

									<TouchableOpacity
										accessibilityRole="button"
										onPress={() => handleOrderAction(order)}
										style={styles.primaryAction}
									>
										<Ionicons
											name={order.statusType === 'delivered' ? 'star' : 'navigate'}
											size={13}
											color="#FFFFFF"
										/>
										<Text style={styles.primaryActionText}>
											{order.statusType === 'delivered' ? 'Review' : 'Track'}
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						);
					})}

					{visibleOrders.length === 0 && (
						<View style={styles.emptyState}>
							<Text style={styles.emptyEmoji}>📦</Text>
							<Text style={styles.emptyTitle}>No matching orders</Text>
							<Text style={styles.emptyCopy}>
								Try selecting another filter or clear your search term.
							</Text>
							<TouchableOpacity
								style={styles.resetFilterBtn}
								onPress={() => {
									setSelectedFilter('All orders');
									setSearch('');
								}}
							>
								<Text style={styles.resetFilterText}>Reset Filters</Text>
							</TouchableOpacity>
						</View>
					)}
				</ScrollView>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	screen: {
		flex: 1,
		backgroundColor: '#F8FAF9',
	},
	header: {
		height: 54,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 14,
		backgroundColor: '#FFFFFF',
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: '#EBEFEF',
	},
	headerButton: {
		width: 38,
		height: 38,
		borderRadius: 19,
		backgroundColor: '#F4F7F6',
		borderWidth: 1,
		borderColor: '#E2E8E6',
		alignItems: 'center',
		justifyContent: 'center',
	},
	headerCenter: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	headerTitle: {
		color: COLORS.primaryDark,
		fontSize: 17,
		fontWeight: '800',
	},
	orderCountChip: {
		backgroundColor: '#E0F2F1',
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 10,
	},
	orderCountText: {
		color: COLORS.primary,
		fontSize: 10.5,
		fontWeight: '800',
	},
	searchBar: {
		flexDirection: 'row',
		alignItems: 'center',
		height: 42,
		marginHorizontal: 14,
		marginTop: 8,
		paddingHorizontal: 12,
		gap: 8,
		backgroundColor: '#FFFFFF',
		borderRadius: 21,
		borderWidth: 1,
		borderColor: '#E0E7E4',
	},
	searchInput: {
		flex: 1,
		paddingVertical: 0,
		color: COLORS.textPrimary,
		fontSize: 13,
	},
	filtersContainer: {
		height: 48,
		justifyContent: 'center',
		backgroundColor: '#FFFFFF',
		borderBottomWidth: 1,
		borderBottomColor: '#EDF2F0',
	},
	filtersScrollStyle: {
		flexGrow: 0,
	},
	filtersScroll: {
		alignItems: 'center',
		paddingHorizontal: 14,
		gap: 8,
	},
	filterPill: {
		height: 32,
		paddingHorizontal: 14,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#F4F7F6',
		borderWidth: 1,
		borderColor: '#E2E8E6',
	},
	filterPillActive: {
		backgroundColor: COLORS.primary,
		borderColor: COLORS.primary,
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 3,
		elevation: 2,
	},
	filterText: {
		color: COLORS.textSecondary,
		fontSize: 12,
		fontWeight: '600',
	},
	filterTextActive: {
		color: '#FFFFFF',
		fontWeight: '700',
	},
	orderList: {
		flex: 1,
	},
	listContent: {
		paddingHorizontal: 14,
		paddingTop: 12,
		gap: 12,
	},
	activeTransitBanner: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#E8F5E9',
		padding: 12,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: '#C8E6C9',
		gap: 10,
	},
	truckIconBadge: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: '#C8E6C9',
		alignItems: 'center',
		justifyContent: 'center',
	},
	transitBannerTitle: {
		fontSize: 12.5,
		fontWeight: '800',
		color: '#1B5E20',
	},
	transitBannerSubtitle: {
		fontSize: 11,
		color: '#2E7D32',
		marginTop: 2,
	},
	trackLinkBadge: {
		backgroundColor: '#1B5E20',
		paddingHorizontal: 9,
		paddingVertical: 4,
		borderRadius: 10,
	},
	trackLinkText: {
		color: '#FFFFFF',
		fontSize: 10.5,
		fontWeight: '800',
	},
	orderCard: {
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#E8ECE9',
		padding: 14,
		shadowColor: '#00251A',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.04,
		shadowRadius: 6,
		elevation: 1,
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 12,
		paddingBottom: 10,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: '#F0F3F2',
	},
	orderId: {
		color: COLORS.textPrimary,
		fontSize: 14,
		fontWeight: '800',
	},
	orderDate: {
		color: COLORS.textMuted,
		fontSize: 11,
		marginTop: 2,
	},
	statusBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 9,
		paddingVertical: 4,
		borderRadius: 10,
	},
	status_shipped: {
		backgroundColor: '#E0F2F1',
	},
	status_transit: {
		backgroundColor: '#FFF3E0',
	},
	status_delivered: {
		backgroundColor: '#E8F5E9',
	},
	statusText: {
		fontSize: 11,
		fontWeight: '700',
	},
	statusText_shipped: {
		color: '#004D40',
	},
	statusText_transit: {
		color: '#E65100',
	},
	statusText_delivered: {
		color: '#2E7D32',
	},
	productRow: {
		flexDirection: 'row',
		gap: 12,
	},
	productImageWrap: {
		width: 74,
		height: 78,
		borderRadius: 12,
		overflow: 'hidden',
		backgroundColor: '#F0F3F2',
	},
	productImage: {
		width: '100%',
		height: '100%',
	},
	fallbackWrap: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#E0E7E4',
	},
	fallbackEmoji: {
		fontSize: 32,
	},
	productInfo: {
		flex: 1,
		justifyContent: 'center',
	},
	productName: {
		color: COLORS.textPrimary,
		fontSize: 13.5,
		lineHeight: 18,
		fontWeight: '700',
	},
	artisanLocationRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		marginTop: 3,
	},
	sellerName: {
		color: COLORS.textSecondary,
		fontSize: 11.5,
		fontWeight: '600',
	},
	quantity: {
		color: COLORS.textMuted,
		fontSize: 11,
		marginTop: 3,
	},
	arrivalRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		marginTop: 4,
	},
	arrival: {
		color: '#2E7D32',
		fontSize: 11,
		fontWeight: '600',
	},
	transitArrival: {
		color: '#E65100',
	},
	cardFooter: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginTop: 12,
		paddingTop: 10,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: '#F0F3F2',
	},
	totalBlock: {
		flex: 1,
	},
	totalLabel: {
		color: COLORS.textMuted,
		fontSize: 9.5,
		fontWeight: '700',
		letterSpacing: 0.4,
	},
	totalPrice: {
		color: COLORS.primary,
		fontSize: 14.5,
		fontWeight: '900',
		marginTop: 2,
	},
	secondaryAction: {
		height: 36,
		paddingHorizontal: 12,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#F5F7F6',
		borderWidth: 1,
		borderColor: '#DCE4E1',
	},
	secondaryActionText: {
		color: COLORS.textPrimary,
		fontSize: 11.5,
		fontWeight: '700',
	},
	primaryAction: {
		height: 36,
		paddingHorizontal: 14,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: COLORS.primary,
		flexDirection: 'row',
		gap: 4,
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 3,
		elevation: 2,
	},
	primaryActionText: {
		color: '#FFFFFF',
		fontSize: 11.5,
		fontWeight: '700',
	},
	emptyState: {
		alignItems: 'center',
		paddingVertical: 48,
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#E8ECE9',
		marginTop: 12,
	},
	emptyEmoji: {
		fontSize: 48,
		marginBottom: 10,
	},
	emptyTitle: {
		color: COLORS.textPrimary,
		fontSize: 16,
		fontWeight: '800',
		marginBottom: 4,
	},
	emptyCopy: {
		color: COLORS.textMuted,
		fontSize: 12,
		textAlign: 'center',
		lineHeight: 18,
		marginBottom: 16,
	},
	resetFilterBtn: {
		backgroundColor: COLORS.primary,
		paddingHorizontal: 16,
		paddingVertical: 9,
		borderRadius: 12,
	},
	resetFilterText: {
		color: '#FFFFFF',
		fontSize: 12,
		fontWeight: '700',
	},
});

export default OrdersScreen;
