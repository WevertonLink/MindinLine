import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomTabNavigator from './BottomTabNavigator';
import WelcomeScreen from '../screens/Welcome/WelcomeScreen';
import { colors } from '../theme/globalStyles';

const Stack = createStackNavigator();
const ONBOARDING_KEY = '@MindinLine:onboarding_completed';

const AppNavigator = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasCompletedOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);
      setIsFirstLaunch(hasCompletedOnboarding === null);
    } catch (error) {
      setIsFirstLaunch(true);
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setIsFirstLaunch(false);
    } catch (error) {
      console.error('Erro ao salvar onboarding:', error);
    }
  };

  // Aguardar verificação do onboarding
  if (isFirstLaunch === null) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: {
            backgroundColor: colors.background.primary,
          },
        }}
      >
        {isFirstLaunch ? (
          <Stack.Screen name="Welcome">
            {() => (
              <WelcomeScreen
                onContinueAsGuest={handleCompleteOnboarding}
                onSignUp={handleCompleteOnboarding}
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
