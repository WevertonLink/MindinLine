// ==========================================
// ✅ TIPOS E INTERFACES: TASKS
// ==========================================

/**
 * Prioridade da tarefa
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Status da tarefa
 */
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Categoria da tarefa
 */
export type TaskCategory =
  | 'work'
  | 'study'
  | 'personal'
  | 'health'
  | 'finance'
  | 'home'
  | 'other';

/**
 * Tipo de recorrência
 */
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'custom';

/**
 * Configuração de recorrência
 */
export interface RecurrenceConfig {
  type: RecurrenceType;
  interval: number; // Ex: a cada 2 dias, 3 semanas, etc.
  daysOfWeek?: number[]; // 0=domingo, 1=segunda, etc (para weekly)
  endDate?: string; // Data de término da recorrência
}

/**
 * Subtarefa
 */
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

/**
 * Sessão de foco (Pomodoro)
 */
export interface FocusSession {
  id: string;
  taskId: string;
  startedAt: string;
  endedAt?: string;
  duration: number; // segundos
  completed: boolean; // Se completou a sessão ou foi interrompida
  type: 'focus' | 'break'; // Foco ou pausa
}

/**
 * Tarefa completa
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  category?: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;

  // Datas
  createdAt: string;
  updatedAt: string;
  dueDate?: string; // Data de vencimento
  completedAt?: string;

  // Relacionamentos
  flowId?: string; // ID do fluxo vinculado (FlowKeeper)
  stepId?: string; // ID da etapa vinculada (FlowKeeper)
  parentTaskId?: string; // ID da tarefa pai (para subtarefas)

  // Subtarefas
  subtasks: Subtask[];

  // Tempo estimado e gasto
  estimatedMinutes?: number; // Tempo estimado
  actualMinutes?: number; // Tempo real gasto
  focusSessions: FocusSession[]; // Sessões de foco (Pomodoro)

  // Recorrência
  isRecurring: boolean;
  recurrence?: RecurrenceConfig;

  // Metadados
  tags?: string[];
  notes?: string; // Notas adicionais
}

/**
 * Input para criar tarefa
 */
export interface CreateTaskInput {
  title: string;
  description?: string;
  category?: TaskCategory;
  priority?: TaskPriority;
  dueDate?: string;
  estimatedMinutes?: number;
  flowId?: string;
  stepId?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurrence?: RecurrenceConfig;
}

/**
 * Input para atualizar tarefa
 */
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  category?: TaskCategory;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  estimatedMinutes?: number;
  tags?: string[];
  notes?: string;
}

/**
 * Input para criar subtarefa
 */
export interface CreateSubtaskInput {
  title: string;
}

/**
 * Filtros para listar tarefas
 */
export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  flowId?: string;
  dueToday?: boolean;
  overdue?: boolean;
  searchQuery?: string;
}

/**
 * Estatísticas das tarefas
 */
export interface TasksStats {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  cancelledTasks: number;
  overdueTasks: number;
  dueTodayTasks: number;
  totalFocusTime: number; // minutos totais de foco
  completionRate: number; // 0-100
}

/**
 * Opções de ordenação
 */
export type TaskSortBy =
  | 'createdAt'
  | 'updatedAt'
  | 'dueDate'
  | 'priority'
  | 'title';

export type SortOrder = 'asc' | 'desc';

/**
 * Configurações do modo de foco (Pomodoro)
 */
export interface FocusModeConfig {
  focusDuration: number; // minutos (padrão: 25)
  shortBreakDuration: number; // minutos (padrão: 5)
  longBreakDuration: number; // minutos (padrão: 15)
  sessionsBeforeLongBreak: number; // padrão: 4
  autoStartBreak: boolean; // padrão: false
  autoStartFocus: boolean; // padrão: false
  soundEnabled: boolean; // padrão: true
}

/**
 * Estado de uma sessão de foco ativa
 */
export interface ActiveFocusSession {
  taskId: string;
  sessionId: string;
  type: 'focus' | 'break';
  startedAt: string;
  duration: number; // segundos totais
  elapsed: number; // segundos decorridos
  isRunning: boolean;
  completedSessions: number; // Sessões completas no ciclo atual
}

// ==========================================
// 🔍 TYPE GUARDS (Validação de Dados)
// ==========================================

/**
 * Valida se um objeto é um Subtask válido
 */
export const isSubtask = (obj: any): obj is Subtask => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.completed === 'boolean' &&
    typeof obj.createdAt === 'string'
  );
};

/**
 * Valida se um objeto é um FocusSession válido
 */
export const isFocusSession = (obj: any): obj is FocusSession => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.taskId === 'string' &&
    typeof obj.startedAt === 'string' &&
    typeof obj.duration === 'number' &&
    typeof obj.completed === 'boolean' &&
    (obj.type === 'focus' || obj.type === 'break')
  );
};

/**
 * Valida se um objeto é um Task válido
 */
export const isTask = (obj: any): obj is Task => {
  if (typeof obj !== 'object' || obj === null) return false;

  // Campos obrigatórios
  if (
    typeof obj.id !== 'string' ||
    typeof obj.title !== 'string' ||
    typeof obj.createdAt !== 'string' ||
    typeof obj.updatedAt !== 'string'
  ) {
    return false;
  }

  // Validar enums
  const validPriorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
  if (!validPriorities.includes(obj.priority)) {
    return false;
  }

  const validStatuses: TaskStatus[] = ['todo', 'in_progress', 'completed', 'cancelled'];
  if (!validStatuses.includes(obj.status)) {
    return false;
  }

  // Validar arrays
  if (!Array.isArray(obj.subtasks) || !obj.subtasks.every(isSubtask)) {
    return false;
  }

  if (!Array.isArray(obj.focusSessions) || !obj.focusSessions.every(isFocusSession)) {
    return false;
  }

  // Validar campos booleanos
  if (typeof obj.isRecurring !== 'boolean') {
    return false;
  }

  // Campos opcionais - se existirem, validar tipo
  if (obj.category !== undefined) {
    const validCategories: TaskCategory[] = [
      'work',
      'study',
      'personal',
      'health',
      'finance',
      'home',
      'other',
    ];
    if (!validCategories.includes(obj.category)) {
      return false;
    }
  }

  if (obj.tags !== undefined && !Array.isArray(obj.tags)) {
    return false;
  }

  return true;
};

/**
 * Valida se um array contém apenas Tasks válidas
 */
export const isTaskArray = (arr: any): arr is Task[] => {
  return Array.isArray(arr) && arr.every(isTask);
};
