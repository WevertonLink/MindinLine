// ==========================================
// 🛡️ ERROR BOUNDARY
// ==========================================

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, borderRadius } from '../theme/globalStyles';
import { analyticsService } from '../services/analyticsService';
import { logger } from '../services/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * ErrorBoundary - Componente que captura erros de JavaScript em qualquer lugar
 * da árvore de componentes filhos e exibe uma UI de fallback.
 *
 * Uso:
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 *
 * Com callback customizado:
 * <ErrorBoundary onError={(error, errorInfo) => logToService(error)}>
 *   <App />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Atualizar estado para renderizar UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro no console
    logger.error('ErrorBoundary capturou um erro:', error);
    logger.error('Informações do erro:', errorInfo);

    // Logar erro no serviço de analytics/crash reporting
    analyticsService.logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // Adicionar breadcrumb para rastreamento
    analyticsService.addBreadcrumb('Error caught by ErrorBoundary', {
      errorMessage: error.message,
      errorStack: error.stack?.substring(0, 200), // Primeiros 200 chars
    });

    // Atualizar estado com informações do erro
    this.setState({ errorInfo });

    // Callback customizado (para integrar com Sentry, Firebase Crashlytics, etc)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Se fallback customizado foi fornecido, usar ele
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de fallback padrão
      return (
        <View style={styles.container}>
          {/* Ícone de erro */}
          <View style={styles.iconContainer}>
            <Icon name="alert-circle" size={80} color={colors.status.error} />
          </View>

          {/* Título */}
          <Text style={styles.title}>Algo deu errado</Text>

          {/* Mensagem de erro */}
          <Text style={styles.message}>
            {this.state.error?.message || 'Erro desconhecido'}
          </Text>

          {/* Detalhes técnicos (opcional - apenas em DEV) */}
          {__DEV__ && this.state.errorInfo && (
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>Detalhes técnicos:</Text>
              <Text style={styles.detailsText} numberOfLines={10}>
                {this.state.errorInfo.componentStack}
              </Text>
            </View>
          )}

          {/* Botão de reset */}
          <Pressable style={styles.button} onPress={this.handleReset}>
            <Icon name="refresh" size={20} color={colors.text.primary} />
            <Text style={styles.buttonText}>Tentar Novamente</Text>
          </Pressable>

          {/* Dica */}
          <Text style={styles.hint}>
            Se o erro persistir, tente fechar e reabrir o aplicativo
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background.primary,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  detailsContainer: {
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.md,
    marginBottom: spacing.xl,
    maxHeight: 200,
    width: '100%',
  },
  detailsTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  detailsText: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    fontFamily: 'monospace',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  hint: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
});

export default ErrorBoundary;
