import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors, typography } from '../theme/globalStyles';

// Screens
import FlashcardsHomeScreen from '../screens/Flashcards/FlashcardsHomeScreen';
import CreateDeckScreen from '../screens/Flashcards/CreateDeckScreen';
import DeckDetailScreen from '../screens/Flashcards/DeckDetailScreen';
import AddCardScreen from '../screens/Flashcards/AddCardScreen';
import StudyModeScreen from '../screens/Flashcards/StudyModeScreen';

const Stack = createStackNavigator();

const FlashcardsNavigator = () => {
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
        name="FlashcardsHome"
        component={FlashcardsHomeScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CreateDeck"
        component={CreateDeckScreen}
        options={{
          title: 'Criar Deck',
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="DeckDetail"
        component={DeckDetailScreen}
        options={{
          title: 'Detalhes do Deck',
        }}
      />

      <Stack.Screen
        name="AddCard"
        component={AddCardScreen}
        options={{
          title: 'Adicionar Card',
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="StudyMode"
        component={StudyModeScreen}
        options={{
          title: 'Modo de Estudo',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default FlashcardsNavigator;
