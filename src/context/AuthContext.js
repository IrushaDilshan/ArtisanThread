import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES } from '../navigation/routes';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { authService } from '../services/authService';

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  role: null,
  isLoading: true,
  isLiveBackend: false,
  login: () => {},
  register: () => {},
  logout: () => {},
  switchRole: () => {},
});

const DEFAULT_USERS = {
  [ROLES.BUYER]: {
    id: 'usr_buyer_01',
    name: 'Maya Lin',
    email: 'maya.buyer@artisanthread.com',
    role: ROLES.BUYER,
    avatar: 'ML',
    badge: 'Connoisseur',
    location: 'Portland, OR',
  },
  [ROLES.ARTISAN]: {
    id: 'usr_artisan_01',
    name: 'Kenji Takahashi',
    atelierName: 'Takahashi Handloom & Indigo',
    email: 'kenji.artisan@artisanthread.com',
    role: ROLES.ARTISAN,
    avatar: 'KT',
    badge: 'Master Weaver',
    location: 'Kyoto / San Francisco Studio',
  },
  [ROLES.COURIER]: {
    id: 'usr_courier_01',
    name: 'Marcus Vance',
    email: 'marcus.courier@artisanthread.com',
    role: ROLES.COURIER,
    avatar: 'MV',
    vehicle: 'Electric Cargo Van #402',
    badge: 'Eco Express Partner',
    rating: '4.98 ★',
  },
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check existing session on startup if Supabase is configured
  useEffect(() => {
    let authListener = null;

    const restoreSession = async () => {
      try {
        if (!isSupabaseConfigured) {
          setIsLoading(false);
          return;
        }

        const session = await authService.getSession();
        if (session?.user) {
          const profile = await authService.getProfile(session.user.id);
          const userRole = profile?.role || session.user.user_metadata?.role || ROLES.BUYER;
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: profile?.full_name || session.user.user_metadata?.full_name,
            role: userRole,
            ...profile,
          });
          setRole(userRole);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.warn('Session restoration notice:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();

    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setRole(null);
          setIsAuthenticated(false);
        }
      });
      authListener = data.subscription;
    }

    return () => {
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  /**
   * Login can either be called with credentials (for real backend):
  /**
   * Set user session after successful backend verification
   */
  const setAuthenticatedUser = (authUser, userProfile = {}) => {
    if (!authUser) {
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);
      return;
    }
    const userRole = (userProfile?.role || authUser.user_metadata?.role || ROLES.BUYER).toLowerCase();
    setUser({
      id: authUser.id,
      email: authUser.email,
      name: userProfile?.full_name || authUser.user_metadata?.full_name || 'Artisan Member',
      role: userRole,
      ...userProfile,
    });
    setRole(userRole);
    setIsAuthenticated(true);
  };

  /**
   * Login can either be called with credentials (for real backend):
   *   login({ email, password })
   * Or with a role string (for quick testing/demo):
   *   login(ROLES.BUYER)
   */
  const login = async (arg1 = ROLES.BUYER, customData = {}) => {
    // If called with real credentials:
    if (typeof arg1 === 'object' && arg1.email && arg1.password) {
      try {
        const data = await authService.login({ email: arg1.email, password: arg1.password });
        if (!data?.user) {
          throw new Error('Authentication failed. No active session returned.');
        }
        setAuthenticatedUser(data.user, data.profile);
        return data;
      } catch (loginError) {
        if (loginError.message?.includes('Email not confirmed')) {
          // Bypass email confirmation: fetch profile and authenticate immediately
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', arg1.email.trim())
            .single();

          if (profile) {
            setAuthenticatedUser({ id: profile.id, email: profile.email }, profile);
            return { user: { id: profile.id, email: profile.email }, profile };
          }
        }
        throw loginError;
      }
    }

    // Direct role/profile setting
    if (typeof arg1 === 'object' && arg1.id) {
      setAuthenticatedUser(arg1, customData);
      return;
    }

    const selectedRole = typeof arg1 === 'string' ? arg1.toLowerCase() : ROLES.BUYER;
    const defaultData = DEFAULT_USERS[selectedRole] || DEFAULT_USERS[ROLES.BUYER];
    setUser({ ...defaultData, ...customData });
    setRole(selectedRole);
    setIsAuthenticated(true);
  };

  /**
   * Register with real Supabase Auth
   */
  const register = async ({ email, password, fullName, role = ROLES.BUYER, metadata = {} }) => {
    const data = await authService.register({ email, password, fullName, role, metadata });
    if (data?.user) {
      if (data?.session) {
        setAuthenticatedUser(data.user, { role: role.toLowerCase(), full_name: fullName, ...metadata });
        return;
      }
      try {
        await login({ email, password });
      } catch (loginErr) {
        // No email confirmation needed: bypass and log in directly
        const profile = await authService.getProfile(data.user.id);
        setAuthenticatedUser(data.user, profile || { role: role.toLowerCase(), full_name: fullName, email, ...metadata });
      }
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await authService.logout();
      } catch (e) {
        console.warn('Logout notice:', e.message);
      }
    }
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  const switchRole = (newRole) => {
    if (DEFAULT_USERS[newRole]) {
      setUser(DEFAULT_USERS[newRole]);
      setRole(newRole);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        role,
        isLoading,
        isLiveBackend: isSupabaseConfigured,
        login,
        setAuthenticatedUser,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
