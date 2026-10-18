import { supabaseAdmin, isSupabaseConfigured } from './supabase';
import { safeStorage } from './storageHelper';

const STORAGE_KEY = 'ARTISAN_THREAD_ITEM_CHATS';
const SUPABASE_URL = 'https://dgwcwxfjuvelnsusninc.supabase.co';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnd2N3eGZqdXZlbG5zdXNuaW5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDM0NTE5NSwiZXhwIjoyMTA1OTIxMTk1fQ.uk5vhNy2_fOjkpt-oLcgH_yoI5KjBXsD2j4216Hmg-I';

// ─── Schema bootstrap ─────────────────────────────────────────────────────────
let schemaReady = false;

/**
 * Creates conversations + messages tables via Supabase Management SQL API
 * if they don't already exist. Only runs once per app session.
 */
async function ensureSchema() {
  if (schemaReady || !isSupabaseConfigured) return;

  const sql = `
    CREATE TABLE IF NOT EXISTS public.conversations (
      id          TEXT PRIMARY KEY,
      product_id  TEXT,
      craft       TEXT,
      product     JSONB,
      buyer       TEXT,
      artisan     TEXT,
      avatar      TEXT,
      role        TEXT,
      last_message TEXT,
      time        TEXT,
      unread      BOOLEAN DEFAULT FALSE,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.messages (
      id              TEXT PRIMARY KEY,
      conversation_id TEXT REFERENCES public.conversations(id) ON DELETE CASCADE,
      sender          TEXT,
      sender_name     TEXT,
      text            TEXT NOT NULL,
      time            TEXT,
      timestamp       BIGINT,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS messages_conv_idx ON public.messages(conversation_id);
  `;

  try {
    const projectRef = 'dgwcwxfjuvelnsusninc';
    const res = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: sql }),
      }
    );

    if (res.ok) {
      schemaReady = true;
      console.log('[chatService] Schema ready (conversations + messages tables)');
    } else {
      const body = await res.text();
      console.warn('[chatService] Schema bootstrap warning:', body);
      // Mark ready anyway — tables may already exist
      schemaReady = true;
    }
  } catch (e) {
    console.warn('[chatService] Schema bootstrap error:', e.message);
    schemaReady = true; // don't retry endlessly
  }
}

// ─── Seed data ────────────────────────────────────────────────────────────────
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
];

// ─── Local listener system ────────────────────────────────────────────────────
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((cb) => {
    try { cb(); } catch (e) { console.warn('Chat listener error:', e); }
  });
};

// ─── Supabase helpers ─────────────────────────────────────────────────────────

/** Map a DB conversations row → app conversation shape */
function dbConvToApp(row, messages = []) {
  return {
    id: row.id,
    productId: row.product_id,
    craft: row.craft,
    product: row.product || {},
    sender: row.buyer,
    buyer: row.buyer,
    artisan: row.artisan,
    avatar: row.avatar,
    role: row.role,
    lastMessage: row.last_message,
    time: row.time,
    unread: row.unread,
    messages: messages.map((m) => ({
      id: m.id,
      sender: m.sender,
      senderName: m.sender_name,
      text: m.text,
      time: m.time,
      timestamp: m.timestamp,
    })),
  };
}

/** Upsert a conversation row */
async function upsertConversation(conv) {
  if (!isSupabaseConfigured || !supabaseAdmin) return;
  const { error } = await supabaseAdmin.from('conversations').upsert({
    id: conv.id,
    product_id: conv.productId || conv.product_id || null,
    craft: conv.craft,
    product: conv.product || null,
    buyer: conv.buyer || conv.sender,
    artisan: conv.artisan,
    avatar: conv.avatar,
    role: conv.role,
    last_message: conv.lastMessage,
    time: conv.time,
    unread: conv.unread || false,
    updated_at: new Date().toISOString(),
  });
  if (error) console.warn('[chatService] upsertConversation error:', error.message);
}

/** Insert a single message row */
async function insertMessage(convId, msg) {
  if (!isSupabaseConfigured || !supabaseAdmin) return;
  const { error } = await supabaseAdmin.from('messages').insert({
    id: msg.id,
    conversation_id: convId,
    sender: msg.sender,
    sender_name: msg.senderName,
    text: msg.text,
    time: msg.time,
    timestamp: msg.timestamp,
  });
  if (error) console.warn('[chatService] insertMessage error:', error.message);
}

