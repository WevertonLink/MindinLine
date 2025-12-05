// ==========================================
// 🛠️ TIMELINE UTILS
// ==========================================

import {
  Activity,
  ActivityType,
  TimelineStats,
  DailyActivity,
  TimeRange,
} from './types';

/**
 * Gera um ID único
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Retorna o ícone apropriado para cada tipo de atividade
 */
export const getActivityIcon = (type: ActivityType): string => {
  const icons: Record<ActivityType, string> = {
    flow_study: 'book-outline',
    flow_completed: 'trophy-outline',
    flashcard_review: 'layers-outline',
    flashcard_deck_completed: 'checkmark-done-circle-outline',
    task_completed: 'checkmark-circle-outline',
    task_created: 'add-circle-outline',
    focus_session: 'timer-outline',
    subtask_completed: 'checkbox-outline',
  };

  return icons[type];
};

/**
 * Retorna a cor apropriada para cada tipo de atividade
 */
export const getActivityColor = (type: ActivityType): string => {
  const colors: Record<ActivityType, string> = {
    flow_study: '#3b82f6',       // blue
    flow_completed: '#f59e0b',   // amber
    flashcard_review: '#8b5cf6', // violet
    flashcard_deck_completed: '#10b981', // green
    task_completed: '#10b981',   // green
    task_created: '#6366f1',     // indigo
    focus_session: '#ef4444',    // red
    subtask_completed: '#14b8a6', // teal
  };

  return colors[type];
};

/**
 * Traduz o tipo de atividade para português
 */
export const translateActivityType = (type: ActivityType): string => {
  const translations: Record<ActivityType, string> = {
    flow_study: 'Estudo',
    flow_completed: 'Flow Completo',
    flashcard_review: 'Revisão',
    flashcard_deck_completed: 'Deck Completo',
    task_completed: 'Tarefa Concluída',
    task_created: 'Tarefa Criada',
    focus_session: 'Sessão de Foco',
    subtask_completed: 'Subtarefa Concluída',
  };

  return translations[type];
};

/**
 * Formata timestamp de atividade
 */
