import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

const INITIAL_MESSAGES = [
  {
    id: 'msg-1',
    sender: 'Maya Lin',
    avatar: 'ML',
    role: 'Art Collector',
    craft: 'Indigo Silk Scarf',
    lastMessage: 'Can you customize the indigo dye pattern to a lighter gradient shade?',
    time: '10:42 AM',
    unread: true,
    history: [
      { sender: 'Maya Lin', text: 'Hi Kenji! I saw your Indigo Silk Scarf listing.', time: '10:30 AM' },
      { sender: 'Maya Lin', text: 'Can you customize the indigo dye pattern to a lighter gradient shade?', time: '10:42 AM' },
    ],
  },
  {
    id: 'msg-2',
    sender: 'Julian Moore',
    avatar: 'JM',
    role: 'Buyer',
    craft: 'Ceramic Matcha Bowl',
    lastMessage: 'Thank you for shipping! Will the parcel include the wooden tomobako box?',
    time: 'Yesterday',
    unread: false,
    history: [
      { sender: 'Julian Moore', text: 'Thank you for shipping! Will the parcel include the wooden tomobako box?', time: 'Yesterday' },
      { sender: 'You', text: 'Yes Julian! Every ceremonial bowl is packed in a custom hand-stamped tomobako.', time: 'Yesterday' },
    ],
  },
  {
    id: 'msg-3',
    sender: 'Marcus Vance',
    avatar: 'MV',
    role: 'Courier Partner',
    craft: 'Batch Delivery #B-12',
    lastMessage: 'Arriving at 4:00 PM for the 3 packaged orders. Please have dispatch receipts ready.',
    time: 'Sep 28',
    unread: false,
    history: [
      { sender: 'Marcus Vance', text: 'Arriving at 4:00 PM for the 3 packaged orders. Please have dispatch receipts ready.', time: 'Sep 28' },
    ],
  },
  {
    id: 'msg-4',
    sender: 'Sarah Jenkins',
    avatar: 'SJ',
    role: 'Custom Inquiry',
    craft: 'Sashiko Table Runner',
    lastMessage: 'Interested in ordering a 6-ft custom hand-loomed runner for a wedding gift.',
    time: 'Sep 25',
    unread: false,
    history: [
      { sender: 'Sarah Jenkins', text: 'Interested in ordering a 6-ft custom hand-loomed runner for a wedding gift.', time: 'Sep 25' },
    ],
  },
];

export const ArtisanMessagesScreen = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [search, setSearch] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [replyText, setReplyText] = useState('');

  const filteredMessages = messages.filter(
    (m) =>
      m.sender.toLowerCase().includes(search.toLowerCase()) ||
      m.craft.toLowerCase().includes(search.toLowerCase()) ||
      m.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenChat = (chat) => {
    setSelectedChat(chat);
    // Mark as read
    setMessages((prev) =>
      prev.map((m) => (m.id === chat.id ? { ...m, unread: false } : m))
    );
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedChat) return;

    const newMsg = {
      sender: 'You',
      text: replyText.trim(),
      time: 'Just now',
    };

    const updatedHistory = [...selectedChat.history, newMsg];
    const updatedChat = {
      ...selectedChat,
      lastMessage: replyText.trim(),
      time: 'Just now',
      history: updatedHistory,
    };

    setSelectedChat(updatedChat);
    setMessages((prev) =>
      prev.map((m) => (m.id === selectedChat.id ? updatedChat : m))
    );
    setReplyText('');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Client & Buyer Messages"
        subtitle="Manage inquiries, custom commissions & courier updates"
      />

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search messages by buyer name or craft..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.messageList}>
            {filteredMessages.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleOpenChat(item)}
                activeOpacity={0.8}
              >
                <Card style={[styles.card, item.unread && styles.unreadCard]}>
                  <View style={styles.row}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{item.avatar}</Text>
                    </View>

                    <View style={styles.info}>
                      <View style={styles.topRow}>
                        <Text style={styles.senderName}>{item.sender}</Text>
                        <Text style={styles.time}>{item.time}</Text>
                      </View>

                      <View style={styles.craftBadgeRow}>
                        <View style={styles.craftBadge}>
                          <Text style={styles.craftBadgeText}>{item.craft}</Text>
                        </View>
                        <Text style={styles.roleTag}>{item.role}</Text>
                      </View>

                      <Text style={styles.lastMsg} numberOfLines={2}>
                        {item.lastMessage}
                      </Text>
                    </View>

                    {item.unread && <View style={styles.unreadDot} />}
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Direct Chat Modal */}
      <Modal
        visible={!!selectedChat}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedChat(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedChat && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderInfo}>
                    <Text style={styles.modalSender}>{selectedChat.sender}</Text>
                    <Text style={styles.modalCraft}>Inquiry regarding: {selectedChat.craft}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedChat(null)}
                    style={styles.closeBtn}
                  >
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.chatHistory} showsVerticalScrollIndicator={false}>
                  {selectedChat.history.map((msg, index) => {
                    const isMe = msg.sender === 'You';
                    return (
                      <View
                        key={index}
                        style={[
                          styles.chatBubble,
                          isMe ? styles.chatBubbleMe : styles.chatBubbleOther,
                        ]}
                      >
                        <Text style={[styles.chatSenderTag, isMe && styles.chatSenderTagMe]}>
                          {msg.sender} • {msg.time}
                        </Text>
                        <Text style={[styles.chatText, isMe && styles.chatTextMe]}>
                          {msg.text}
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>

                <View style={styles.replyBar}>
                  <TextInput
                    style={styles.replyInput}
                    placeholder="Type your response to buyer..."
                    placeholderTextColor={COLORS.textMuted}
                    value={replyText}
                    onChangeText={setReplyText}
                  />
                  <TouchableOpacity
                    style={styles.sendBtn}
                    onPress={handleSendReply}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.sendBtnText}>Send</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  messageList: {
    gap: 10,
    marginTop: 4,
  },
  card: {
    padding: SPACING.md,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    backgroundColor: '#F7FCFA',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  senderName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  time: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  craftBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  craftBadge: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  craftBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  roleTag: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  lastMsg: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    height: '75%',
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalHeaderInfo: {
    flex: 1,
  },
  modalSender: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalCraft: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  chatHistory: {
    flex: 1,
    paddingVertical: 12,
  },
  chatBubble: {
    padding: 12,
    borderRadius: RADIUS.md,
    marginBottom: 10,
    maxWidth: '85%',
  },
  chatBubbleOther: {
    backgroundColor: '#F3F4F6',
    alignSelf: 'flex-start',
  },
  chatBubbleMe: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
  },
  chatSenderTag: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 4,
    fontWeight: '600',
  },
  chatSenderTagMe: {
    color: '#80CBC4',
  },
  chatText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  chatTextMe: {
    color: '#FFFFFF',
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});

export default ArtisanMessagesScreen;
