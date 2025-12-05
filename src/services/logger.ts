// ==========================================
// 📝 LOGGER SERVICE
// ==========================================

/**
 * Logger Service - Sistema de logging que respeita o ambiente de execução.
 *
 * Em desenvolvimento (__DEV__ = true):
 * - Todos os logs são exibidos no console
 * - Útil para debugging e desenvolvimento
 *
 * Em produção (__DEV__ = false):
 * - Apenas errors são exibidos
 * - logs, info e warns são silenciados
 * - Reduz ruído e melhora performance
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private static instance: Logger;
  private enabledInProduction: LogLevel[] = ['error'];

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Verifica se um tipo de log deve ser exibido baseado no ambiente
   */
  private shouldLog(level: LogLevel): boolean {
    if (__DEV__) {
      // Em desenvolvimento, todos os logs são permitidos
      return true;
    }
    // Em produção, apenas alguns níveis são permitidos
    return this.enabledInProduction.includes(level);
  }

  /**
   * Log genérico - desabilitado em produção
   */
  log(message: string, ...args: any[]): void {
    if (this.shouldLog('log')) {
      console.log(message, ...args);
    }
  }

  /**
   * Log informativo - desabilitado em produção
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(message, ...args);
    }
  }

  /**
   * Warning - desabilitado em produção
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(message, ...args);
    }
  }

  /**
   * Error - sempre habilitado (desenvolvimento e produção)
   */
  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(message, ...args);
    }
  }

  /**
   * Debug - apenas em desenvolvimento
   */
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(message, ...args);
    }
  }

  /**
   * Configura quais níveis de log são permitidos em produção
   * Por padrão, apenas 'error' está habilitado
   */
  setProductionLevels(levels: LogLevel[]): void {
    this.enabledInProduction = levels;
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
