import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_FALLBACK_URL = 'https://dgwcwxfjuvelnsusninc.supabase.co';
const SUPABASE_FALLBACK_ANON_KEY = 'sb_publishable_KnB81ypFNj1SbOt_PlT7xA_wuZZRvHZ';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || SUPABASE_FALLBACK_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_FALLBACK_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-ref') &&
  !supabaseAnonKey.includes('your-anon-public-key')
);

// Resilient storage adapter that prevents "Native module is null" crashes in Expo
const memoryStorage = new Map();

const safeStorage = {
  getItem: async (key) => {
    try {
      if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
        const val = await AsyncStorage.getItem(key);
        return val;
      }
    } catch (e) {
      // Native module not linked or null in current Expo environment
    }
    return memoryStorage.has(key) ? memoryStorage.get(key) : null;
  },
  setItem: async (key, value) => {
    try {
      if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
        await AsyncStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      // Native module not linked or null in current Expo environment
    }
    memoryStorage.set(key, value);
  },
  removeItem: async (key) => {
    try {
      if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
        await AsyncStorage.removeItem(key);
        return;
      }
    } catch (e) {
      // Native module not linked or null in current Expo environment
    }
    memoryStorage.delete(key);
  },
};

// Supabase client with resilient storage adapter
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: safeStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
