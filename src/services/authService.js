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
};
