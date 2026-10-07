import React, { useState } from 'react';
import {
	Alert,
	Image,
	Platform,
	Pressable,
	ScrollView,
	Share,
	StyleSheet,
	Text,
	View,
	useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../navigation/routes';

const PRODUCT_IMAGES = [
	'https://images.unsplash.com/photo-1583391733956-6c78276477e3?auto=format&fit=crop&w=1200&q=90',
	'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=90',
	'https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=1200&q=90',
];

const SIZES = ['S', 'M', 'L', 'XL'];
const DETAILS_TABS = ['Fabric Specs', 'Size Chart', 'Customer Reviews'];

export const ProductDetailScreen = ({ navigation, route }) => {
	const [activeImage, setActiveImage] = useState(0);
	const [selectedSize, setSelectedSize] = useState('M');
	const [activeTab, setActiveTab] = useState(DETAILS_TABS[0]);
	const [isWishlisted, setIsWishlisted] = useState(false);
	const insets = useSafeAreaInsets();
	const { width: screenWidth } = useWindowDimensions();
	const product = route?.params?.product || {};
	const title = product.title || product.name || 'Handmade Batik Silk Saree';
	const price = product.price ? `LKR ${product.price}` : 'LKR 12,500';
	const seller = product.artisan || "Malsha's Crafts";
	const images = product.images?.length ? product.images : product.image ? [product.image, ...PRODUCT_IMAGES.slice(1)] : PRODUCT_IMAGES;

	const handleShare = async () => {
		try {
			await Share.share({ message: `${title} — ${price} at ArtisanThread` });
		} catch (error) {
			Alert.alert('Unable to share', 'Please try again in a moment.');
		}
	};

	const handleChat = () => {
		navigation?.navigate?.(ROUTES.BUYER.CHAT, { artisan: seller, product });
	};

	const handlePurchase = () => {
		Alert.alert(
			'Ready to purchase?',
			`${title}\nSize: ${selectedSize}\n${price}\n\nYour payment is protected with escrow.`,
			[
				{ text: 'Continue shopping', style: 'cancel' },
				{ text: 'Continue securely', onPress: () => navigation?.navigate?.('BuyerCart', { product, size: selectedSize }) },
			]
		);
	};

	const renderTabContent = () => {
		if (activeTab === 'Size Chart') {
			return (
				<View style={styles.sizeChart}>
					{[['Size', 'Bust', 'Length'], ['S', '34 in', '5.5 m'], ['M', '36 in', '5.5 m'], ['L', '38 in', '5.5 m'], ['XL', '40 in', '5.5 m']].map((row, rowIndex) => (
						<View key={row[0]} style={[styles.chartRow, rowIndex === 0 && styles.chartHeaderRow]}>
							{row.map((cell) => <Text key={cell} style={[styles.chartCell, rowIndex === 0 && styles.chartHeaderText]}>{cell}</Text>)}
						</View>
					))}
				</View>
			);
		}

		if (activeTab === 'Customer Reviews') {
			return (
				<View style={styles.reviewContent}>
					<View style={styles.reviewScore}>
						<Ionicons name="star" size={17} color="#D6A92C" />
						<Text style={styles.reviewScoreText}>4.9</Text>
						<Text style={styles.reviewCount}>from 28 happy customers</Text>
					</View>
					<Text style={styles.reviewQuote}>“Beautiful craftsmanship and the silk feels wonderful. It arrived carefully packed.”</Text>
					<Text style={styles.reviewAuthor}>— Recent verified buyer</Text>
				</View>
			);
		}

		return (
			<Text style={styles.specificationText}>
				Pure silk  ·  Hand-waxed batik  ·  Natural dyes  ·  5.5 m length with matching blouse piece
			</Text>
		);
	};

	return (
		<SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
			<View style={styles.screen}>
				<View style={styles.header}>
					<Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => navigation?.goBack?.()} style={styles.headerButton}>
						<Ionicons name="arrow-back" size={21} color={COLORS.textPrimary} />
					</Pressable>
					<Text style={styles.brandTitle}>ArtisanThread</Text>
					<View style={styles.headerActions}>
						<Pressable accessibilityRole="button" accessibilityLabel="Share product" onPress={handleShare} style={styles.headerButton}>
							<Ionicons name="share-social-outline" size={19} color={COLORS.textPrimary} />
						</Pressable>
						<Pressable accessibilityRole="button" accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'} onPress={() => setIsWishlisted((value) => !value)} style={styles.headerButton}>
							<Ionicons name={isWishlisted ? 'heart' : 'heart-outline'} size={21} color={isWishlisted ? '#C84C4C' : COLORS.textPrimary} />
						</Pressable>
					</View>
				</View>

				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={[styles.scrollContent, { paddingBottom: 124 + insets.bottom }]}
				>
					<View style={styles.carousel}>
						<ScrollView
							horizontal
							pagingEnabled
							showsHorizontalScrollIndicator={false}
							onMomentumScrollEnd={(event) => {
								const pageWidth = event.nativeEvent.layoutMeasurement.width;
								setActiveImage(Math.round(event.nativeEvent.contentOffset.x / pageWidth));
							}}
						>
							{images.map((image) => (
								<Image key={image} source={{ uri: image }} style={[styles.productImage, { width: screenWidth - 24 }]} resizeMode="cover" />
							))}
						</ScrollView>
						<View style={styles.pagination}>
								{images.map((image, index) => (
								<View key={image} style={[styles.paginationDot, index === activeImage && styles.paginationDotActive]} />
							))}
						</View>
					</View>

					<View style={styles.productInfo}>
						<Text style={styles.productTitle}>{title}</Text>
						<Text style={styles.price}>{price}</Text>
						<Text style={styles.sellerName}>{seller}</Text>
						<View style={styles.sellerVerified}>
							<Ionicons name="shield-checkmark-outline" size={15} color={COLORS.success} />
							<Text style={styles.verifiedText}>Verified</Text>
						</View>
					</View>

					<View style={styles.tabs}>
						{DETAILS_TABS.map((tab) => {
							const active = activeTab === tab;
							return (
								<Pressable key={tab} onPress={() => setActiveTab(tab)} style={styles.tabButton} accessibilityRole="tab" accessibilityState={{ selected: active }}>
									<Text style={[styles.tabText, active && styles.tabTextActive]}>{tab}</Text>
									<View style={[styles.tabUnderline, active && styles.tabUnderlineActive]} />
								</Pressable>
							);
						})}
					</View>
					<View style={styles.tabContent}>{renderTabContent()}</View>

					<View style={styles.sizeSection}>
						<Text style={styles.sectionTitle}>Choose size</Text>
						<View style={styles.sizeOptions}>
							{SIZES.map((size) => {
								const selected = selectedSize === size;
								return (
									<Pressable key={size} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setSelectedSize(size)} style={[styles.sizeButton, selected && styles.sizeButtonSelected]}>
										<Text style={[styles.sizeText, selected && styles.sizeTextSelected]}>{size}</Text>
									</Pressable>
								);
							})}
							<Pressable onPress={() => Alert.alert('Custom measurements', 'The maker will help you create a fit tailored to your measurements.')} style={styles.customSizeButton}>
								<Text style={styles.customSizeText}>+ Request Custom{ '\n' }Measurements</Text>
							</Pressable>
						</View>
					</View>

					<View style={styles.guarantee}>
						<Ionicons name="shield-checkmark-outline" size={19} color={COLORS.success} />
						<Text style={styles.guaranteeText}>100% Authentic Handcrafted Guarantee</Text>
					</View>
				</ScrollView>

				<View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
					<Pressable accessibilityRole="button" onPress={handleChat} style={styles.chatButton}>
						<Text style={styles.chatButtonText}>Chat with Maker</Text>
					</Pressable>
					<Pressable accessibilityRole="button" onPress={handlePurchase} style={styles.buyButton}>
						<Text style={styles.buyButtonText}>Buy Now with Escrow Security</Text>
					</Pressable>
				</View>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: '#FAFAF9' },
	screen: { flex: 1, backgroundColor: '#FAFAF9' },
	header: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
	headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	headerButton: { width: 34, height: 34, borderRadius: 18, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEEEEC', alignItems: 'center', justifyContent: 'center' },
	brandTitle: { position: 'absolute', left: 80, right: 80, textAlign: 'center', color: '#191B1A', fontSize: 12, fontWeight: '800', letterSpacing: 0.1 },
	scrollContent: { paddingBottom: 20 },
	carousel: { height: 286, marginHorizontal: 12, borderRadius: 13, backgroundColor: '#E7E9E4', overflow: 'hidden' },
	productImage: { width: '100%', height: 286 },
	pagination: { position: 'absolute', bottom: 10, alignSelf: 'center', flexDirection: 'row', gap: 5 },
	paginationDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.65)' },
	paginationDotActive: { width: 17, backgroundColor: '#FFF' },
	productInfo: { paddingHorizontal: 15, paddingTop: 11 },
	productTitle: { color: '#171918', fontSize: 20, lineHeight: 25, fontWeight: '800', letterSpacing: -0.35 },
	price: { color: COLORS.primary, fontSize: 15, lineHeight: 20, fontWeight: '800', marginTop: 2 },
	sellerName: { color: COLORS.primary, fontSize: 11, fontWeight: '600', marginTop: 5 },
	sellerVerified: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
	verifiedText: { color: COLORS.success, fontSize: 9, fontWeight: '600' },
	tabs: { marginHorizontal: 15, marginTop: 18, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E9ECE9' },
	tabButton: { minHeight: 31, alignItems: 'center', justifyContent: 'space-between' },
	tabText: { color: '#717A77', fontSize: 9, fontWeight: '500' },
	tabTextActive: { color: COLORS.primary, fontWeight: '700' },
	tabUnderline: { width: '100%', height: 2, backgroundColor: 'transparent' },
	tabUnderlineActive: { backgroundColor: COLORS.primary },
	tabContent: { minHeight: 53, paddingHorizontal: 15, paddingTop: 9 },
	specificationText: { color: '#7B8380', fontSize: 9, lineHeight: 14 },
	sizeChart: { borderWidth: 1, borderColor: '#E5EAE7', borderRadius: 7, overflow: 'hidden' },
	chartRow: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#E5EAE7', minHeight: 24, alignItems: 'center' },
	chartHeaderRow: { backgroundColor: '#F0F5F2', borderTopWidth: 0 },
	chartCell: { flex: 1, textAlign: 'center', color: COLORS.textSecondary, fontSize: 9, paddingVertical: 4 },
	chartHeaderText: { color: COLORS.primary, fontWeight: '700' },
	reviewContent: { paddingVertical: 2 },
	reviewScore: { flexDirection: 'row', alignItems: 'center', gap: 5 },
	reviewScoreText: { color: COLORS.textPrimary, fontWeight: '800', fontSize: 12 },
	reviewCount: { color: COLORS.textMuted, fontSize: 9 },
	reviewQuote: { color: COLORS.textSecondary, fontSize: 9, lineHeight: 14, marginTop: 4 },
	reviewAuthor: { color: COLORS.textMuted, fontSize: 8, marginTop: 2 },
	sizeSection: { paddingHorizontal: 15, marginTop: 2 },
	sectionTitle: { color: '#252A28', fontSize: 11, fontWeight: '800', marginBottom: 7 },
	sizeOptions: { flexDirection: 'row', gap: 7, alignItems: 'center' },
	sizeButton: { width: 37, height: 34, borderRadius: 8, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E7EAE8', alignItems: 'center', justifyContent: 'center' },
	sizeButtonSelected: { backgroundColor: '#E8F3F0', borderColor: COLORS.primaryLight },
	sizeText: { color: COLORS.textPrimary, fontSize: 10, fontWeight: '600' },
	sizeTextSelected: { color: COLORS.primary, fontWeight: '800' },
	customSizeButton: { flex: 1, minHeight: 34, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
	customSizeText: { textAlign: 'center', color: COLORS.primary, fontSize: 8, lineHeight: 10, fontWeight: '700' },
	guarantee: { minHeight: 48, marginHorizontal: 15, marginTop: 13, paddingHorizontal: 11, borderRadius: 11, backgroundColor: '#E9F6ED', justifyContent: 'center', gap: 5 },
	guaranteeText: { color: '#398151', fontSize: 10, fontWeight: '700' },
	bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 8, gap: 7, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#ECEFEC', ...Platform.select({ android: { elevation: 10 }, ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.06, shadowRadius: 8 } }) },
	chatButton: { flex: 0.9, height: 42, borderRadius: 11, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },
	chatButtonText: { color: COLORS.primary, fontSize: 10, fontWeight: '700' },
	buyButton: { flex: 1.45, height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, backgroundColor: COLORS.primary },
	buyButtonText: { color: '#FFF', fontSize: 9, textAlign: 'center', fontWeight: '700' },
});

export default ProductDetailScreen;
