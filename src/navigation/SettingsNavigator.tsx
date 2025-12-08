import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors, typography } from '../theme/globalStyles';

// Screens
import SettingsScreen from '../screens/Settings/SettingsScreen';
import FocusModeSettingsScreen from '../screens/Settings/FocusModeSettingsScreen';
import TasksSettingsScreen from '../screens/Settings/TasksSettingsScreen';
import FlashcardsSettingsScreen from '../screens/Settings/FlashcardsSettingsScreen';
import FlowKeeperSettingsScreen from '../screens/Settings/FlowKeeperSettingsScreen';

const Stack = createStackNavigator();

const SettingsNavigator = () => {
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
        name="SettingsHome"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FocusModeSettings"
        component={FocusModeSettingsScreen}
        options={{ title: 'Focus Mode' }}
      />
      <Stack.Screen
        name="TasksSettings"
        component={TasksSettingsScreen}
        options={{ title: 'Tarefas' }}
      />
      <Stack.Screen
        name="FlashcardsSettings"
        component={FlashcardsSettingsScreen}
        options={{ title: 'Flashcards' }}
      />
      <Stack.Screen
        name="FlowKeeperSettings"
        component={FlowKeeperSettingsScreen}
        options={{ title: 'FlowKeeper' }}
      />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
