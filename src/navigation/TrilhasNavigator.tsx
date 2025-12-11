import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors, typography } from '../theme/globalStyles';

// Screens
import TrilhasHomeScreen from '../screens/Trilhas/TrilhasHomeScreen';
import CreateTrilhaScreen from '../screens/Trilhas/CreateTrilhaScreen';
import TrilhaDetailScreen from '../screens/Trilhas/TrilhaDetailScreen';
import StepDetailScreen from '../screens/Trilhas/StepDetailScreen';
import EditStepScreen from '../screens/Trilhas/EditStepScreen';

const Stack = createStackNavigator();

const TrilhasNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background.primary,
          borderBottomWidth: 1,
          borderBottomColor: colors.glass.border,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: typography.fontWeight.bold,
          fontSize: typography.fontSize.lg,
        },
      }}
    >
      <Stack.Screen
        name="TrilhasHome"
        component={TrilhasHomeScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CreateTrilha"
        component={CreateTrilhaScreen}
        options={{
          title: 'Criar Trilha',
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="TrilhaDetail"
        component={TrilhaDetailScreen}
        options={{
          title: 'Detalhes da Trilha',
        }}
      />

      <Stack.Screen
        name="StepDetail"
        component={StepDetailScreen}
        options={{
          title: 'Detalhes da Etapa',
        }}
      />

      <Stack.Screen
        name="EditStep"
        component={EditStepScreen}
        options={{
          title: 'Editar Etapa',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

export default TrilhasNavigator;
