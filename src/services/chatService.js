import { safeStorage } from './storageHelper';

const STORAGE_KEY = 'ARTISAN_THREAD_ITEM_CHATS';

const SEED_CONVERSATIONS = [
  {
    id: 'msg-1',
    productId: '1',
    craft: 'Indigo Silk Scarf',
    product: {
      id: '1',
      title: 'Indigo Silk Scarf',
      name: 'Indigo Silk Scarf',
      price: 'LKR 12,500',
      category: 'Textiles',
      artisan: 'Master Artisan',
      image: 'https://images.unsplash.com/photo-1606760227091-3dd850d97f1d?w=400',
    },
    sender: 'Maya Lin',
    buyer: 'Maya Lin',
    artisan: 'Master Artisan',
    avatar: 'ML',
    role: 'Art Collector',
    lastMessage: 'Can you customize the indigo dye pattern to a lighter gradient shade?',
    time: '10:42 AM',
    unread: true,
    messages: [
      {
        id: 'msg-1-1',
        sender: 'buyer',
        senderName: 'Maya Lin',
        text: 'Hi! I saw your Indigo Silk Scarf listing on the marketplace.',
        time: '10:30 AM',
        timestamp: Date.now() - 3600000,
      },
      {
        id: 'msg-1-2',
        sender: 'buyer',
        senderName: 'Maya Lin',
        text: 'Can you customize the indigo dye pattern to a lighter gradient shade?',
        time: '10:42 AM',
        timestamp: Date.now() - 3000000,
      },
    ],
  },
  {
    id: 'msg-2',
    productId: '2',
    craft: 'Ceramic Matcha Bowl',
    product: {
      id: '2',
      title: 'Ceramic Matcha Bowl',
      name: 'Ceramic Matcha Bowl',
      price: 'LKR 8,500',
      category: 'Ceramics',
      artisan: 'Master Artisan',
      image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400',
    },
    sender: 'Julian Moore',
    buyer: 'Julian Moore',
    artisan: 'Master Artisan',
    avatar: 'JM',
    role: 'Buyer',
    lastMessage: 'Yes Julian! Every ceremonial bowl is packed in a custom hand-stamped tomobako.',
    time: 'Yesterday',
    unread: false,
    messages: [
      {
        id: 'msg-2-1',
        sender: 'buyer',
        senderName: 'Julian Moore',
        text: 'Thank you for shipping! Will the parcel include the wooden tomobako box?',
        time: 'Yesterday',
        timestamp: Date.now() - 86400000,
      },
      {
        id: 'msg-2-2',
        sender: 'maker',
        senderName: 'Master Artisan',
        text: 'Yes Julian! Every ceremonial bowl is packed in a custom hand-stamped tomobako.',
        time: 'Yesterday',
        timestamp: Date.now() - 82000000,
      },
    ],
  },
  {
    id: 'msg-3',
    productId: 'indigo-dress',
    craft: 'Indigo Silk Batik Saree & Dress',
    product: {
      id: 'indigo-dress',
      title: 'Indigo Silk Batik Saree & Dress',
      name: 'Indigo Silk Batik Saree & Dress',
      price: 'LKR 6,500',
      category: 'Batik Apparel',
      artisan: 'Nimali Batik Studio',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85',
    },
    sender: 'Saman Jayawardena',
    buyer: 'Saman Jayawardena',
    artisan: 'Nimali Batik Studio',
    avatar: 'SJ',
    role: 'Buyer',
    lastMessage: 'Here is the latest organic indigo dye batch from our workshop.',
    time: '10:28 AM',
    unread: false,
    messages: [
      {
        id: 'msg-3-1',
        sender: 'maker',
        senderName: 'Nimali Batik Studio',
        text: 'Ayubowan! Thank you for your interest in the Indigo Silk Batik Saree. I can customize the blouse piece and drape to your exact measurements.',
        time: '10:24 AM',
        timestamp: Date.now() - 1800000,
      },
      {
        id: 'msg-3-2',
        sender: 'buyer',
        senderName: 'Saman Jayawardena',
        text: 'That sounds great! I’d love a custom fit. Can you send me a photo of the current fabric dye lot?',
        time: '10:26 AM',
        timestamp: Date.now() - 1500000,
      },
      {
        id: 'msg-3-3',
        sender: 'maker',
        senderName: 'Nimali Batik Studio',
        text: 'Here is the latest organic indigo dye batch from our workshop. The silk weave is ultra-soft and has a subtle sheen.',
        time: '10:28 AM',
        timestamp: Date.now() - 1200000,
      },
    ],
  },
];

const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((callback) => {
    try {
      callback();
    } catch (e) {
      console.warn('Chat listener error:', e);
    }
  });
};

