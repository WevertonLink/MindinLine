import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import {
  Settings,
  UpdateSettingsInput,
  ExportData,
  UsageStats,
} from '../features/settings/types';

// ==========================================
// ✅ SETTINGS CONTEXT
// ==========================================

const STORAGE_KEY = '@MindinLine:settings';
const USAGE_STATS_KEY = '@MindinLine:usage_stats';

// Configurações padrão
const DEFAULT_SETTINGS: Settings = {
  app: {
    theme: 'glassmorphism_deep',
    language: 'pt-BR',
    notificationsEnabled: true,
    notifyOnStreakBreak: true,
    notifyOnTaskDue: true,
    notifyOnReviewDue: true,
    soundEnabled: true,
    soundVolume: 80,
    analyticsEnabled: true,
    crashReportsEnabled: true,
  },
  focusMode: {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreak: false,
    autoStartFocus: false,
    soundEnabled: true,
    vibrationEnabled: true,
  },
  flashcards: {
    cardsPerSession: 20,
    showAnswerTime: 3,
    easyBonusDays: 2,
    hardPenaltyDays: 1,
    shuffleCards: true,
    autoPlayAudio: false,
  },
  tasks: {
    defaultPriority: 'medium',
    showCompletedTasks: true,
    autoArchiveCompletedDays: 30,
    enableRecurringTasks: true,
    defaultReminderMinutes: 60,
  },
  flowKeeper: {
    autoPlayNextStep: false,
    markMaterialAsCompletedOnView: false,
    defaultStepDuration: 30,
    showProgressBar: true,
  },
  timeline: {
    goalActivitiesPerDay: 5,
    goalFocusMinutesPerDay: 120,
    showDetailedStats: true,
    groupActivitiesByDay: true,
  },
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
};

interface SettingsContextData {
  // Estado
  settings: Settings;
  usageStats: UsageStats | null;
  loading: boolean;

  // Atualizar configurações
  updateSettings: (input: UpdateSettingsInput) => Promise<void>;
  resetSettings: () => Promise<void>;
  resetSection: (section: keyof Omit<Settings, 'version' | 'lastUpdated'>) => Promise<void>;

  // Export/Import
  exportData: () => Promise<ExportData>;
  importData: (data: ExportData) => Promise<void>;
  clearAllData: () => Promise<void>;

  // Usage Stats
  updateUsageStats: () => Promise<void>;

  // Utilitários
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextData>({} as SettingsContextData);

// ==========================================
// 🔧 PROVIDER
// ==========================================

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar settings ao iniciar
  useEffect(() => {
    loadSettingsFromStorage();
    loadUsageStatsFromStorage();
    updateUsageStats();
  }, []);

  // ==========================================
  // STORAGE
  // ==========================================

