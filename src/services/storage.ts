import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

// ==========================================
// 💾 SERVIÇO DE STORAGE
// ==========================================

// Keys para AsyncStorage
export const STORAGE_KEYS = {
  FLOWS: '@mindinline:flows',
  FLASHCARDS: '@mindinline:flashcards',
  TASKS: '@mindinline:tasks',
  TIMELINE: '@mindinline:timeline',
  SETTINGS: '@mindinline:settings',
  USER_PROFILE: '@mindinline:user_profile',
} as const;

// ==========================================
// 🔧 FUNÇÕES GENÉRICAS
// ==========================================

/**
 * Salvar dados no AsyncStorage
 */
export const saveData = async <T>(key: string, data: T): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    logger.error(`Erro ao salvar dados (${key}):`, error);
    throw error;
  }
};

/**
 * Carregar dados do AsyncStorage
 */
export const loadData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    logger.error(`Erro ao carregar dados (${key}):`, error);
    return null;
  }
};

/**
 * Remover dados do AsyncStorage
 */
export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    logger.error(`Erro ao remover dados (${key}):`, error);
    throw error;
  }
};

/**
 * Limpar todos os dados do AsyncStorage
 */
export const clearAll = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    logger.error('Erro ao limpar todos os dados:', error);
    throw error;
  }
};

/**
 * Verificar se uma key existe
 */
export const hasKey = async (key: string): Promise<boolean> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return keys.includes(key);
  } catch (error) {
    logger.error(`Erro ao verificar existência da key (${key}):`, error);
    return false;
  }
};

// ==========================================
// 🔄 VERSIONAMENTO E VALIDAÇÃO
// ==========================================

const CURRENT_VERSION = '1.0.0';

/**
 * Interface para dados versionados
 */
export interface VersionedData<T> {
  version: string;
  data: T;
  savedAt: string;
}

/**
 * Type guard genérico - deve ser implementado para cada tipo específico
 */
export type TypeValidator<T> = (data: any) => data is T;

/**
 * Salvar dados com versionamento
 */
export const saveDataVersioned = async <T>(key: string, data: T): Promise<void> => {
  try {
    const versioned: VersionedData<T> = {
      version: CURRENT_VERSION,
      data,
      savedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(versioned));
  } catch (error) {
    logger.error(`Erro ao salvar dados versionados (${key}):`, error);
    throw error;
  }
};

/**
 * Carregar dados com validação e migração
 */
export const loadDataVersioned = async <T>(
  key: string,
  validator?: TypeValidator<T>
): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    if (!jsonValue) return null;

    const parsed = JSON.parse(jsonValue);

    // Suporte a dados antigos (sem versão)
    if (!parsed.version) {
      logger.warn(`Dados sem versão encontrados em ${key}. Aplicando migração automática.`);
      return migrateToVersioned(parsed, validator);
    }

    // Verificar versão
    if (parsed.version !== CURRENT_VERSION) {
      logger.warn(
        `Versão antiga detectada em ${key}: ${parsed.version}. Migrando para ${CURRENT_VERSION}`
      );
      return migrate(parsed, validator);
    }

    // Validar schema se validator fornecido
    if (validator && !validator(parsed.data)) {
      logger.error(`Dados inválidos em ${key}. Schema não corresponde ao esperado.`);
      return null;
    }

    return parsed.data;
  } catch (error) {
    logger.error(`Erro ao carregar dados versionados (${key}):`, error);
    return null;
  }
};

/**
 * Migrar dados antigos (sem wrapper de versão) para o formato versionado
 */
const migrateToVersioned = <T>(data: any, validator?: TypeValidator<T>): T | null => {
  // Dados antigos sem wrapper de versão - assumir que são do formato antigo
  if (validator && !validator(data)) {
    logger.error('Dados antigos não passaram na validação. Ignorando.');
    return null;
  }
  return data;
};

/**
 * Migrar dados entre versões
 */
const migrate = <T>(versioned: VersionedData<any>, validator?: TypeValidator<T>): T | null => {
  // Implementar migrações específicas aqui quando necessário
  // Por enquanto, apenas validar e retornar os dados
  const data = versioned.data;

  // Aplicar transformações de migração baseadas na versão
  // Exemplo futuro:
  // if (versioned.version === '0.9.0') {
  //   data = migrateFrom0_9_0(data);
  // }

  if (validator && !validator(data)) {
    logger.error('Dados migrados não passaram na validação. Ignorando.');
    return null;
  }

  return data;
};

