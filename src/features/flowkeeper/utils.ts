import { Flow, FlowStep, FlowKeeperStats } from './types';

// ==========================================
// 🔧 UTILITÁRIOS: FLOWKEEPER
// ==========================================

/**
 * Gerar ID único (timestamp + random)
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Calcular progresso do fluxo (0-100)
 */
export const calculateFlowProgress = (steps: FlowStep[]): number => {
  if (steps.length === 0) return 0;

  const completedSteps = steps.filter(step => step.completed).length;
  return Math.round((completedSteps / steps.length) * 100);
};

/**
 * Verificar se fluxo está completo
 */
export const isFlowCompleted = (flow: Flow): boolean => {
  return flow.steps.length > 0 && flow.steps.every(step => step.completed);
};

/**
 * Obter próxima etapa não concluída
 */
export const getNextIncompleteStep = (flow: Flow): FlowStep | null => {
  return flow.steps.find(step => !step.completed) || null;
};

/**
 * Calcular tempo total estimado do fluxo (em minutos)
 */
export const calculateTotalEstimatedTime = (steps: FlowStep[]): number => {
  return steps.reduce((total, step) => {
    return total + (step.estimatedTime || 0);
  }, 0);
};

/**
 * Calcular tempo restante do fluxo (em minutos)
 */
export const calculateRemainingTime = (steps: FlowStep[]): number => {
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
export const sortStepsByOrder = (steps: FlowStep[]): FlowStep[] => {
  return [...steps].sort((a, b) => a.order - b.order);
};

/**
 * Reordenar etapas após adição/remoção
 */
export const reorderSteps = (steps: FlowStep[]): FlowStep[] => {
  return steps.map((step, index) => ({
    ...step,
    order: index,
  }));
};

/**
 * Calcular estatísticas gerais
 */
export const calculateStats = (flows: Flow[]): FlowKeeperStats => {
  const totalFlows = flows.length;
  const activeFlows = flows.filter(f => f.status === 'active').length;
  const completedFlows = flows.filter(f => f.status === 'completed').length;

  const totalSteps = flows.reduce((sum, flow) => sum + flow.steps.length, 0);
  const completedSteps = flows.reduce(
    (sum, flow) => sum + flow.steps.filter(s => s.completed).length,
    0
  );

  const averageProgress =
    totalFlows > 0
      ? Math.round(
          flows.reduce((sum, flow) => sum + flow.progress, 0) / totalFlows
        )
      : 0;

  return {
    totalFlows,
    activeFlows,
    completedFlows,
    totalSteps,
    completedSteps,
    averageProgress,
  };
};

/**
 * Filtrar fluxos por query de busca
 */
export const filterFlowsBySearch = (
  flows: Flow[],
  query: string
): Flow[] => {
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) return flows;

  return flows.filter(
    flow =>
      flow.title.toLowerCase().includes(lowerQuery) ||
      flow.description?.toLowerCase().includes(lowerQuery) ||
      flow.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
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