  const loadSettingsFromStorage = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge com defaults para garantir novos campos
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
          app: { ...DEFAULT_SETTINGS.app, ...parsed.app },
          focusMode: { ...DEFAULT_SETTINGS.focusMode, ...parsed.focusMode },
          flashcards: { ...DEFAULT_SETTINGS.flashcards, ...parsed.flashcards },
          tasks: { ...DEFAULT_SETTINGS.tasks, ...parsed.tasks },
          flowKeeper: { ...DEFAULT_SETTINGS.flowKeeper, ...parsed.flowKeeper },
          timeline: { ...DEFAULT_SETTINGS.timeline, ...parsed.timeline },
        });
      }
    } catch (error) {
      console.error('Erro ao carregar settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettingsToStorage = async (updatedSettings: Settings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Erro ao salvar settings:', error);
      throw error;
    }
  };

  const loadUsageStatsFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem(USAGE_STATS_KEY);
      if (stored) {
        setUsageStats(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erro ao carregar usage stats:', error);
    }
  };

  const saveUsageStatsToStorage = async (stats: UsageStats) => {
    try {
      await AsyncStorage.setItem(USAGE_STATS_KEY, JSON.stringify(stats));
      setUsageStats(stats);
    } catch (error) {
      console.error('Erro ao salvar usage stats:', error);
    }
  };

  // ==========================================
  // ATUALIZAR CONFIGURAÇÕES
  // ==========================================

  const updateSettings = async (input: UpdateSettingsInput): Promise<void> => {
    const updatedSettings: Settings = {
      ...settings,
      app: input.app ? { ...settings.app, ...input.app } : settings.app,
      focusMode: input.focusMode ? { ...settings.focusMode, ...input.focusMode } : settings.focusMode,
      flashcards: input.flashcards ? { ...settings.flashcards, ...input.flashcards } : settings.flashcards,
      tasks: input.tasks ? { ...settings.tasks, ...input.tasks } : settings.tasks,
      flowKeeper: input.flowKeeper ? { ...settings.flowKeeper, ...input.flowKeeper } : settings.flowKeeper,
      timeline: input.timeline ? { ...settings.timeline, ...input.timeline } : settings.timeline,
      lastUpdated: new Date().toISOString(),
    };

    await saveSettingsToStorage(updatedSettings);
  };

  const resetSettings = async (): Promise<void> => {
    await saveSettingsToStorage({
      ...DEFAULT_SETTINGS,
      lastUpdated: new Date().toISOString(),
    });
  };

  const resetSection = async (
    section: keyof Omit<Settings, 'version' | 'lastUpdated'>
  ): Promise<void> => {
    const updatedSettings: Settings = {
      ...settings,
      [section]: DEFAULT_SETTINGS[section],
      lastUpdated: new Date().toISOString(),
    };

    await saveSettingsToStorage(updatedSettings);
  };

  // ==========================================
  // EXPORT/IMPORT
  // ==========================================

  const exportData = async (): Promise<ExportData> => {
    try {
      // Carregar dados de todos os módulos
      const flowsData = await AsyncStorage.getItem('@MindinLine:flows');
      const flashcardsData = await AsyncStorage.getItem('@MindinLine:flashcards');
      const tasksData = await AsyncStorage.getItem('@MindinLine:tasks');
      const activitiesData = await AsyncStorage.getItem('@MindinLine:timeline_activities');

      const exportData: ExportData = {
        flows: flowsData ? JSON.parse(flowsData) : [],
        flashcards: flashcardsData ? JSON.parse(flashcardsData) : [],
        tasks: tasksData ? JSON.parse(tasksData) : [],
        activities: activitiesData ? JSON.parse(activitiesData) : [],
        settings,
        exportedAt: new Date().toISOString(),
        version: settings.version,
      };

      return exportData;
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      throw error;
    }
  };

  const importData = async (data: ExportData): Promise<void> => {
    try {
      // Validar versão
      if (!data.version) {
        throw new Error('Dados inválidos');
      }

      // Importar cada módulo
      if (data.flows && Array.isArray(data.flows)) {
        await AsyncStorage.setItem('@MindinLine:flows', JSON.stringify(data.flows));
      }
      if (data.flashcards && Array.isArray(data.flashcards)) {
        await AsyncStorage.setItem('@MindinLine:flashcards', JSON.stringify(data.flashcards));
      }
      if (data.tasks && Array.isArray(data.tasks)) {
        await AsyncStorage.setItem('@MindinLine:tasks', JSON.stringify(data.tasks));
      }
      if (data.activities && Array.isArray(data.activities)) {
        await AsyncStorage.setItem('@MindinLine:timeline_activities', JSON.stringify(data.activities));
      }
      if (data.settings) {
        await saveSettingsToStorage(data.settings);
      }

      Alert.alert('Sucesso', 'Dados importados com sucesso! Reinicie o app para aplicar as mudanças.');
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      throw error;
    }
  };

  const clearAllData = async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        '@MindinLine:flows',
        '@MindinLine:flashcards',
        '@MindinLine:tasks',
        '@MindinLine:timeline_activities',
        '@MindinLine:timeline_config',
        USAGE_STATS_KEY,
      ]);

      // Manter settings mas resetar para default
      await resetSettings();

      Alert.alert('Sucesso', 'Todos os dados foram limpos!');
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      throw error;
    }
  };

  // ==========================================
  // USAGE STATS
  // ==========================================

  const updateUsageStats = async (): Promise<void> => {
    try {
      // Carregar contadores de cada módulo
      const flowsData = await AsyncStorage.getItem('@MindinLine:flows');
      const flashcardsData = await AsyncStorage.getItem('@MindinLine:flashcards');
      const tasksData = await AsyncStorage.getItem('@MindinLine:tasks');
      const activitiesData = await AsyncStorage.getItem('@MindinLine:timeline_activities');

      const flows = flowsData ? JSON.parse(flowsData) : [];
      const flashcards = flashcardsData ? JSON.parse(flashcardsData) : { decks: [] };
      const tasks = tasksData ? JSON.parse(tasksData) : [];
      const activities = activitiesData ? JSON.parse(activitiesData) : [];

      // Calcular total focus time
      const totalFocusTime = activities
        .filter((a: any) => a.type === 'focus_session')
        .reduce((sum: number, a: any) => sum + (a.metadata?.duration || 0), 0) / 60;

      // Calcular dias de uso
      const firstActivity = activities.length > 0
        ? activities.reduce((earliest: any, a: any) =>
            new Date(a.timestamp) < new Date(earliest.timestamp) ? a : earliest
          )
        : null;

      const totalDaysUsed = firstActivity
        ? Math.ceil((Date.now() - new Date(firstActivity.timestamp).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const stats: UsageStats = {
        totalDaysUsed,
        lastOpenedAt: new Date().toISOString(),
        totalFlows: flows.length,
        totalDecks: flashcards.decks?.length || 0,
        totalTasks: tasks.length,
        totalActivities: activities.length,
        totalFocusTime: Math.round(totalFocusTime),
      };

      await saveUsageStatsToStorage(stats);
    } catch (error) {
      console.error('Erro ao atualizar usage stats:', error);
    }
  };

  // ==========================================
  // UTILITÁRIOS
  // ==========================================

  const refreshSettings = async (): Promise<void> => {
    await loadSettingsFromStorage();
    await loadUsageStatsFromStorage();
  };

  // ==========================================
  // PROVIDER VALUE
  // ==========================================

  const value: SettingsContextData = {
    settings,
    usageStats,
    loading,
    updateSettings,
    resetSettings,
    resetSection,
    exportData,
    importData,
    clearAllData,
    updateUsageStats,
    refreshSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

// ==========================================
// 🪝 HOOK
// ==========================================

export const useSettings = () => {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }

  return context;
};

export default SettingsContext;
