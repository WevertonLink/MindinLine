// ==========================================
// 📦 BASE REPOSITORY
// ==========================================

import { saveDataVersioned, loadDataVersioned, TypeValidator } from '../services/storage';

/**
 * Repository base abstrato para persistência de dados
 *
 * Implementa o padrão Repository para separar a lógica de acesso a dados
 * dos Contexts, facilitando testes e manutenção.
 *
 * @example
 * // Criar um repository específico
 * export class TaskRepository extends BaseRepository<Task> {
 *   constructor() {
 *     super(STORAGE_KEYS.TASKS, isTaskArray);
 *   }
 *
 *   // Métodos customizados
 *   async getByStatus(status: TaskStatus): Promise<Task[]> {
 *     const tasks = await this.getAll();
 *     return tasks.filter(t => t.status === status);
 *   }
 * }
 */
export abstract class BaseRepository<T> {
  /**
   * @param storageKey - Chave do AsyncStorage para armazenar os dados
   * @param validator - Função type guard para validar dados (opcional)
   */
  constructor(
    protected readonly storageKey: string,
    protected readonly validator?: TypeValidator<T[]>
  ) {}

  /**
   * Buscar todos os itens
   */
  async getAll(): Promise<T[]> {
    const data = await loadDataVersioned<T[]>(this.storageKey, this.validator);
    return data || [];
  }

  /**
   * Salvar todos os itens (substitui o array inteiro)
   */
  async save(items: T[]): Promise<void> {
    await saveDataVersioned(this.storageKey, items);
  }

  /**
   * Buscar item por ID
   * @param id - ID do item
   * @param idKey - Nome da propriedade que contém o ID (padrão: 'id')
   */
  async getById(id: string, idKey: keyof T = 'id' as keyof T): Promise<T | null> {
    const items = await this.getAll();
    return items.find(item => item[idKey] === id) || null;
  }

  /**
   * Criar um novo item
   * @param item - Item a ser criado
   */
  async create(item: T): Promise<T> {
    const items = await this.getAll();
    items.push(item);
    await this.save(items);
    return item;
  }

  /**
   * Atualizar um item existente
   * @param id - ID do item
   * @param updates - Campos a serem atualizados
   * @param idKey - Nome da propriedade que contém o ID (padrão: 'id')
   */
  async update(
    id: string,
    updates: Partial<T>,
    idKey: keyof T = 'id' as keyof T
  ): Promise<T | null> {
    const items = await this.getAll();
    const index = items.findIndex(item => item[idKey] === id);

    if (index === -1) return null;

    const updated = { ...items[index], ...updates } as T;
    items[index] = updated;
    await this.save(items);
    return updated;
  }

  /**
   * Deletar um item
   * @param id - ID do item
   * @param idKey - Nome da propriedade que contém o ID (padrão: 'id')
   * @returns true se item foi deletado, false se não foi encontrado
   */
  async delete(id: string, idKey: keyof T = 'id' as keyof T): Promise<boolean> {
    const items = await this.getAll();
    const filtered = items.filter(item => item[idKey] !== id);

    // Se o tamanho não mudou, item não foi encontrado
    if (filtered.length === items.length) {
      return false;
    }

    await this.save(filtered);
    return true;
  }

  /**
   * Deletar múltiplos itens
   * @param ids - Array de IDs
   * @param idKey - Nome da propriedade que contém o ID (padrão: 'id')
   * @returns Quantidade de itens deletados
   */
  async deleteMany(ids: string[], idKey: keyof T = 'id' as keyof T): Promise<number> {
    const items = await this.getAll();
    const idsSet = new Set(ids);
    const filtered = items.filter(item => !idsSet.has(item[idKey] as any));

    const deletedCount = items.length - filtered.length;

    if (deletedCount > 0) {
      await this.save(filtered);
    }

    return deletedCount;
  }

  /**
   * Limpar todos os dados
   */
  async clear(): Promise<void> {
    await this.save([]);
  }

  /**
   * Contar total de itens
   */
  async count(): Promise<number> {
    const items = await this.getAll();
    return items.length;
  }

  /**
   * Verificar se existe algum item que satisfaz condição
   * @param predicate - Função de teste
   */
  async exists(predicate: (item: T) => boolean): Promise<boolean> {
    const items = await this.getAll();
    return items.some(predicate);
  }

  /**
   * Filtrar itens
   * @param predicate - Função de filtro
   */
  async filter(predicate: (item: T) => boolean): Promise<T[]> {
    const items = await this.getAll();
    return items.filter(predicate);
  }

  /**
   * Buscar primeiro item que satisfaz condição
   * @param predicate - Função de busca
   */
  async find(predicate: (item: T) => boolean): Promise<T | null> {
    const items = await this.getAll();
    return items.find(predicate) || null;
  }
}

export default BaseRepository;
