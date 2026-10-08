import React, { useState } from 'react';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../navigation/routes';

const INITIAL_CART = [
	{
		id: 'dumbara-bag',
		name: 'Dumbara Handloom Bag',
		store: 'Kandyan Loom House',
		specs: 'Natural brown · Medium',
		price: 5000,
		quantity: 1,
		image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=500&q=85',
	},
	{
		id: 'palm-leaf-box',
		name: 'Palm Leaf Storage Box',
		store: 'Matara Craft Circle',
		specs: 'Natural palm · Small',
		price: 2950,
		quantity: 1,
		image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=500&q=85',
	},
];

const formatLkr = (amount) => `LKR ${Number(amount).toLocaleString('en-LK')}`;

const formatPrice = (price) => Number(String(price || 0).replace(/[^\d.]/g, '')) || 0;

export const CartScreen = ({ navigation, route }) => {
	const insets = useSafeAreaInsets();
	const [cartItems, setCartItems] = useState(() => {
		const incomingProduct = route?.params?.product;
		if (!incomingProduct) return INITIAL_CART;
		return [{
			id: incomingProduct.id || 'selected-product',
			name: incomingProduct.title || incomingProduct.name || 'Handmade craft',
			store: incomingProduct.artisan || 'Sri Lankan Artisan',
			specs: incomingProduct.specs || 'Handcrafted · One size',
			price: formatPrice(incomingProduct.price),
			quantity: 1,
			image: incomingProduct.image || INITIAL_CART[0].image,
		}];
	});
	const [savedItems, setSavedItems] = useState([]);
	const [promoCode, setPromoCode] = useState('');
	const [promoApplied, setPromoApplied] = useState(false);
	const [promoMessage, setPromoMessage] = useState('');

	const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
	const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
	const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
	const total = subtotal - discount;

	const updateQuantity = (id, change) => {
		setCartItems((current) => current.map((item) => (
			item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
		)));
	};

	const removeItem = (id) => setCartItems((current) => current.filter((item) => item.id !== id));

	const saveForLater = (item) => {
		setSavedItems((current) => [...current, item]);
		removeItem(item.id);
	};

	const applyPromo = () => {
		if (promoCode.trim().toUpperCase() === 'THREAD10') {
			setPromoApplied(true);
			setPromoMessage('10% artisan discount applied');
		} else {
			setPromoApplied(false);
			setPromoMessage(promoCode.trim() ? 'This promo code is not valid' : 'Enter a promo code first');
		}
	};

	const proceedToCheckout = () => {
		if (cartItems.length === 0) {
			Alert.alert(
				'Your cart is empty',
				'Add a handmade piece before continuing to checkout.'
			);
			return;
		}

		navigation?.navigate?.(ROUTES.BUYER.CHECKOUT, {
			items: cartItems,
			totalAmount: total,
		});
	};

	const renderCartItem = (item) => (
		<View key={item.id} style={styles.itemCard}>
			<Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
			<View style={styles.itemContent}>
				<Text numberOfLines={1} style={styles.itemName}>{item.name}</Text>
				<Text numberOfLines={1} style={styles.storeName}>{item.store}</Text>
				<Text numberOfLines={1} style={styles.itemSpecs}>{item.specs}</Text>
				<Text style={styles.itemPrice}>{formatLkr(item.price)}</Text>
				<View style={styles.itemBottomRow}>
					<View style={styles.quantityControl}>
						<Pressable accessibilityRole="button" accessibilityLabel={`Decrease quantity of ${item.name}`} onPress={() => updateQuantity(item.id, -1)} style={styles.quantityButton}>
							<Ionicons name="remove" size={14} color={COLORS.textPrimary} />
						</Pressable>
						<Text style={styles.quantityText}>{item.quantity}</Text>
						<Pressable accessibilityRole="button" accessibilityLabel={`Increase quantity of ${item.name}`} onPress={() => updateQuantity(item.id, 1)} style={styles.quantityButton}>
							<Ionicons name="add" size={14} color={COLORS.textPrimary} />
						</Pressable>
					</View>
					<View style={styles.itemActions}>
						<Pressable accessibilityRole="button" onPress={() => saveForLater(item)}>
							<Text style={styles.saveAction}>Save</Text>
						</Pressable>
						<Pressable accessibilityRole="button" onPress={() => removeItem(item.id)}>
							<Text style={styles.removeAction}>Remove</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</View>
	);

	return (
		<SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
			<View style={styles.screen}>
				<View style={styles.header}>
					<Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => navigation?.goBack?.()} style={styles.headerButton}>
						<Ionicons name="arrow-back" size={21} color={COLORS.textPrimary} />
					</Pressable>
					<Text style={styles.title}>My Cart ({itemCount})</Text>
					<View style={styles.headerButton}>
						<Ionicons name="ellipsis-horizontal" size={19} color={COLORS.textPrimary} />
					</View>
				</View>

				<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: 132 + insets.bottom }]}>
					<View style={styles.deliveryBanner}>
						<Ionicons name="car-outline" size={18} color="#32825B" />
						<View style={styles.deliveryCopy}>
							<Text style={styles.deliveryTitle}>Free delivery on this order</Text>
							<Text style={styles.deliverySubtitle}>Estimated delivery: 21–23 September</Text>
						</View>
					</View>

					{cartItems.length ? cartItems.map(renderCartItem) : (
						<View style={styles.emptyState}>
							<Ionicons name="basket-outline" size={36} color={COLORS.primaryLight} />
							<Text style={styles.emptyTitle}>Your cart is empty</Text>
							<Text style={styles.emptyCopy}>Discover something special, made by hand.</Text>
							<Pressable onPress={() => navigation?.navigate?.(ROUTES.BUYER.HOME)} style={styles.shopButton}>
								<Text style={styles.shopButtonText}>Explore the marketplace</Text>
							</Pressable>
						</View>
					)}

					{savedItems.length > 0 && (
						<View style={styles.savedNotice}>
							<Ionicons name="heart" size={15} color={COLORS.primary} />
							<Text style={styles.savedNoticeText}>{savedItems.length} item{savedItems.length === 1 ? '' : 's'} saved for later</Text>
						</View>
					)}

					<View style={styles.promoBox}>
						<TextInput
							accessibilityLabel="Promo code"
							placeholder="Add promo code"
							placeholderTextColor={COLORS.textMuted}
							value={promoCode}
							onChangeText={(value) => { setPromoCode(value); setPromoMessage(''); }}
							style={styles.promoInput}
							autoCapitalize="characters"
						/>
						<Pressable accessibilityRole="button" onPress={applyPromo}>
							<Text style={styles.applyText}>Apply</Text>
						</Pressable>
					</View>
					{promoMessage ? <Text style={[styles.promoMessage, promoApplied ? styles.promoSuccess : styles.promoError]}>{promoMessage}</Text> : null}

					<View style={styles.summaryCard}>
						<Text style={styles.summaryTitle}>Price summary</Text>
						<View style={styles.summaryRow}>
							<Text style={styles.summaryLabel}>Items ({itemCount})</Text>
							<Text style={styles.summaryValue}>{formatLkr(subtotal)}</Text>
						</View>
						<View style={styles.summaryRow}>
							<Text style={styles.summaryLabel}>Delivery</Text>
							<Text style={styles.freeValue}>Free</Text>
						</View>
						{discount > 0 && (
							<View style={styles.summaryRow}>
								<Text style={styles.discountLabel}>Promo discount</Text>
								<Text style={styles.discountLabel}>− {formatLkr(discount)}</Text>
							</View>
						)}
						<View style={styles.summaryDivider} />
						<View style={styles.totalRow}>
							<Text style={styles.totalLabel}>Total</Text>
							<Text style={styles.totalValue}>{formatLkr(total)}</Text>
						</View>
					</View>
				</ScrollView>

				<View style={[styles.checkoutBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
					<View style={styles.secureTotal}>
						<Text style={styles.secureLabel}>Secure escrow total</Text>
						<Text style={styles.securePrice}>{formatLkr(total)}</Text>
					</View>
					<Pressable accessibilityRole="button" onPress={proceedToCheckout} style={styles.checkoutButton}>
						<Text style={styles.checkoutText}>Proceed to Secure Checkout</Text>
					</Pressable>
				</View>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: '#F8F8F7' },
	screen: { flex: 1, backgroundColor: '#F8F8F7' },
	header: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14 },
	headerButton: { width: 34, height: 34, borderRadius: 18, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#ECEEEC', alignItems: 'center', justifyContent: 'center' },
	title: { color: '#171B19', fontSize: 16, fontWeight: '800' },
	scrollContent: { paddingHorizontal: 12, paddingTop: 3, gap: 10 },
	deliveryBanner: { minHeight: 43, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#E7F5EA' },
	deliveryCopy: { flex: 1 },
	deliveryTitle: { color: '#37815A', fontSize: 10, fontWeight: '700' },
	deliverySubtitle: { color: '#6D9B7E', fontSize: 8, marginTop: 1 },
	itemCard: { minHeight: 126, flexDirection: 'row', gap: 9, padding: 9, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E8EAE8' },
	itemImage: { width: 75, height: 88, alignSelf: 'center', borderRadius: 9, backgroundColor: '#EAEDEB' },
	itemContent: { flex: 1, justifyContent: 'center', minWidth: 0 },
	itemName: { color: '#1B201E', fontSize: 11, fontWeight: '800' },
	storeName: { color: COLORS.textMuted, fontSize: 8, marginTop: 3 },
	itemSpecs: { color: '#818985', fontSize: 8, marginTop: 3 },
	itemPrice: { color: COLORS.primary, fontSize: 11, fontWeight: '800', marginTop: 4 },
	itemBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 },
	quantityControl: { height: 25, minWidth: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E9ECEA', borderRadius: 7 },
	quantityButton: { width: 23, height: 23, alignItems: 'center', justifyContent: 'center' },
	quantityText: { minWidth: 17, textAlign: 'center', color: COLORS.textPrimary, fontSize: 9, fontWeight: '700' },
	itemActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
	saveAction: { color: '#35766D', fontSize: 8, fontWeight: '700' },
	removeAction: { color: '#BD5D57', fontSize: 8, fontWeight: '700' },
	savedNotice: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
	savedNoticeText: { color: COLORS.primary, fontSize: 9, fontWeight: '600' },
	promoBox: { minHeight: 38, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E8EAE8', borderRadius: 9 },
	promoInput: { flex: 1, paddingVertical: 0, color: COLORS.textPrimary, fontSize: 9 },
	applyText: { color: COLORS.primary, fontSize: 9, fontWeight: '700' },
	promoMessage: { fontSize: 8, paddingLeft: 4, marginTop: -6 },
	promoSuccess: { color: '#32825B' },
	promoError: { color: '#BD5D57' },
	summaryCard: { padding: 10, borderRadius: 11, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E8EAE8' },
	summaryTitle: { color: '#222725', fontSize: 10, fontWeight: '800', marginBottom: 6 },
	summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 2 },
	summaryLabel: { color: '#7B8380', fontSize: 8 },
	summaryValue: { color: '#343A37', fontSize: 8, fontWeight: '700' },
	freeValue: { color: '#5D866E', fontSize: 8, fontWeight: '700' },
	discountLabel: { color: '#35815B', fontSize: 8, fontWeight: '600' },
	summaryDivider: { height: 1, backgroundColor: '#ECEFEC', marginVertical: 6 },
	totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	totalLabel: { color: '#222725', fontSize: 10, fontWeight: '800' },
	totalValue: { color: COLORS.primary, fontSize: 12, fontWeight: '800' },
	checkoutBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 12, paddingTop: 8, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EBEDEA' },
	secureTotal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 },
	secureLabel: { color: COLORS.textMuted, fontSize: 8 },
	securePrice: { color: '#242A27', fontSize: 10, fontWeight: '800' },
	checkoutButton: { height: 39, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary },
	checkoutText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
	emptyState: { alignItems: 'center', paddingVertical: 24, backgroundColor: '#FFF', borderRadius: 12 },
	emptyTitle: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700', marginTop: 7 },
	emptyCopy: { color: COLORS.textMuted, fontSize: 9, marginTop: 3 },
	shopButton: { marginTop: 10, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 8, backgroundColor: COLORS.primary },
	shopButtonText: { color: '#FFF', fontSize: 9, fontWeight: '700' },
});

export default CartScreen;
