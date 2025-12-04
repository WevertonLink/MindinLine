import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

// Navigators & Screens
import FlowKeeperNavigator from './FlowKeeperNavigator';
import FlashcardsNavigator from './FlashcardsNavigator';
import TasksNavigator from './TasksNavigator';
import SettingsNavigator from './SettingsNavigator';
import TimelineScreen from '../screens/Timeline/TimelineScreen';

// Theme
import { colors, spacing, typography } from '../theme/globalStyles';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        // Header style
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

        // Tab bar style com SafeArea
        tabBarStyle: {
          backgroundColor: 'rgba(10, 14, 39, 0.95)',
          borderTopWidth: 1,
          borderTopColor: colors.glass.border,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: spacing.sm,
        },
        tabBarActiveTintColor: colors.accent.primary,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.4)',
        tabBarLabelStyle: {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium,
        },
      }}
    >
      {/* Flashcards Tab - PRIMEIRA (principal) */}
      <Tab.Screen
        name="FlashcardsTab"
        component={FlashcardsNavigator}
        options={{
          headerShown: false,
          tabBarLabel: 'Flashcards',
          tabBarIcon: ({ color, size }) => (
            <Icon name="layers-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Trilhas de Estudo Tab */}
      <Tab.Screen
        name="FlowKeeperTab"
        component={FlowKeeperNavigator}
        options={{
          headerShown: false,
          tabBarLabel: 'Trilhas',
          tabBarIcon: ({ color, size}) => (
            <Icon name="map-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Tasks Tab */}
      <Tab.Screen
        name="TasksTab"
        component={TasksNavigator}
        options={{
          headerShown: false,
          tabBarLabel: 'Tarefas',
          tabBarIcon: ({ color, size }) => (
            <Icon name="checkmark-circle-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Timeline Tab */}
      <Tab.Screen
        name="TimelineTab"
        component={TimelineScreen}
        options={{
          title: 'Timeline',
          tabBarLabel: 'Linha',
          tabBarIcon: ({ color, size }) => (
            <Icon name="time-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Settings Tab */}
      <Tab.Screen
        name="SettingsTab"
        component={SettingsNavigator}
        options={{
          headerShown: false,
          tabBarLabel: 'Config',
          tabBarIcon: ({ color, size }) => (
            <Icon name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  // Estilos adicionais se necessário
});

export default BottomTabNavigator;
