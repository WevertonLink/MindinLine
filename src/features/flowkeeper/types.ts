// ==========================================
// 🎯 TIPOS E INTERFACES: FLOWKEEPER
// ==========================================

/**
 * Status do fluxo
 */
export type FlowStatus = 'active' | 'paused' | 'completed';

/**
 * Categoria do fluxo (expansível)
 */
export type FlowCategory =
  | 'programming'
  | 'language'
  | 'science'
  | 'arts'
  | 'business'
  | 'personal'
  | 'other';

/**
 * Tipo de material de estudo
 */
export type MaterialType =
  | 'link'
  | 'video'
  | 'pdf'
  | 'book'
  | 'article'
  | 'note'
  | 'other';

/**
 * Material de estudo
 */
export interface Material {
  id: string;
  title: string;
  type: MaterialType;
  url?: string; // URL ou caminho local
  notes?: string;
  createdAt: string;
}

/**
 * Etapa do fluxo de aprendizado
 */
export interface FlowStep {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  order: number;
  materials: Material[];
  estimatedTime?: number; // minutos
  completedAt?: string;
  createdAt: string;
}

/**
 * Fluxo de aprendizado completo
 */
export interface Flow {
  id: string;
  title: string;
  description?: string;
  category?: FlowCategory;
  status: FlowStatus;
  steps: FlowStep[];
  progress: number; // 0-100 (calculado automaticamente)
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  tags?: string[];
}

/**
 * Input para criar novo fluxo
 */
export interface CreateFlowInput {
  title: string;
  description?: string;
  category?: FlowCategory;
  tags?: string[];
}

/**
 * Input para atualizar fluxo
 */
export interface UpdateFlowInput {
  title?: string;
  description?: string;
  category?: FlowCategory;
  status?: FlowStatus;
  tags?: string[];
}

/**
 * Input para criar nova etapa
 */
export interface CreateStepInput {
  title: string;
  description?: string;
  estimatedTime?: number;
}

/**
 * Input para criar novo material
 */
export interface CreateMaterialInput {
  title: string;
  type: MaterialType;
  url?: string;
  notes?: string;
}

/**
 * Estatísticas do FlowKeeper
 */
export interface FlowKeeperStats {
  totalFlows: number;
  activeFlows: number;
  completedFlows: number;
  totalSteps: number;
  completedSteps: number;
  averageProgress: number;
}

/**
 * Filtros para listar fluxos
 */
export interface FlowFilters {
  status?: FlowStatus;
  category?: FlowCategory;
  searchQuery?: string;
}

/**
 * Opções de ordenação
 */
export type FlowSortBy =
  | 'createdAt'
  | 'updatedAt'
  | 'title'
  | 'progress';

export type SortOrder = 'asc' | 'desc';
