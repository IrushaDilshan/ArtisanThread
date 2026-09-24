import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from './routes';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { WelcomeBackScreen } from '../screens/auth/WelcomeBackScreen';
import { OTPVerificationScreen } from '../screens/auth/OTPVerificationScreen';
import { CreateAccountScreen } from '../screens/auth/CreateAccountScreen';
import { ChooseRoleScreen } from '../screens/auth/ChooseRoleScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { COLORS } from '../constants/colors';

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.AUTH.ONBOARDING}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFFFFF' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name={ROUTES.AUTH.ONBOARDING} component={OnboardingScreen} />
      <Stack.Screen name={ROUTES.AUTH.WELCOME_BACK} component={WelcomeBackScreen} />
      <Stack.Screen name={ROUTES.AUTH.LOGIN} component={WelcomeBackScreen} />
      <Stack.Screen name={ROUTES.AUTH.OTP_VERIFICATION} component={OTPVerificationScreen} />
      <Stack.Screen name={ROUTES.AUTH.CREATE_ACCOUNT} component={CreateAccountScreen} />
      <Stack.Screen name={ROUTES.AUTH.CHOOSE_ROLE} component={ChooseRoleScreen} />
      <Stack.Screen name="LoginRolePicker" component={LoginScreen} />
      <Stack.Screen name={ROUTES.AUTH.REGISTER} component={RegisterScreen} />
      <Stack.Screen name={ROUTES.AUTH.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
