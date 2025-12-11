import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  isTaskArray,
} from '../features/tasks/types';
import {
  generateId,
  calculateStats,
} from '../features/tasks/utils';
import { createNextOccurrence } from '../features/tasks/recurrence';
import { STORAGE_KEYS, loadDataVersioned, saveDataVersioned } from '../services/storage';
import { addTimelineActivity } from '../services/timelineService';
import { useSettings } from './SettingsContext';
import { logger } from '../services/logger';

// Storage key para sessão ativa de foco
const ACTIVE_FOCUS_SESSION_KEY = '@mindinline:active_focus_session';

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

  // Time Tracking (Timer Convencional)
  startTaskTimer: (taskId: string) => Promise<void>;
  pauseTaskTimer: (taskId: string) => Promise<void>;
  stopTaskTimer: (taskId: string) => Promise<void>;

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
  const { settings } = useSettings();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFocusSession, setActiveFocusSession] = useState<ActiveFocusSession | null>(null);

  // Calcular stats diretamente de tasks com memoização
  // Só recalcula quando tasks muda, evitando re-renders desnecessários
  const stats = useMemo(() => calculateStats(tasks), [tasks]);

  // Sincronizar focusModeConfig com o SettingsContext
  const focusModeConfig: FocusModeConfig = {
    focusDuration: settings.focusMode.focusDuration,
    shortBreakDuration: settings.focusMode.shortBreakDuration,
    longBreakDuration: settings.focusMode.longBreakDuration,
    sessionsBeforeLongBreak: settings.focusMode.sessionsBeforeLongBreak,
    autoStartBreak: settings.focusMode.autoStartBreak,
    autoStartFocus: settings.focusMode.autoStartFocus,
    soundEnabled: settings.focusMode.soundEnabled,
  };

  // Carregar tasks do storage ao iniciar
  useEffect(() => {
    loadTasksFromStorage();
    restoreActiveFocusSession();
  }, []);

  // Atualizar elapsed a cada segundo quando a sessão está rodando
  useEffect(() => {
    if (!activeFocusSession?.isRunning) return;

    const interval = setInterval(() => {
      setActiveFocusSession(prev => {
        if (!prev || !prev.isRunning) return prev;

        const newElapsed = prev.elapsed + 1;

        // Auto-completar quando atingir duração
        if (newElapsed >= prev.duration) {
          // Marcar como não-rodando para evitar loop
          const completed = { ...prev, elapsed: prev.duration, isRunning: false };
          persistActiveFocusSession(completed);
          // completeFocusSession será chamado pela UI quando detectar isso
          return completed;
        }

        const updated = { ...prev, elapsed: newElapsed };
        // Persistir a cada 5 segundos para evitar muitas escritas
        if (newElapsed % 5 === 0) {
          persistActiveFocusSession(updated);
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeFocusSession?.isRunning, activeFocusSession?.sessionId]);

  // Persistir sessão quando mudar (exceto updates frequentes de elapsed)
  useEffect(() => {
    if (activeFocusSession && !activeFocusSession.isRunning) {
      persistActiveFocusSession(activeFocusSession);
    }
  }, [activeFocusSession?.isRunning, activeFocusSession?.taskId]);

  // Carregar tasks do AsyncStorage
  const loadTasksFromStorage = async () => {
    try {
      setLoading(true);
      const savedTasks = await loadDataVersioned<Task[]>(STORAGE_KEYS.TASKS, isTaskArray);
      if (savedTasks) {
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
      await saveDataVersioned(STORAGE_KEYS.TASKS, updatedTasks);
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Erro ao salvar tasks:', error);
      throw error;
    }
  };

  // Persistir sessão ativa de foco
  const persistActiveFocusSession = async (session: ActiveFocusSession | null) => {
    try {
      if (session) {
        await AsyncStorage.setItem(ACTIVE_FOCUS_SESSION_KEY, JSON.stringify(session));
      } else {
        await AsyncStorage.removeItem(ACTIVE_FOCUS_SESSION_KEY);
      }
    } catch (error) {
      console.error('Erro ao persistir sessão de foco:', error);
    }
  };

  // Restaurar sessão ativa de foco
  const restoreActiveFocusSession = async () => {
    try {
      const stored = await AsyncStorage.getItem(ACTIVE_FOCUS_SESSION_KEY);
      if (!stored) return;

      const session: ActiveFocusSession = JSON.parse(stored);

      // Recalcular elapsed baseado em startedAt
      const startedAt = new Date(session.startedAt).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startedAt) / 1000);

      // Se a sessão já terminou enquanto o app estava fechado
      if (elapsed >= session.duration) {
        logger.info('Sessão de foco expirou enquanto app estava fechado');
        await persistActiveFocusSession(null);
        // Completar a sessão automaticamente
        setActiveFocusSession({ ...session, elapsed: session.duration, isRunning: false });
        // Nota: completeFocusSession será chamado pela UI quando detectar elapsed >= duration
        return;
      }

      // Restaurar sessão com elapsed atualizado
      setActiveFocusSession({ ...session, elapsed, isRunning: session.isRunning });
    } catch (error) {
      console.error('Erro ao restaurar sessão de foco:', error);
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

    let updatedTasks = tasks.map(t => {
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

    // Criar próxima ocorrência se task recorrente foi completada
    if (newStatus === 'completed' && task.isRecurring && task.recurrence) {
      try {
        const nextOccurrence = createNextOccurrence(task);
        updatedTasks = [...updatedTasks, nextOccurrence];

        // Registrar criação da próxima ocorrência no timeline
        await addTimelineActivity({
          type: 'task_created',
          title: `Tarefa recorrente criada: ${nextOccurrence.title}`,
          description: `Próxima ocorrência de "${task.title}"`,
          metadata: {
            taskId: nextOccurrence.id,
            originalTaskId: task.id,
          },
        });

        logger.info('Próxima ocorrência criada:', {
          original: task.id,
          next: nextOccurrence.id,
          dueDate: nextOccurrence.dueDate,
        });
      } catch (error: any) {
        logger.warn('Não foi possível criar próxima ocorrência:', error.message);
        // Continuar mesmo se falhar (ex: endDate atingido)
      }
    }

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
    await persistActiveFocusSession(session);
  };

  const pauseFocusSession = async (): Promise<void> => {
    if (activeFocusSession) {
      const paused = {
        ...activeFocusSession,
        isRunning: false,
      };
      setActiveFocusSession(paused);
      await persistActiveFocusSession(paused);
    }
  };

  const resumeFocusSession = async (): Promise<void> => {
    if (activeFocusSession) {
      const resumed = {
        ...activeFocusSession,
        isRunning: true,
      };
      setActiveFocusSession(resumed);
      await persistActiveFocusSession(resumed);
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
    await persistActiveFocusSession(null);
  };

  const cancelFocusSession = async (): Promise<void> => {
    setActiveFocusSession(null);
    await persistActiveFocusSession(null);
  };

  // updateFocusModeConfig now does nothing since config comes from SettingsContext
  const updateFocusModeConfig = (config: Partial<FocusModeConfig>) => {
    console.warn('updateFocusModeConfig is deprecated. Use SettingsContext instead.');
  };

  // ==========================================
  // TIME TRACKING (TIMER CONVENCIONAL)
  // ==========================================

  /**
   * Inicia o timer de uma task
   */
  const startTaskTimer = async (taskId: string): Promise<void> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      logger.warn('Task não encontrada:', taskId);
      return;
    }

    const now = new Date().toISOString();

    const updatedTask: Task = {
      ...task,
      timeTracking: {
        isRunning: true,
        startedAt: now,
        pausedAt: undefined,
        totalSeconds: task.timeTracking?.totalSeconds || 0,
        sessions: task.timeTracking?.sessions || [],
      },
      updatedAt: now,
    };

    const updatedTasks = tasks.map(t => (t.id === taskId ? updatedTask : t));
    setTasks(updatedTasks);
    await saveTasksToStorage(updatedTasks);

    logger.info('Timer iniciado para task:', taskId);
  };

  /**
   * Pausa o timer de uma task
   */
  const pauseTaskTimer = async (taskId: string): Promise<void> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.timeTracking?.isRunning) {
      logger.warn('Timer não está rodando ou task não encontrada:', taskId);
      return;
    }

    const now = new Date().toISOString();
    const startedAt = task.timeTracking.startedAt!;

    // Calcular segundos desde que iniciou
    const elapsed = Math.floor(
      (new Date(now).getTime() - new Date(startedAt).getTime()) / 1000
    );

    const updatedTask: Task = {
      ...task,
      timeTracking: {
        ...task.timeTracking,
        isRunning: false,
        pausedAt: now,
        totalSeconds: task.timeTracking.totalSeconds + elapsed,
      },
      updatedAt: now,
    };

    const updatedTasks = tasks.map(t => (t.id === taskId ? updatedTask : t));
    setTasks(updatedTasks);
    await saveTasksToStorage(updatedTasks);

    logger.info('Timer pausado:', {
      taskId,
      elapsed,
      total: updatedTask.timeTracking?.totalSeconds,
    });
  };

  /**
   * Para o timer e finaliza a sessão (salva no histórico)
   */
  const stopTaskTimer = async (taskId: string): Promise<void> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.timeTracking) {
      logger.warn('Task ou timeTracking não encontrado:', taskId);
      return;
    }

    const now = new Date().toISOString();
    let totalSeconds = task.timeTracking.totalSeconds;

    // Se estava rodando, calcular tempo final
    if (task.timeTracking.isRunning && task.timeTracking.startedAt) {
      const elapsed = Math.floor(
        (new Date(now).getTime() - new Date(task.timeTracking.startedAt).getTime()) / 1000
      );
      totalSeconds += elapsed;
    }

    // Criar sessão para histórico
    const session = {
      startedAt: task.timeTracking.sessions.length > 0
        ? task.timeTracking.sessions[0].startedAt
        : task.timeTracking.startedAt || now,
      endedAt: now,
      duration: totalSeconds,
    };

    const updatedTask: Task = {
      ...task,
      timeTracking: {
        isRunning: false,
        startedAt: undefined,
        pausedAt: undefined,
        totalSeconds: 0, // Reset para próxima vez
        sessions: [...(task.timeTracking.sessions || []), session],
      },
      updatedAt: now,
    };

    const updatedTasks = tasks.map(t => (t.id === taskId ? updatedTask : t));
    setTasks(updatedTasks);
    await saveTasksToStorage(updatedTasks);

    // Adicionar atividade na timeline
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const timeStr = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;

    await addTimelineActivity({
      type: 'focus_session',
      title: `Timer finalizado: ${task.title}`,
      description: `Tempo gasto: ${timeStr}`,
      metadata: {
        taskId,
        taskTitle: task.title,
        duration: totalSeconds,
      },
    });

    logger.info('Timer finalizado:', { taskId, totalSeconds });
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
    startTaskTimer,
    pauseTaskTimer,
    stopTaskTimer,
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
