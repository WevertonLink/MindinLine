import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Task,
  Subtask,
  FocusSession,
  CreateTaskInput,
  UpdateTaskInput,
  CreateSubtaskInput,
  TasksStats,
  TaskStatus,
  ActiveFocusSession,
  FocusModeConfig,
} from '../features/tasks/types';
import {
  generateId,
  calculateStats,
} from '../features/tasks/utils';
import { saveTasks, loadTasks } from '../services/storage';
import { addTimelineActivity } from '../services/timelineService';

// ==========================================
// ✅ TASKS CONTEXT
// ==========================================

interface TasksContextData {
  // Estado
  tasks: Task[];
  stats: TasksStats;
  loading: boolean;
  activeFocusSession: ActiveFocusSession | null;
  focusModeConfig: FocusModeConfig;

  // CRUD de Tasks
  createTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (taskId: string, input: UpdateTaskInput) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  getTaskById: (taskId: string) => Task | undefined;
  toggleTaskStatus: (taskId: string) => Promise<void>;

  // CRUD de Subtasks
  addSubtask: (taskId: string, input: CreateSubtaskInput) => Promise<Subtask>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;

  // Focus Sessions (Pomodoro)
  startFocusSession: (taskId: string, type: 'focus' | 'break') => Promise<void>;
  pauseFocusSession: () => Promise<void>;
  resumeFocusSession: () => Promise<void>;
  completeFocusSession: () => Promise<void>;
  cancelFocusSession: () => Promise<void>;
  updateFocusModeConfig: (config: Partial<FocusModeConfig>) => void;

  // Utilitários
  refreshTasks: () => Promise<void>;
}

const TasksContext = createContext<TasksContextData>({} as TasksContextData);

// ==========================================
// 🔧 PROVIDER
// ==========================================

interface TasksProviderProps {
  children: ReactNode;
}