// ==========================================
// 🎯 FUNÇÕES ESPECÍFICAS POR MÓDULO
// ==========================================

// --- FLOWS ---
export const saveFlows = async (flows: any[]) => {
  return saveData(STORAGE_KEYS.FLOWS, flows);
};

export const loadFlows = async () => {
  return loadData<any[]>(STORAGE_KEYS.FLOWS);
};

// --- FLASHCARDS ---
export const saveFlashcards = async (flashcards: any[]) => {
  return saveData(STORAGE_KEYS.FLASHCARDS, flashcards);
};

export const loadFlashcards = async () => {
  return loadData<any[]>(STORAGE_KEYS.FLASHCARDS);
};

// --- TASKS ---
export const saveTasks = async (tasks: any[]) => {
  return saveData(STORAGE_KEYS.TASKS, tasks);
};

export const loadTasks = async () => {
  return loadData<any[]>(STORAGE_KEYS.TASKS);
};

// --- TIMELINE ---
export const saveTimeline = async (timeline: any[]) => {
  return saveData(STORAGE_KEYS.TIMELINE, timeline);
};

export const loadTimeline = async () => {
  return loadData<any[]>(STORAGE_KEYS.TIMELINE);
};

// --- SETTINGS ---
export const saveSettings = async (settings: any) => {
  return saveData(STORAGE_KEYS.SETTINGS, settings);
};

export const loadSettings = async () => {
  return loadData<any>(STORAGE_KEYS.SETTINGS);
};

// --- USER PROFILE ---
export const saveUserProfile = async (profile: any) => {
  return saveData(STORAGE_KEYS.USER_PROFILE, profile);
};

export const loadUserProfile = async () => {
  return loadData<any>(STORAGE_KEYS.USER_PROFILE);
};

// ==========================================
// 🔄 FUNÇÕES DE MIGRAÇÃO E BACKUP
// ==========================================

/**
 * Exportar todos os dados (para backup)
 */
export const exportAllData = async (): Promise<Record<string, any>> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const stores = await AsyncStorage.multiGet(keys);

    const data: Record<string, any> = {};
    stores.forEach(([key, value]) => {
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    });

    return data;
  } catch (error) {
    logger.error('Erro ao exportar dados:', error);
    throw error;
  }
};

/**
 * Importar dados (restaurar backup)
 */
export const importAllData = async (data: Record<string, any>): Promise<void> => {
  try {
    const entries = Object.entries(data).map(([key, value]) => [
      key,
      typeof value === 'string' ? value : JSON.stringify(value),
    ]);

    await AsyncStorage.multiSet(entries as [string, string][]);
  } catch (error) {
    logger.error('Erro ao importar dados:', error);
    throw error;
  }
};

// ==========================================
// 🔧 UTILITÁRIOS
// ==========================================

/**
 * Obter tamanho aproximado do storage em bytes
 */
export const getStorageSize = async (): Promise<number> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const stores = await AsyncStorage.multiGet(keys);

    let totalSize = 0;
    stores.forEach(([, value]) => {
      if (value) {
        totalSize += new Blob([value]).size;
      }
    });

    return totalSize;
  } catch (error) {
    logger.error('Erro ao calcular tamanho do storage:', error);
    return 0;
  }
};

/**
 * Verificar se o storage está próximo do limite (5MB warning)
 */
export const isStorageNearLimit = async (): Promise<boolean> => {
  const size = await getStorageSize();
  const limitMB = 5;
  return size > limitMB * 1024 * 1024;
};

export default {
  // Genéricas
  saveData,
  loadData,
  removeData,
  clearAll,
  hasKey,

  // Versionamento
  saveDataVersioned,
  loadDataVersioned,

  // Específicas
  saveFlows,
  loadFlows,
  saveFlashcards,
  loadFlashcards,
  saveTasks,
  loadTasks,
  saveTimeline,
  loadTimeline,
  saveSettings,
  loadSettings,
  saveUserProfile,
  loadUserProfile,

  // Backup
  exportAllData,
  importAllData,

  // Utilitários
  getStorageSize,
  isStorageNearLimit,

  // Keys
  STORAGE_KEYS,
};
