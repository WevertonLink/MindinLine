import { StyleSheet } from 'react-native';

// ==========================================
// 🎨 TEMA GLOBAL: GLASSMORPHISM DEEP
// ==========================================

export const colors = {
  // Cores de fundo profundas
  background: {
    primary: '#0a0e27',
    secondary: '#1a1535',
    tertiary: '#0d1b2a',
    quaternary: '#1b263b',
  },

  // Cores de glassmorphism
  glass: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },

  // Cores de texto
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.8)',
    tertiary: 'rgba(255, 255, 255, 0.6)',
    disabled: 'rgba(255, 255, 255, 0.3)',
  },

  // Cores de accent (roxo/azul)
  accent: {
    primary: '#6366f1',
    secondary: '#818cf8',
    tertiary: '#a5b4fc',
  },

  // Cores de status
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
};

export const typography = {
  // Tamanhos de fonte
  fontSize: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },

  // Pesos de fonte
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const shadows = {
  // Sombras para glassmorphism
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 10,
  },

  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },

  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 5,
  },

  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 40,
    elevation: 15,
  },
};

// ==========================================
// 🎯 COMPONENTES REUTILIZÁVEIS
// ==========================================

export const globalStyles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  // Gradiente de fundo (usar com LinearGradient)
  gradientBackground: {
    flex: 1,
  },

  // Container com padding
  containerPadded: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },

  // Card glassmorphism
  glassCard: {
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.lg,
    ...shadows.glass,
  },

  // Card pequeno
  glassCardSmall: {
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.md,
    ...shadows.small,
  },

  // Card grande
  glassCardLarge: {
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.xl,
    ...shadows.large,
  },

  // Título principal
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },

  // Subtítulo
  subtitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },

  // Texto corpo
  bodyText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.tertiary,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },

  // Texto pequeno
  smallText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.tertiary,
  },

  // Botão primário
  buttonPrimary: {
    backgroundColor: colors.accent.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },

  // Texto do botão
  buttonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },

  // Botão secundário (glass)
  buttonSecondary: {
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Input glassmorphism
  input: {
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },

  // Divisor
  divider: {
    height: 1,
    backgroundColor: colors.glass.border,
    marginVertical: spacing.base,
  },

  // Centralizado
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Linha
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Linha com espaço entre elementos
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Gap entre elementos
  gap4: { gap: spacing.xs },
  gap8: { gap: spacing.sm },
  gap12: { gap: spacing.md },
  gap16: { gap: spacing.base },
  gap20: { gap: spacing.lg },
  gap24: { gap: spacing.xl },
});

// ==========================================
// 🎭 ANIMAÇÕES
// ==========================================

export const animations = {
  // Duração das animações
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },

  // Easing
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// ==========================================
// 🔧 UTILITÁRIOS
// ==========================================

export const utils = {
  // Criar opacidade
  opacity: (color: string, opacity: number) => {
    return color.replace(/rgba?\((.+)\)/, `rgba($1, ${opacity})`);
  },

  // Criar blur (para uso com BlurView ou similar)
  blur: {
    light: 10,
    medium: 30,
    heavy: 50,
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  globalStyles,
  animations,
  utils,
};
