import React, { createContext, useContext, useState } from 'react';
import { ROLES } from '../navigation/routes';

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  role: null,
  login: () => {},
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
  // Start unauthenticated so user sees the Auth/Login screen with Role switcher
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  const login = (selectedRole = ROLES.BUYER, customData = {}) => {
    const defaultData = DEFAULT_USERS[selectedRole] || DEFAULT_USERS[ROLES.BUYER];
    setUser({ ...defaultData, ...customData });
    setRole(selectedRole);
    setIsAuthenticated(true);
  };

  const logout = () => {
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
        login,
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
