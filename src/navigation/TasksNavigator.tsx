import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors, typography } from '../theme/globalStyles';

// Screens
import TasksHomeScreen from '../screens/Tasks/TasksHomeScreen';
import CreateTaskScreen from '../screens/Tasks/CreateTaskScreen';
import TaskDetailScreen from '../screens/Tasks/TaskDetailScreen';
import FocusModeScreen from '../screens/Tasks/FocusModeScreen';

const Stack = createStackNavigator();

const TasksNavigator = () => {
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
        name="TasksHome"
        component={TasksHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{ title: 'Nova Tarefa' }}
      />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{ title: 'Detalhes da Tarefa' }}
      />
      <Stack.Screen
        name="FocusMode"
        component={FocusModeScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default TasksNavigator;
