import { supabase, isSupabaseConfigured } from './supabase';
import { ROLES } from '../navigation/routes';

/**
 * Format local or international phone numbers to standard E.164 (e.g. +94774126688)
 */
export const formatE164Phone = (phone) => {
  if (!phone) return '';
  const digitsOnly = phone.replace(/[^0-9+]/g, '');
  if (digitsOnly.startsWith('+')) return digitsOnly;
  if (digitsOnly.startsWith('0')) return `+94${digitsOnly.slice(1)}`;
  if (digitsOnly.length === 9) return `+94${digitsOnly}`;
  return `+${digitsOnly}`;
};

export const authService = {
  /**
   * Send real SMS OTP to phone number using Supabase Phone Auth
   */
  async sendPhoneOtp(phone) {
    if (!isSupabaseConfigured || !supabase) {
      return { success: true, formattedPhone: formatE164Phone(phone), demo: true };
    }

    const formattedPhone = formatE164Phone(phone);
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });

    if (error) throw error;
    return { data, formattedPhone };
  },

  /**
   * Verify real SMS OTP token with Supabase Auth
   */
  async verifyPhoneOtp(phone, token) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client is not configured. Please check your .env credentials.');
    }

    const formattedPhone = formatE164Phone(phone);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: token.trim(),
      type: 'sms',
    });

    if (error) throw error;

    let profile = null;
    if (data?.user?.id) {
      profile = await this.getProfile(data.user.id);
    }

    return { ...data, profile };
  },

  /**
   * Check if a phone number is registered in the database profiles
   */
  async checkPhoneRegistered(phone) {
    if (!isSupabaseConfigured || !supabase || !phone) return null;

    const formatted = formatE164Phone(phone);
    const digitsOnly = phone.replace(/[^0-9]/g, '');
    const localNumber = digitsOnly.startsWith('94') ? `0${digitsOnly.slice(2)}` : digitsOnly;
    const intlNoPlus = formatted.replace('+', '');

    try {
      // 1. Direct match on phone column
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`phone.eq.${formatted},phone.eq.${localNumber},phone.eq.${digitsOnly},phone.eq.${intlNoPlus}`);

      if (!error && data && data.length > 0) {
        return data[0];
      }

      // 2. Fallback: match inside metadata JSONB or full scan comparison
      const { data: allProfiles } = await supabase.from('profiles').select('*');
      if (allProfiles && allProfiles.length > 0) {
        const found = allProfiles.find((p) => {
          const stored = (p.phone || p.metadata?.phone || '').replace(/[^0-9]/g, '');
          if (!stored || stored.length < 5) return false;
          return (
            stored === digitsOnly ||
            stored.endsWith(digitsOnly) ||
            digitsOnly.endsWith(stored) ||
            stored === localNumber ||
            stored === intlNoPlus
          );
        });
        if (found) return found;
      }

      return null;
    } catch (err) {
      console.warn('checkPhoneRegistered warning:', err.message);
      return null;
    }
  },

  /**
   * Register a new user with Supabase Auth and assign their role
   */
  async register({ email, password, fullName, role = ROLES.BUYER, metadata = {} }) {
    if (!isSupabaseConfigured) {
      return {
        user: { id: `mock_${Date.now()}`, email, full_name: fullName, role, ...metadata },
        error: null,
      };
    }

    const phoneValue = metadata.phone || '';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          phone: phoneValue,
          metadata,
        },
      },
    });

    if (error) throw error;

    // Explicitly update profile in public.profiles table so phone and details are saved
    if (data?.user?.id) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          phone: phoneValue,
          full_name: fullName,
          role: role.toUpperCase(),
          metadata,
        });
      } catch (err) {
        console.warn('Profile upsert warning:', err.message);
      }
    }

    // Sign out from initial signup session so user must log in through phone OTP verification
    try {
      await supabase.auth.signOut();
    } catch (e) {}

    return data;
  },

  /**
   * Log in with Email and Password
   */
  async login({ email, password }) {
    if (!isSupabaseConfigured) {
      return { user: null, session: null, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Fetch user profile from 'profiles' table
    const profile = await this.getProfile(data.user.id);
    return { ...data, profile };
  },

  /**
   * Log out current session
   */
  async logout() {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get active user session
   */
  async getSession() {
    if (!isSupabaseConfigured) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Fetch user profile from public.profiles
   */
  async getProfile(userId) {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('Error fetching profile:', error.message);
    }
    return data;
  },

  /**
   * Update profile details
   */
  async updateProfile(userId, updates) {
    if (!isSupabaseConfigured) return updates;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Fetch all registered courier partners from the database profiles with offline fallback
   */
  async getRegisteredCouriers() {
    const defaultCouriers = [
      {
        id: '5de2dd7b-8e12-4901-8979-7f5520dc2a31',
        full_name: 'irusha',
        phone: '0777777777',
        badge: 'Express Delivery Partner',
        location: 'Kalutara & Suburbs',
        vehicle: 'Electric Cargo Van #402',
        rating: '4.9 ★',
      },
      {
        id: 'c91d74af-47f7-4d01-888a-cfbb1e9b9eec',
        full_name: 'kasun',
        phone: '0999999999',
        badge: 'Priority Dispatcher',
        location: 'Colombo 03 & Greater Colombo',
        vehicle: 'Hero Dawn 125 Bike',
        rating: '4.8 ★',
      },
      {
        id: '8b112de3-193c-40d0-b7ba-2adfd02748bb',
        full_name: 'ruwan',
        phone: '0766666666',
        badge: 'Regional Carrier',
        location: 'Galle & Southern Belt',
        vehicle: 'Tuk-Tuk Cargo Carrier',
        rating: '4.7 ★',
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        full_name: 'Kavinda Fernando',
        phone: '+94 77 234 5678',
        badge: 'Eco Express Partner',
        location: 'Western Coastal Route',
        vehicle: 'Electric Cargo Van #402',
        rating: '4.9 ★',
      },
      {
        id: 'usr_courier_01',
        full_name: 'Marcus Vance',
        phone: '+94 77 123 4567',
        badge: 'High-Volume Carrier',
        location: 'Kandy & Central Zone',
        vehicle: 'Cargo Van Express',
        rating: '4.95 ★',
      },
    ];

    if (!isSupabaseConfigured || !supabase) {
      return defaultCouriers;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('role', 'courier');

      if (!error && data && data.length > 0) {
        // Map Supabase profiles and merge with default details
        const combined = [...data.map((c) => {
          const match = defaultCouriers.find(
            (f) =>
              f.id === c.id ||
              (f.phone && c.phone && f.phone.replace(/[^0-9]/g, '') === c.phone.replace(/[^0-9]/g, '')) ||
              (f.full_name && c.full_name && f.full_name.toLowerCase() === c.full_name.toLowerCase())
          );
          return {
            id: c.id,
            full_name: c.full_name || match?.full_name || 'Courier Partner',
            phone: c.phone || match?.phone || '0770000000',
            badge: c.badge || match?.badge || 'Verified Courier',
            location: c.location || match?.location || 'Western Province',
            vehicle: c.metadata?.vehicle || match?.vehicle || 'Delivery Van',
            rating: c.metadata?.rating || match?.rating || '4.8 ★',
          };
        })];

        // Also ensure default couriers (like irusha / kasun / ruwan) exist in the list
        for (const def of defaultCouriers) {
          if (!combined.some(c => c.id === def.id || (c.full_name && c.full_name.toLowerCase() === def.full_name.toLowerCase()))) {
            combined.push(def);
          }
        }
        return combined;
      }
    } catch (err) {
      console.warn('getRegisteredCouriers notice:', err.message);
    }

    return defaultCouriers;
  },
};