// ─── Chat Service ─────────────────────────────────────────────────────────────
export const chatService = {
  subscribe(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  async getConversations() {
    await ensureSchema();

    // Try Supabase first
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: convRows, error } = await supabaseAdmin
          .from('conversations')
          .select('*')
          .order('updated_at', { ascending: false });

        if (!error && convRows && convRows.length > 0) {
          // Fetch all messages for these conversations
          const convIds = convRows.map((r) => r.id);
          const { data: msgRows } = await supabaseAdmin
            .from('messages')
            .select('*')
            .in('conversation_id', convIds)
            .order('timestamp', { ascending: true });

          const msgsByConv = {};
          (msgRows || []).forEach((m) => {
            if (!msgsByConv[m.conversation_id]) msgsByConv[m.conversation_id] = [];
            msgsByConv[m.conversation_id].push(m);
          });

          const conversations = convRows.map((row) =>
            dbConvToApp(row, msgsByConv[row.id] || [])
          );

          // Sync to local storage as cache
          await safeStorage.setItem(STORAGE_KEY, conversations);
          return conversations;
        }
      } catch (e) {
        console.warn('[chatService] getConversations from Supabase error:', e.message);
      }
    }

    // Fallback: local storage
    try {
      const stored = await safeStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[chatService] Error reading local chats:', e);
    }

    // Seed defaults and persist them
    await this._seedDefaults();
    return SEED_CONVERSATIONS;
  },

  async _seedDefaults() {
    await ensureSchema();
    // Write seed conversations to Supabase
    for (const conv of SEED_CONVERSATIONS) {
      await upsertConversation(conv);
      for (const msg of conv.messages || []) {
        await insertMessage(conv.id, { ...msg, senderName: msg.senderName });
      }
    }
    await safeStorage.setItem(STORAGE_KEY, SEED_CONVERSATIONS);
  },

  async getConversationById(id) {
    await ensureSchema();

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: row, error } = await supabaseAdmin
          .from('conversations')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && row) {
          const { data: msgRows } = await supabaseAdmin
            .from('messages')
            .select('*')
            .eq('conversation_id', id)
            .order('timestamp', { ascending: true });

          return dbConvToApp(row, msgRows || []);
        }
      } catch (e) {
        console.warn('[chatService] getConversationById error:', e.message);
      }
    }

    const list = await this.getConversations();
    return list.find((c) => c.id === id) || null;
  },

  /**
   * Find or create a conversation tied to a specific product
   */
  async getOrCreateConversationForProduct(product, buyerName = 'Buyer', artisanName = null) {
    if (!product) return null;
    await ensureSchema();

    const prodId = String(product.id || '');
    const prodTitle = product.title || product.name || 'Handcrafted Craft';
    const effectiveArtisan = artisanName || product.artisan || product.store || 'Master Artisan';

    // Try to find existing in Supabase
    if (isSupabaseConfigured && supabaseAdmin && prodId) {
      try {
        const { data: existing } = await supabaseAdmin
          .from('conversations')
          .select('*')
          .eq('product_id', prodId)
          .maybeSingle();

        if (existing) {
          const { data: msgRows } = await supabaseAdmin
            .from('messages')
            .select('*')
            .eq('conversation_id', existing.id)
            .order('timestamp', { ascending: true });
          return dbConvToApp(existing, msgRows || []);
        }
      } catch (e) {
        console.warn('[chatService] getOrCreate lookup error:', e.message);
      }
    }

    // Fallback: check local list
    const list = await this.getConversations();
    const localExisting = list.find(
      (c) =>
        (prodId && String(c.productId) === prodId) ||
        (c.craft && c.craft.toLowerCase() === prodTitle.toLowerCase())
    );
    if (localExisting) return localExisting;

    // Create new conversation
    const newChatId = `chat-prod-${prodId || Date.now()}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const introMsg = {
      id: `msg-${Date.now()}-intro`,
      sender: 'maker',
      senderName: effectiveArtisan,
      text: `Ayubowan! Thank you for your interest in "${prodTitle}". I am here to help with questions about materials, custom dimensions, or delivery!`,
      time: timeStr,
      timestamp: Date.now(),
    };

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
      messages: [introMsg],
    };

    // Persist to Supabase
    await upsertConversation(newConversation);
    await insertMessage(newConversation.id, introMsg);

    // Update local cache
    const updated = [newConversation, ...list];
    await safeStorage.setItem(STORAGE_KEY, updated);
    notifyListeners();
    return newConversation;
  },

  /**
   * Send a new message (buyer or artisan)
   */
  async sendMessage(conversationId, { sender, senderName, text }) {
    if (!conversationId || !text || !text.trim()) return null;
    await ensureSchema();

    const conv = await this.getConversationById(conversationId);
    if (!conv) {
      console.warn('[chatService] Conversation not found:', conversationId);
      return null;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const newMsg = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sender: sender || 'buyer',
      senderName: senderName || (sender === 'maker' ? conv.artisan : conv.buyer),
      text: text.trim(),
      time: timeStr,
      timestamp: Date.now(),
    };

    const isBuyer = (sender || '').toLowerCase() === 'buyer';
    const updatedConv = {
      ...conv,
      messages: [...(conv.messages || []), newMsg],
      lastMessage: text.trim(),
      time: 'Just now',
      unread: isBuyer,
    };

    // Persist message + update conversation in Supabase
    await insertMessage(conversationId, newMsg);
    await upsertConversation(updatedConv);

    // Update local cache
    const list = await this.getConversations();
    const updatedList = [updatedConv, ...list.filter((c) => c.id !== conversationId)];
    await safeStorage.setItem(STORAGE_KEY, updatedList);
    notifyListeners();

    return { conversation: updatedConv, message: newMsg };
  },

  async markAsRead(conversationId) {
    await ensureSchema();

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin
          .from('conversations')
          .update({ unread: false })
          .eq('id', conversationId);
      } catch (e) {
        console.warn('[chatService] markAsRead error:', e.message);
      }
    }

    const list = await this.getConversations();
    const updatedList = list.map((c) =>
      c.id === conversationId ? { ...c, unread: false } : c
    );
    await safeStorage.setItem(STORAGE_KEY, updatedList);
    notifyListeners();
  },
};
