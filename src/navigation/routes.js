/**
 * Application Navigation Route Constants
 */

export const ROUTES = {
  // Shared Auth Flow
  AUTH: {
    ROOT: 'AuthRoot',
    ONBOARDING: 'Onboarding',
    WELCOME_BACK: 'WelcomeBack',
    OTP_VERIFICATION: 'OTPVerification',
    CREATE_ACCOUNT: 'CreateAccount',
    CHOOSE_ROLE: 'ChooseRole',
    LOGIN: 'Login',
    REGISTER: 'Register',
    FORGOT_PASSWORD: 'ForgotPassword',
  },

  // Role: Buyer
  BUYER: {
    ROOT: 'BuyerRoot',
    HOME: 'BuyerHome',
    ORDERS: 'BuyerOrders',
    PROFILE: 'BuyerProfile',
  },

  // Role: Artisan
  ARTISAN: {
    ROOT: 'ArtisanRoot',
    DASHBOARD: 'ArtisanDashboard',
    PRODUCTS: 'ArtisanProducts',
    ORDERS: 'ArtisanOrders',
    PROFILE: 'ArtisanProfile',
  },

  // Role: Courier
  COURIER: {
    ROOT: 'CourierRoot',
    DELIVERIES: 'CourierDeliveries',
    ROUTES: 'CourierRoutes',
    EARNINGS: 'CourierEarnings',
    PROFILE: 'CourierProfile',
  },
};

export const ROLES = {
  BUYER: 'buyer',
  ARTISAN: 'artisan',
  COURIER: 'courier',
};
