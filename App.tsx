/**
 * MindinLine - App para pessoas com TDAH
 * Desenvolvimento vibe-coding no Termux
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme/globalStyles';
import { FlowKeeperProvider } from './src/context/FlowKeeperContext';
import { FlashcardsProvider } from './src/context/FlashcardsContext';
import { TasksProvider } from './src/context/TasksContext';
import { TimelineProvider } from './src/context/TimelineContext';
import { SettingsProvider } from './src/context/SettingsContext';

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <FlowKeeperProvider>
            <FlashcardsProvider>
              <TasksProvider>
                <TimelineProvider>
                  <StatusBar
                    barStyle="light-content"
                    backgroundColor={colors.background.primary}
                    translucent={false}
                  />
                  <AppNavigator />
                </TimelineProvider>
              </TasksProvider>
            </FlashcardsProvider>
          </FlowKeeperProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
