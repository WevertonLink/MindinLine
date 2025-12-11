// ==========================================
// ⚙️ SETTINGS TYPES
// ==========================================

/**
 * Configurações gerais do app
 */
export interface AppSettings {
  // Aparência
  theme: 'glassmorphism_deep'; // futuro: adicionar mais temas
  language: 'pt-BR' | 'en-US';

  // Notificações
  notificationsEnabled: boolean;
  notifyOnStreakBreak: boolean;
  notifyOnTaskDue: boolean;
  notifyOnReviewDue: boolean;

  // Som
  soundEnabled: boolean;
  soundVolume: number; // 0-100

  // Privacidade
  analyticsEnabled: boolean;
  crashReportsEnabled: boolean;
}

/**
 * Configurações do Focus Mode (Pomodoro)
 */
export interface FocusModeSettings {
  focusDuration: number; // em minutos
  shortBreakDuration: number; // em minutos
  longBreakDuration: number; // em minutos
  sessionsBeforeLongBreak: number;
  autoStartBreak: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

/**
 * Configurações de Flashcards
 */
export interface FlashcardsSettings {
  cardsPerSession: number; // quantos cards por sessão
  showAnswerTime: number; // segundos antes de mostrar botões
  easyBonusDays: number; // dias extras para "easy"
  hardPenaltyDays: number; // dias de penalidade para "hard"
  shuffleCards: boolean;
  autoPlayAudio: boolean; // se tiver áudio nos cards
}

/**
 * Configurações de Tasks
 */
export interface TasksSettings {
  defaultPriority: 'low' | 'medium' | 'high' | 'urgent';
  showCompletedTasks: boolean;
  autoArchiveCompletedDays: number; // dias antes de arquivar automaticamente
  enableRecurringTasks: boolean;
  defaultReminderMinutes: number; // lembrete padrão antes do vencimento
}

/**
 * Configurações de Trilhas de Aprendizado
 */
export interface TrilhasSettings {
  autoPlayNextStep: boolean;
  markMaterialAsCompletedOnView: boolean;
  defaultStepDuration: number; // duração estimada padrão em minutos
  showProgressBar: boolean;
}

/**
 * Configurações de Timeline
 */
export interface TimelineSettings {
  goalActivitiesPerDay: number;
  goalFocusMinutesPerDay: number;
  showDetailedStats: boolean;
  groupActivitiesByDay: boolean;
}

/**
 * Todas as configurações do app
 */
export interface Settings {
  app: AppSettings;
  focusMode: FocusModeSettings;
  flashcards: FlashcardsSettings;
  tasks: TasksSettings;
  trilhas: TrilhasSettings;
  timeline: TimelineSettings;

  // Metadata
  version: string;
  lastUpdated: string; // ISO date string
}

/**
 * Input para atualizar configurações
 */
export interface UpdateSettingsInput {
  app?: Partial<AppSettings>;
  focusMode?: Partial<FocusModeSettings>;
  flashcards?: Partial<FlashcardsSettings>;
  tasks?: Partial<TasksSettings>;
  trilhas?: Partial<TrilhasSettings>;
  timeline?: Partial<TimelineSettings>;
}

/**
 * Dados para exportação
 */
export interface ExportData {
  flows: any[];
  flashcards: any[];
  tasks: any[];
  activities: any[];
  settings: Settings;
  exportedAt: string;
  version: string;
}

/**
 * Estatísticas de uso do app
 */
export interface UsageStats {
  totalDaysUsed: number;
  lastOpenedAt: string;
  totalTrilhas: number;
  totalDecks: number;
  totalTasks: number;
  totalActivities: number;
  totalFocusTime: number; // em minutos
}
