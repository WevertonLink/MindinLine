// ==========================================
// 🪝 CUSTOM HOOK: useDebounce
// ==========================================

import { useState, useEffect } from 'react';

/**
 * Hook para debounce de valores
 *
 * Útil para otimizar buscas em tempo real, evitando chamadas
 * excessivas enquanto o usuário ainda está digitando.
 *
 * @param value - Valor a ser debounced
 * @param delay - Delay em ms (padrão: 300ms)
 * @returns Valor debounced
 *
 * @example
 * const [searchInput, setSearchInput] = useState('');
 * const debouncedSearch = useDebounce(searchInput, 500);
 *
 * useEffect(() => {
 *   // Esta busca só roda 500ms após o usuário parar de digitar
 *   performSearch(debouncedSearch);
 * }, [debouncedSearch]);
 */
export const useDebounce = <T>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Criar um timer que atualiza o valor após o delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpar o timer se o valor mudar antes do delay terminar
    // (cleanup function)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
