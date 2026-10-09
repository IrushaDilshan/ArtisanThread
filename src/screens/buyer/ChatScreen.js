import React, { useRef, useState } from 'react';
import {
	Alert,
	FlatList,
	Image,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
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

const INITIAL_MESSAGES = [
	{
		id: 'message-1',
		sender: 'maker',
		text: 'Ayubowan! Thank you for your interest in the Indigo Silk Batik Saree. I can customize the blouse piece and drape to your exact measurements.',
		time: '10:24 AM',
	},
	{
		id: 'message-2',
		sender: 'buyer',
		text: 'That sounds great! I’d love a custom fit. Can you send me a photo of the current fabric dye lot?',
		time: '10:26 AM',
	},
	{
		id: 'message-3',
		sender: 'maker',
		text: 'Here is the latest organic indigo dye batch from our workshop. The silk weave is ultra-soft and has a subtle sheen.',
		time: '10:28 AM',
	},
];

const SUGGESTIONS = [
	'Can you customize measurements? 📏',
	'When can you ship to Colombo? 🚚',
	'Can I request a fabric video? 🎥',
	'What natural dyes are used? 🌿',
];

export const ChatScreen = ({ navigation, route }) => {
	const insets = useSafeAreaInsets();
	const [messages, setMessages] = useState(INITIAL_MESSAGES);
	const [draft, setDraft] = useState('');
	const listRef = useRef(null);

	const product = route?.params?.product || {};
	const seller = route?.params?.artisan || product.artisan || 'Nimali Batik Studio';
	const productName = product.title || product.name || 'Indigo Silk Batik Saree & Dress';
	const productPrice = product.price
		? (String(product.price).startsWith('LKR') ? product.price : `LKR ${product.price}`)
		: 'LKR 6,500';
	const productImage =
		product.image ||
		'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=500&q=85';

	const sendMessage = (customText) => {
		const text = (customText || draft).trim();
		if (!text) return;

		const now = new Date();
		const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

		setMessages((current) => [
			...current,
			{
				id: `message-${Date.now()}`,
				sender: 'buyer',
				text,
				time,
			},
		]);
		setDraft('');
		Keyboard.dismiss();

		// Auto-reply simulation from maker for interactive delight
		setTimeout(() => {
			setMessages((curr) => [
				...curr,
				{
					id: `reply-${Date.now()}`,
					sender: 'maker',
					text: 'Thank you for your message! Our master artisan is reviewing your request and will reply shortly. All orders are protected under Escrow.',
					time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
				},
			]);
			requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
		}, 1200);

		requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
	};

	const showAttachmentOptions = () =>
		Alert.alert('Share Attachment', 'Choose an attachment to send to the master artisan.', [
			{ text: 'Measurement Sheet', onPress: () => Alert.alert('Measurements', 'Measurement template shared with artisan.') },
			{ text: 'Photo / Video', onPress: () => Alert.alert('Photo Library', 'Photo sharing enabled.') },
			{ text: 'Cancel', style: 'cancel' },
		]);

	const showCamera = () =>
		Alert.alert('Camera', 'Take a photo of measurements or reference pattern.');

	const showOptions = () => {
		Alert.alert('Artisan Conversation', seller, [
			{ text: 'View Artisan Profile', onPress: () => Alert.alert(seller, 'Master Artisan atelier located in Colombo, Sri Lanka.') },
			{ text: 'Escrow Protection Details', onPress: () => Alert.alert('Escrow Protection', 'Your payments are held in escrow and released only after delivery approval.') },
			{ text: 'Close', style: 'cancel' },
		]);
	};

	const renderMessage = ({ item }) => {
		const isBuyer = item.sender === 'buyer';
		return (
			<View style={[styles.messageRow, isBuyer ? styles.buyerRow : styles.makerRow]}>
				{!isBuyer && (
					<View style={styles.makerAvatarSmall}>
						<Text style={styles.makerAvatarLetter}>{seller[0] || 'A'}</Text>
					</View>
				)}

				<View style={[styles.bubbleWrap, isBuyer ? styles.buyerBubbleWrap : styles.makerBubbleWrap]}>
					<View style={[styles.messageBubble, isBuyer ? styles.buyerBubble : styles.makerBubble]}>
						<Text style={[styles.messageText, isBuyer && styles.buyerMessageText]}>
							{item.text}
						</Text>
					</View>
					<View style={styles.metaRow}>
						<Text style={[styles.timestamp, isBuyer && styles.buyerTimestamp]}>
							{item.time}
						</Text>
						{isBuyer && (
							<Ionicons name="checkmark-done" size={13} color={COLORS.primary} style={styles.checkIcon} />
						)}
					</View>
				</View>
			</View>
		);
	};

	return (
		<SafeAreaView style={styles.safeArea} edges={['top']}>
			<StatusBar style="dark" backgroundColor="#FFFFFF" />

			<KeyboardAvoidingView
				style={styles.screen}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
			>
				{/* Top Header Navigation */}
				<View style={styles.header}>
					<TouchableOpacity
						accessibilityRole="button"
						accessibilityLabel="Go back"
						onPress={() => navigation?.goBack?.()}
						style={styles.headerBtn}
					>
						<Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
					</TouchableOpacity>

					<View style={styles.headerCenter}>
						<View style={styles.artisanAvatarWrap}>
							<Text style={styles.artisanAvatarText}>{seller[0] || 'N'}</Text>
							<View style={styles.onlineBadgeDot} />
						</View>
						<View style={styles.artisanTextGroup}>
							<View style={styles.artisanNameRow}>
								<Text style={styles.artisanName} numberOfLines={1}>{seller}</Text>
								<Ionicons name="checkmark-circle" size={13} color={COLORS.success} />
							</View>
							<Text style={styles.artisanStatus}>Active now · Verified Maker</Text>
						</View>
					</View>

					<TouchableOpacity
						accessibilityRole="button"
						accessibilityLabel="More options"
						onPress={showOptions}
						style={styles.headerBtn}
					>
						<Ionicons name="ellipsis-horizontal" size={18} color={COLORS.textPrimary} />
					</TouchableOpacity>
				</View>

				{/* Pinned Product Context Banner */}
				<View style={styles.productBanner}>
					<Image source={{ uri: productImage }} style={styles.productThumb} resizeMode="cover" />
					<View style={styles.productMeta}>
						<Text style={styles.productInquiryTag}>Inquiry About This Piece</Text>
						<Text numberOfLines={1} style={styles.productTitleText}>{productName}</Text>
						<Text style={styles.productPriceText}>{productPrice}</Text>
					</View>
					<TouchableOpacity
						style={styles.buyNowSmallBtn}
						onPress={() => navigation?.navigate(ROUTES.BUYER.CART, { product })}
					>
						<Ionicons name="lock-closed" size={11} color="#FFFFFF" />
						<Text style={styles.buyNowSmallText}>Buy</Text>
					</TouchableOpacity>
				</View>

				{/* Message List */}
				<FlatList
					ref={listRef}
					data={messages}
					renderItem={renderMessage}
					keyExtractor={(item) => item.id}
					style={styles.messageList}
					contentContainerStyle={styles.messageListContent}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
					ListHeaderComponent={(
						<View style={styles.dateSeparator}>
							<View style={styles.datePill}>
								<Ionicons name="shield-checkmark" size={12} color="#00796B" />
								<Text style={styles.datePillText}>Escrow Protected Conversation</Text>
							</View>
						</View>
					)}
				/>

				{/* Quick Suggestion Chips */}
				<View style={styles.suggestionsContainer}>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.suggestionsScroll}
					>
						{SUGGESTIONS.map((sug, i) => (
							<TouchableOpacity
								key={i}
								style={styles.suggestionChip}
								onPress={() => sendMessage(sug)}
							>
								<Text style={styles.suggestionText}>{sug}</Text>
							</TouchableOpacity>
						))}
					</ScrollView>
				</View>

				{/* Message Composer Input Bar */}
				<View
					style={[
						styles.composerContainer,
						{ paddingBottom: Math.max(insets.bottom, 12) },
					]}
				>
					<TouchableOpacity
						accessibilityRole="button"
						accessibilityLabel="Attach file"
						onPress={showAttachmentOptions}
						style={styles.actionIconBtn}
					>
						<Ionicons name="attach" size={22} color={COLORS.textSecondary} />
					</TouchableOpacity>

					<View style={styles.inputWrapper}>
						<TextInput
							accessibilityLabel="Type a message"
							placeholder="Message maker (sizing, colors...)"
							placeholderTextColor={COLORS.textMuted}
							value={draft}
							onChangeText={setDraft}
							onSubmitEditing={() => sendMessage()}
							style={styles.textInput}
							returnKeyType="send"
							multiline
							maxLength={1000}
						/>
						<TouchableOpacity
							accessibilityRole="button"
							accessibilityLabel="Camera"
							onPress={showCamera}
							style={styles.cameraIconBtn}
						>
							<Ionicons name="camera-outline" size={19} color={COLORS.textMuted} />
						</TouchableOpacity>
					</View>

					<TouchableOpacity
						accessibilityRole="button"
						accessibilityLabel="Send message"
						onPress={() => sendMessage()}
						style={[
							styles.sendBtn,
							!draft.trim() && styles.sendBtnInactive,
						]}
						disabled={!draft.trim()}
					>
						<Ionicons name="send" size={16} color="#FFFFFF" />
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
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
		height: 56,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 12,
		backgroundColor: '#FFFFFF',
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: '#EBEFEF',
	},
	headerBtn: {
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
		gap: 9,
		flex: 1,
		marginHorizontal: 8,
	},
	artisanAvatarWrap: {
		width: 38,
		height: 38,
		borderRadius: 19,
		backgroundColor: '#E0F2F1',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
	},
	artisanAvatarText: {
		fontSize: 15,
		fontWeight: '800',
		color: COLORS.primary,
	},
	onlineBadgeDot: {
		position: 'absolute',
		bottom: 1,
		right: 1,
		width: 9,
		height: 9,
		borderRadius: 5,
		backgroundColor: '#2E7D32',
		borderWidth: 1.5,
		borderColor: '#FFFFFF',
	},
	artisanTextGroup: {
		flex: 1,
	},
	artisanNameRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	artisanName: {
		fontSize: 13.5,
		fontWeight: '800',
		color: COLORS.textPrimary,
	},
	artisanStatus: {
		fontSize: 10.5,
		color: COLORS.success,
		fontWeight: '600',
		marginTop: 1,
	},
	productBanner: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#EDF2F0',
		gap: 10,
		shadowColor: '#00251A',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.04,
		shadowRadius: 4,
		elevation: 1,
	},
	productThumb: {
		width: 44,
		height: 44,
		borderRadius: 8,
		backgroundColor: '#E8ECE9',
	},
	productMeta: {
		flex: 1,
	},
	productInquiryTag: {
		fontSize: 9.5,
		color: COLORS.primary,
		fontWeight: '700',
		textTransform: 'uppercase',
		letterSpacing: 0.4,
	},
	productTitleText: {
		fontSize: 12.5,
		fontWeight: '700',
		color: COLORS.textPrimary,
		marginTop: 1,
	},
	productPriceText: {
		fontSize: 12,
		fontWeight: '800',
		color: COLORS.primary,
		marginTop: 1,
	},
	buyNowSmallBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		backgroundColor: COLORS.primary,
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 8,
	},
	buyNowSmallText: {
		color: '#FFFFFF',
		fontSize: 11,
		fontWeight: '800',
	},
	messageList: {
		flex: 1,
		backgroundColor: '#F8FAF9',
	},
	messageListContent: {
		paddingHorizontal: 12,
		paddingTop: 12,
		paddingBottom: 8,
		gap: 12,
	},
	dateSeparator: {
		alignItems: 'center',
		marginBottom: 10,
	},
	datePill: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
		backgroundColor: '#E0F2F1',
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 12,
	},
	datePillText: {
		fontSize: 10.5,
		color: '#004D40',
		fontWeight: '700',
	},
	messageRow: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		gap: 6,
		maxWidth: '85%',
	},
	makerRow: {
		alignSelf: 'flex-start',
	},
	buyerRow: {
		alignSelf: 'flex-end',
	},
	makerAvatarSmall: {
		width: 26,
		height: 26,
		borderRadius: 13,
		backgroundColor: '#D4AF37',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 16,
	},
	makerAvatarLetter: {
		color: '#FFFFFF',
		fontSize: 11,
		fontWeight: '800',
	},
	bubbleWrap: {
		maxWidth: '100%',
	},
	makerBubbleWrap: {
		alignItems: 'flex-start',
	},
	buyerBubbleWrap: {
		alignItems: 'flex-end',
	},
	messageBubble: {
		borderRadius: 16,
		paddingHorizontal: 13,
		paddingVertical: 10,
		shadowColor: '#00251A',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 3,
		elevation: 1,
	},
	makerBubble: {
		backgroundColor: '#FFFFFF',
		borderTopLeftRadius: 4,
		borderWidth: 1,
		borderColor: '#E8ECE9',
	},
	buyerBubble: {
		backgroundColor: COLORS.primary,
		borderTopRightRadius: 4,
	},
	messageText: {
		fontSize: 13,
		lineHeight: 18,
		color: COLORS.textPrimary,
	},
	buyerMessageText: {
		color: '#FFFFFF',
	},
	metaRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
		marginTop: 3,
		paddingHorizontal: 4,
	},
	timestamp: {
		fontSize: 9.5,
		color: COLORS.textMuted,
	},
	buyerTimestamp: {
		textAlign: 'right',
	},
	checkIcon: {
		marginLeft: 2,
	},
	suggestionsContainer: {
		backgroundColor: '#FFFFFF',
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: '#EBEFEF',
		paddingVertical: 6,
	},
	suggestionsScroll: {
		paddingHorizontal: 12,
		gap: 8,
	},
	suggestionChip: {
		backgroundColor: '#F0F5F3',
		borderWidth: 1,
		borderColor: '#D7E5E0',
		paddingHorizontal: 11,
		paddingVertical: 6,
		borderRadius: 14,
	},
	suggestionText: {
		fontSize: 11,
		color: COLORS.primaryDark,
		fontWeight: '600',
	},
	composerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		paddingHorizontal: 12,
		paddingTop: 8,
		gap: 8,
		borderTopWidth: 1,
		borderTopColor: '#EBEFEF',
	},
	actionIconBtn: {
		width: 38,
		height: 38,
		borderRadius: 19,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#F4F7F6',
	},
	inputWrapper: {
		flex: 1,
		minHeight: 40,
		maxHeight: 100,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#F4F7F6',
		borderRadius: 20,
		borderWidth: 1,
		borderColor: '#E2E8E6',
		paddingHorizontal: 12,
	},
	textInput: {
		flex: 1,
		fontSize: 13,
		color: COLORS.textPrimary,
		paddingVertical: 8,
		maxHeight: 80,
	},
	cameraIconBtn: {
		padding: 4,
		marginLeft: 4,
	},
	sendBtn: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: COLORS.primary,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 2,
	},
	sendBtnInactive: {
		backgroundColor: '#A0B2AE',
		shadowOpacity: 0,
		elevation: 0,
	},
});

export default ChatScreen;
