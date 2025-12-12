import {
  Task,
  Subtask,
  TaskPriority,
  TaskStatus,
  TaskCategory,
  TasksStats,
  FocusSession,
} from './types';

// ==========================================
// 🔧 UTILITÁRIOS: TASKS
// ==========================================

/**
 * Gerar ID único
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ==========================================
// 📅 DATAS E VENCIMENTOS
// ==========================================

/**
 * Verificar se tarefa está vencida
 */
export const isOverdue = (task: Task): boolean => {
  if (!task.dueDate || task.status === 'completed' || task.status === 'cancelled') {
    return false;
  }

  const dueDate = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today;
};

/**
 * Verificar se tarefa vence hoje
 */
export const isDueToday = (task: Task): boolean => {
  if (!task.dueDate) return false;

  const dueDate = new Date(task.dueDate);
  const today = new Date();

  return (
    dueDate.getDate() === today.getDate() &&
    dueDate.getMonth() === today.getMonth() &&
    dueDate.getFullYear() === today.getFullYear()
  );
};

/**
 * Verificar se tarefa vence esta semana
 */
export const isDueThisWeek = (task: Task): boolean => {
  if (!task.dueDate) return false;

  const dueDate = new Date(task.dueDate);
  const today = new Date();
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  return dueDate >= today && dueDate <= weekFromNow;
};

// ==========================================
// 🎯 PRIORIDADES E STATUS
// ==========================================

/**
 * Obter cor da prioridade
 */
export const getPriorityColor = (priority: TaskPriority): string => {
  const colors = {
    low: '#10b981', // verde
    medium: '#3b82f6', // azul
    high: '#f59e0b', // amarelo
    urgent: '#ef4444', // vermelho
  };
  return colors[priority];
};

/**
 * Obter cor do status
 */
export const getStatusColor = (status: TaskStatus): string => {
  const colors = {
    todo: '#6366f1', // roxo
    in_progress: '#3b82f6', // azul
    completed: '#10b981', // verde
    cancelled: '#6b7280', // cinza
  };
  return colors[status];
};

/**
 * Traduzir prioridade
 */
export const translatePriority = (priority: TaskPriority): string => {
  const translations = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    urgent: 'Urgente',
  };
  return translations[priority];
};

/**
 * Traduzir status
 */
export const translateStatus = (status: TaskStatus): string => {
  const translations = {
    todo: 'A Fazer',
    in_progress: 'Em Progresso',
    completed: 'Concluída',
    cancelled: 'Cancelada',
  };
  return translations[status];
};

/**
 * Traduzir categoria
 */
export const translateCategory = (category: TaskCategory): string => {
  const translations = {
    work: 'Trabalho',
    study: 'Estudo',
    personal: 'Pessoal',
    health: 'Saúde',
    finance: 'Finanças',
    home: 'Casa',
    other: 'Outro',
  };
  return translations[category];
};

// ==========================================
// 📊 CÁLCULOS E PROGRESSO
// ==========================================

/**
 * Calcular progresso das subtarefas
 */
export const calculateSubtasksProgress = (subtasks: Subtask[]): number => {
  if (subtasks.length === 0) return 0;

  const completed = subtasks.filter(st => st.completed).length;
  return Math.round((completed / subtasks.length) * 100);
};

/**
 * Calcular tempo total de foco
 */
export const calculateTotalFocusTime = (sessions: FocusSession[]): number => {
  return sessions
    .filter(s => s.type === 'focus' && s.completed)
    .reduce((total, session) => total + session.duration, 0);
};

/**
 * Calcular estatísticas gerais
 */
export const calculateStats = (tasks: Task[]): TasksStats => {
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const cancelledTasks = tasks.filter(t => t.status === 'cancelled').length;
  const overdueTasks = tasks.filter(isOverdue).length;
  const dueTodayTasks = tasks.filter(isDueToday).length;

  const totalFocusTime = Math.round(
    tasks.reduce((total, task) => {
      return total + calculateTotalFocusTime(task.focusSessions);
    }, 0) / 60
  ); // converter para minutos

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    todoTasks,
    inProgressTasks,
    completedTasks,
    cancelledTasks,
    overdueTasks,
    dueTodayTasks,
    totalFocusTime,
    completionRate,
  };
};

// ==========================================
// 🔍 FILTROS E ORDENAÇÃO
// ==========================================

/**
 * Filtrar tarefas por query de busca
 */
export const filterTasksBySearch = (tasks: Task[], query: string): Task[] => {
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) return tasks;

  return tasks.filter(
    task =>
      task.title.toLowerCase().includes(lowerQuery) ||
      task.description?.toLowerCase().includes(lowerQuery) ||
      task.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Ordenar tarefas
 */
export const sortTasks = (
  tasks: Task[],
  sortBy: 'priority' | 'dueDate' | 'createdAt' = 'createdAt',
  order: 'asc' | 'desc' = 'desc'
): Task[] => {
  const sorted = [...tasks];

  sorted.sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'priority') {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (sortBy === 'dueDate') {
      const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      comparison = aDate - bDate;
    } else if (sortBy === 'createdAt') {
      comparison =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
};

// ==========================================
// 📅 FORMATAÇÃO
// ==========================================

/**
 * Converter data DD/MM/AAAA para ISO
 */
export const parseBrazilianDate = (dateStr: string): string | null => {
  const trimmed = dateStr.trim();
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  // Validar dia e mês
  if (day < 1 || day > 31 || month < 1 || month > 12) return null;

  // Criar data (mês é 0-indexed no JS)
  const date = new Date(year, month - 1, day);

  // Validar se a data é válida (ex: 31/02 é inválida)
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    return null;
  }

  return date.toISOString();
};

/**
 * Formatar data para exibição
 */
export const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);

  // Verificar se é uma data válida
  if (isNaN(date.getTime())) return 'Data inválida';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Formatar data relativa
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
 * Formatar data de vencimento
 */
export const formatDueDate = (dueDate: string): string => {
  const date = new Date(dueDate);

  // Verificar se é uma data válida
  if (isNaN(date.getTime())) return 'Data inválida';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diffMs = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `Atrasada ${Math.abs(diffDays)} dia(s)`;
  if (diffDays === 0) return 'Vence hoje';
  if (diffDays === 1) return 'Vence amanhã';
  if (diffDays < 7) return `Vence em ${diffDays} dias`;
  return formatDate(dueDate);
};

/**
 * Formatar tempo (minutos para formato legível)
 */
export const formatTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}min`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
};

/**
 * Formatar tempo em segundos (para timer)
 */
export const formatTimerSeconds = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// ==========================================
// ✅ VALIDAÇÕES
// ==========================================

/**
 * Validar título
 */
export const validateTitle = (title: string): boolean => {
  return title.trim().length >= 3;
};

/**
 * Validar data de vencimento
 */
export const validateDueDate = (dueDate: string): boolean => {
  const date = new Date(dueDate);
  return !isNaN(date.getTime());
};