export const TasksProvider: React.FC<TasksProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TasksStats>({
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    cancelledTasks: 0,
    overdueTasks: 0,
    dueTodayTasks: 0,
    totalFocusTime: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeFocusSession, setActiveFocusSession] = useState<ActiveFocusSession | null>(null);
  const [focusModeConfig, setFocusModeConfig] = useState<FocusModeConfig>({
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreak: false,
    autoStartFocus: false,
    soundEnabled: true,
  });

  // Carregar tasks do storage ao iniciar
  useEffect(() => {
    loadTasksFromStorage();
  }, []);

  // Atualizar stats sempre que tasks mudar
  useEffect(() => {
    setStats(calculateStats(tasks));
  }, [tasks]);

  // Carregar tasks do AsyncStorage
  const loadTasksFromStorage = async () => {
    try {
      setLoading(true);
      const savedTasks = await loadTasks();
      if (savedTasks && Array.isArray(savedTasks)) {
        setTasks(savedTasks);
      }
    } catch (error) {
      console.error('Erro ao carregar tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Salvar tasks no AsyncStorage
  const saveTasksToStorage = async (updatedTasks: Task[]) => {
    try {
      await saveTasks(updatedTasks);
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Erro ao salvar tasks:', error);
      throw error;
    }
  };

  // ==========================================
  // CRUD DE TASKS
  // ==========================================

  const createTask = async (input: CreateTaskInput): Promise<Task> => {
    const newTask: Task = {
      id: generateId(),
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority || 'medium',
      status: 'todo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: input.dueDate,
      flowId: input.flowId,
      stepId: input.stepId,
      subtasks: [],
      focusSessions: [],
      estimatedMinutes: input.estimatedMinutes,
      tags: input.tags || [],
      isRecurring: input.isRecurring || false,
      recurrence: input.recurrence,
    };

    const updatedTasks = [...tasks, newTask];
    await saveTasksToStorage(updatedTasks);

    // Registrar no Timeline
    await addTimelineActivity({
      type: 'task_created',
      title: `Tarefa criada: ${newTask.title}`,
      description: newTask.description,
      metadata: {
        taskId: newTask.id,
        taskTitle: newTask.title,
        taskPriority: newTask.priority,
      },
    });

    return newTask;
  };

  const updateTask = async (taskId: string, input: UpdateTaskInput): Promise<void> => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          ...input,
          updatedAt: new Date().toISOString(),
        };
      }
      return task;
    });

    await saveTasksToStorage(updatedTasks);
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    await saveTasksToStorage(updatedTasks);
  };

  const getTaskById = (taskId: string): Task | undefined => {
    return tasks.find(task => task.id === taskId);
  };

  const toggleTaskStatus = async (taskId: string): Promise<void> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus: TaskStatus = task.status === 'completed' ? 'todo' : 'completed';

    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    await saveTasksToStorage(updatedTasks);

    // Registrar no Timeline quando completar
    if (newStatus === 'completed') {
      await addTimelineActivity({
        type: 'task_completed',
        title: `Tarefa concluída: ${task.title}`,
        description: task.description,
        metadata: {
          taskId: task.id,
          taskTitle: task.title,
          taskPriority: task.priority,
        },
      });
    }
  };

  // ==========================================
  // CRUD DE SUBTASKS
  // ==========================================

  const addSubtask = async (
    taskId: string,
    input: CreateSubtaskInput
  ): Promise<Subtask> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task não encontrada');

    const newSubtask: Subtask = {
      id: generateId(),
      title: input.title,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedSubtasks = [...task.subtasks, newSubtask];

    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: updatedSubtasks,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    await saveTasksToStorage(updatedTasks);

    return newSubtask;
  };

  const toggleSubtask = async (taskId: string, subtaskId: string): Promise<void> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task não encontrada');

    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return;

    const isCompleting = !subtask.completed;

    const updatedSubtasks = task.subtasks.map(st => {
      if (st.id === subtaskId) {
        return { ...st, completed: !st.completed };
      }
      return st;
    });

    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: updatedSubtasks,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    await saveTasksToStorage(updatedTasks);

    // Registrar no Timeline quando completar
    if (isCompleting) {
      await addTimelineActivity({
        type: 'subtask_completed',
        title: `Subtarefa concluída: ${subtask.title}`,
        description: `Da tarefa: ${task.title}`,
        metadata: {
          taskId: task.id,
          taskTitle: task.title,
          subtaskId: subtask.id,
          subtaskTitle: subtask.title,
        },
      });
    }
  };

  const deleteSubtask = async (taskId: string, subtaskId: string): Promise<void> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task não encontrada');

    const updatedSubtasks = task.subtasks.filter(st => st.id !== subtaskId);

    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: updatedSubtasks,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    await saveTasksToStorage(updatedTasks);
  };

  // ==========================================
  // FOCUS SESSIONS (POMODORO)
  // ==========================================

  const startFocusSession = async (taskId: string, type: 'focus' | 'break'): Promise<void> => {
    const duration = type === 'focus'
      ? focusModeConfig.focusDuration * 60
      : focusModeConfig.shortBreakDuration * 60;

    const session: ActiveFocusSession = {
      taskId,
      sessionId: generateId(),
      type,
      startedAt: new Date().toISOString(),
      duration,
      elapsed: 0,
      isRunning: true,
      completedSessions: 0,
    };

    setActiveFocusSession(session);
  };

  const pauseFocusSession = async (): Promise<void> => {
    if (activeFocusSession) {
      setActiveFocusSession({
        ...activeFocusSession,
        isRunning: false,
      });
    }
  };

  const resumeFocusSession = async (): Promise<void> => {
    if (activeFocusSession) {
      setActiveFocusSession({
        ...activeFocusSession,
        isRunning: true,
      });
    }
  };

  const completeFocusSession = async (): Promise<void> => {
    if (!activeFocusSession) return;

    const task = tasks.find(t => t.id === activeFocusSession.taskId);
    if (!task) return;

    const newSession: FocusSession = {
      id: activeFocusSession.sessionId,
      taskId: activeFocusSession.taskId,
      startedAt: activeFocusSession.startedAt,
      endedAt: new Date().toISOString(),
      duration: activeFocusSession.duration,
      completed: true,
      type: activeFocusSession.type,
    };

    const updatedFocusSessions = [...task.focusSessions, newSession];

    // Calcular tempo real gasto
    const totalFocusTime = updatedFocusSessions
      .filter(s => s.type === 'focus' && s.completed)
      .reduce((sum, s) => sum + s.duration, 0);

    const actualMinutes = Math.round(totalFocusTime / 60);

    const updatedTasks = tasks.map(t => {
      if (t.id === activeFocusSession.taskId) {
        return {
          ...t,
          focusSessions: updatedFocusSessions,
          actualMinutes,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    await saveTasksToStorage(updatedTasks);

    // Registrar no Timeline
    if (activeFocusSession.type === 'focus') {
      await addTimelineActivity({
        type: 'focus_session',
        title: `Sessão de foco: ${task.title}`,
        description: `Sessão de ${Math.round(activeFocusSession.duration / 60)} minutos concluída`,
        metadata: {
          taskId: task.id,
          taskTitle: task.title,
          duration: activeFocusSession.duration,
          sessionType: 'focus',
        },
      });
    }

    setActiveFocusSession(null);
  };

  const cancelFocusSession = async (): Promise<void> => {
    setActiveFocusSession(null);
  };

  const updateFocusModeConfig = (config: Partial<FocusModeConfig>) => {
    setFocusModeConfig(prev => ({ ...prev, ...config }));
  };

  // ==========================================
  // UTILITÁRIOS
  // ==========================================

  const refreshTasks = async (): Promise<void> => {
    await loadTasksFromStorage();
  };

  // ==========================================
  // PROVIDER VALUE
  // ==========================================

  const value: TasksContextData = {
    tasks,
    stats,
    loading,
    activeFocusSession,
    focusModeConfig,
    createTask,
    updateTask,
    deleteTask,
    getTaskById,
    toggleTaskStatus,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    startFocusSession,
    pauseFocusSession,
    resumeFocusSession,
    completeFocusSession,
    cancelFocusSession,
    updateFocusModeConfig,
    refreshTasks,
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

// ==========================================
// 🪝 HOOK
// ==========================================

export const useTasks = () => {
  const context = useContext(TasksContext);

  if (!context) {
    throw new Error('useTasks must be used within TasksProvider');
  }

  return context;
};

export default TasksContext;
