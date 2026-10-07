import React, { useMemo, useState } from 'react';
import {
	FlatList,
	Image,
	Pressable,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
	useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../navigation/routes';

const CATEGORIES = ['All', 'Batik Apparel', 'Handloom', 'Handicrafts'];

const PRODUCTS = [
	{
		id: 'indigo-dress',
		name: 'Indigo Batik Dress',
		price: '6,500',
		artisan: 'Nimali Batik Studio',
		category: 'Batik Apparel',
		rating: '4.9 (22)',
		image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e3?auto=format&fit=crop&w=900&q=85',
	},
	{
		id: 'dumbara-bag',
		name: 'Dumbara Handloom Bag',
		price: '4,800',
		artisan: 'Kandyan Loom House',
		category: 'Handloom',
		rating: '4.8 (16)',
		image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85',
	},
	{
		id: 'palm-storage-box',
		name: 'Palm Leaf Storage Box',
		price: '2,950',
		artisan: 'Matara Craft Circle',
		category: 'Handicrafts',
		rating: '4.9 (31)',
		image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=85',
	},
	{
		id: 'lacquer-elephant',
		name: 'Lacquer Elephant',
		price: '3,200',
		artisan: 'Laksha Artisans',
		category: 'Handicrafts',
		rating: '4.8 (12)',
		image: 'https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?auto=format&fit=crop&w=900&q=85',
	},
];

export const MarketplaceScreen = ({ navigation }) => {
	const [selectedCategory, setSelectedCategory] = useState('All');
	const [search, setSearch] = useState('');
	const [favorites, setFavorites] = useState([]);
	const { width } = useWindowDimensions();
	const cardWidth = (width - 44) / 2;

	const products = useMemo(() => {
		const query = search.trim().toLowerCase();
		return PRODUCTS.filter((product) => {
			const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
			const matchesSearch = !query || `${product.name} ${product.artisan} ${product.category}`.toLowerCase().includes(query);
			return matchesCategory && matchesSearch;
		});
	}, [search, selectedCategory]);

	const toggleFavorite = (id) => {
		setFavorites((current) => (
			current.includes(id) ? current.filter((favorite) => favorite !== id) : [...current, id]
		));
	};

	const renderProduct = ({ item }) => {
		const isFavorite = favorites.includes(item.id);
		return (
			<View style={[styles.productCard, { width: cardWidth }]}>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={`View ${item.name}`}
					onPress={() => navigation?.navigate(ROUTES.BUYER.PRODUCT_DETAIL, { product: item })}
				>
					<View style={styles.imageWrap}>
						<Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
					</View>
					<View style={styles.productDetails}>
						<Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
						<Text style={styles.productPrice}>LKR {item.price}</Text>
						<Text style={styles.artisanName} numberOfLines={1}>{item.artisan}</Text>
						<View style={styles.verifiedRow}>
							<Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
							<Text style={styles.verifiedText}>Verified Artisan</Text>
						</View>
						<View style={styles.ratingRow}>
							<Ionicons name="star" size={13} color="#D4A72C" />
							<Text style={styles.ratingText}>{item.rating}</Text>
						</View>
					</View>
				</Pressable>
				<Pressable
					accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
					accessibilityRole="button"
					onPress={() => toggleFavorite(item.id)}
					style={styles.favoriteButton}
				>
					<Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={17} color={isFavorite ? '#C84C4C' : COLORS.textPrimary} />
				</Pressable>
			</View>
		);
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<Text style={styles.pageTitle}>ArtisanThread marketplace</Text>
				<View style={styles.actionRow}>
					<View style={styles.searchBar}>
						<Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
						<TextInput
							accessibilityLabel="Search products and artisans"
							placeholder="Find batik, handloom..."
							placeholderTextColor={COLORS.textMuted}
							value={search}
							onChangeText={setSearch}
							style={styles.searchInput}
							returnKeyType="search"
						/>
						<Pressable
							accessibilityLabel="Filter by category"
							accessibilityRole="button"
							onPress={() => setSelectedCategory((current) => {
								const index = CATEGORIES.indexOf(current);
								return CATEGORIES[(index + 1) % CATEGORIES.length];
							})}
							hitSlop={8}
						>
							<Ionicons name="options-outline" size={19} color={COLORS.primary} />
						</Pressable>
					</View>
					<Pressable
						accessibilityLabel="Wishlist"
						accessibilityRole="button"
						style={styles.roundButton}
					onPress={() => navigation?.navigate(ROUTES.BUYER.WISHLIST)}
					>
						<Ionicons name="heart-outline" size={21} color={COLORS.textPrimary} />
					</Pressable>
					<Pressable
						accessibilityLabel="Shopping cart"
						style={styles.roundButton}
						onPress={() => navigation?.navigate('BuyerCart')}
					>
						<Ionicons name="cart-outline" size={21} color={COLORS.textPrimary} />
						<View style={styles.cartBadge}><Text style={styles.cartBadgeText}>2</Text></View>
					</Pressable>
				</View>
			</View>

			<FlatList
				data={products}
				renderItem={renderProduct}
				keyExtractor={(item) => item.id}
				numColumns={2}
				columnWrapperStyle={styles.productRow}
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}
				ListHeaderComponent={(
					<View>
						<View style={styles.heroBanner}>
							<Text style={styles.heroTitle}>Authentic Sri Lankan{ '\n' }Crafts</Text>
						</View>
						<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
							{CATEGORIES.map((category) => {
								const active = selectedCategory === category;
								return (
									<Pressable
										key={category}
										accessibilityRole="button"
										accessibilityState={{ selected: active }}
										onPress={() => setSelectedCategory(category)}
										style={[styles.categoryPill, active && styles.categoryPillActive]}
									>
										<Text style={[styles.categoryText, active && styles.categoryTextActive]}>{category}</Text>
									</Pressable>
								);
							})}
						</ScrollView>
					</View>
				)}
				ListEmptyComponent={<Text style={styles.emptyText}>No crafts found. Try another search.</Text>}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: '#F5F6F5' },
	header: { paddingHorizontal: 15, paddingTop: 8, paddingBottom: 9, backgroundColor: '#F5F6F5' },
	pageTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 10 },
	actionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	searchBar: { flex: 1, height: 42, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 11, gap: 7 },
	searchInput: { flex: 1, minWidth: 0, paddingVertical: 0, fontSize: 12, color: COLORS.textPrimary },
	roundButton: { width: 40, height: 40, borderRadius: 22, backgroundColor: '#FFF', borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
	cartBadge: { position: 'absolute', right: -2, top: -2, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
	cartBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '700' },
	listContent: { paddingHorizontal: 14, paddingBottom: 12 },
	heroBanner: { height: 96, borderRadius: 15, backgroundColor: '#9AA6A5', justifyContent: 'center', paddingHorizontal: 14, marginBottom: 8 },
	heroTitle: { color: '#FFF', fontSize: 17, fontWeight: '800', lineHeight: 21 },
	categoryList: { alignItems: 'center', paddingBottom: 8, gap: 7 },
	categoryPill: { height: 29, paddingHorizontal: 13, borderRadius: 18, backgroundColor: '#FFF', borderColor: COLORS.border, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
	categoryPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
	categoryText: { fontSize: 10, color: COLORS.textPrimary, fontWeight: '500' },
	categoryTextActive: { color: '#FFF', fontWeight: '700' },
	productRow: { justifyContent: 'space-between', marginBottom: 9 },
	productCard: { overflow: 'hidden', backgroundColor: '#FFF', borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E8EBE9' },
	imageWrap: { height: 108, backgroundColor: '#E8ECEA' },
	productImage: { width: '100%', height: '100%' },
	favoriteButton: { position: 'absolute', right: 7, top: 7, width: 28, height: 28, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center' },
	productDetails: { paddingHorizontal: 8, paddingTop: 7, paddingBottom: 8, minHeight: 106 },
	productName: { minHeight: 27, fontSize: 11, lineHeight: 14, fontWeight: '700', color: COLORS.textPrimary },
	productPrice: { fontSize: 11, color: COLORS.primary, fontWeight: '700', marginTop: 1 },
	artisanName: { fontSize: 9, color: COLORS.textMuted, marginTop: 3 },
	verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
	verifiedText: { fontSize: 9, color: COLORS.success, fontWeight: '600' },
	ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
	ratingText: { fontSize: 9, color: COLORS.textPrimary, fontWeight: '600' },
	emptyText: { textAlign: 'center', color: COLORS.textMuted, paddingVertical: 30, fontSize: 13 },
});

export const BuyerHomeScreen = MarketplaceScreen;
export default MarketplaceScreen;
