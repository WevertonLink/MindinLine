// ==========================================
// 🪝 CUSTOM HOOK: useFilteredList
// ==========================================

import { useMemo, useState } from 'react';

/**
 * Opções de configuração para useFilteredList
 */
export interface UseFilteredListOptions<T> {
  /** Array de itens a serem filtrados */
  items: T[];
  /** Chaves do objeto para busca (ex: ['title', 'description']) */
  searchKeys: (keyof T)[];
  /** Função de filtro customizada (opcional) */
  filterFn?: (item: T) => boolean;
  /** Função de ordenação customizada (opcional) */
  sortFn?: (a: T, b: T) => number;
}

/**
 * Hook para filtrar, buscar e ordenar listas de forma otimizada
 *
 * Centraliza lógica comum de filtros, buscas e ordenação,
 * com memoização automática para evitar re-processamento desnecessário.
 *
 * @param options - Configurações de filtro/busca/ordenação
 * @returns Objeto com itens filtrados, query de busca e setter
 *
 * @example
 * // Filtrar tasks por busca e status
 * const { filteredItems, searchQuery, setSearchQuery } = useFilteredList({
 *   items: tasks,
 *   searchKeys: ['title', 'description'],
 *   filterFn: filterStatus !== 'all' ? (t) => t.status === filterStatus : undefined,
 *   sortFn: (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
 * });
 *
 * // No JSX
 * <TextInput value={searchQuery} onChangeText={setSearchQuery} />
 * <FlatList data={filteredItems} ... />
 */
export const useFilteredList = <T>({
  items,
  searchKeys,
  filterFn,
  sortFn,
}: UseFilteredListOptions<T>) => {
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Aplicar busca, filtro e ordenação com memoização
   * Só recalcula se items, searchQuery, filterFn ou sortFn mudarem
   */
  const filteredItems = useMemo(() => {
    let result = [...items];

    // 1. Aplicar busca por texto
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();

      result = result.filter(item => {
        // Verifica se alguma das chaves de busca contém o texto
        return searchKeys.some(key => {
          const value = item[key];

          // Buscar apenas em strings
          if (typeof value === 'string') {
            return value.toLowerCase().includes(query);
          }

          // Se o valor for um array de strings (ex: tags)
          if (Array.isArray(value)) {
            return value.some(
              v => typeof v === 'string' && v.toLowerCase().includes(query)
            );
          }

          return false;
        });
      });
    }

    // 2. Aplicar filtro customizado (se fornecido)
    if (filterFn) {
      result = result.filter(filterFn);
    }

    // 3. Aplicar ordenação (se fornecida)
    if (sortFn) {
      result.sort(sortFn);
    }

    return result;
  }, [items, searchQuery, filterFn, sortFn, searchKeys]);

  return {
    /** Itens filtrados e ordenados */
    filteredItems,
    /** Query de busca atual */
    searchQuery,
    /** Setter para atualizar a query de busca */
    setSearchQuery,
  };
};

export default useFilteredList;
