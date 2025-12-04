import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './BottomTabNavigator';
import { colors } from '../theme/globalStyles';

const Stack = createStackNavigator();

const AppNavigator = () => {
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
        {/* Main Tab Navigator */}
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

        {/*
          Adicionar telas de navegação futuras aqui:
          - Detalhes de Fluxo
          - Criar/Editar Fluxo
          - Revisar Flashcards
          - Detalhes de Tarefa
          - Modo de Foco
          - etc.
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
