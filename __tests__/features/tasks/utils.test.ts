// ==========================================
// 🧪 TESTES: Tasks Utils
// ==========================================

import { calculateStats, isOverdue, isDueToday } from '../../../src/features/tasks/utils';
import { Task } from '../../../src/features/tasks/types';

describe('calculateStats', () => {
  const createTask = (overrides?: Partial<Task>): Task => ({
    id: 'test-1',
    title: 'Test Task',
    priority: 'medium',
    status: 'todo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [],
    focusSessions: [],
    isRecurring: false,
    ...overrides,
  });

  it('deve retornar stats zerados para array vazio', () => {
    const stats = calculateStats([]);

    expect(stats.totalTasks).toBe(0);
    expect(stats.todoTasks).toBe(0);
    expect(stats.inProgressTasks).toBe(0);
    expect(stats.completedTasks).toBe(0);
    expect(stats.cancelledTasks).toBe(0);
    expect(stats.completionRate).toBe(0);
  });

  it('deve contar corretamente tasks por status', () => {
    const tasks = [
      createTask({ status: 'todo' }),
      createTask({ status: 'todo' }),
      createTask({ status: 'in_progress' }),
      createTask({ status: 'completed' }),
      createTask({ status: 'cancelled' }),
    ];

    const stats = calculateStats(tasks);

    expect(stats.totalTasks).toBe(5);
    expect(stats.todoTasks).toBe(2);
    expect(stats.inProgressTasks).toBe(1);
    expect(stats.completedTasks).toBe(1);
    expect(stats.cancelledTasks).toBe(1);
  });

  it('deve calcular completion rate corretamente', () => {
    const tasks = [
      createTask({ status: 'completed' }),
      createTask({ status: 'completed' }),
      createTask({ status: 'todo' }),
      createTask({ status: 'in_progress' }),
    ];

    const stats = calculateStats(tasks);

    expect(stats.completionRate).toBe(50); // 2 de 4 = 50%
  });

  it('deve retornar 0% de completion se nenhuma task completada', () => {
    const tasks = [
      createTask({ status: 'todo' }),
      createTask({ status: 'in_progress' }),
    ];

    const stats = calculateStats(tasks);

    expect(stats.completionRate).toBe(0);
  });

  it('deve retornar 100% de completion se todas completadas', () => {
    const tasks = [
      createTask({ status: 'completed' }),
      createTask({ status: 'completed' }),
      createTask({ status: 'completed' }),
    ];

    const stats = calculateStats(tasks);

    expect(stats.completionRate).toBe(100);
  });

  it('deve calcular tempo total de foco corretamente', () => {
    const tasks = [
      createTask({
        focusSessions: [
          {
            id: '1',
            taskId: 'task-1',
            startedAt: new Date().toISOString(),
            endedAt: new Date().toISOString(),
            duration: 1500, // 25 min em segundos
            completed: true,
            type: 'focus',
          },
          {
            id: '2',
            taskId: 'task-1',
            startedAt: new Date().toISOString(),
            endedAt: new Date().toISOString(),
            duration: 1500, // 25 min
            completed: true,
            type: 'focus',
          },
        ],
      }),
      createTask({
        focusSessions: [
          {
            id: '3',
            taskId: 'task-2',
            startedAt: new Date().toISOString(),
            endedAt: new Date().toISOString(),
            duration: 600, // 10 min
            completed: true,
            type: 'focus',
          },
        ],
      }),
    ];

    const stats = calculateStats(tasks);

    // (25 + 25 + 10) = 60 minutos
    expect(stats.totalFocusTime).toBe(60);
  });

  it('deve ignorar sessões de break no cálculo de foco', () => {
    const tasks = [
      createTask({
        focusSessions: [
          {
            id: '1',
            taskId: 'task-1',
            startedAt: new Date().toISOString(),
            duration: 1500, // 25 min (focus)
            completed: true,
            type: 'focus',
          },
          {
            id: '2',
            taskId: 'task-1',
            startedAt: new Date().toISOString(),
            duration: 300, // 5 min (break - deve ignorar)
            completed: true,
            type: 'break',
          },
        ],
      }),
    ];

    const stats = calculateStats(tasks);

    expect(stats.totalFocusTime).toBe(25); // Apenas a sessão de foco
  });
});

describe('isOverdue', () => {
  const createTask = (daysOffset: number): Task => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysOffset);

    return {
      id: 'test-1',
      title: 'Test Task',
      priority: 'medium',
      status: 'todo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: dueDate.toISOString(),
      subtasks: [],
      focusSessions: [],
      isRecurring: false,
    };
  };

  it('deve retornar false se task não tem dueDate', () => {
    const task = createTask(0);
    delete task.dueDate;

    expect(isOverdue(task)).toBe(false);
  });

  it('deve retornar false se task está completada', () => {
    const task = createTask(-5); // 5 dias atrasada
    task.status = 'completed';

    expect(isOverdue(task)).toBe(false);
  });

  it('deve retornar true se dueDate passou e task não está completada', () => {
    const task = createTask(-1); // Ontem

    expect(isOverdue(task)).toBe(true);
  });

  it('deve retornar false se dueDate é hoje', () => {
    const task = createTask(0); // Hoje

    expect(isOverdue(task)).toBe(false);
  });

  it('deve retornar false se dueDate é no futuro', () => {
    const task = createTask(7); // Daqui a 7 dias

    expect(isOverdue(task)).toBe(false);
  });
});

describe('isDueToday', () => {
  const createTask = (daysOffset: number): Task => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysOffset);

    return {
      id: 'test-1',
      title: 'Test Task',
      priority: 'medium',
      status: 'todo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: dueDate.toISOString(),
      subtasks: [],
      focusSessions: [],
      isRecurring: false,
    };
  };

  it('deve retornar false se task não tem dueDate', () => {
    const task = createTask(0);
    delete task.dueDate;

    expect(isDueToday(task)).toBe(false);
  });

  it('deve retornar true se dueDate é hoje', () => {
    const task = createTask(0); // Hoje

    expect(isDueToday(task)).toBe(true);
  });

  it('deve retornar false se dueDate foi ontem', () => {
    const task = createTask(-1); // Ontem

    expect(isDueToday(task)).toBe(false);
  });

  it('deve retornar false se dueDate é amanhã', () => {
    const task = createTask(1); // Amanhã

    expect(isDueToday(task)).toBe(false);
  });

  it('deve comparar apenas a data, ignorando horário', () => {
    const task = createTask(0);

    // Modificar para horário diferente mas mesma data
    const date = new Date(task.dueDate!);
    date.setHours(23, 59, 59);
    task.dueDate = date.toISOString();

    expect(isDueToday(task)).toBe(true);
  });
});
