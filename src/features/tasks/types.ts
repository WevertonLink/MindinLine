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
