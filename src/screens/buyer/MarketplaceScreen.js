import React, { useMemo, useState } from 'react';
import {
	FlatList,
	Image,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../navigation/routes';

const CATEGORIES = [
	{ id: 'All', label: 'All Crafts', icon: 'sparkles' },
	{ id: 'Batik Apparel', label: 'Batik Apparel', icon: 'shirt-outline' },
	{ id: 'Handloom', label: 'Handloom & Weave', icon: 'color-palette-outline' },
	{ id: 'Handicrafts', label: 'Handicrafts', icon: 'cube-outline' },
	{ id: 'Woodcraft', label: 'Woodcraft & Carving', icon: 'hammer-outline' },
	{ id: 'Jewelry', label: 'Heritage Jewelry', icon: 'diamond-outline' },
];

const PRODUCTS = [
	{
		id: 'indigo-dress',
		name: 'Indigo Silk Batik Saree & Dress',
		price: '6,500',
		artisan: 'Nimali Batik Studio',
		location: 'Colombo',
		category: 'Batik Apparel',
		rating: '4.9 (22)',
		icon: '👗',
		badge: 'Best Seller',
		image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85',
	},
	{
		id: 'dumbara-bag',
		name: 'Dumbara Handloom Tote Bag',
		price: '4,800',
		artisan: 'Kandyan Loom House',
		location: 'Kandy',
		category: 'Handloom',
		rating: '4.8 (16)',
		icon: '🧵',
		badge: 'Heritage',
		image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85',
	},
	{
		id: 'palm-storage-box',
		name: 'Matara Palm Leaf Storage Box',
		price: '2,950',
		artisan: 'Matara Craft Circle',
		location: 'Matara',
		category: 'Handicrafts',
		rating: '4.9 (31)',
		icon: '📦',
		badge: 'Eco Friendly',
		image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=85',
	},
	{
		id: 'lacquer-elephant',
		name: 'Handcarved Lacquer Wooden Elephant',
		price: '3,200',
		artisan: 'Laksha Artisans',
		location: 'Galle',
		category: 'Woodcraft',
		rating: '4.8 (12)',
		icon: '🐘',
		badge: 'Masterpiece',
		image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=900&q=85',
	},
	{
		id: 'terracotta-pot',
		name: 'Traditional Terracotta Cooking Pot',
		price: '2,400',
		artisan: 'Kelaniya Clay Potters',
		location: 'Kelaniya',
		category: 'Handicrafts',
		rating: '4.9 (18)',
		icon: '🏺',
		badge: 'Natural Clay',
		image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=85',
	},
	{
		id: 'ceylon-jewelry',
		name: 'Handcrafted Ceylon Silver Pendant',
		price: '8,900',
		artisan: 'Ratnapura Silversmiths',
		location: 'Ratnapura',
		category: 'Jewelry',
		rating: '5.0 (27)',
		icon: '💍',
		badge: 'Pure Silver',
		image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85',
	},
];

export const MarketplaceScreen = ({ navigation }) => {
	const [selectedCategory, setSelectedCategory] = useState('All');
	const [search, setSearch] = useState('');
	const [favorites, setFavorites] = useState(['dumbara-bag']);
	const [cartCount, setCartCount] = useState(2);
	const [toastMessage, setToastMessage] = useState('');
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [failedImages, setFailedImages] = useState({});

	const { width: screenWidth } = useWindowDimensions();

	// Responsive Card Metrics
	const horizontalPadding = 14;
	const gap = 10;
	const numColumns = screenWidth > 600 ? 3 : 2;
	const cardWidth = Math.floor((screenWidth - (horizontalPadding * 2) - ((numColumns - 1) * gap)) / numColumns);
	const imageHeight = Math.round(cardWidth * 1.05);

	const products = useMemo(() => {
		const query = search.trim().toLowerCase();
		return PRODUCTS.filter((product) => {
			const matchesCategory =
				selectedCategory === 'All' || product.category === selectedCategory;
			const matchesSearch =
				!query ||
				`${product.name} ${product.artisan} ${product.category} ${product.location || ''}`
					.toLowerCase()
					.includes(query);
			return matchesCategory && matchesSearch;
		});
	}, [search, selectedCategory]);

	const toggleFavorite = (id) => {
		setFavorites((current) => {
			const isFav = current.includes(id);
			const updated = isFav ? current.filter((f) => f !== id) : [...current, id];
			showToast(isFav ? 'Removed from Wishlist' : 'Saved to Wishlist ❤️');
			return updated;
		});
	};

	const showToast = (msg) => {
		setToastMessage(msg);
		setTimeout(() => {
			setToastMessage('');
		}, 2200);
	};

	const handleAddToCart = (item) => {
		setCartCount((c) => c + 1);
		showToast(`Added ${item.name.substring(0, 18)}... to cart! 🛍️`);
	};

	const handleImageError = (id) => {
		setFailedImages((prev) => ({ ...prev, [id]: true }));
	};

	const renderProduct = ({ item }) => {
		const isFavorite = favorites.includes(item.id);
		const hasImageError = failedImages[item.id];

		return (
			<View style={[styles.productCard, { width: cardWidth }]}>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={`View ${item.name}`}
					onPress={() => navigation?.navigate(ROUTES.BUYER.PRODUCT_DETAIL, { product: item })}
					style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
				>
					{/* Card Image Wrap */}
					<View style={[styles.imageWrap, { height: imageHeight }]}>
						{!hasImageError ? (
							<Image
								source={{ uri: item.image }}
								style={styles.productImage}
								resizeMode="cover"
								onError={() => handleImageError(item.id)}
							/>
						) : (
							<View style={styles.imageFallback}>
								<Text style={styles.imageFallbackEmoji}>{item.icon || '🏺'}</Text>
								<Text style={styles.imageFallbackText}>{item.category}</Text>
							</View>
						)}

						{/* Category Pill Tag */}
						{item.badge && (
							<View style={styles.badgeTag}>
								<Text style={styles.badgeTagText}>{item.badge}</Text>
							</View>
						)}

						{/* Wishlist Heart Button */}
						<TouchableOpacity
							activeOpacity={0.7}
							accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
							onPress={(e) => {
								e.stopPropagation?.();
								toggleFavorite(item.id);
							}}
							style={styles.favoriteButton}
						>
							<Ionicons
								name={isFavorite ? 'heart' : 'heart-outline'}
								size={17}
								color={isFavorite ? '#E53935' : COLORS.textPrimary}
							/>
						</TouchableOpacity>
					</View>

					{/* Product Details Section */}
					<View style={styles.productDetails}>
						<Text style={styles.productName} numberOfLines={2}>
							{item.name}
						</Text>

						<View style={styles.artisanLocationRow}>
							<Ionicons name="storefront-outline" size={11} color={COLORS.textMuted} />
							<Text style={styles.artisanName} numberOfLines={1}>
								{item.artisan}
							</Text>
						</View>

						<View style={styles.trustRow}>
							<View style={styles.verifiedRow}>
								<Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
								<Text style={styles.verifiedText}>Verified</Text>
							</View>
							<View style={styles.ratingRow}>
								<Ionicons name="star" size={11} color="#E6A100" />
								<Text style={styles.ratingText}>{item.rating}</Text>
							</View>
						</View>

						{/* Price and Add to Cart Row */}
						<View style={styles.priceActionRow}>
							<View>
								<Text style={styles.currencyLabel}>LKR</Text>
								<Text style={styles.productPrice}>{item.price}</Text>
							</View>

							<TouchableOpacity
								activeOpacity={0.8}
								accessibilityLabel={`Add ${item.name} to cart`}
								onPress={(e) => {
									e.stopPropagation?.();
									handleAddToCart(item);
								}}
								style={styles.addCartBtn}
							>
								<Ionicons name="add" size={18} color="#FFFFFF" />
							</TouchableOpacity>
						</View>
					</View>
				</Pressable>
			</View>
		);
	};

	return (
		<SafeAreaView style={styles.safeArea} edges={['top']}>
			<StatusBar style="dark" backgroundColor="#FFFFFF" />

			{/* Toast Notification */}
			{!!toastMessage && (
				<View style={styles.toastContainer} pointerEvents="none">
					<View style={styles.toastCard}>
						<Ionicons name="sparkles" size={14} color="#D4AF37" />
						<Text style={styles.toastText}>{toastMessage}</Text>
					</View>
				</View>
			)}

			{/* Top Header Navigation Bar */}
			<View style={styles.header}>
				<View style={styles.headerTop}>
					<View style={styles.headerBrandGroup}>
						<View style={styles.brandTitleRow}>
							<Text style={styles.brandTitle}>ArtisanThread</Text>
							<View style={styles.countryBadge}>
								<Text style={styles.countryBadgeText}>🇱🇰 LK</Text>
							</View>
						</View>
						<Text style={styles.brandSubtitle}>Authentic Sri Lankan Heritage</Text>
					</View>

					<View style={styles.headerRightActions}>
						{/* Wishlist Button */}
						<Pressable
							accessibilityLabel="Wishlist"
							accessibilityRole="button"
							style={styles.iconCircleBtn}
							onPress={() => navigation?.navigate(ROUTES.BUYER.WISHLIST)}
						>
							<Ionicons name="heart-outline" size={20} color={COLORS.textPrimary} />
							{favorites.length > 0 && (
								<View style={styles.badgeMiniDot} />
							)}
						</Pressable>

						{/* Shopping Cart Button */}
						<Pressable
							accessibilityLabel="Shopping cart"
							accessibilityRole="button"
							style={styles.iconCircleBtn}
							onPress={() => navigation?.navigate(ROUTES.BUYER.CART)}
						>
							<Ionicons name="bag-handle-outline" size={20} color={COLORS.textPrimary} />
							{cartCount > 0 && (
								<View style={styles.cartBadge}>
									<Text style={styles.cartBadgeText}>{cartCount}</Text>
								</View>
							)}
						</Pressable>
					</View>
				</View>

				{/* Search & Filter Row */}
				<View style={styles.searchRow}>
					<View style={styles.searchBar}>
						<Ionicons name="search" size={17} color={COLORS.textMuted} />
						<TextInput
							accessibilityLabel="Search products and artisans"
							placeholder="Search batik, handloom, crafts..."
							placeholderTextColor={COLORS.textMuted}
							value={search}
							onChangeText={setSearch}
							style={styles.searchInput}
							returnKeyType="search"
						/>
						{search.length > 0 && (
							<Pressable onPress={() => setSearch('')} hitSlop={8}>
								<Ionicons name="close-circle" size={17} color={COLORS.textMuted} />
							</Pressable>
						)}
					</View>

					{/* Filter Trigger Button */}
					<Pressable
						accessibilityLabel="Filter by category"
						accessibilityRole="button"
						onPress={() => setShowFilterModal(true)}
						style={[
							styles.filterBtn,
							selectedCategory !== 'All' && styles.filterBtnActive,
						]}
					>
						<Ionicons
							name="options"
							size={18}
							color={selectedCategory !== 'All' ? '#FFFFFF' : COLORS.primary}
						/>
					</Pressable>
				</View>
			</View>

			{/* Main Scrollable Content */}
			<FlatList
				data={products}
				renderItem={renderProduct}
				keyExtractor={(item) => item.id}
				numColumns={numColumns}
				columnWrapperStyle={styles.productRow}
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}
				ListHeaderComponent={(
					<View>
						{/* Hero Artisan Banner */}
						<View style={styles.heroBanner}>
							<View style={styles.heroBadge}>
								<Ionicons name="shield-checkmark" size={11} color="#80CBC4" />
								<Text style={styles.heroBadgeText}>100% ESCROW PROTECTED</Text>
							</View>
							<Text style={styles.heroTitle}>Authentic Sri Lankan Crafts</Text>
							<Text style={styles.heroSubtitle}>
								Direct from master weavers, batik artists & certified heritage ateliers.
							</Text>

							<View style={styles.heroTagsRow}>
								<View style={styles.heroTagPill}>
									<Text style={styles.heroTagPillText}>🌿 Fair Trade</Text>
								</View>
								<View style={styles.heroTagPill}>
									<Text style={styles.heroTagPillText}>✨ Handcrafted</Text>
								</View>
								<View style={styles.heroTagPill}>
									<Text style={styles.heroTagPillText}>🚚 Express Delivery</Text>
								</View>
							</View>
						</View>

						{/* Horizontal Categories Scroll */}
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.categoryScroll}
						>
							{CATEGORIES.map((cat) => {
								const active = selectedCategory === cat.id;
								return (
									<Pressable
										key={cat.id}
										accessibilityRole="button"
										accessibilityState={{ selected: active }}
										onPress={() => setSelectedCategory(cat.id)}
										style={[styles.categoryPill, active && styles.categoryPillActive]}
									>
										<Ionicons
											name={cat.icon}
											size={14}
											color={active ? '#FFFFFF' : COLORS.textSecondary}
										/>
										<Text style={[styles.categoryText, active && styles.categoryTextActive]}>
											{cat.label}
										</Text>
									</Pressable>
								);
							})}
						</ScrollView>

						{/* Section Title & Count */}
						<View style={styles.sectionHeader}>
							<View>
								<Text style={styles.sectionTitle}>Curated Handcrafted Pieces</Text>
								<Text style={styles.sectionSubtitle}>
									{selectedCategory === 'All' ? 'Showing all categories' : selectedCategory}
								</Text>
							</View>
							<View style={styles.itemCountBadge}>
								<Text style={styles.itemCountText}>{products.length} items</Text>
							</View>
						</View>
					</View>
				)}
				ListEmptyComponent={(
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyEmoji}>🏺</Text>
						<Text style={styles.emptyTitle}>No Crafts Found</Text>
						<Text style={styles.emptySubtitle}>
							{search
								? `We couldn't find crafts matching "${search}".`
								: `No items listed in "${selectedCategory}" right now.`}
						</Text>
						{(search || selectedCategory !== 'All') && (
							<TouchableOpacity
								style={styles.emptyResetBtn}
								onPress={() => {
									setSearch('');
									setSelectedCategory('All');
								}}
							>
								<Text style={styles.emptyResetText}>Reset All Filters</Text>
							</TouchableOpacity>
						)}
					</View>
				)}
			/>

			{/* Category Filter Modal */}
			<Modal
				visible={showFilterModal}
				transparent
				animationType="fade"
				onRequestClose={() => setShowFilterModal(false)}
			>
				<Pressable
					style={styles.modalOverlay}
					onPress={() => setShowFilterModal(false)}
				>
					<Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation?.()}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Select Category</Text>
							<Pressable onPress={() => setShowFilterModal(false)} hitSlop={10}>
								<Ionicons name="close" size={22} color={COLORS.textPrimary} />
							</Pressable>
						</View>

						<View style={styles.modalList}>
							{CATEGORIES.map((cat) => {
								const active = selectedCategory === cat.id;
								return (
									<TouchableOpacity
										key={cat.id}
										style={[styles.modalItem, active && styles.modalItemActive]}
										onPress={() => {
											setSelectedCategory(cat.id);
											setShowFilterModal(false);
										}}
									>
										<View style={styles.modalItemLeft}>
											<Ionicons
												name={cat.icon}
												size={18}
												color={active ? COLORS.primary : COLORS.textSecondary}
											/>
											<Text
												style={[styles.modalItemText, active && styles.modalItemTextActive]}
											>
												{cat.label}
											</Text>
										</View>
										{active && (
											<Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
										)}
									</TouchableOpacity>
								);
							})}
						</View>
					</Pressable>
				</Pressable>
			</Modal>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	toastContainer: {
		position: 'absolute',
		top: 60,
		left: 0,
		right: 0,
		zIndex: 999,
		alignItems: 'center',
	},
	toastCard: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		backgroundColor: '#00251A',
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 24,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 6,
	},
	toastText: {
		color: '#FFFFFF',
		fontSize: 12,
		fontWeight: '600',
	},
	header: {
		paddingHorizontal: 16,
		paddingTop: 8,
		paddingBottom: 12,
		backgroundColor: '#FFFFFF',
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: '#EBEFEF',
	},
	headerTop: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	headerBrandGroup: {
		flex: 1,
		justifyContent: 'center',
	},
	brandTitleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	brandTitle: {
		fontSize: 20,
		fontWeight: '800',
		color: COLORS.primaryDark,
		letterSpacing: -0.3,
	},
	countryBadge: {
		backgroundColor: '#E0F2F1',
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 10,
	},
	countryBadgeText: {
		fontSize: 10,
		fontWeight: '700',
		color: COLORS.primary,
	},
	brandSubtitle: {
		fontSize: 11,
		color: COLORS.textMuted,
		marginTop: 2,
	},
	headerRightActions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	iconCircleBtn: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#F4F7F6',
		borderWidth: 1,
		borderColor: '#E2E8E6',
		alignItems: 'center',
		justifyContent: 'center',
	},
	badgeMiniDot: {
		position: 'absolute',
		top: 7,
		right: 7,
		width: 7,
		height: 7,
		borderRadius: 4,
		backgroundColor: '#E53935',
	},
	cartBadge: {
		position: 'absolute',
		right: -3,
		top: -3,
		minWidth: 18,
		height: 18,
		borderRadius: 9,
		backgroundColor: COLORS.primary,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 3,
		borderWidth: 1.5,
		borderColor: '#FFFFFF',
	},
	cartBadgeText: {
		color: '#FFF',
		fontSize: 9,
		fontWeight: '800',
	},
	searchRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	searchBar: {
		flex: 1,
		height: 44,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#F5F7F6',
		borderRadius: 22,
		borderWidth: 1,
		borderColor: '#E0E7E4',
		paddingHorizontal: 14,
		gap: 8,
	},
	searchInput: {
		flex: 1,
		minWidth: 0,
		paddingVertical: 0,
		fontSize: 13,
		color: COLORS.textPrimary,
	},
	filterBtn: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: '#F5F7F6',
		borderWidth: 1,
		borderColor: '#E0E7E4',
		alignItems: 'center',
		justifyContent: 'center',
	},
	filterBtnActive: {
		backgroundColor: COLORS.primary,
		borderColor: COLORS.primary,
	},
	listContent: {
		paddingHorizontal: 14,
		paddingBottom: 24,
		backgroundColor: '#F7F9F8',
	},
	heroBanner: {
		marginTop: 12,
		marginBottom: 14,
		padding: 16,
		borderRadius: 16,
		backgroundColor: '#004D40',
		shadowColor: '#00251A',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.12,
		shadowRadius: 10,
		elevation: 3,
	},
	heroBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		backgroundColor: 'rgba(255, 255, 255, 0.16)',
		alignSelf: 'flex-start',
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 6,
		marginBottom: 8,
	},
	heroBadgeText: {
		color: '#80CBC4',
		fontSize: 9,
		fontWeight: '800',
		letterSpacing: 0.6,
	},
	heroTitle: {
		color: '#FFFFFF',
		fontSize: 18,
		fontWeight: '800',
		lineHeight: 23,
	},
	heroSubtitle: {
		color: '#B2DFDB',
		fontSize: 12,
		lineHeight: 17,
		marginTop: 4,
	},
	heroTagsRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 6,
		marginTop: 12,
	},
	heroTagPill: {
		backgroundColor: 'rgba(255, 255, 255, 0.14)',
		paddingHorizontal: 9,
		paddingVertical: 4,
		borderRadius: 12,
	},
	heroTagPillText: {
		color: '#FFFFFF',
		fontSize: 10,
		fontWeight: '600',
	},
	categoryScroll: {
		paddingBottom: 10,
		gap: 8,
	},
	categoryPill: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		height: 34,
		paddingHorizontal: 12,
		borderRadius: 18,
		backgroundColor: '#FFFFFF',
		borderColor: '#E2E8E6',
		borderWidth: 1,
	},
	categoryPillActive: {
		backgroundColor: COLORS.primary,
		borderColor: COLORS.primary,
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 2,
	},
	categoryText: {
		fontSize: 12,
		color: COLORS.textSecondary,
		fontWeight: '600',
	},
	categoryTextActive: {
		color: '#FFFFFF',
		fontWeight: '700',
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 8,
		marginBottom: 12,
	},
	sectionTitle: {
		fontSize: 15,
		fontWeight: '800',
		color: COLORS.textPrimary,
	},
	sectionSubtitle: {
		fontSize: 11,
		color: COLORS.textMuted,
		marginTop: 1,
	},
	itemCountBadge: {
		backgroundColor: '#E8EFEF',
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 10,
	},
	itemCountText: {
		fontSize: 10,
		fontWeight: '700',
		color: COLORS.primary,
	},
	productRow: {
		justifyContent: 'space-between',
		marginBottom: 12,
	},
	productCard: {
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#E8ECE9',
		overflow: 'hidden',
		shadowColor: '#00251A',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.04,
		shadowRadius: 6,
		elevation: 1,
	},
	imageWrap: {
		width: '100%',
		backgroundColor: '#F0F3F2',
		position: 'relative',
		overflow: 'hidden',
	},
	productImage: {
		width: '100%',
		height: '100%',
	},
	imageFallback: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#E2EBE8',
	},
	imageFallbackEmoji: {
		fontSize: 36,
	},
	imageFallbackText: {
		fontSize: 10,
		color: COLORS.textMuted,
		fontWeight: '600',
		marginTop: 4,
	},
	badgeTag: {
		position: 'absolute',
		left: 8,
		top: 8,
		backgroundColor: 'rgba(0, 37, 26, 0.72)',
		paddingHorizontal: 7,
		paddingVertical: 3,
		borderRadius: 6,
	},
	badgeTagText: {
		color: '#FFFFFF',
		fontSize: 9,
		fontWeight: '700',
		letterSpacing: 0.4,
	},
	favoriteButton: {
		position: 'absolute',
		right: 8,
		top: 8,
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: 'rgba(255, 255, 255, 0.94)',
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	productDetails: {
		padding: 10,
	},
	productName: {
		fontSize: 12.5,
		lineHeight: 16,
		fontWeight: '700',
		color: COLORS.textPrimary,
		minHeight: 32,
	},
	artisanLocationRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
		marginTop: 3,
	},
	artisanName: {
		fontSize: 10.5,
		color: COLORS.textSecondary,
		flex: 1,
	},
	trustRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 5,
		paddingBottom: 6,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: '#F0F3F2',
	},
	verifiedRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
	},
	verifiedText: {
		fontSize: 9.5,
		color: COLORS.success,
		fontWeight: '700',
	},
	ratingRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
	},
	ratingText: {
		fontSize: 9.5,
		color: COLORS.textPrimary,
		fontWeight: '700',
	},
	priceActionRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 6,
	},
	currencyLabel: {
		fontSize: 8.5,
		color: COLORS.textMuted,
		fontWeight: '700',
	},
	productPrice: {
		fontSize: 13.5,
		color: COLORS.primary,
		fontWeight: '800',
	},
	addCartBtn: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: COLORS.primary,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
		elevation: 1,
	},
	emptyContainer: {
		paddingVertical: 40,
		paddingHorizontal: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	emptyEmoji: {
		fontSize: 44,
		marginBottom: 10,
	},
	emptyTitle: {
		fontSize: 16,
		fontWeight: '800',
		color: COLORS.textPrimary,
		marginBottom: 4,
	},
	emptySubtitle: {
		fontSize: 12,
		color: COLORS.textMuted,
		textAlign: 'center',
		lineHeight: 18,
		marginBottom: 16,
	},
	emptyResetBtn: {
		backgroundColor: COLORS.primary,
		paddingHorizontal: 16,
		paddingVertical: 9,
		borderRadius: 18,
	},
	emptyResetText: {
		color: '#FFFFFF',
		fontSize: 12,
		fontWeight: '700',
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.45)',
		justifyContent: 'flex-end',
	},
	modalSheet: {
		backgroundColor: '#FFFFFF',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
		paddingBottom: 32,
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	modalTitle: {
		fontSize: 16,
		fontWeight: '800',
		color: COLORS.textPrimary,
	},
	modalList: {
		gap: 6,
	},
	modalItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 12,
		paddingHorizontal: 12,
		borderRadius: 10,
	},
	modalItemActive: {
		backgroundColor: '#E0F2F1',
	},
	modalItemLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	modalItemText: {
		fontSize: 14,
		color: COLORS.textPrimary,
		fontWeight: '600',
	},
	modalItemTextActive: {
		color: COLORS.primary,
		fontWeight: '800',
	},
});

export const BuyerHomeScreen = MarketplaceScreen;
export default MarketplaceScreen;
