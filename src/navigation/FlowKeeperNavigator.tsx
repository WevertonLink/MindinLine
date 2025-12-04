import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors, typography } from '../theme/globalStyles';

// Screens
import FlowKeeperHomeScreen from '../screens/FlowKeeper/FlowKeeperHomeScreen';
import CreateFlowScreen from '../screens/FlowKeeper/CreateFlowScreen';
import FlowDetailScreen from '../screens/FlowKeeper/FlowDetailScreen';
import StepDetailScreen from '../screens/FlowKeeper/StepDetailScreen';
import EditStepScreen from '../screens/FlowKeeper/EditStepScreen';

const Stack = createStackNavigator();

const FlowKeeperNavigator = () => {
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
        name="FlowKeeperHome"
        component={FlowKeeperHomeScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CreateFlow"
        component={CreateFlowScreen}
        options={{
          title: 'Criar Fluxo',
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="FlowDetail"
        component={FlowDetailScreen}
        options={{
          title: 'Detalhes do Fluxo',
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

export default FlowKeeperNavigator;
