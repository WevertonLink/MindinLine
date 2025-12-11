import { Trilha, Etapa, EstatisticasTrilhas } from './types';

// ==========================================
// 🔧 UTILITÁRIOS: TRILHAS DE APRENDIZADO
// ==========================================

/**
 * Gerar ID único (timestamp + random)
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Calcular progresso da trilha (0-100)
 */
export const calculateFlowProgress = (steps: Etapa[]): number => {
  if (steps.length === 0) return 0;

  const completedSteps = steps.filter(step => step.completed).length;
  return Math.round((completedSteps / steps.length) * 100);
};

/**
 * Verificar se trilha está completa
 */
export const isTrilhaCompleted = (trilha: Trilha): boolean => {
  return trilha.steps.length > 0 && trilha.steps.every(step => step.completed);
};

/**
 * Obter próxima etapa não concluída
 */
export const getNextIncompleteStep = (trilha: Trilha): Etapa | null => {
  return trilha.steps.find(step => !step.completed) || null;
};

/**
 * Calcular tempo total estimado da trilha (em minutos)
 */
export const calculateTotalEstimatedTime = (steps: Etapa[]): number => {
  return steps.reduce((total, step) => {
    return total + (step.estimatedTime || 0);
  }, 0);
};

/**
 * Calcular tempo restante da trilha (em minutos)
 */
export const calculateRemainingTime = (steps: Etapa[]): number => {
  return steps
    .filter(step => !step.completed)
    .reduce((total, step) => {
      return total + (step.estimatedTime || 0);
    }, 0);
};

/**
 * Formatar tempo (minutos → "Xh Ymin")
 */
export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}min`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}min`;
};

/**
 * Ordenar etapas por ordem
 */
export const sortStepsByOrder = (steps: Etapa[]): Etapa[] => {
  return [...steps].sort((a, b) => a.order - b.order);
};

/**
 * Reordenar etapas após adição/remoção
 */
export const reorderSteps = (steps: Etapa[]): Etapa[] => {
  return steps.map((step, index) => ({
    ...step,
    order: index,
  }));
};

/**
 * Calcular estatísticas gerais
 */
export const calculateStats = (trilhas: Trilha[]): EstatisticasTrilhas => {
  const totalTrilhas = trilhas.length;
  const activeTrilhas = trilhas.filter(t => t.status === 'active').length;
  const completedTrilhas = trilhas.filter(t => t.status === 'completed').length;

  const totalSteps = trilhas.reduce((sum, trilha) => sum + trilha.steps.length, 0);
  const completedSteps = trilhas.reduce(
    (sum, trilha) => sum + trilha.steps.filter(s => s.completed).length,
    0
  );

  const averageProgress =
    totalTrilhas > 0
      ? Math.round(
          trilhas.reduce((sum, trilha) => sum + trilha.progress, 0) / totalTrilhas
        )
      : 0;

  return {
    totalTrilhas,
    activeTrilhas,
    completedTrilhas,
    totalSteps,
    completedSteps,
    averageProgress,
  };
};

/**
 * Filtrar trilhas por query de busca
 */
export const filterTrilhasBySearch = (
  trilhas: Trilha[],
  query: string
): Trilha[] => {
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) return trilhas;

  return trilhas.filter(
    trilha =>
      trilha.title.toLowerCase().includes(lowerQuery) ||
      trilha.description?.toLowerCase().includes(lowerQuery) ||
      trilha.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Formatar data para exibição (ISO → "DD/MM/YYYY")
 */
export const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Formatar data relativa ("há 2 dias", "há 1 mês")
 */
export const formatRelativeDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Há ${Math.floor(diffDays / 30)} meses`;
  return `Há ${Math.floor(diffDays / 365)} anos`;
};

/**
 * Validar título (não vazio, min 3 chars)
 */
export const validateTitle = (title: string): boolean => {
  return title.trim().length >= 3;
};

/**
 * Traduzir categoria
 */
export const translateCategory = (category: string): string => {
  const translations: Record<string, string> = {
    programming: 'Programação',
    language: 'Idiomas',
    science: 'Ciências',
    arts: 'Artes',
    business: 'Negócios',
    personal: 'Pessoal',
    other: 'Outro',
  };

  return translations[category] || category;
};

/**
 * Traduzir status
 */
export const translateStatus = (status: string): string => {
  const translations: Record<string, string> = {
    active: 'Ativo',
    paused: 'Pausado',
    completed: 'Concluído',
  };

  return translations[status] || status;
};

/**
 * Obter cor do status
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: '#10b981', // verde
    paused: '#f59e0b', // amarelo
    completed: '#6366f1', // roxo
  };

  return colors[status] || '#ffffff';
};
