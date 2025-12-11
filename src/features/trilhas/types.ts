// ==========================================
// 🎯 TIPOS E INTERFACES: TRILHAS DE APRENDIZADO
// ==========================================

/**
 * Status da trilha
 */
export type StatusTrilha = 'active' | 'paused' | 'completed';

/**
 * Categoria da trilha (expansível)
 */
export type CategoriaTrilha =
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
 * Etapa da trilha de aprendizado
 */
export interface Etapa {
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
 * Trilha de aprendizado completa
 */
export interface Trilha {
  id: string;
  title: string;
  description?: string;
  category?: CategoriaTrilha;
  status: StatusTrilha;
  steps: Etapa[];
  progress: number; // 0-100 (calculado automaticamente)
  linkedDeckId?: string; // ID do deck de flashcards gerado desta trilha
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  tags?: string[];
}

/**
 * Input para criar nova trilha
 */
export interface CriarTrilhaInput {
  title: string;
  description?: string;
  category?: CategoriaTrilha;
  tags?: string[];
}

/**
 * Input para atualizar trilha
 */
export interface AtualizarTrilhaInput {
  title?: string;
  description?: string;
  category?: CategoriaTrilha;
  status?: StatusTrilha;
  tags?: string[];
}

/**
 * Input para criar nova etapa
 */
export interface CriarEtapaInput {
  title: string;
  description?: string;
  estimatedTime?: number;
}

/**
 * Input para criar novo material
 */
export interface CriarMaterialInput {
  title: string;
  type: MaterialType;
  url?: string;
  notes?: string;
}

/**
 * Estatísticas das Trilhas
 */
export interface EstatisticasTrilhas {
  totalTrilhas: number;
  activeTrilhas: number;
  completedTrilhas: number;
  totalSteps: number;
  completedSteps: number;
  averageProgress: number;
}

/**
 * Filtros para listar trilhas
 */
export interface TrilhaFilters {
  status?: StatusTrilha;
  category?: CategoriaTrilha;
  searchQuery?: string;
}

/**
 * Opções de ordenação
 */
export type TrilhaSortBy =
  | 'createdAt'
  | 'updatedAt'
  | 'title'
  | 'progress';

export type SortOrder = 'asc' | 'desc';
