// ==========================================
// 📦 TASK REPOSITORY
// ==========================================

import { BaseRepository } from './BaseRepository';
import { Task, TaskStatus, TaskPriority, isTaskArray } from '../features/tasks/types';
import { STORAGE_KEYS } from '../services/storage';

/**
 * Repository para gerenciar persistência de Tasks
 *
 * Extende BaseRepository com métodos específicos para Tasks
 */
export class TaskRepository extends BaseRepository<Task> {
  constructor() {
    super(STORAGE_KEYS.TASKS, isTaskArray);
  }

  /**
   * Buscar tasks por status
   */
  async getByStatus(status: TaskStatus): Promise<Task[]> {
    return this.filter(t => t.status === status);
  }

  /**
   * Buscar tasks por prioridade
   */
  async getByPriority(priority: TaskPriority): Promise<Task[]> {
    return this.filter(t => t.priority === priority);
  }

  /**
   * Buscar tasks atrasadas (overdue)
   */
  async getOverdue(): Promise<Task[]> {
    const tasks = await this.getAll();
    const now = new Date();

    return tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;

      const dueDate = new Date(t.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return dueDate < today;
    });
  }

  /**
   * Buscar tasks que vencem hoje
   */
  async getDueToday(): Promise<Task[]> {
    const tasks = await this.getAll();
    const today = new Date().toISOString().split('T')[0];

    return tasks.filter(t => {
      if (!t.dueDate) return false;
      return t.dueDate.split('T')[0] === today;
    });
  }

  /**
   * Buscar tasks vinculadas a uma trilha
   * @deprecated Use getByTrilhaId em vez disso (mantido para compatibilidade)
   */
  async getByFlowId(flowId: string): Promise<Task[]> {
    return this.filter(t => t.flowId === flowId);
  }

  /**
   * Buscar tasks vinculadas a uma trilha
   */
  async getByTrilhaId(trilhaId: string): Promise<Task[]> {
    return this.filter(t => t.flowId === trilhaId);
  }

  /**
   * Buscar tasks vinculadas a uma etapa de trilha
   */
  async getByStepId(stepId: string): Promise<Task[]> {
    return this.filter(t => t.stepId === stepId);
  }

  /**
   * Buscar tasks com tag específica
   */
  async getByTag(tag: string): Promise<Task[]> {
    return this.filter(t => t.tags?.includes(tag) || false);
  }

  /**
   * Completar uma task
   * @param taskId - ID da task
   */
  async complete(taskId: string): Promise<Task | null> {
    return this.update(taskId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Cancelar uma task
   * @param taskId - ID da task
   */
  async cancel(taskId: string): Promise<Task | null> {
    return this.update(taskId, {
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Marcar task como em progresso
   * @param taskId - ID da task
   */
  async startProgress(taskId: string): Promise<Task | null> {
    return this.update(taskId, {
      status: 'in_progress',
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Buscar tasks recorrentes
   */
  async getRecurring(): Promise<Task[]> {
    return this.filter(t => t.isRecurring === true);
  }

  /**
   * Deletar todas as tasks completadas
   * @returns Quantidade de tasks deletadas
   */
  async deleteCompleted(): Promise<number> {
    const tasks = await this.getAll();
    const completedIds = tasks.filter(t => t.status === 'completed').map(t => t.id);
    return this.deleteMany(completedIds);
  }

  /**
   * Deletar todas as tasks canceladas
   * @returns Quantidade de tasks deletadas
   */
  async deleteCancelled(): Promise<number> {
    const tasks = await this.getAll();
    const cancelledIds = tasks.filter(t => t.status === 'cancelled').map(t => t.id);
    return this.deleteMany(cancelledIds);
  }
}

// Instância singleton do repository
export const taskRepository = new TaskRepository();

export default taskRepository;
