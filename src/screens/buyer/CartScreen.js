import React, { useEffect, useState } from 'react';
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

const INITIAL_CART = [
	{
		id: 'dumbara-bag',
		name: 'Dumbara Handloom Tote Bag',
		store: 'Kandyan Loom House',
		specs: 'Handcrafted · Size Medium',
		price: 4800,
		quantity: 1,
		image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=500&q=85',
	},
	{
		id: 'palm-leaf-box',
		name: 'Matara Palm Leaf Storage Box',
		store: 'Matara Craft Circle',
		specs: 'Handcrafted · Natural Cane',
		price: 2950,
		quantity: 1,
		image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=500&q=85',
	},
];

const formatLkr = (amount) => `LKR ${Number(amount || 0).toLocaleString('en-LK')}`;
const formatPrice = (price) => Number(String(price || 0).replace(/[^\d.]/g, '')) || 0;

export const CartScreen = ({ navigation, route }) => {
	const insets = useSafeAreaInsets();

	const [cartItems, setCartItems] = useState(() => {
		const incomingProduct = route?.params?.product;
		if (!incomingProduct) return INITIAL_CART;
		const size = route?.params?.size;
		return [
			{
				id: incomingProduct.id || 'selected-product',
				name: incomingProduct.title || incomingProduct.name || 'Handmade craft',
				store: incomingProduct.artisan || 'Nimali Batik Studio',
				specs: size ? `Handcrafted · Size ${size}` : (incomingProduct.specs || 'Handcrafted · Size M'),
				price: formatPrice(incomingProduct.price),
				quantity: 2,
				image: incomingProduct.image || INITIAL_CART[0].image,
			},
		];
	});

	const [savedItems, setSavedItems] = useState([]);
	const [promoCode, setPromoCode] = useState('');
	const [promoApplied, setPromoApplied] = useState(false);
	const [promoMessage, setPromoMessage] = useState('');

	useEffect(() => {
		const incomingProduct = route?.params?.product;
		if (incomingProduct) {
			const size = route?.params?.size;
			setCartItems((prev) => {
				const existingIndex = prev.findIndex(
					(item) => item.id === (incomingProduct.id || 'selected-product')
				);
				if (existingIndex >= 0) {
					return prev.map((item, idx) =>
						idx === existingIndex
							? {
									...item,
									quantity: item.quantity + 1,
									specs: size ? `Handcrafted · Size ${size}` : item.specs,
							  }
							: item
					);
				}
				return [
					...prev,
					{
						id: incomingProduct.id || `product-${Date.now()}`,
						name: incomingProduct.title || incomingProduct.name || 'Handmade craft',
						store: incomingProduct.artisan || 'Sri Lankan Artisan',
						specs: size ? `Handcrafted · Size ${size}` : 'Handcrafted · Size M',
						price: formatPrice(incomingProduct.price),
						quantity: 1,
						image: incomingProduct.image || INITIAL_CART[0].image,
					},
				];
			});
		}
	}, [route?.params?.product, route?.params?.size]);

	const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
	const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
	const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
	const total = subtotal - discount;

	const updateQuantity = (id, change) => {
		setCartItems((current) =>
			current.map((item) =>
				item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
			)
		);
	};

	const removeItem = (id) => {
		setCartItems((current) => current.filter((item) => item.id !== id));
	};

	const saveForLater = (item) => {
		setSavedItems((current) => [...current, item]);
		removeItem(item.id);
	};

	const applyPromo = (codeToApply) => {
		const code = (codeToApply || promoCode).trim().toUpperCase();
		if (code === 'THREAD10' || code === 'ARTISAN10') {
			setPromoCode(code);
			setPromoApplied(true);
			setPromoMessage('🎉 10% artisan discount applied!');
		} else {
			setPromoApplied(false);
			setPromoMessage(code ? 'Invalid promo code. Try THREAD10' : 'Enter a promo code');
		}
	};

	const proceedToCheckout = () => {
		if (cartItems.length === 0) {
			Alert.alert(
				'Your cart is empty',
				'Add an authentic handmade craft before continuing to checkout.'
			);
			return;
		}

		navigation?.navigate(ROUTES.BUYER.CHECKOUT, {
			items: cartItems,
			totalAmount: total,
		});
	};

	const renderCartItem = (item) => (
		<View key={item.id} style={styles.itemCard}>
			<Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />

			<View style={styles.itemContent}>
				<View style={styles.itemHeaderRow}>
					<Text numberOfLines={1} style={styles.itemName}>
						{item.name}
					</Text>
					<TouchableOpacity
						accessibilityRole="button"
						accessibilityLabel={`Remove ${item.name}`}
						onPress={() => removeItem(item.id)}
						style={styles.deleteIconBtn}
					>
						<Ionicons name="trash-outline" size={17} color="#D32F2F" />
					</TouchableOpacity>
				</View>

				<View style={styles.artisanTagRow}>
					<Ionicons name="storefront-outline" size={12} color={COLORS.textMuted} />
					<Text numberOfLines={1} style={styles.storeName}>
						{item.store}
					</Text>
				</View>

				<View style={styles.specsBadge}>
					<Text style={styles.itemSpecsText}>{item.specs}</Text>
				</View>

				<View style={styles.itemPriceBottomRow}>
					<Text style={styles.itemPrice}>{formatLkr(item.price)}</Text>

					{/* Quantity Stepper */}
					<View style={styles.quantityStepper}>
						<TouchableOpacity
							accessibilityRole="button"
							accessibilityLabel="Decrease quantity"
							onPress={() => updateQuantity(item.id, -1)}
							style={styles.stepperBtn}
						>
							<Ionicons name="remove" size={14} color={COLORS.textPrimary} />
						</TouchableOpacity>
						<Text style={styles.quantityNumber}>{item.quantity}</Text>
						<TouchableOpacity
							accessibilityRole="button"
							accessibilityLabel="Increase quantity"
							onPress={() => updateQuantity(item.id, 1)}
							style={styles.stepperBtn}
						>
							<Ionicons name="add" size={14} color={COLORS.textPrimary} />
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</View>
	);

	return (
		<SafeAreaView style={styles.safeArea} edges={['top']}>
			<StatusBar style="dark" backgroundColor="#FFFFFF" />

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
					<Text style={styles.headerTitle}>My Cart</Text>
					<View style={styles.itemCountChip}>
						<Text style={styles.itemCountChipText}>{itemCount} items</Text>
					</View>
				</View>

				<TouchableOpacity
					accessibilityRole="button"
					accessibilityLabel="Saved items"
					onPress={() => navigation?.navigate(ROUTES.BUYER.WISHLIST)}
					style={styles.headerButton}
				>
					<Ionicons name="heart-outline" size={20} color={COLORS.textPrimary} />
				</TouchableOpacity>
			</View>

			{/* Main Scroll Content */}
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={[
					styles.scrollContent,
					{ paddingBottom: 120 + insets.bottom },
				]}
			>
				{/* Free Islandwide Delivery Banner */}
				<View style={styles.deliveryBanner}>
					<View style={styles.deliveryIconWrap}>
						<Ionicons name="cube-outline" size={18} color="#00796B" />
					</View>
					<View style={styles.deliveryCopy}>
						<Text style={styles.deliveryTitle}>Free Islandwide Express Delivery</Text>
						<Text style={styles.deliverySubtitle}>
							Estimated arrival: 2–3 business days with live courier tracking
						</Text>
					</View>
				</View>

				{/* Cart Items List */}
				{cartItems.length > 0 ? (
					<View style={styles.itemsWrapper}>{cartItems.map(renderCartItem)}</View>
				) : (
					<View style={styles.emptyState}>
						<Text style={styles.emptyEmoji}>🏺</Text>
						<Text style={styles.emptyTitle}>Your craft basket is empty</Text>
						<Text style={styles.emptyCopy}>
							Discover authentic batik, handloom & handcrafted heritage pieces directly from
							master artisans.
						</Text>
						<TouchableOpacity
							onPress={() => navigation?.navigate(ROUTES.BUYER.HOME)}
							style={styles.shopButton}
						>
							<Ionicons name="sparkles" size={15} color="#FFFFFF" />
							<Text style={styles.shopButtonText}>Explore Marketplace</Text>
						</TouchableOpacity>
					</View>
				)}

				{/* Saved For Later Notice */}
				{savedItems.length > 0 && (
					<View style={styles.savedNotice}>
						<Ionicons name="bookmark" size={14} color={COLORS.primary} />
						<Text style={styles.savedNoticeText}>
							{savedItems.length} item{savedItems.length === 1 ? '' : 's'} saved for later
						</Text>
					</View>
				)}

				{/* Promo Code Input & Quick Suggestion */}
				{cartItems.length > 0 && (
					<View style={styles.promoSection}>
						<View style={styles.promoBox}>
							<Ionicons name="pricetag-outline" size={17} color={COLORS.textMuted} />
							<TextInput
								accessibilityLabel="Promo code"
								placeholder="Enter promo code (e.g. THREAD10)"
								placeholderTextColor={COLORS.textMuted}
								value={promoCode}
								onChangeText={(val) => {
									setPromoCode(val);
									setPromoMessage('');
								}}
								style={styles.promoInput}
								autoCapitalize="characters"
							/>
							<TouchableOpacity
								accessibilityRole="button"
								onPress={() => applyPromo()}
								style={[
									styles.applyBtn,
									promoApplied && styles.applyBtnApplied,
								]}
							>
								<Text style={[styles.applyText, promoApplied && styles.applyTextApplied]}>
									{promoApplied ? 'Applied ✓' : 'Apply'}
								</Text>
							</TouchableOpacity>
						</View>

						{!promoApplied && (
							<TouchableOpacity
								style={styles.promoQuickChip}
								onPress={() => applyPromo('THREAD10')}
							>
								<Text style={styles.promoQuickText}>
									💡 Tap to apply promo code <Text style={{ fontWeight: '800' }}>THREAD10</Text> for 10% off
								</Text>
							</TouchableOpacity>
						)}

						{!!promoMessage && (
							<Text
								style={[
									styles.promoMessage,
									promoApplied ? styles.promoSuccess : styles.promoError,
								]}
							>
								{promoMessage}
							</Text>
						)}
					</View>
				)}

				{/* Artisan Escrow Buyer Protection Card */}
				{cartItems.length > 0 && (
					<View style={styles.escrowCard}>
						<View style={styles.escrowHeader}>
							<View style={styles.escrowShieldIcon}>
								<Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
							</View>
							<View style={{ flex: 1 }}>
								<Text style={styles.escrowTitle}>Artisan Escrow Protected</Text>
								<Text style={styles.escrowSubtitle}>Safe & Fair Trade Guarantee</Text>
							</View>
						</View>
						<Text style={styles.escrowBody}>
							Your payment is securely held by the ArtisanThread escrow system. Funds are released
							to the maker atelier only after you inspect and accept your parcel upon doorstep
							delivery.
						</Text>
						<View style={styles.escrowBadgesRow}>
							<View style={styles.escrowBadge}>
								<Ionicons name="lock-closed" size={12} color="#80CBC4" />
								<Text style={styles.escrowBadgeText}>Funds Held in Escrow</Text>
							</View>
							<View style={styles.escrowBadge}>
								<Ionicons name="refresh" size={12} color="#80CBC4" />
								<Text style={styles.escrowBadgeText}>100% Refund Guarantee</Text>
							</View>
						</View>
					</View>
				)}

				{/* Price Summary Card */}
				{cartItems.length > 0 && (
					<View style={styles.summaryCard}>
						<Text style={styles.summaryTitle}>Price Summary</Text>

						<View style={styles.summaryRow}>
							<Text style={styles.summaryLabel}>Items Subtotal ({itemCount})</Text>
							<Text style={styles.summaryValue}>{formatLkr(subtotal)}</Text>
						</View>

						<View style={styles.summaryRow}>
							<Text style={styles.summaryLabel}>Islandwide Courier Delivery</Text>
							<View style={styles.freeDeliveryPill}>
								<Text style={styles.freeDeliveryPillText}>FREE</Text>
							</View>
						</View>

						{discount > 0 && (
							<View style={styles.summaryRow}>
								<Text style={styles.discountLabel}>Promo Discount (10%)</Text>
								<Text style={styles.discountValue}>− {formatLkr(discount)}</Text>
							</View>
						)}

						<View style={styles.summaryDivider} />

						<View style={styles.totalRow}>
							<View>
								<Text style={styles.totalLabel}>Total to Pay</Text>
								<Text style={styles.totalSublabel}>Includes all taxes & escrow fee</Text>
							</View>
							<Text style={styles.totalValue}>{formatLkr(total)}</Text>
						</View>
					</View>
				)}
			</ScrollView>

			{/* Floating Bottom Sticky Checkout Bar (Above Tab Bar) */}
			{cartItems.length > 0 && (
				<View style={styles.checkoutBar}>
					<View style={styles.secureTotalRow}>
						<View style={styles.secureTag}>
							<Ionicons name="shield-checkmark" size={13} color={COLORS.success} />
							<Text style={styles.secureLabel}>Escrow Protected Total</Text>
						</View>
						<Text style={styles.securePrice}>{formatLkr(total)}</Text>
					</View>

					<TouchableOpacity
						accessibilityRole="button"
						accessibilityLabel="Proceed to secure checkout"
						onPress={proceedToCheckout}
						style={styles.checkoutButton}
					>
						<Ionicons name="lock-closed" size={17} color="#FFFFFF" />
						<Text style={styles.checkoutText}>Proceed to Secure Checkout</Text>
						<Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
					</TouchableOpacity>
				</View>
			)}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#FFFFFF',
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
	itemCountChip: {
		backgroundColor: '#E0F2F1',
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 12,
	},
	itemCountChipText: {
		color: COLORS.primary,
		fontSize: 10.5,
		fontWeight: '800',
	},
	scrollContent: {
		paddingHorizontal: 14,
		paddingTop: 12,
		gap: 12,
		backgroundColor: '#F8FAF9',
	},
	deliveryBanner: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		padding: 12,
		borderRadius: 14,
		backgroundColor: '#E8F5E9',
		borderWidth: 1,
		borderColor: '#D0EBD8',
	},
	deliveryIconWrap: {
		width: 34,
		height: 34,
		borderRadius: 17,
		backgroundColor: '#FFFFFF',
		alignItems: 'center',
		justifyContent: 'center',
	},
	deliveryCopy: {
		flex: 1,
	},
	deliveryTitle: {
		color: '#2E7D32',
		fontSize: 12.5,
		fontWeight: '800',
	},
	deliverySubtitle: {
		color: '#4E8A5E',
		fontSize: 11,
		marginTop: 2,
	},
	itemsWrapper: {
		gap: 10,
	},
	itemCard: {
		flexDirection: 'row',
		gap: 12,
		padding: 12,
		borderRadius: 16,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E8ECE9',
		shadowColor: '#00251A',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.04,
		shadowRadius: 6,
		elevation: 1,
	},
	itemImage: {
		width: 78,
		height: 86,
		borderRadius: 12,
		backgroundColor: '#EAEDEB',
	},
	itemContent: {
		flex: 1,
		justifyContent: 'space-between',
		minWidth: 0,
	},
	itemHeaderRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
	},
	itemName: {
		flex: 1,
		color: COLORS.textPrimary,
		fontSize: 13.5,
		fontWeight: '800',
		lineHeight: 18,
		marginRight: 6,
	},
	deleteIconBtn: {
		padding: 4,
	},
	artisanTagRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		marginTop: 3,
	},
	storeName: {
		color: COLORS.textSecondary,
		fontSize: 11.5,
		fontWeight: '600',
	},
	specsBadge: {
		backgroundColor: '#F0F4F2',
		alignSelf: 'flex-start',
		paddingHorizontal: 7,
		paddingVertical: 2,
		borderRadius: 6,
		marginTop: 4,
	},
	itemSpecsText: {
		color: COLORS.textSecondary,
		fontSize: 10,
		fontWeight: '600',
	},
	itemPriceBottomRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 8,
		paddingTop: 6,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: '#F0F3F2',
	},
	itemPrice: {
		color: COLORS.primary,
		fontSize: 14.5,
		fontWeight: '900',
	},
	quantityStepper: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#DCE4E1',
		borderRadius: 8,
		backgroundColor: '#F8FAF9',
	},
	stepperBtn: {
		width: 28,
		height: 28,
		alignItems: 'center',
		justifyContent: 'center',
	},
	quantityNumber: {
		minWidth: 22,
		textAlign: 'center',
		color: COLORS.textPrimary,
		fontSize: 12,
		fontWeight: '800',
	},
	savedNotice: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 4,
	},
	savedNoticeText: {
		color: COLORS.primary,
		fontSize: 11,
		fontWeight: '700',
	},
	promoSection: {
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		padding: 12,
		borderWidth: 1,
		borderColor: '#E8ECE9',
		gap: 8,
	},
	promoBox: {
		height: 44,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		backgroundColor: '#F5F7F6',
		borderWidth: 1,
		borderColor: '#E0E7E4',
		borderRadius: 12,
		gap: 8,
	},
	promoInput: {
		flex: 1,
		paddingVertical: 0,
		color: COLORS.textPrimary,
		fontSize: 12.5,
		fontWeight: '600',
	},
	applyBtn: {
		backgroundColor: COLORS.primary,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 8,
	},
	applyBtnApplied: {
		backgroundColor: '#E0F2F1',
	},
	applyText: {
		color: '#FFFFFF',
		fontSize: 11.5,
		fontWeight: '800',
	},
	applyTextApplied: {
		color: COLORS.primary,
	},
	promoQuickChip: {
		backgroundColor: '#F0F7F5',
		padding: 8,
		borderRadius: 8,
	},
	promoQuickText: {
		fontSize: 11,
		color: COLORS.primary,
	},
	promoMessage: {
		fontSize: 11,
		fontWeight: '600',
		paddingLeft: 4,
	},
	promoSuccess: {
		color: '#2E7D32',
	},
	promoError: {
		color: '#D32F2F',
	},
	escrowCard: {
		backgroundColor: '#004D40',
		borderRadius: 16,
		padding: 16,
		shadowColor: '#00251A',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.12,
		shadowRadius: 8,
		elevation: 3,
	},
	escrowHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		marginBottom: 8,
	},
	escrowShieldIcon: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	escrowTitle: {
		color: '#FFFFFF',
		fontSize: 14,
		fontWeight: '800',
	},
	escrowSubtitle: {
		color: '#80CBC4',
		fontSize: 10.5,
		fontWeight: '600',
	},
	escrowBody: {
		color: '#B2DFDB',
		fontSize: 11.5,
		lineHeight: 16,
		marginBottom: 10,
	},
	escrowBadgesRow: {
		flexDirection: 'row',
		gap: 8,
		flexWrap: 'wrap',
	},
	escrowBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		backgroundColor: 'rgba(255, 255, 255, 0.12)',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 8,
	},
	escrowBadgeText: {
		color: '#FFFFFF',
		fontSize: 10,
		fontWeight: '700',
	},
	summaryCard: {
		padding: 14,
		borderRadius: 16,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E8ECE9',
	},
	summaryTitle: {
		color: COLORS.textPrimary,
		fontSize: 14,
		fontWeight: '800',
		marginBottom: 10,
	},
	summaryRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginVertical: 4,
	},
	summaryLabel: {
		color: COLORS.textSecondary,
		fontSize: 12.5,
	},
	summaryValue: {
		color: COLORS.textPrimary,
		fontSize: 12.5,
		fontWeight: '700',
	},
	freeDeliveryPill: {
		backgroundColor: '#E8F5E9',
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 6,
	},
	freeDeliveryPillText: {
		color: COLORS.success,
		fontSize: 11,
		fontWeight: '800',
	},
	discountLabel: {
		color: COLORS.success,
		fontSize: 12.5,
		fontWeight: '700',
	},
	discountValue: {
		color: COLORS.success,
		fontSize: 12.5,
		fontWeight: '800',
	},
	summaryDivider: {
		height: 1,
		backgroundColor: '#ECEFEC',
		marginVertical: 10,
	},
	totalRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	totalLabel: {
		color: COLORS.textPrimary,
		fontSize: 14.5,
		fontWeight: '800',
	},
	totalSublabel: {
		color: COLORS.textMuted,
		fontSize: 10,
		marginTop: 2,
	},
	totalValue: {
		color: COLORS.primary,
		fontSize: 17,
		fontWeight: '900',
	},
	checkoutBar: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		paddingHorizontal: 14,
		paddingTop: 10,
		paddingBottom: 12,
		backgroundColor: '#FFFFFF',
		borderTopWidth: 1,
		borderTopColor: '#EBEFEF',
		shadowColor: '#00251A',
		shadowOffset: { width: 0, height: -3 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 10,
	},
	secureTotalRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	secureTag: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	secureLabel: {
		color: COLORS.textSecondary,
		fontSize: 11.5,
		fontWeight: '600',
	},
	securePrice: {
		color: COLORS.primary,
		fontSize: 15,
		fontWeight: '900',
	},
	checkoutButton: {
		height: 48,
		borderRadius: 14,
		backgroundColor: COLORS.primary,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 2,
	},
	checkoutText: {
		color: '#FFFFFF',
		fontSize: 13.5,
		fontWeight: '800',
	},
	emptyState: {
		alignItems: 'center',
		paddingVertical: 36,
		paddingHorizontal: 20,
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#E8ECE9',
	},
	emptyEmoji: {
		fontSize: 48,
		marginBottom: 12,
	},
	emptyTitle: {
		color: COLORS.textPrimary,
		fontSize: 16,
		fontWeight: '800',
		marginBottom: 6,
	},
	emptyCopy: {
		color: COLORS.textMuted,
		fontSize: 12,
		textAlign: 'center',
		lineHeight: 18,
		marginBottom: 18,
	},
	shopButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 12,
		backgroundColor: COLORS.primary,
	},
	shopButtonText: {
		color: '#FFFFFF',
		fontSize: 12.5,
		fontWeight: '800',
	},
});

export default CartScreen;
