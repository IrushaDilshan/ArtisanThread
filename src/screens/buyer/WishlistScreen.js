import React, { useState } from 'react';
import {
	Alert,
	FlatList,
	Image,
	Pressable,
	StyleSheet,
	Text,
	View,
	useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../navigation/routes';

const INITIAL_WISHLIST = [
	{
		id: 'indigo-dress',
		name: 'Indigo Batik Dress',
		price: '6,500',
		artisan: 'Nimali Batik Studio',
		rating: '4.9 (22)',
		image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e3?auto=format&fit=crop&w=700&q=85',
	},
	{
		id: 'dumbara-bag',
		name: 'Dumbara Handloom Bag',
		price: '4,800',
		artisan: 'Kandyan Loom House',
		rating: '4.8 (16)',
		image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=700&q=85',
	},
	{
		id: 'lacquer-elephant',
		name: 'Lacquer Elephant',
		price: '3,200',
		artisan: 'Laksha Artisans',
		rating: '4.9 (44)',
		image: 'https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?auto=format&fit=crop&w=700&q=85',
	},
	{
		id: 'palm-leaf-box',
		name: 'Palm Leaf Storage Box',
		price: '2,950',
		artisan: 'Matara Craft Circle',
		rating: '4.7 (31)',
		image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=700&q=85',
	},
];

export const WishlistScreen = ({ navigation }) => {
	const [items, setItems] = useState(INITIAL_WISHLIST);
	const { width } = useWindowDimensions();
	const cardWidth = (width - 38) / 2;

	const removeItem = (id) => setItems((current) => current.filter((item) => item.id !== id));

	const addToCart = (item) => {
		Alert.alert('Added to cart', `${item.name} is ready for checkout.`, [
			{ text: 'Keep browsing', style: 'cancel' },
			{ text: 'View cart', onPress: () => navigation?.navigate?.(ROUTES.BUYER.CART, { product: item }) },
		]);
	};

	const renderItem = ({ item }) => (
		<View style={[styles.card, { width: cardWidth }]}>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel={`View ${item.name}`}
				onPress={() => navigation?.navigate?.(ROUTES.BUYER.PRODUCT_DETAIL, { product: item })}
			>
				<Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
				<View style={styles.details}>
					<Text numberOfLines={1} style={styles.productName}>{item.name}</Text>
					<Text style={styles.price}>LKR {item.price}</Text>
					<Text numberOfLines={1} style={styles.artisan}>{item.artisan}</Text>
					<View style={styles.verifiedRow}>
						<Ionicons name="shield-checkmark-outline" size={13} color={COLORS.success} />
						<Text style={styles.verifiedText}>Verified Artisan</Text>
					</View>
					<View style={styles.ratingRow}>
						<Ionicons name="star" size={11} color="#D6A92C" />
						<Text style={styles.rating}>{item.rating}</Text>
					</View>
				</View>
			</Pressable>
			<View style={styles.cardActions}>
				<Pressable accessibilityRole="button" onPress={() => addToCart(item)} style={styles.addButton}>
					<Text style={styles.addButtonText}>Add to Cart</Text>
				</Pressable>
				<Pressable accessibilityRole="button" accessibilityLabel={`Remove ${item.name} from wishlist`} onPress={() => removeItem(item.id)} style={styles.removeButton}>
					<Ionicons name="trash-outline" size={17} color="#BD4C4C" />
				</Pressable>
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
					<Text style={styles.title}>Wishlist ({items.length})</Text>
					<View style={styles.headerButton}>
						<Ionicons name="ellipsis-horizontal" size={19} color={COLORS.textPrimary} />
					</View>
				</View>
				<FlatList
					data={items}
					renderItem={renderItem}
					keyExtractor={(item) => item.id}
					numColumns={2}
					columnWrapperStyle={styles.row}
					contentContainerStyle={styles.grid}
					showsVerticalScrollIndicator={false}
					ListEmptyComponent={(
						<View style={styles.emptyState}>
							<Ionicons name="heart-outline" size={38} color={COLORS.primaryLight} />
							<Text style={styles.emptyTitle}>Your wishlist is waiting</Text>
							<Text style={styles.emptyCopy}>Save handcrafted finds here for later.</Text>
						</View>
					)}
				/>
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
	grid: { paddingHorizontal: 12, paddingTop: 5, paddingBottom: 14 },
	row: { justifyContent: 'space-between', marginBottom: 10 },
	card: { overflow: 'hidden', padding: 7, borderRadius: 13, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F0F1EF' },
	productImage: { width: '100%', height: 108, borderRadius: 9, backgroundColor: '#E9ECE9' },
	details: { paddingTop: 6, paddingBottom: 4 },
	productName: { color: '#1E2421', fontSize: 10, fontWeight: '800' },
	price: { color: COLORS.primary, fontSize: 10, fontWeight: '800', marginTop: 2 },
	artisan: { color: COLORS.textMuted, fontSize: 8, marginTop: 2 },
	verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
	verifiedText: { color: COLORS.success, fontSize: 8, fontWeight: '600' },
	ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
	rating: { color: COLORS.textPrimary, fontSize: 8, fontWeight: '600' },
	cardActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
	addButton: { flex: 1, height: 29, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary },
	addButtonText: { color: '#FFF', fontSize: 9, fontWeight: '700' },
	removeButton: { width: 29, height: 29, borderRadius: 15, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F0E8E7', alignItems: 'center', justifyContent: 'center' },
	emptyState: { alignItems: 'center', paddingVertical: 55 },
	emptyTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700', marginTop: 10 },
	emptyCopy: { color: COLORS.textMuted, fontSize: 10, marginTop: 4 },
});

export default WishlistScreen;
