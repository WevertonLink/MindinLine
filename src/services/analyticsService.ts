// ==========================================
// 📊 ANALYTICS & CRASH REPORTING SERVICE
// ==========================================

/**
 * Serviço de Analytics e Crash Reporting
 *
 * NOTA: Esta é uma implementação stub/placeholder.
 * Para produção, instale Firebase ou alternativa:
 * - @react-native-firebase/app
 * - @react-native-firebase/analytics
 * - @react-native-firebase/crashlytics
 *
 * Ou alternativas:
 * - Sentry (@sentry/react-native)
 * - Amplitude (amplitude-js)
 * - Mixpanel (mixpanel-react-native)
 *
 * Instalação Firebase:
 * npm install @react-native-firebase/app
 * npm install @react-native-firebase/analytics
 * npm install @react-native-firebase/crashlytics
 *
 * Configuração adicional necessária:
 * - google-services.json (Android)
 * - GoogleService-Info.plist (iOS)
 */

import { logger } from './logger';

export interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

export interface UserProperties {
  userId?: string;
  appVersion?: string;
  platform?: string;
  [key: string]: string | number | boolean | undefined;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private enabled: boolean = true;
  private userId: string | null = null;

  private constructor() {
    this.init();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Inicializar analytics
   */
  private async init(): Promise<void> {
    try {
      // TODO: Inicializar Firebase Analytics
      // await analytics().setAnalyticsCollectionEnabled(true);
      logger.info('📊 AnalyticsService: Serviço de analytics stub inicializado');
    } catch (error) {
      logger.error('Erro ao inicializar analytics:', error);
    }
  }

  /**
   * Habilitar/desabilitar analytics
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;

    // TODO: Atualizar configuração do Firebase
    // analytics().setAnalyticsCollectionEnabled(enabled);

    logger.info(`📊 AnalyticsService: Analytics ${enabled ? 'habilitado' : 'desabilitado'}`);
  }

  /**
   * Definir ID do usuário
   */
  setUserId(userId: string | null): void {
    this.userId = userId;

    // TODO: Definir no Firebase
    // if (userId) {
    //   analytics().setUserId(userId);
    //   crashlytics().setUserId(userId);
    // }

    logger.info('📊 AnalyticsService: User ID definido:', userId);
  }

  /**
   * Definir propriedades do usuário
   */
  setUserProperties(properties: UserProperties): void {
    if (!this.enabled) return;

    // TODO: Definir no Firebase
    // Object.entries(properties).forEach(([key, value]) => {
    //   if (value !== undefined) {
    //     analytics().setUserProperty(key, String(value));
    //   }
    // });

    logger.info('📊 AnalyticsService: User properties definidas:', properties);
  }

  /**
   * Logar evento customizado
   */
  logEvent(eventName: string, properties?: EventProperties): void {
    if (!this.enabled) return;

    // TODO: Logar no Firebase
    // analytics().logEvent(eventName, properties);

    logger.info(`📊 AnalyticsService: Evento "${eventName}" logado:`, properties);
  }

  /**
   * Logar erro/exception
   */
  logError(error: Error, context?: Record<string, any>): void {
    // TODO: Logar no Crashlytics
    // crashlytics().recordError(error);
    // if (context) {
    //   crashlytics().log(JSON.stringify(context));
    // }

    logger.error('📊 AnalyticsService: Erro logado:', error.message, context);
  }

  /**
   * Adicionar breadcrumb (rastreamento de ações do usuário)
   */
  addBreadcrumb(message: string, data?: Record<string, any>): void {
    // TODO: Adicionar ao Crashlytics
    // crashlytics().log(`${message} ${JSON.stringify(data || {})}`);

    logger.info('📊 AnalyticsService: Breadcrumb:', message, data);
  }

  // ==========================================
  // 📌 EVENTOS ESPECÍFICOS DO DOMÍNIO
  // ==========================================

  // === TASKS ===

  logTaskCreated(category: string, priority: string): void {
    this.logEvent('task_created', { category, priority });
  }

  logTaskCompleted(category: string, durationMinutes?: number): void {
    this.logEvent('task_completed', {
      category,
      duration_minutes: durationMinutes,
    });
  }

  logTaskDeleted(reason: 'user_action' | 'auto_archive'): void {
    this.logEvent('task_deleted', { reason });
  }

  // === FLASHCARDS ===

  logDeckCreated(category: string, initialCardsCount: number): void {
    this.logEvent('deck_created', {
      category,
      initial_cards_count: initialCardsCount,
    });
  }

  logCardReviewed(difficulty: 'again' | 'hard' | 'good' | 'easy'): void {
    this.logEvent('card_reviewed', { difficulty });
  }

  logReviewSessionCompleted(cardsReviewed: number, duration: number): void {
    this.logEvent('review_session_completed', {
      cards_reviewed: cardsReviewed,
      duration_seconds: duration,
    });
  }

  // === FOCUS MODE (POMODORO) ===

  logFocusSessionStarted(type: 'focus' | 'break', durationMinutes: number): void {
    this.logEvent('focus_session_started', {
      type,
      duration_minutes: durationMinutes,
    });
  }

  logFocusSessionCompleted(type: 'focus' | 'break', durationMinutes: number): void {
    this.logEvent('focus_session_completed', {
      type,
      duration_minutes: durationMinutes,
    });
  }

  logFocusSessionCancelled(reason: 'user_action' | 'app_backgrounded'): void {
    this.logEvent('focus_session_cancelled', { reason });
  }

  // === FLOWKEEPER ===

  logFlowCreated(category: string, stepsCount: number): void {
    this.logEvent('flow_created', {
      category,
      steps_count: stepsCount,
    });
  }

  logFlowCompleted(category: string, durationDays: number): void {
    this.logEvent('flow_completed', {
      category,
      duration_days: durationDays,
    });
  }

  logMaterialViewed(type: string, durationSeconds?: number): void {
    this.logEvent('material_viewed', {
      type,
      duration_seconds: durationSeconds,
    });
  }

  // === TIMELINE ===

  logStreakAchieved(days: number, isPersonalRecord: boolean): void {
    this.logEvent('streak_achieved', {
      days,
      is_personal_record: isPersonalRecord,
    });
  }

  logStreakBroken(previousDays: number): void {
    this.logEvent('streak_broken', {
      previous_days: previousDays,
    });
  }

  // === APP LIFECYCLE ===

  logAppOpened(source?: 'cold_start' | 'background' | 'notification'): void {
    this.logEvent('app_opened', { source });
  }

  logAppBackgrounded(sessionDuration: number): void {
    this.logEvent('app_backgrounded', {
      session_duration_seconds: sessionDuration,
    });
  }

  logScreenViewed(screenName: string): void {
    this.logEvent('screen_view', {
      screen_name: screenName,
    });
  }

  // === SETTINGS ===

  logSettingChanged(settingKey: string, newValue: string | number | boolean): void {
    this.logEvent('setting_changed', {
      setting_key: settingKey,
      new_value: String(newValue),
    });
  }

  // === DATA MANAGEMENT ===

  logDataExported(format: 'json' | 'csv'): void {
    this.logEvent('data_exported', { format });
  }

  logDataImported(itemsCount: number): void {
    this.logEvent('data_imported', { items_count: itemsCount });
  }

  logDataCleared(section: 'all' | 'tasks' | 'flashcards' | 'flows'): void {
    this.logEvent('data_cleared', { section });
  }

  // === ERRORS ===

  logStorageError(operation: 'load' | 'save' | 'delete', key: string): void {
    this.logEvent('storage_error', { operation, key });
  }

  logNetworkError(endpoint: string, statusCode?: number): void {
    this.logEvent('network_error', {
      endpoint,
      status_code: statusCode,
    });
  }
}

// Exportar instância singleton
export const analyticsService = AnalyticsService.getInstance();

export default analyticsService;