export const chatService = {
  subscribe(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  async getConversations() {
    try {
      const stored = await safeStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading stored chats:', e);
    }

    // Seed defaults
    await safeStorage.setItem(STORAGE_KEY, SEED_CONVERSATIONS);
    return SEED_CONVERSATIONS;
  },

  async getConversationById(id) {
    const list = await this.getConversations();
    return list.find((c) => c.id === id) || null;
  },

  /**
   * Find or create a conversation strictly connected to a specific product
   */
  async getOrCreateConversationForProduct(product, buyerName = 'Buyer', artisanName = null) {
    if (!product) return null;

    const list = await this.getConversations();
    const prodId = String(product.id || '');
    const prodTitle = product.title || product.name || 'Handcrafted Craft';
    const effectiveArtisan = artisanName || product.artisan || product.store || 'Master Artisan';

    // Look for existing conversation by productId or exact craft name
    const existing = list.find(
      (c) =>
        (prodId && String(c.productId) === prodId) ||
        (c.craft && c.craft.toLowerCase() === prodTitle.toLowerCase())
    );

    if (existing) {
      // Update with any richer product details if missing
      if (!existing.product || !existing.product.image) {
        existing.product = {
          id: prodId,
          title: prodTitle,
          name: prodTitle,
          price: product.price,
          category: product.category,
          artisan: effectiveArtisan,
          image:
            product.image ||
            product.photo ||
            (product.images && product.images[0]) ||
            'https://images.unsplash.com/photo-1606760227091-3dd850d97f1d?w=400',
        };
        await safeStorage.setItem(STORAGE_KEY, list);
        notifyListeners();
      }
      return existing;
    }

    // Create new item-connected conversation
    const newChatId = `chat-prod-${prodId || Date.now()}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    const newConversation = {
      id: newChatId,
      productId: prodId || newChatId,
      craft: prodTitle,
      product: {
        id: prodId || newChatId,
        title: prodTitle,
        name: prodTitle,
        price: product.price || 'LKR 8,500',
        category: product.category || 'Handicrafts',
        artisan: effectiveArtisan,
        image:
          product.image ||
          product.photo ||
          (product.images && product.images[0]) ||
          'https://images.unsplash.com/photo-1606760227091-3dd850d97f1d?w=400',
      },
      sender: buyerName || 'Buyer',
      buyer: buyerName || 'Buyer',
      artisan: effectiveArtisan,
      avatar: (buyerName || 'B').slice(0, 2).toUpperCase(),
      role: 'Buyer Inquiry',
      lastMessage: `Started inquiry about "${prodTitle}"`,
      time: timeStr,
      unread: true,
      messages: [
        {
          id: `msg-${Date.now()}-intro`,
          sender: 'maker',
          senderName: effectiveArtisan,
          text: `Ayubowan! Thank you for your interest in "${prodTitle}". I am here to help with questions about materials, custom dimensions, or delivery!`,
          time: timeStr,
          timestamp: Date.now(),
        },
      ],
    };

    const updated = [newConversation, ...list];
    await safeStorage.setItem(STORAGE_KEY, updated);
    notifyListeners();
    return newConversation;
  },

  /**
   * Send a new message into a conversation (can be sent by Buyer or Artisan)
   */
  async sendMessage(conversationId, { sender, senderName, text }) {
    if (!conversationId || !text || !text.trim()) return null;

    const list = await this.getConversations();
    const targetIdx = list.findIndex((c) => c.id === conversationId);

    if (targetIdx === -1) {
      console.warn('Conversation not found for ID:', conversationId);
      return null;
    }

    const conv = list[targetIdx];
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    const newMsg = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sender: sender || 'buyer', // 'buyer' or 'maker'
      senderName: senderName || (sender === 'maker' ? conv.artisan : conv.buyer),
      text: text.trim(),
      time: timeStr,
      timestamp: Date.now(),
    };

    const updatedMessages = [...(conv.messages || []), newMsg];
    const isBuyer = (sender || '').toLowerCase() === 'buyer';

    const updatedConv = {
      ...conv,
      messages: updatedMessages,
      lastMessage: text.trim(),
      time: 'Just now',
      unread: isBuyer, // unread for artisan if sent by buyer
    };

    // Move active conversation to top of list
    const updatedList = [
      updatedConv,
      ...list.filter((c) => c.id !== conversationId),
    ];

    await safeStorage.setItem(STORAGE_KEY, updatedList);
    notifyListeners();
    return { conversation: updatedConv, message: newMsg };
  },

  async markAsRead(conversationId) {
    const list = await this.getConversations();
    const updatedList = list.map((c) =>
      c.id === conversationId ? { ...c, unread: false } : c
    );
    await safeStorage.setItem(STORAGE_KEY, updatedList);
    notifyListeners();
  },
};
