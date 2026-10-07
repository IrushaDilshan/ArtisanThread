import React, { useRef, useState } from 'react';
import {
	Alert,
	FlatList,
	Image,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';

const INITIAL_MESSAGES = [
	{
		id: 'message-1',
		sender: 'maker',
		text: 'Hello! Thank you for your interest in the Handmade Batik Silk Saree. I can customize the blouse piece to your measurements.',
		time: '10:24 AM',
	},
	{
		id: 'message-2',
		sender: 'buyer',
		text: "That sounds great! I’d love a custom fit. Can you send me a photo of the current fabric dye lot?",
		time: '10:26 AM',
	},
	{
		id: 'message-3',
		sender: 'maker',
		text: 'Here is the latest dye lot. I can also send you a video of the fabric texture if you’d like.',
		time: '10:28 AM',
	},
];

export const ChatScreen = ({ navigation, route }) => {
	const [messages, setMessages] = useState(INITIAL_MESSAGES);
	const [draft, setDraft] = useState('');
	const listRef = useRef(null);
	const product = route?.params?.product || {};
	const seller = route?.params?.artisan || product.artisan || "Malsha's Crafts";
	const productName = product.title || product.name || 'Handmade Batik Silk Saree';
	const productPrice = product.price ? `LKR ${product.price}` : 'LKR 12,500';
	const productImage = product.image || 'https://images.unsplash.com/photo-1583391733956-6c78276477e3?auto=format&fit=crop&w=500&q=85';

	const sendMessage = () => {
		const text = draft.trim();
		if (!text) return;
		const now = new Date();
		const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
		setMessages((current) => [...current, {
			id: `message-${Date.now()}`,
			sender: 'buyer',
			text,
			time,
		}]);
		setDraft('');
		Keyboard.dismiss();
		requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
	};

	const showAttachmentOptions = () => Alert.alert('Add attachment', 'Choose an attachment to share with the maker.', [
		{ text: 'Photo library', onPress: () => Alert.alert('Photo library', 'Photo sharing can be connected here.') },
		{ text: 'Cancel', style: 'cancel' },
	]);

	const showCamera = () => Alert.alert('Camera', 'Camera capture can be connected here.');

	const renderMessage = ({ item }) => {
		const isBuyer = item.sender === 'buyer';
		return (
			<View style={[styles.messageGroup, isBuyer ? styles.buyerMessageGroup : styles.makerMessageGroup]}>
				<View style={[styles.messageBubble, isBuyer ? styles.buyerBubble : styles.makerBubble]}>
					<Text style={[styles.messageText, isBuyer && styles.buyerMessageText]}>{item.text}</Text>
				</View>
				<Text style={[styles.timestamp, isBuyer && styles.buyerTimestamp]}>{item.time}</Text>
			</View>
		);
	};

	return (
		<SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
			<KeyboardAvoidingView
				style={styles.screen}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
			>
				<View style={styles.header}>
					<Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => navigation?.goBack?.()} style={styles.headerButton}>
						<Ionicons name="arrow-back" size={21} color={COLORS.textPrimary} />
					</Pressable>
					<Text style={styles.headerTitle}>Chat with Maker</Text>
					<Pressable accessibilityRole="button" accessibilityLabel="Chat options" onPress={() => Alert.alert('Chat options', 'More conversation options.')} style={styles.headerButton}>
						<Ionicons name="ellipsis-horizontal" size={20} color={COLORS.textPrimary} />
					</Pressable>
				</View>
				<View style={styles.accentLine} />

				<View style={styles.makerCard}>
					<View style={styles.makerNameRow}>
						<Text style={styles.makerName}>{seller}</Text>
						<Ionicons name="shield-checkmark" size={13} color={COLORS.success} />
						<Text style={styles.verified}>Verified</Text>
					</View>
					<View style={styles.onlineRow}>
						<View style={styles.onlineDot} />
						<Text style={styles.onlineText}>Online</Text>
					</View>
				</View>

				<View style={styles.productCard}>
					<Image source={{ uri: productImage }} style={styles.productImage} resizeMode="cover" />
					<View style={styles.productInfo}>
						<Text numberOfLines={1} style={styles.productName}>{productName}</Text>
						<Text numberOfLines={1} style={styles.productSeller}>{seller}</Text>
						<Text style={styles.productPrice}>{productPrice}</Text>
					</View>
				</View>

				<FlatList
					ref={listRef}
					data={messages}
					renderItem={renderMessage}
					keyExtractor={(item) => item.id}
					style={styles.messageList}
					contentContainerStyle={styles.messageListContent}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
					maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
				/>

				<View style={styles.composer}>
					<Pressable accessibilityRole="button" accessibilityLabel="Attach file" onPress={showAttachmentOptions} style={styles.composerIcon}>
						<Ionicons name="attach-outline" size={21} color="#75807C" />
					</Pressable>
					<TextInput
						accessibilityLabel="Type a message"
						placeholder="Type a message..."
						placeholderTextColor="#8C9591"
						value={draft}
						onChangeText={setDraft}
						onSubmitEditing={sendMessage}
						style={styles.messageInput}
						returnKeyType="send"
						multiline
						maxLength={1000}
					/>
					<Pressable accessibilityRole="button" accessibilityLabel="Take a photo" onPress={showCamera} style={styles.composerIcon}>
						<Ionicons name="camera-outline" size={20} color="#75807C" />
					</Pressable>
					<Pressable accessibilityRole="button" accessibilityLabel="Send message" onPress={sendMessage} style={[styles.sendButton, !draft.trim() && styles.sendButtonInactive]}>
						<Ionicons name="send" size={18} color="#FFF" />
					</Pressable>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: '#FAFAF9' },
	screen: { flex: 1, backgroundColor: '#FAFAF9' },
	header: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 13 },
	headerButton: { width: 34, height: 34, borderRadius: 18, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EBEEEC', alignItems: 'center', justifyContent: 'center' },
	headerTitle: { color: '#171C1A', fontSize: 15, fontWeight: '800' },
	accentLine: { height: 2, backgroundColor: '#28A8D8' },
	makerCard: { minHeight: 62, marginHorizontal: 12, marginTop: 10, paddingHorizontal: 14, justifyContent: 'center', borderWidth: 1, borderStyle: 'dotted', borderColor: '#58A8C0', backgroundColor: '#FFF' },
	makerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
	makerName: { color: '#202623', fontSize: 12, fontWeight: '800' },
	verified: { color: '#68827A', fontSize: 8, fontWeight: '600' },
	onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
	onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#42BC80' },
	onlineText: { color: '#53A87B', fontSize: 9 },
	productCard: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 9, marginHorizontal: 12, marginTop: 10, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderStyle: 'dotted', borderColor: '#58A8C0', backgroundColor: '#FFF' },
	productImage: { width: 50, height: 55, borderRadius: 6, backgroundColor: '#E8ECE9' },
	productInfo: { flex: 1, minWidth: 0, justifyContent: 'center' },
	productName: { color: '#252A28', fontSize: 10, fontWeight: '800' },
	productSeller: { color: COLORS.textMuted, fontSize: 8, marginTop: 3 },
	productPrice: { color: COLORS.primary, fontSize: 10, fontWeight: '800', marginTop: 3 },
	messageList: { flex: 1, marginHorizontal: 12, marginTop: 10, borderWidth: 1, borderStyle: 'dotted', borderColor: '#58A8C0' },
	messageListContent: { flexGrow: 1, paddingHorizontal: 8, paddingVertical: 9, justifyContent: 'flex-end', gap: 10 },
	messageGroup: { maxWidth: '88%' },
	makerMessageGroup: { alignSelf: 'flex-start' },
	buyerMessageGroup: { alignSelf: 'flex-end', alignItems: 'flex-end' },
	messageBubble: { borderRadius: 13, paddingHorizontal: 10, paddingVertical: 8 },
	makerBubble: { backgroundColor: '#E4F2F0', borderTopLeftRadius: 4 },
	buyerBubble: { backgroundColor: COLORS.primary, borderTopRightRadius: 4 },
	messageText: { color: '#424B47', fontSize: 10, lineHeight: 15 },
	buyerMessageText: { color: '#FFF' },
	timestamp: { color: '#8A938F', fontSize: 7, marginTop: 3 },
	buyerTimestamp: { textAlign: 'right' },
	composer: { minHeight: 53, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, gap: 5, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EDEFEF' },
	composerIcon: { width: 28, height: 34, alignItems: 'center', justifyContent: 'center' },
	messageInput: { flex: 1, minHeight: 36, maxHeight: 90, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 18, backgroundColor: '#F2F3F2', color: COLORS.textPrimary, fontSize: 10 },
	sendButton: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary },
	sendButtonInactive: { opacity: 0.85 },
});

export default ChatScreen;
