/**
 * MindinLine - App para pessoas com TDAH
 * Desenvolvimento vibe-coding no Termux
 *
 * @format
 */

import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme/globalStyles';
import { TrilhasProvider } from './src/context/TrilhasContext';
import { FlashcardsProvider } from './src/context/FlashcardsContext';
import { TasksProvider } from './src/context/TasksContext';
import { TimelineProvider } from './src/context/TimelineContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <SettingsProvider>
            <TrilhasProvider>
              <FlashcardsProvider>
                <TasksProvider>
                  <TimelineProvider>
                    <StatusBar
                      barStyle="light-content"
                      backgroundColor={colors.background.primary}
                      translucent={false}
                    />
                    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={['top']}>
                      <AppNavigator />
                    </SafeAreaView>
                  </TimelineProvider>
                </TasksProvider>
              </FlashcardsProvider>
            </TrilhasProvider>
          </SettingsProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

export default App;
