import { addDays, addWeeks, addMonths } from 'date-fns';
import { Task, RecurrenceConfig } from './types';
import { generateId } from './utils';

/**
 * Calcula próxima data de recorrência
 */
export const calculateNextRecurrence = (
  currentDueDate: string,
  recurrence: RecurrenceConfig
): string | null => {
  const currentDate = new Date(currentDueDate);

  switch (recurrence.type) {
    case 'daily':
      return addDays(currentDate, recurrence.interval).toISOString();
    case 'weekly':
      return addWeeks(currentDate, recurrence.interval).toISOString();
    case 'monthly':
      return addMonths(currentDate, recurrence.interval).toISOString();
    default:
      return null;
  }
};

/**
 * Cria próxima ocorrência de task recorrente
 */
export const createNextOccurrence = (originalTask: Task): Task => {
  if (!originalTask.recurrence || !originalTask.dueDate) {
    throw new Error('Task não tem recorrência configurada');
  }

  const nextDueDate = calculateNextRecurrence(
    originalTask.dueDate,
    originalTask.recurrence
  );

  if (!nextDueDate) {
    throw new Error('Não foi possível calcular próxima data');
  }

  // Verificar endDate
  if (originalTask.recurrence.endDate) {
    const endDate = new Date(originalTask.recurrence.endDate);
    const nextDate = new Date(nextDueDate);
    if (nextDate > endDate) {
      throw new Error('Recorrência encerrada (endDate atingido)');
    }
  }

  return {
    ...originalTask,
    id: generateId(),
    status: 'todo',
    subtasks: originalTask.subtasks.map(st => ({
      ...st,
      id: generateId(),
      completed: false,
    })),
    dueDate: nextDueDate,
    completedAt: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Manter recurrence config para continuar o ciclo
    isRecurring: true,
    recurrence: originalTask.recurrence,
  };
};
