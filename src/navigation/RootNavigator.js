import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { ROUTES, ROLES } from './routes';
import { AuthNavigator } from './AuthNavigator';
import { BuyerNavigator } from './BuyerNavigator';
import { ArtisanNavigator } from './ArtisanNavigator';
import { CourierNavigator } from './CourierNavigator';
import { COLORS } from '../constants/colors';

const Stack = createNativeStackNavigator();

const NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.textPrimary,
    border: COLORS.borderLight,
    notification: COLORS.primaryLight,
  },
};

export const RootNavigator = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <NavigationContainer theme={NavigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!isAuthenticated ? (
          // Shared Authentication Flow (Login, Register, Forgot Password)
          <Stack.Screen name={ROUTES.AUTH.ROOT} component={AuthNavigator} />
        ) : role === ROLES.ARTISAN ? (
          // Artisan Role Navigator
          <Stack.Screen name={ROUTES.ARTISAN.ROOT} component={ArtisanNavigator} />
        ) : role === ROLES.COURIER ? (
          // Courier Role Navigator
          <Stack.Screen name={ROUTES.COURIER.ROOT} component={CourierNavigator} />
        ) : (
          // Default Role: Buyer Navigator
          <Stack.Screen name={ROUTES.BUYER.ROOT} component={BuyerNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
