import React, { useMemo, useState } from 'react';
import {
	Alert,
	Image,
	Modal,
	Platform,
	Pressable,
	ScrollView,
	Share,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../navigation/routes';

const FALLBACK_GALLERY = [
	'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=90',
	'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=90',
	'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1200&q=90',
];

const SIZES = ['S', 'M', 'L', 'XL', 'Custom'];
const DETAILS_TABS = ['Specifications', 'Size Guide', 'Buyer Reviews (22)'];

const REVIEWS = [
	{
		id: '1',
		name: 'Sanduni Fernando',
		rating: 5,
		date: '3 days ago',
		comment: 'Absolutely stunning silk craftsmanship! The colors in real life are even richer than in the photos. Arrived carefully wrapped with an artisan certificate.',
	},
	{
		id: '2',
		name: 'Kavindu Perera',
		rating: 5,
		date: '1 week ago',
		comment: 'Genuine Sri Lankan handloom quality. The seller answered all my custom measurement queries promptly. Highly recommended!',
	},
];

export const ProductDetailScreen = ({ navigation, route }) => {
	const [activeImage, setActiveImage] = useState(0);
	const [selectedSize, setSelectedSize] = useState('M');
	const [activeTab, setActiveTab] = useState(DETAILS_TABS[0]);
	const [isWishlisted, setIsWishlisted] = useState(false);
	const [imageError, setImageError] = useState(false);
	const [showPurchaseModal, setShowPurchaseModal] = useState(false);
	const [showCustomModal, setShowCustomModal] = useState(false);

	const insets = useSafeAreaInsets();
	const { width: screenWidth } = useWindowDimensions();

	const product = route?.params?.product || {};
	const title = product.title || product.name || 'Indigo Silk Batik Saree & Dress';
	const price = product.price ? (String(product.price).startsWith('LKR') ? product.price : `LKR ${product.price}`) : 'LKR 6,500';
	const seller = product.artisan || 'Nimali Batik Studio';
	const location = product.location || 'Colombo, Sri Lanka';
	const category = product.category || 'Batik Apparel';
	const rating = product.rating || '4.9 (22)';

	// Gallery images
	const images = useMemo(() => {
		if (product.images && product.images.length > 0) return product.images;
		if (product.image) return [product.image, ...FALLBACK_GALLERY.slice(1)];
		return FALLBACK_GALLERY;
	}, [product]);

	const carouselHeight = Math.min(Math.round(screenWidth * 0.95), 360);

	const handleShare = async () => {
		try {
			await Share.share({ message: `${title} — ${price} on ArtisanThread Marketplace` });
		} catch (error) {
			Alert.alert('Unable to share', 'Please try again in a moment.');
		}
	};

	const handleChat = () => {
		navigation?.navigate(ROUTES.BUYER.CHAT, { artisan: seller, product });
	};

	const handlePurchase = () => {
		setShowPurchaseModal(true);
	};

	const renderTabContent = () => {
		if (activeTab === 'Size Guide') {
			return (
				<View style={styles.sizeGuideCard}>
					<View style={styles.chartHeaderRow}>
						<Text style={[styles.chartHeaderCell, { flex: 1.2 }]}>Size</Text>
						<Text style={styles.chartHeaderCell}>Bust / Chest</Text>
						<Text style={styles.chartHeaderCell}>Waist</Text>
						<Text style={styles.chartHeaderCell}>Length</Text>
					</View>
					{[
						{ size: 'S (Small)', bust: '34 in', waist: '28 in', length: '5.5 m' },
						{ size: 'M (Medium)', bust: '36 in', waist: '30 in', length: '5.5 m' },
						{ size: 'L (Large)', bust: '38 in', waist: '32 in', length: '5.5 m' },
						{ size: 'XL (Extra)', bust: '40 in', waist: '34 in', length: '5.5 m' },
						{ size: 'Custom', bust: 'Tailored', waist: 'Tailored', length: 'On request' },
					].map((row, idx) => (
						<View
							key={row.size}
							style={[
								styles.chartRow,
								idx % 2 === 1 && { backgroundColor: '#F8FAF9' },
							]}
						>
							<Text style={[styles.chartCellBold, { flex: 1.2 }]}>{row.size}</Text>
							<Text style={styles.chartCell}>{row.bust}</Text>
							<Text style={styles.chartCell}>{row.waist}</Text>
							<Text style={styles.chartCell}>{row.length}</Text>
						</View>
					))}
				</View>
			);
		}

		if (activeTab.includes('Buyer Reviews')) {
			return (
				<View style={styles.reviewsWrapper}>
					<View style={styles.reviewSummaryCard}>
						<View style={styles.reviewBigScore}>
							<Text style={styles.reviewScoreNumber}>4.9</Text>
							<View style={styles.reviewStarsRow}>
								{[1, 2, 3, 4, 5].map((s) => (
									<Ionicons key={s} name="star" size={14} color="#D4AF37" />
								))}
							</View>
							<Text style={styles.reviewSummaryCount}>22 verified reviews</Text>
						</View>
						<View style={styles.reviewDivider} />
						<View style={styles.reviewHighlight}>
							<Text style={styles.reviewHighlightText}>🌿 100% Authentic Sri Lankan</Text>
							<Text style={styles.reviewHighlightSub}>Buyer satisfaction guarantee</Text>
						</View>
					</View>

					{REVIEWS.map((rev) => (
						<View key={rev.id} style={styles.reviewItem}>
							<View style={styles.reviewItemHeader}>
								<View style={styles.reviewAvatar}>
									<Text style={styles.reviewAvatarText}>{rev.name[0]}</Text>
								</View>
								<View style={{ flex: 1 }}>
									<Text style={styles.reviewAuthorName}>{rev.name}</Text>
									<Text style={styles.reviewDate}>{rev.date} · Verified Purchase</Text>
								</View>
								<View style={styles.reviewRatingPill}>
									<Ionicons name="star" size={11} color="#D4AF37" />
									<Text style={styles.reviewRatingPillText}>{rev.rating}.0</Text>
								</View>
							</View>
							<Text style={styles.reviewComment}>{rev.comment}</Text>
						</View>
					))}
				</View>
			);
		}

		// Default Specifications Tab
		return (
			<View style={styles.specificationsList}>
				<View style={styles.specItem}>
					<View style={styles.specIconWrap}>
						<Ionicons name="color-palette-outline" size={16} color={COLORS.primary} />
					</View>
					<View style={{ flex: 1 }}>
						<Text style={styles.specLabel}>Artisan Craft Technique</Text>
						<Text style={styles.specValue}>Traditional Hand-Waxed Batik Dip Dyeing</Text>
					</View>
				</View>

				<View style={styles.specItem}>
					<View style={styles.specIconWrap}>
						<Ionicons name="leaf-outline" size={16} color={COLORS.primary} />
					</View>
					<View style={{ flex: 1 }}>
						<Text style={styles.specLabel}>Materials & Dyes</Text>
						<Text style={styles.specValue}>100% Pure Mulberry Silk & Natural Indigo Dyes</Text>
					</View>
				</View>

				<View style={styles.specItem}>
					<View style={styles.specIconWrap}>
						<Ionicons name="resize-outline" size={16} color={COLORS.primary} />
					</View>
					<View style={{ flex: 1 }}>
						<Text style={styles.specLabel}>Length & Inclusions</Text>
						<Text style={styles.specValue}>5.5 meters saree length + 0.8 meter matching unstitched blouse</Text>
					</View>
				</View>

				<View style={styles.specItem}>
					<View style={styles.specIconWrap}>
						<Ionicons name="sparkles-outline" size={16} color={COLORS.primary} />
					</View>
					<View style={{ flex: 1 }}>
						<Text style={styles.specLabel}>Care Instructions</Text>
						<Text style={styles.specValue}>Gentle hand wash in cold water or dry clean to preserve natural dyes</Text>
					</View>
				</View>
			</View>
		);
	};

	return (
		<SafeAreaView style={styles.safeArea} edges={['top']}>
			<StatusBar style="dark" backgroundColor="#FFFFFF" />

			{/* Top Navigation Bar */}
			<View style={styles.navBar}>
				<TouchableOpacity
					accessibilityRole="button"
					accessibilityLabel="Go back"
					onPress={() => navigation?.goBack?.()}
					style={styles.navButton}
				>
					<Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
				</TouchableOpacity>

				<View style={styles.navTitleGroup}>
					<Text style={styles.navTitle}>ArtisanThread</Text>
					<Text style={styles.navSubtitle}>Craft Atelier</Text>
				</View>

				<View style={styles.navActions}>
					<TouchableOpacity
						accessibilityRole="button"
						accessibilityLabel="Share product"
						onPress={handleShare}
						style={styles.navButton}
					>
						<Ionicons name="share-social-outline" size={19} color={COLORS.textPrimary} />
					</TouchableOpacity>
					<TouchableOpacity
						accessibilityRole="button"
						accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
						onPress={() => setIsWishlisted((val) => !val)}
						style={styles.navButton}
					>
						<Ionicons
							name={isWishlisted ? 'heart' : 'heart-outline'}
							size={20}
							color={isWishlisted ? '#E53935' : COLORS.textPrimary}
						/>
					</TouchableOpacity>
				</View>
			</View>

			{/* Scrollable Product Details Content */}
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={[
					styles.scrollContent,
					{ paddingBottom: 110 + insets.bottom },
				]}
			>
				{/* Image Carousel */}
				<View style={[styles.carouselContainer, { height: carouselHeight }]}>
					{!imageError ? (
						<ScrollView
							horizontal
							pagingEnabled
							showsHorizontalScrollIndicator={false}
							onMomentumScrollEnd={(event) => {
								const pageWidth = event.nativeEvent.layoutMeasurement.width;
								setActiveImage(Math.round(event.nativeEvent.contentOffset.x / pageWidth));
							}}
						>
							{images.map((imgUri, index) => (
								<Image
									key={`${imgUri}-${index}`}
									source={{ uri: imgUri }}
									style={[styles.carouselImage, { width: screenWidth - 28 }]}
									resizeMode="cover"
									onError={() => setImageError(true)}
								/>
							))}
						</ScrollView>
					) : (
						<View style={styles.imageFallback}>
							<Text style={styles.fallbackEmoji}>👗</Text>
							<Text style={styles.fallbackTitle}>{category}</Text>
						</View>
					)}

					{/* Badge Pill on top-left of image */}
					<View style={styles.carouselBadge}>
						<Ionicons name="shield-checkmark" size={11} color="#80CBC4" />
						<Text style={styles.carouselBadgeText}>CERTIFIED ARTISAN</Text>
					</View>

					{/* Pagination Dots & Count on image */}
					<View style={styles.carouselFooter}>
						<View style={styles.paginationDots}>
							{images.map((_, idx) => (
								<View
									key={idx}
									style={[
										styles.paginationDot,
										idx === activeImage && styles.paginationDotActive,
									]}
								/>
							))}
						</View>
						<View style={styles.imageCounter}>
							<Text style={styles.imageCounterText}>
								{activeImage + 1} / {images.length}
							</Text>
						</View>
					</View>
				</View>

				{/* Product Header & Title */}
				<View style={styles.infoCard}>
					<View style={styles.categoryChipRow}>
						<View style={styles.categoryChip}>
							<Text style={styles.categoryChipText}>{category}</Text>
						</View>
						<View style={styles.ratingBadge}>
							<Ionicons name="star" size={12} color="#D4AF37" />
							<Text style={styles.ratingBadgeText}>{rating}</Text>
						</View>
					</View>

					<Text style={styles.productTitle}>{title}</Text>

					<View style={styles.priceRow}>
						<View>
							<Text style={styles.priceCurrency}>Total Price</Text>
							<Text style={styles.priceAmount}>{price}</Text>
						</View>
						<View style={styles.stockBadge}>
							<Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
							<Text style={styles.stockBadgeText}>In Stock · Made to Order</Text>
						</View>
					</View>
				</View>

				{/* Artisan Atelier Profile Card */}
				<View style={styles.artisanCard}>
					<View style={styles.artisanAvatar}>
						<Ionicons name="storefront" size={20} color={COLORS.primary} />
					</View>
					<View style={styles.artisanInfo}>
						<View style={styles.artisanNameRow}>
							<Text style={styles.artisanName}>{seller}</Text>
							<Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
						</View>
						<Text style={styles.artisanLocation}>📍 {location} · Master Artisan</Text>
						<Text style={styles.artisanResponseTime}>⚡ Usually replies in 15 minutes</Text>
					</View>
					<TouchableOpacity
						accessibilityRole="button"
						onPress={handleChat}
						style={styles.artisanChatBtn}
					>
						<Ionicons name="chatbubble-ellipses-outline" size={16} color={COLORS.primary} />
						<Text style={styles.artisanChatText}>Chat</Text>
					</TouchableOpacity>
				</View>

				{/* Craft Heritage Description */}
				<View style={styles.sectionBlock}>
					<Text style={styles.sectionTitle}>About This Craft</Text>
					<Text style={styles.descriptionText}>
						Crafted by master artisans in Sri Lanka using centuries-old wax-resist batik techniques.
						Each motif is delicately drawn by hand and repeatedly immersed in plant-based dyes.
						Because every piece is handcrafted, it represents a unique, unrepeatable heirloom of
						island heritage.
					</Text>
				</View>

				{/* Size Selection */}
				<View style={styles.sectionBlock}>
					<View style={styles.sizeSectionHeader}>
						<Text style={styles.sectionTitle}>Choose Size</Text>
						<Text style={styles.sizeSubtitle}>Standard Sri Lankan tailoring</Text>
					</View>

					<View style={styles.sizePillsRow}>
						{SIZES.map((size) => {
							const selected = selectedSize === size;
							return (
								<TouchableOpacity
									key={size}
									accessibilityRole="button"
									accessibilityState={{ selected }}
									onPress={() => setSelectedSize(size)}
									style={[styles.sizePill, selected && styles.sizePillSelected]}
								>
									<Text style={[styles.sizePillText, selected && styles.sizePillTextSelected]}>
										{size}
									</Text>
								</TouchableOpacity>
							);
						})}
					</View>

					<TouchableOpacity
						onPress={() => setShowCustomModal(true)}
						style={styles.customTailoringBanner}
					>
						<Ionicons name="cut-outline" size={16} color={COLORS.primary} />
						<Text style={styles.customTailoringText}>
							Need custom sleeve or saree length? Tap to request custom tailoring
						</Text>
					</TouchableOpacity>
				</View>

				{/* Interactive Tabs (Specifications, Size Guide, Reviews) */}
				<View style={styles.tabSection}>
					<View style={styles.tabBarRow}>
						{DETAILS_TABS.map((tab) => {
							const active = activeTab === tab;
							return (
								<TouchableOpacity
									key={tab}
									onPress={() => setActiveTab(tab)}
									style={[styles.tabItem, active && styles.tabItemActive]}
								>
									<Text style={[styles.tabItemText, active && styles.tabItemTextActive]}>
										{tab}
									</Text>
								</TouchableOpacity>
							);
						})}
					</View>

					<View style={styles.tabContentContainer}>{renderTabContent()}</View>
				</View>

				{/* Escrow Buyer Protection Card */}
				<View style={styles.escrowCard}>
					<View style={styles.escrowHeader}>
						<View style={styles.escrowShieldIcon}>
							<Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
						</View>
						<View style={{ flex: 1 }}>
							<Text style={styles.escrowTitle}>Artisan Escrow Protected</Text>
							<Text style={styles.escrowSubtitle}>Your money stays safe</Text>
						</View>
					</View>
					<Text style={styles.escrowBody}>
						Funds are held securely by ArtisanThread and only released to the artisan after your
						package arrives and you confirm complete satisfaction.
					</Text>
					<View style={styles.escrowPointsRow}>
						<View style={styles.escrowPoint}>
							<Ionicons name="cube-outline" size={14} color="#80CBC4" />
							<Text style={styles.escrowPointText}>Doorstep Inspection</Text>
						</View>
						<View style={styles.escrowPoint}>
							<Ionicons name="card-outline" size={14} color="#80CBC4" />
							<Text style={styles.escrowPointText}>100% Refund Guarantee</Text>
						</View>
					</View>
				</View>
			</ScrollView>

			{/* Floating Bottom Sticky Action Bar */}
			<View
				style={[
					styles.floatingBottomBar,
					{ paddingBottom: Math.max(insets.bottom, 14) },
				]}
			>
				<TouchableOpacity
					accessibilityRole="button"
					accessibilityLabel="Chat with artisan"
					onPress={handleChat}
					style={styles.bottomChatButton}
				>
					<Ionicons name="chatbubbles-outline" size={18} color={COLORS.primary} />
					<Text style={styles.bottomChatText}>Chat</Text>
				</TouchableOpacity>

				<TouchableOpacity
					accessibilityRole="button"
					accessibilityLabel="Buy now with escrow"
					onPress={handlePurchase}
					style={styles.bottomBuyButton}
				>
					<Ionicons name="lock-closed" size={16} color="#FFFFFF" />
					<Text style={styles.bottomBuyText}>Buy Now with Escrow · {price}</Text>
				</TouchableOpacity>
			</View>

			{/* Custom Escrow Checkout Modal Bottom Sheet */}
			<Modal
				visible={showPurchaseModal}
				transparent
				animationType="slide"
				onRequestClose={() => setShowPurchaseModal(false)}
			>
				<Pressable
					style={styles.modalOverlay}
					onPress={() => setShowPurchaseModal(false)}
				>
					<Pressable
						style={[
							styles.modalSheet,
							{ paddingBottom: Math.max(insets.bottom, 24) },
						]}
						onPress={(e) => e.stopPropagation?.()}
					>
						<View style={styles.sheetHandle} />

						{/* Modal Header */}
						<View style={styles.modalHeader}>
							<View style={styles.modalHeaderLeft}>
								<View style={styles.escrowShieldMini}>
									<Ionicons name="shield-checkmark" size={18} color={COLORS.primary} />
								</View>
								<View>
									<Text style={styles.modalTitle}>Proceed with Escrow Security</Text>
									<Text style={styles.modalSubtitle}>100% Buyer Protection Guaranteed</Text>
								</View>
							</View>
							<TouchableOpacity
								accessibilityRole="button"
								accessibilityLabel="Close"
								onPress={() => setShowPurchaseModal(false)}
								style={styles.modalCloseBtn}
							>
								<Ionicons name="close" size={20} color={COLORS.textPrimary} />
							</TouchableOpacity>
						</View>

						{/* Product Summary Row */}
						<View style={styles.sheetProductCard}>
							<Image
								source={{ uri: images[0] }}
								style={styles.sheetProductThumb}
								resizeMode="cover"
							/>
							<View style={styles.sheetProductInfo}>
								<Text numberOfLines={1} style={styles.sheetProductTitle}>
									{title}
								</Text>
								<Text style={styles.sheetProductSeller}>Artisan: {seller}</Text>
								<View style={styles.sheetSizeBadge}>
									<Text style={styles.sheetSizeBadgeText}>Selected Size: {selectedSize}</Text>
								</View>
								<Text style={styles.sheetProductPrice}>{price}</Text>
							</View>
						</View>

						{/* Escrow Security Feature List */}
						<View style={styles.sheetEscrowBox}>
							<View style={styles.sheetEscrowItem}>
								<Ionicons name="lock-closed" size={16} color={COLORS.primary} />
								<Text style={styles.sheetEscrowItemText}>
									Payment is safely held in escrow — released only after you approve delivery.
								</Text>
							</View>
							<View style={styles.sheetEscrowItem}>
								<Ionicons name="eye" size={16} color={COLORS.primary} />
								<Text style={styles.sheetEscrowItemText}>
									Doorstep parcel inspection upon arrival anywhere in Sri Lanka.
								</Text>
							</View>
							<View style={styles.sheetEscrowItem}>
								<Ionicons name="refresh-circle" size={16} color={COLORS.primary} />
								<Text style={styles.sheetEscrowItemText}>
									Hassle-free return & full refund guarantee if item is defective.
								</Text>
							</View>
						</View>

						{/* Modal Action Buttons */}
						<View style={styles.modalActions}>
							<TouchableOpacity
								accessibilityRole="button"
								style={styles.modalConfirmBtn}
								onPress={() => {
									setShowPurchaseModal(false);
									try {
										navigation?.navigate('BuyerTabs', {
											screen: ROUTES.BUYER.CART,
											params: { product, size: selectedSize },
										});
									} catch (e) {
										navigation?.navigate(ROUTES.BUYER.CART, {
											product,
											size: selectedSize,
										});
									}
								}}
							>
								<Ionicons name="cart" size={18} color="#FFFFFF" />
								<Text style={styles.modalConfirmBtnText}>
									Add to Cart & Checkout · {price}
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								accessibilityRole="button"
								style={styles.modalCancelBtn}
								onPress={() => setShowPurchaseModal(false)}
							>
								<Text style={styles.modalCancelBtnText}>Keep Browsing</Text>
							</TouchableOpacity>
						</View>
					</Pressable>
				</Pressable>
			</Modal>

			{/* Custom Tailoring Request Modal */}
			<Modal
				visible={showCustomModal}
				transparent
				animationType="fade"
				onRequestClose={() => setShowCustomModal(false)}
			>
				<Pressable
					style={styles.modalOverlay}
					onPress={() => setShowCustomModal(false)}
				>
					<Pressable
						style={[
							styles.modalSheet,
							{ paddingBottom: Math.max(insets.bottom, 24) },
						]}
						onPress={(e) => e.stopPropagation?.()}
					>
						<View style={styles.sheetHandle} />

						<View style={styles.modalHeader}>
							<View style={styles.modalHeaderLeft}>
								<View style={styles.escrowShieldMini}>
									<Ionicons name="cut" size={18} color={COLORS.primary} />
								</View>
								<View>
									<Text style={styles.modalTitle}>Custom Tailoring Request</Text>
									<Text style={styles.modalSubtitle}>Direct atelier request with {seller}</Text>
								</View>
							</View>
							<TouchableOpacity
								accessibilityRole="button"
								accessibilityLabel="Close"
								onPress={() => setShowCustomModal(false)}
								style={styles.modalCloseBtn}
							>
								<Ionicons name="close" size={20} color={COLORS.textPrimary} />
							</TouchableOpacity>
						</View>

						<View style={styles.customModalBody}>
							<Text style={styles.customModalText}>
								Our master artisans can customize blouse measurements, sleeve lengths, and saree borders to your exact preferences before dispatch.
							</Text>
							<Text style={styles.customModalSubtext}>
								You can send your reference sizes right now via direct artisan chat.
							</Text>
						</View>

						<View style={styles.modalActions}>
							<TouchableOpacity
								accessibilityRole="button"
								style={styles.modalConfirmBtn}
								onPress={() => {
									setShowCustomModal(false);
									navigation?.navigate(ROUTES.BUYER.CHAT, { artisan: seller, product });
								}}
							>
								<Ionicons name="chatbubbles" size={18} color="#FFFFFF" />
								<Text style={styles.modalConfirmBtnText}>
									Chat with Artisan Now
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								accessibilityRole="button"
								style={styles.modalCancelBtn}
								onPress={() => setShowCustomModal(false)}
							>
								<Text style={styles.modalCancelBtnText}>Close</Text>
							</TouchableOpacity>
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
	navBar: {
		height: 52,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 14,
		backgroundColor: '#FFFFFF',
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: '#EBEFEF',
	},
	navButton: {
		width: 38,
		height: 38,
		borderRadius: 19,
		backgroundColor: '#F4F7F6',
		borderWidth: 1,
		borderColor: '#E2E8E6',
		alignItems: 'center',
		justifyContent: 'center',
	},
	navTitleGroup: {
		alignItems: 'center',
	},
	navTitle: {
		fontSize: 15,
		fontWeight: '800',
		color: COLORS.primaryDark,
		letterSpacing: -0.2,
	},
	navSubtitle: {
		fontSize: 10,
		color: COLORS.textMuted,
		marginTop: 1,
	},
	navActions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	scrollContent: {
		paddingHorizontal: 14,
		paddingTop: 12,
		backgroundColor: '#F8FAF9',
	},
	carouselContainer: {
		width: '100%',
		borderRadius: 16,
		overflow: 'hidden',
		backgroundColor: '#EAEFEA',
		position: 'relative',
		shadowColor: '#00251A',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	carouselImage: {
		height: '100%',
	},
	imageFallback: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#E0E7E4',
	},
	fallbackEmoji: {
		fontSize: 48,
	},
	fallbackTitle: {
		fontSize: 14,
		color: COLORS.textMuted,
		fontWeight: '700',
		marginTop: 8,
	},
	carouselBadge: {
		position: 'absolute',
		top: 12,
		left: 12,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		backgroundColor: 'rgba(0, 37, 26, 0.76)',
		paddingHorizontal: 9,
		paddingVertical: 4,
		borderRadius: 8,
	},
	carouselBadgeText: {
		color: '#FFFFFF',
		fontSize: 9.5,
		fontWeight: '800',
		letterSpacing: 0.5,
	},
	carouselFooter: {
		position: 'absolute',
		bottom: 12,
		left: 14,
		right: 14,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	paginationDots: {
		flexDirection: 'row',
		gap: 5,
	},
	paginationDot: {
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: 'rgba(255, 255, 255, 0.55)',
	},
	paginationDotActive: {
		width: 18,
		backgroundColor: '#FFFFFF',
	},
	imageCounter: {
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 10,
	},
	imageCounterText: {
		color: '#FFFFFF',
		fontSize: 10,
		fontWeight: '700',
	},
	infoCard: {
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		padding: 16,
		marginTop: 12,
		borderWidth: 1,
		borderColor: '#E8ECE9',
	},
	categoryChipRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	categoryChip: {
		backgroundColor: '#E0F2F1',
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 6,
	},
	categoryChipText: {
		color: COLORS.primary,
		fontSize: 10.5,
		fontWeight: '700',
		textTransform: 'uppercase',
	},
	ratingBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		backgroundColor: '#FFF9E6',
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 6,
	},
	ratingBadgeText: {
		fontSize: 11,
		fontWeight: '800',
		color: '#8A6D05',
	},
	productTitle: {
		fontSize: 19,
		fontWeight: '800',
		color: COLORS.textPrimary,
		lineHeight: 25,
		letterSpacing: -0.3,
	},
	priceRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-end',
		marginTop: 12,
		paddingTop: 10,
		borderTopWidth: 1,
		borderTopColor: '#F0F3F2',
	},
	priceCurrency: {
		fontSize: 10,
		color: COLORS.textMuted,
		fontWeight: '700',
		textTransform: 'uppercase',
	},
	priceAmount: {
		fontSize: 21,
		fontWeight: '900',
		color: COLORS.primary,
		marginTop: 1,
	},
	stockBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		backgroundColor: '#E8F5E9',
		paddingHorizontal: 9,
		paddingVertical: 4,
		borderRadius: 8,
	},
	stockBadgeText: {
		fontSize: 10.5,
		color: COLORS.success,
		fontWeight: '700',
	},
	artisanCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		padding: 14,
		marginTop: 12,
		borderWidth: 1,
		borderColor: '#E8ECE9',
		gap: 12,
	},
	artisanAvatar: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: '#E0F2F1',
		alignItems: 'center',
		justifyContent: 'center',
	},
	artisanInfo: {
		flex: 1,
	},
	artisanNameRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
	},
	artisanName: {
		fontSize: 13.5,
		fontWeight: '800',
		color: COLORS.textPrimary,
	},
	artisanLocation: {
		fontSize: 11,
		color: COLORS.textSecondary,
		marginTop: 2,
	},
	artisanResponseTime: {
		fontSize: 10,
		color: COLORS.success,
		fontWeight: '600',
		marginTop: 2,
	},
	artisanChatBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: 12,
		paddingVertical: 7,
		borderRadius: 18,
		backgroundColor: '#E0F2F1',
	},
	artisanChatText: {
		fontSize: 11,
		fontWeight: '800',
		color: COLORS.primary,
	},
	sectionBlock: {
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		padding: 16,
		marginTop: 12,
		borderWidth: 1,
		borderColor: '#E8ECE9',
	},
	sectionTitle: {
		fontSize: 15,
		fontWeight: '800',
		color: COLORS.textPrimary,
		marginBottom: 6,
	},
	descriptionText: {
		fontSize: 12.5,
		lineHeight: 19,
		color: COLORS.textSecondary,
	},
	sizeSectionHeader: {
		marginBottom: 10,
	},
	sizeSubtitle: {
		fontSize: 11,
		color: COLORS.textMuted,
		marginTop: 1,
	},
	sizePillsRow: {
		flexDirection: 'row',
		gap: 8,
		flexWrap: 'wrap',
	},
	sizePill: {
		minWidth: 44,
		height: 38,
		borderRadius: 10,
		backgroundColor: '#F5F7F6',
		borderWidth: 1,
		borderColor: '#E0E7E4',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 12,
	},
	sizePillSelected: {
		backgroundColor: COLORS.primary,
		borderColor: COLORS.primary,
	},
	sizePillText: {
		fontSize: 12,
		fontWeight: '700',
		color: COLORS.textPrimary,
	},
	sizePillTextSelected: {
		color: '#FFFFFF',
	},
	customTailoringBanner: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		backgroundColor: '#F0F7F5',
		padding: 10,
		borderRadius: 10,
		marginTop: 12,
		borderWidth: 1,
		borderColor: '#D7EBE5',
	},
	customTailoringText: {
		flex: 1,
		fontSize: 11,
		color: COLORS.primary,
		fontWeight: '600',
		lineHeight: 15,
	},
	tabSection: {
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		padding: 16,
		marginTop: 12,
		borderWidth: 1,
		borderColor: '#E8ECE9',
	},
	tabBarRow: {
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderBottomColor: '#EBEFEF',
		marginBottom: 14,
	},
	tabItem: {
		paddingVertical: 8,
		marginRight: 16,
		borderBottomWidth: 2,
		borderBottomColor: 'transparent',
	},
	tabItemActive: {
		borderBottomColor: COLORS.primary,
	},
	tabItemText: {
		fontSize: 12,
		fontWeight: '600',
		color: COLORS.textMuted,
	},
	tabItemTextActive: {
		color: COLORS.primary,
		fontWeight: '800',
	},
	tabContentContainer: {
		minHeight: 80,
	},
	specificationsList: {
		gap: 12,
	},
	specItem: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 10,
	},
	specIconWrap: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: '#E0F2F1',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 2,
	},
	specLabel: {
		fontSize: 11,
		fontWeight: '700',
		color: COLORS.textPrimary,
	},
	specValue: {
		fontSize: 12,
		color: COLORS.textSecondary,
		marginTop: 2,
		lineHeight: 17,
	},
	sizeGuideCard: {
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#E0E7E4',
		overflow: 'hidden',
	},
	chartHeaderRow: {
		flexDirection: 'row',
		backgroundColor: '#E0F2F1',
		paddingVertical: 8,
		paddingHorizontal: 10,
	},
	chartHeaderCell: {
		flex: 1,
		fontSize: 10.5,
		fontWeight: '800',
		color: COLORS.primary,
		textAlign: 'center',
	},
	chartRow: {
		flexDirection: 'row',
		paddingVertical: 8,
		paddingHorizontal: 10,
		borderTopWidth: 1,
		borderTopColor: '#EBEFEF',
	},
	chartCellBold: {
		flex: 1,
		fontSize: 11,
		fontWeight: '700',
		color: COLORS.textPrimary,
		textAlign: 'center',
	},
	chartCell: {
		flex: 1,
		fontSize: 11,
		color: COLORS.textSecondary,
		textAlign: 'center',
	},
	reviewsWrapper: {
		gap: 12,
	},
	reviewSummaryCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#F8FAF9',
		padding: 12,
		borderRadius: 12,
		gap: 14,
	},
	reviewBigScore: {
		alignItems: 'center',
	},
	reviewScoreNumber: {
		fontSize: 24,
		fontWeight: '900',
		color: COLORS.textPrimary,
	},
	reviewStarsRow: {
		flexDirection: 'row',
		gap: 2,
		marginTop: 2,
	},
	reviewSummaryCount: {
		fontSize: 9.5,
		color: COLORS.textMuted,
		marginTop: 2,
	},
	reviewDivider: {
		width: 1,
		height: 36,
		backgroundColor: '#E0E7E4',
	},
	reviewHighlight: {
		flex: 1,
	},
	reviewHighlightText: {
		fontSize: 12,
		fontWeight: '700',
		color: COLORS.primary,
	},
	reviewHighlightSub: {
		fontSize: 10.5,
		color: COLORS.textMuted,
		marginTop: 2,
	},
	reviewItem: {
		backgroundColor: '#FFFFFF',
		padding: 10,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#EBEFEF',
	},
	reviewItemHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 6,
	},
	reviewAvatar: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: '#D4AF37',
		alignItems: 'center',
		justifyContent: 'center',
	},
	reviewAvatarText: {
		color: '#FFFFFF',
		fontSize: 11,
		fontWeight: '800',
	},
	reviewAuthorName: {
		fontSize: 12,
		fontWeight: '700',
		color: COLORS.textPrimary,
	},
	reviewDate: {
		fontSize: 9.5,
		color: COLORS.textMuted,
	},
	reviewRatingPill: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
		backgroundColor: '#FFF9E6',
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 6,
	},
	reviewRatingPillText: {
		fontSize: 10,
		fontWeight: '800',
		color: '#8A6D05',
	},
	reviewComment: {
		fontSize: 11.5,
		color: COLORS.textSecondary,
		lineHeight: 16,
	},
	escrowCard: {
		backgroundColor: '#004D40',
		borderRadius: 16,
		padding: 16,
		marginTop: 12,
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
		marginBottom: 12,
	},
	escrowPointsRow: {
		flexDirection: 'row',
		gap: 10,
	},
	escrowPoint: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		backgroundColor: 'rgba(255, 255, 255, 0.12)',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 8,
	},
	escrowPointText: {
		color: '#FFFFFF',
		fontSize: 10,
		fontWeight: '700',
	},
	floatingBottomBar: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: '#FFFFFF',
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 14,
		paddingTop: 10,
		gap: 10,
		borderTopWidth: 1,
		borderTopColor: '#EBEFEF',
		...Platform.select({
			android: { elevation: 12 },
			ios: {
				shadowColor: '#00251A',
				shadowOffset: { width: 0, height: -3 },
				shadowOpacity: 0.08,
				shadowRadius: 8,
			},
		}),
	},
	bottomChatButton: {
		width: 68,
		height: 46,
		borderRadius: 12,
		borderWidth: 1.5,
		borderColor: COLORS.primary,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#F0F7F5',
		gap: 2,
	},
	bottomChatText: {
		fontSize: 11,
		fontWeight: '800',
		color: COLORS.primary,
	},
	bottomBuyButton: {
		flex: 1,
		height: 46,
		borderRadius: 12,
		backgroundColor: COLORS.primary,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6,
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 2,
	},
	bottomBuyText: {
		color: '#FFFFFF',
		fontSize: 13,
		fontWeight: '800',
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'flex-end',
	},
	modalSheet: {
		backgroundColor: '#FFFFFF',
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		paddingHorizontal: 18,
		paddingTop: 12,
		shadowColor: '#00251A',
		shadowOffset: { width: 0, height: -4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 10,
	},
	sheetHandle: {
		width: 44,
		height: 5,
		borderRadius: 3,
		backgroundColor: '#DCE4E1',
		alignSelf: 'center',
		marginBottom: 14,
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 14,
	},
	modalHeaderLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		flex: 1,
	},
	escrowShieldMini: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: '#E0F2F1',
		alignItems: 'center',
		justifyContent: 'center',
	},
	modalTitle: {
		fontSize: 15,
		fontWeight: '800',
		color: COLORS.textPrimary,
	},
	modalSubtitle: {
		fontSize: 11,
		color: COLORS.textMuted,
		marginTop: 1,
	},
	modalCloseBtn: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: '#F4F7F6',
		alignItems: 'center',
		justifyContent: 'center',
	},
	sheetProductCard: {
		flexDirection: 'row',
		backgroundColor: '#F8FAF9',
		borderRadius: 14,
		padding: 10,
		borderWidth: 1,
		borderColor: '#E8ECE9',
		gap: 12,
		alignItems: 'center',
		marginBottom: 14,
	},
	sheetProductThumb: {
		width: 58,
		height: 58,
		borderRadius: 10,
		backgroundColor: '#EAEFEA',
	},
	sheetProductInfo: {
		flex: 1,
	},
	sheetProductTitle: {
		fontSize: 13,
		fontWeight: '700',
		color: COLORS.textPrimary,
	},
	sheetProductSeller: {
		fontSize: 10.5,
		color: COLORS.textMuted,
		marginTop: 1,
	},
	sheetSizeBadge: {
		backgroundColor: '#E0F2F1',
		alignSelf: 'flex-start',
		paddingHorizontal: 7,
		paddingVertical: 2,
		borderRadius: 6,
		marginTop: 3,
	},
	sheetSizeBadgeText: {
		fontSize: 9.5,
		fontWeight: '700',
		color: COLORS.primary,
	},
	sheetProductPrice: {
		fontSize: 13.5,
		fontWeight: '900',
		color: COLORS.primary,
		marginTop: 2,
	},
	sheetEscrowBox: {
		backgroundColor: '#F0F8F5',
		borderRadius: 12,
		padding: 12,
		borderWidth: 1,
		borderColor: '#D4EDE4',
		gap: 8,
		marginBottom: 16,
	},
	sheetEscrowItem: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 8,
	},
	sheetEscrowItemText: {
		flex: 1,
		fontSize: 11,
		color: '#1B4D3E',
		lineHeight: 15,
		fontWeight: '600',
	},
	modalActions: {
		gap: 8,
	},
	modalConfirmBtn: {
		height: 48,
		borderRadius: 14,
		backgroundColor: COLORS.primary,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.25,
		shadowRadius: 6,
		elevation: 3,
	},
	modalConfirmBtnText: {
		color: '#FFFFFF',
		fontSize: 13.5,
		fontWeight: '800',
	},
	modalCancelBtn: {
		height: 40,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#F4F7F6',
	},
	modalCancelBtnText: {
		color: COLORS.textSecondary,
		fontSize: 12,
		fontWeight: '700',
	},
	customModalBody: {
		paddingVertical: 12,
		gap: 8,
		marginBottom: 14,
	},
	customModalText: {
		fontSize: 13,
		lineHeight: 19,
		color: COLORS.textPrimary,
		fontWeight: '600',
	},
	customModalSubtext: {
		fontSize: 11.5,
		lineHeight: 17,
		color: COLORS.textMuted,
	},
});

export default ProductDetailScreen;
