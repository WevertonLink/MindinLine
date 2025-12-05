// ==========================================
// 📬 NOTIFICATION SERVICE
// ==========================================

/**
 * Serviço de Notificações Push
 *
 * NOTA: Esta é uma implementação stub/placeholder.
 * Para produção, instale uma biblioteca de notificações:
 * - @notifee/react-native (recomendado para Android/iOS)
 * - expo-notifications (se usando Expo)
 *
 * Instalação:
 * npm install @notifee/react-native
 *
 * Configuração adicional necessária:
 * - android/app/src/main/AndroidManifest.xml
 * - ios/Podfile (cd ios && pod install)
 */

import { Platform } from 'react-native';
import { Task } from '../features/tasks/types';
import { Deck } from '../features/flashcards/types';
import { logger } from './logger';

export interface NotificationOptions {
  id?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  scheduleTime?: Date;
  sound?: boolean;
  vibrate?: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private hasPermission: boolean = false;

  private constructor() {
    this.init();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Inicializar serviço de notificações
   */
  private async init(): Promise<void> {
    try {
      // TODO: Inicializar biblioteca de notificações
      // const settings = await notifee.requestPermission();
      // this.hasPermission = settings.authorizationStatus >= 1;
      logger.info('📬 NotificationService: Serviço de notificações stub inicializado');
    } catch (error) {
      logger.error('Erro ao inicializar notificações:', error);
    }
  }

  /**
   * Solicitar permissão do usuário
   */
  async requestPermission(): Promise<boolean> {
    try {
      // TODO: Implementar quando biblioteca estiver instalada
      // const settings = await notifee.requestPermission();
      // this.hasPermission = settings.authorizationStatus >= 1;
      // return this.hasPermission;

      logger.info('📬 NotificationService: Permissão solicitada (stub)');
      this.hasPermission = true;
      return true;
    } catch (error) {
      logger.error('Erro ao solicitar permissão de notificações:', error);
      return false;
    }
  }

  /**
   * Exibir notificação imediata
   */
  async showNotification(options: NotificationOptions): Promise<string | null> {
    if (!this.hasPermission) {
      logger.warn('📬 NotificationService: Sem permissão para notificações');
      return null;
    }

    try {
      // TODO: Implementar quando biblioteca estiver instalada
      // const channelId = await notifee.createChannel({
      //   id: 'default',
      //   name: 'Default Channel',
      // });
      //
      // return await notifee.displayNotification({
      //   id: options.id,
      //   title: options.title,
      //   body: options.body,
      //   data: options.data,
      //   android: {
      //     channelId,
      //     sound: options.sound ? 'default' : undefined,
      //     vibrate: options.vibrate,
      //   },
      //   ios: {
      //     sound: options.sound ? 'default' : undefined,
      //   },
      // });

      logger.info('📬 NotificationService: Notificação exibida (stub):', options.title);
      return options.id || `notification_${Date.now()}`;
    } catch (error) {
      logger.error('Erro ao exibir notificação:', error);
      return null;
    }
  }

  /**
   * Agendar notificação futura
   */
  async scheduleNotification(options: NotificationOptions): Promise<string | null> {
    if (!this.hasPermission || !options.scheduleTime) {
      console.warn('📬 NotificationService: Sem permissão ou sem horário agendado');
      return null;
    }

    try {
      // TODO: Implementar quando biblioteca estiver instalada
      // const channelId = await notifee.createChannel({
      //   id: 'scheduled',
      //   name: 'Scheduled Notifications',
      // });
      //
      // const trigger: TimestampTrigger = {
      //   type: TriggerType.TIMESTAMP,
      //   timestamp: options.scheduleTime.getTime(),
      // };
      //
      // return await notifee.createTriggerNotification({
      //   id: options.id,
      //   title: options.title,
      //   body: options.body,
      //   data: options.data,
      //   android: { channelId },
      // }, trigger);

      logger.info('📬 NotificationService: Notificação agendada (stub):', {
        title: options.title,
        time: options.scheduleTime,
      });
      return options.id || `scheduled_${Date.now()}`;
    } catch (error) {
      logger.error('Erro ao agendar notificação:', error);
      return null;
    }
  }

  /**
   * Cancelar notificação agendada
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      // TODO: Implementar quando biblioteca estiver instalada
      // await notifee.cancelNotification(notificationId);
      logger.info('📬 NotificationService: Notificação cancelada (stub):', notificationId);
    } catch (error) {
      logger.error('Erro ao cancelar notificação:', error);
    }
  }

  /**
   * Cancelar todas as notificações
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      // TODO: Implementar quando biblioteca estiver instalada
      // await notifee.cancelAllNotifications();
      logger.info('📬 NotificationService: Todas as notificações canceladas (stub)');
    } catch (error) {
      logger.error('Erro ao cancelar todas as notificações:', error);
    }
  }

  // ==========================================
  // 📌 MÉTODOS ESPECÍFICOS DO DOMÍNIO
  // ==========================================

  /**
   * Notificar sobre tarefa próxima do vencimento
   */
  async notifyTaskDueSoon(task: Task): Promise<string | null> {
    if (!task.dueDate) return null;

    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const oneHourBefore = new Date(dueDate.getTime() - 3600000); // 1 hora antes

    if (oneHourBefore > now) {
      return this.scheduleNotification({
        id: `task_due_${task.id}`,
        title: 'Tarefa próxima do vencimento',
        body: task.title,
        data: { type: 'task_due', taskId: task.id },
        scheduleTime: oneHourBefore,
        sound: true,
        vibrate: true,
      });
    }

    return null;
  }

  /**
   * Notificar sobre cards para revisar
   */
  async notifyReviewDue(deck: Deck, cardsCount: number): Promise<string | null> {
    if (cardsCount === 0) return null;

    return this.showNotification({
      id: `review_due_${deck.id}`,
      title: `${cardsCount} ${cardsCount === 1 ? 'card' : 'cards'} para revisar`,
      body: `Deck: ${deck.title}`,
      data: { type: 'review_due', deckId: deck.id },
      sound: true,
      vibrate: true,
    });
  }

  /**
   * Notificar sobre quebra de streak
   */
  async notifyStreakBreak(currentStreak: number): Promise<string | null> {
    return this.showNotification({
      id: 'streak_break',
      title: 'Mantenha seu streak!',
      body: `Você está em ${currentStreak} ${currentStreak === 1 ? 'dia seguido' : 'dias seguidos'}. Continue estudando hoje!`,
      data: { type: 'streak_reminder' },
      sound: true,
      vibrate: true,
    });
  }

  /**
   * Notificar sobre sessão de foco completada
   */
  async notifyFocusSessionComplete(duration: number): Promise<string | null> {
    return this.showNotification({
      id: 'focus_complete',
      title: 'Sessão de Foco Completada!',
      body: `Você focou por ${duration} minutos. Ótimo trabalho!`,
      data: { type: 'focus_complete' },
      sound: true,
      vibrate: true,
    });
  }

  /**
   * Lembrete diário para estudar
   */
  async scheduleDailyReminder(hour: number = 9, minute: number = 0): Promise<string | null> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(hour, minute, 0, 0);

    return this.scheduleNotification({
      id: 'daily_reminder',
      title: 'Hora de estudar!',
      body: 'Dedique alguns minutos ao seu aprendizado hoje',
      data: { type: 'daily_reminder' },
      scheduleTime: tomorrow,
      sound: true,
      vibrate: false,
    });
  }
}

// Exportar instância singleton
export const notificationService = NotificationService.getInstance();

export default notificationService;
