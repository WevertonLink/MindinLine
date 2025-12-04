// ==========================================
// 📊 TIMELINE TYPES
// ==========================================

/**
 * Tipos de atividades registradas no Timeline
 */
export type ActivityType =
  | 'flow_study'         // Estudou um material do FlowKeeper
  | 'flow_completed'     // Completou um flow
  | 'flashcard_review'   // Revisou flashcards
  | 'flashcard_deck_completed' // Completou revisão de um deck
  | 'task_completed'     // Completou uma tarefa
  | 'task_created'       // Criou uma tarefa
  | 'focus_session'      // Completou sessão de foco Pomodoro
  | 'subtask_completed'; // Completou uma subtarefa

/**
 * Atividade registrada no Timeline
 */
export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: string; // ISO date string

  // Metadata específico por tipo
  metadata?: {
    // FlowKeeper
    flowId?: string;
    flowTitle?: string;
    stepId?: string;
    stepTitle?: string;
    materialType?: 'video' | 'article' | 'book' | 'pdf' | 'link' | 'note';

    // Flashcards
    deckId?: string;
    deckTitle?: string;
    cardsReviewed?: number;
    averageDifficulty?: 'again' | 'hard' | 'good' | 'easy';

    // Tasks
    taskId?: string;
    taskTitle?: string;
    taskPriority?: 'low' | 'medium' | 'high' | 'urgent';
    subtaskId?: string;
    subtaskTitle?: string;

    // Focus Sessions
    duration?: number; // em segundos
    sessionType?: 'focus' | 'break';

    // Stats gerais
    pointsEarned?: number;
    streakIncrement?: boolean;
  };
}

/**
 * Input para criar uma atividade
 */
export interface CreateActivityInput {
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: Activity['metadata'];
}

/**
 * Range de tempo para filtros
 */
export type TimeRange = 'today' | 'week' | 'month' | 'all';

/**
 * Estatísticas do Timeline
 */
export interface TimelineStats {
  totalActivities: number;

  // Por tipo
  flowStudies: number;
  flowsCompleted: number;
  flashcardReviews: number;
  decksCompleted: number;
  tasksCompleted: number;
  tasksCreated: number;
  focusSessions: number;
  subtasksCompleted: number;

  // Tempo
  totalFocusTime: number; // em minutos
  totalStudyTime: number; // em minutos

  // Streak
  currentStreak: number; // dias consecutivos com atividade
  longestStreak: number; // maior streak
  lastActivityDate: string | null; // ISO date string

  // Produtividade
  activitiesPerDay: number; // média
  mostProductiveDay: string | null; // dia da semana (Monday, Tuesday, etc)

  // Esta semana
  thisWeekActivities: number;
  thisWeekFocusTime: number;

  // Este mês
  thisMonthActivities: number;
  thisMonthFocusTime: number;
}

/**
 * Dados agregados por dia
 */
export interface DailyActivity {
  date: string; // YYYY-MM-DD
  activities: Activity[];
  totalActivities: number;
  focusTime: number; // em minutos
  studyTime: number; // em minutos
}

/**
 * Filtros para o Timeline
 */
export interface TimelineFilters {
  timeRange: TimeRange;
  activityTypes?: ActivityType[]; // filtrar por tipos específicos
  searchQuery?: string;
}

/**
 * Configurações do Timeline
 */
export interface TimelineConfig {
  enableNotifications: boolean;
  notifyOnStreak: boolean;
  goalActivitiesPerDay: number;
  goalFocusMinutesPerDay: number;
}
