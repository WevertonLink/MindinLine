import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Activity,
  CreateActivityInput,
  TimelineStats,
  TimelineFilters,
  TimelineConfig,
  TimeRange,
  DailyActivity,
} from '../features/timeline/types';
import {
  generateId,
  calculateStats,
  groupActivitiesByDay,
  filterActivitiesByTimeRange,
  searchActivities,
} from '../features/timeline/utils';

// ==========================================
// ✅ TIMELINE CONTEXT
// ==========================================

const STORAGE_KEY = '@MindinLine:timeline_activities';
const CONFIG_STORAGE_KEY = '@MindinLine:timeline_config';

interface TimelineContextData {
  // Estado
  activities: Activity[];
  stats: TimelineStats;
  loading: boolean;
  filters: TimelineFilters;
  config: TimelineConfig;

  // CRUD de Activities
  addActivity: (input: CreateActivityInput) => Promise<Activity>;
  deleteActivity: (activityId: string) => Promise<void>;
  clearAllActivities: () => Promise<void>;

  // Filtros
  setFilters: (filters: Partial<TimelineFilters>) => void;
  getFilteredActivities: () => Activity[];
  getDailyActivities: () => DailyActivity[];

  // Configurações
  updateConfig: (config: Partial<TimelineConfig>) => Promise<void>;

  // Utilitários
  refreshActivities: () => Promise<void>;
}

const TimelineContext = createContext<TimelineContextData>({} as TimelineContextData);

// ==========================================
// 🔧 PROVIDER
// ==========================================

interface TimelineProviderProps {
  children: ReactNode;
}

export const TimelineProvider: React.FC<TimelineProviderProps> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<TimelineStats>({
    totalActivities: 0,
    flowStudies: 0,
    flowsCompleted: 0,
    flashcardReviews: 0,
    decksCompleted: 0,
    tasksCompleted: 0,
    tasksCreated: 0,
    focusSessions: 0,
    subtasksCompleted: 0,
    totalFocusTime: 0,
    totalStudyTime: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    activitiesPerDay: 0,
    mostProductiveDay: null,
    thisWeekActivities: 0,
    thisWeekFocusTime: 0,
    thisMonthActivities: 0,
    thisMonthFocusTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFiltersState] = useState<TimelineFilters>({
    timeRange: 'all',
    activityTypes: undefined,
    searchQuery: undefined,
  });
  const [config, setConfig] = useState<TimelineConfig>({
    enableNotifications: true,
    notifyOnStreak: true,
    goalActivitiesPerDay: 5,
    goalFocusMinutesPerDay: 120,
  });

  // Carregar atividades do storage ao iniciar
  useEffect(() => {
    loadActivitiesFromStorage();
    loadConfigFromStorage();
  }, []);

  // Atualizar stats sempre que activities mudar
  useEffect(() => {
    setStats(calculateStats(activities));
  }, [activities]);

  // ==========================================
  // STORAGE
  // ==========================================

  const loadActivitiesFromStorage = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setActivities(parsed);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveActivitiesToStorage = async (updatedActivities: Activity[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedActivities));
      setActivities(updatedActivities);
    } catch (error) {
      console.error('Erro ao salvar atividades:', error);
      throw error;
    }
  };

  const loadConfigFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setConfig(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Erro ao carregar config:', error);
    }
  };

  const saveConfigToStorage = async (updatedConfig: TimelineConfig) => {
    try {
      await AsyncStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updatedConfig));
      setConfig(updatedConfig);
    } catch (error) {
      console.error('Erro ao salvar config:', error);
      throw error;
    }
  };

  // ==========================================
  // CRUD DE ACTIVITIES
  // ==========================================

  const addActivity = async (input: CreateActivityInput): Promise<Activity> => {
    const newActivity: Activity = {
      id: generateId(),
      type: input.type,
      title: input.title,
      description: input.description,
      timestamp: new Date().toISOString(),
      metadata: input.metadata,
    };

    const updatedActivities = [newActivity, ...activities];
    await saveActivitiesToStorage(updatedActivities);

    return newActivity;
  };

  const deleteActivity = async (activityId: string): Promise<void> => {
    const updatedActivities = activities.filter(a => a.id !== activityId);
    await saveActivitiesToStorage(updatedActivities);
  };

  const clearAllActivities = async (): Promise<void> => {
    await saveActivitiesToStorage([]);
  };

  // ==========================================
  // FILTROS
  // ==========================================

  const setFilters = (newFilters: Partial<TimelineFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const getFilteredActivities = (): Activity[] => {
    let filtered = [...activities];

    // Filtrar por range de tempo
    filtered = filterActivitiesByTimeRange(filtered, filters.timeRange);

    // Filtrar por tipos de atividade
    if (filters.activityTypes && filters.activityTypes.length > 0) {
      filtered = filtered.filter(a => filters.activityTypes!.includes(a.type));
    }

    // Filtrar por busca
    if (filters.searchQuery) {
      filtered = searchActivities(filtered, filters.searchQuery);
    }

    // Ordenar por data (mais recente primeiro)
    return filtered.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const getDailyActivities = (): DailyActivity[] => {
    const filtered = getFilteredActivities();
    return groupActivitiesByDay(filtered);
  };

  // ==========================================
  // CONFIGURAÇÕES
  // ==========================================

  const updateConfig = async (newConfig: Partial<TimelineConfig>): Promise<void> => {
    const updatedConfig = { ...config, ...newConfig };
    await saveConfigToStorage(updatedConfig);
  };

  // ==========================================
  // UTILITÁRIOS
  // ==========================================

  const refreshActivities = async (): Promise<void> => {
    await loadActivitiesFromStorage();
  };

  // ==========================================
  // PROVIDER VALUE
  // ==========================================

  const value: TimelineContextData = {
    activities,
    stats,
    loading,
    filters,
    config,
    addActivity,
    deleteActivity,
    clearAllActivities,
    setFilters,
    getFilteredActivities,
    getDailyActivities,
    updateConfig,
    refreshActivities,
  };

  return <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>;
};

// ==========================================
// 🪝 HOOK
// ==========================================

export const useTimeline = () => {
  const context = useContext(TimelineContext);

  if (!context) {
    throw new Error('useTimeline must be used within TimelineProvider');
  }

  return context;
};

export default TimelineContext;