export const formatActivityTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}m atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays}d atrás`;

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

/**
 * Formata data completa
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Formata duração em minutos
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

/**
 * Agrupa atividades por dia
 */
export const groupActivitiesByDay = (activities: Activity[]): DailyActivity[] => {
  const grouped: Record<string, Activity[]> = {};

  activities.forEach(activity => {
    const date = new Date(activity.timestamp).toISOString().split('T')[0];
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(activity);
  });

  return Object.entries(grouped)
    .map(([date, dayActivities]) => ({
      date,
      activities: dayActivities.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
      totalActivities: dayActivities.length,
      focusTime: dayActivities
        .filter(a => a.type === 'focus_session')
        .reduce((sum, a) => sum + (a.metadata?.duration || 0), 0) / 60,
      studyTime: dayActivities
        .filter(a => a.type === 'flow_study' || a.type === 'flashcard_review')
        .reduce((sum, a) => sum + (a.metadata?.duration || 20), 0) / 60, // estimate 20min per study
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
};

/**
 * Filtra atividades por range de tempo
 */
export const filterActivitiesByTimeRange = (
  activities: Activity[],
  timeRange: TimeRange
): Activity[] => {
  const now = new Date();
  let cutoffDate: Date;

  switch (timeRange) {
    case 'today':
      cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'all':
      return activities;
  }

  return activities.filter(
    activity => new Date(activity.timestamp) >= cutoffDate
  );
};

/**
 * Calcula o streak (dias consecutivos com atividades)
 */
export const calculateStreak = (activities: Activity[]): { current: number; longest: number } => {
  if (activities.length === 0) return { current: 0, longest: 0 };

  // Ordenar por data (mais recente primeiro)
  const sorted = [...activities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Pegar datas únicas (YYYY-MM-DD)
  const uniqueDates = Array.from(
    new Set(sorted.map(a => new Date(a.timestamp).toISOString().split('T')[0]))
  ).sort((a, b) => b.localeCompare(a));

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Calcular current streak
  let currentStreak = 0;
  const mostRecentActivityDate = uniqueDates[0];

  // Streak atual só é válido se a última atividade foi hoje ou ontem
  if (mostRecentActivityDate !== today && mostRecentActivityDate !== yesterday) {
    currentStreak = 0; // Streak quebrado (última atividade foi há 2+ dias)
  } else {
    // Começar a contar do dia apropriado
    let checkDate = mostRecentActivityDate === today ? today : yesterday;

    for (const date of uniqueDates) {
      if (date === checkDate) {
        currentStreak++;
        // Avançar para o dia anterior
        const d = new Date(checkDate);
        d.setDate(d.getDate() - 1);
        checkDate = d.toISOString().split('T')[0];
      } else {
        // Gap detectado - streak atual termina aqui
        break;
      }
    }
  }

  // Calcular longest streak (percorrer todas as datas)
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1]);
    const currDate = new Date(uniqueDates[i]);
    const diffDays = Math.floor(
      (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      // Dias consecutivos
      tempStreak++;
    } else {
      // Gap detectado - finalizar streak temporário
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return { current: currentStreak, longest: longestStreak };
};

/**
 * Identifica o dia da semana mais produtivo
 */
export const getMostProductiveDay = (activities: Activity[]): string | null => {
  if (activities.length === 0) return null;

  const dayCount: Record<string, number> = {};
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daysPT = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  activities.forEach(activity => {
    const dayIndex = new Date(activity.timestamp).getDay();
    const dayName = days[dayIndex];
    dayCount[dayName] = (dayCount[dayName] || 0) + 1;
  });

  const mostProductive = Object.entries(dayCount).reduce(
    (max, [day, count]) => (count > max.count ? { day, count } : max),
    { day: '', count: 0 }
  );

  const dayIndex = days.indexOf(mostProductive.day);
  return dayIndex >= 0 ? daysPT[dayIndex] : null;
};

/**
 * Calcula estatísticas do Timeline
 */
export const calculateStats = (activities: Activity[]): TimelineStats => {
  const streak = calculateStreak(activities);

  // Total por tipo
  const flowStudies = activities.filter(a => a.type === 'flow_study').length;
  const flowsCompleted = activities.filter(a => a.type === 'flow_completed').length;
  const flashcardReviews = activities.filter(a => a.type === 'flashcard_review').length;
  const decksCompleted = activities.filter(a => a.type === 'flashcard_deck_completed').length;
  const tasksCompleted = activities.filter(a => a.type === 'task_completed').length;
  const tasksCreated = activities.filter(a => a.type === 'task_created').length;
  const focusSessions = activities.filter(a => a.type === 'focus_session').length;
  const subtasksCompleted = activities.filter(a => a.type === 'subtask_completed').length;

  // Tempo total de foco
  const totalFocusTime = Math.round(
    activities
      .filter(a => a.type === 'focus_session')
      .reduce((sum, a) => sum + (a.metadata?.duration || 0), 0) / 60
  );

  // Tempo total de estudo (estimate)
  const totalStudyTime = Math.round(
    activities
      .filter(a => a.type === 'flow_study' || a.type === 'flashcard_review')
      .reduce((sum, a) => sum + (a.metadata?.duration || 20), 0) / 60
  );

  // Esta semana
  const thisWeekActivitiesArray = filterActivitiesByTimeRange(activities, 'week');
  const thisWeekActivities = thisWeekActivitiesArray.length;
  const thisWeekFocusTime = Math.round(
    thisWeekActivitiesArray
      .filter(a => a.type === 'focus_session')
      .reduce((sum, a) => sum + (a.metadata?.duration || 0), 0) / 60
  );

  // Este mês
  const thisMonthActivitiesArray = filterActivitiesByTimeRange(activities, 'month');
  const thisMonthActivities = thisMonthActivitiesArray.length;
  const thisMonthFocusTime = Math.round(
    thisMonthActivitiesArray
      .filter(a => a.type === 'focus_session')
      .reduce((sum, a) => sum + (a.metadata?.duration || 0), 0) / 60
  );

  // Última atividade
  const lastActivity = activities.length > 0
    ? activities.reduce((latest, a) =>
        new Date(a.timestamp) > new Date(latest.timestamp) ? a : latest
      )
    : null;

  // Atividades por dia (média)
  const uniqueDays = new Set(
    activities.map(a => new Date(a.timestamp).toISOString().split('T')[0])
  ).size;
  const activitiesPerDay = uniqueDays > 0 ? activities.length / uniqueDays : 0;

  return {
    totalActivities: activities.length,
    flowStudies,
    flowsCompleted,
    flashcardReviews,
    decksCompleted,
    tasksCompleted,
    tasksCreated,
    focusSessions,
    subtasksCompleted,
    totalFocusTime,
    totalStudyTime,
    currentStreak: streak.current,
    longestStreak: streak.longest,
    lastActivityDate: lastActivity?.timestamp || null,
    activitiesPerDay: parseFloat(activitiesPerDay.toFixed(1)),
    mostProductiveDay: getMostProductiveDay(activities),
    thisWeekActivities,
    thisWeekFocusTime,
    thisMonthActivities,
    thisMonthFocusTime,
  };
};

/**
 * Busca atividades por query
 */
export const searchActivities = (activities: Activity[], query: string): Activity[] => {
  if (!query.trim()) return activities;

  const lowercaseQuery = query.toLowerCase().trim();

  return activities.filter(
    activity =>
      activity.title.toLowerCase().includes(lowercaseQuery) ||
      activity.description?.toLowerCase().includes(lowercaseQuery) ||
      activity.metadata?.flowTitle?.toLowerCase().includes(lowercaseQuery) ||
      activity.metadata?.deckTitle?.toLowerCase().includes(lowercaseQuery) ||
      activity.metadata?.taskTitle?.toLowerCase().includes(lowercaseQuery)
  );
};
