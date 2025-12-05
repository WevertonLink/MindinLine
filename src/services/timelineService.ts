/**
 * Timeline Service
 * Serviço para registrar atividades no Timeline sem dependência de Context
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity, CreateActivityInput } from '../features/timeline/types';
import { generateId } from '../features/timeline/utils';
import { logger } from './logger';

const STORAGE_KEY = '@MindinLine:timeline_activities';

/**
 * Adiciona uma atividade ao Timeline
 * Pode ser chamado de qualquer lugar, inclusive dentro de Contexts
 */
export const addTimelineActivity = async (input: CreateActivityInput): Promise<void> => {
  try {
    // Carregar atividades existentes
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const activities: Activity[] = stored ? JSON.parse(stored) : [];

    // Criar nova atividade
    const newActivity: Activity = {
      id: generateId(),
      type: input.type,
      title: input.title,
      description: input.description,
      timestamp: new Date().toISOString(),
      metadata: input.metadata,
    };

    // Adicionar no início (mais recente primeiro)
    const updatedActivities = [newActivity, ...activities];

    // Salvar
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedActivities));
  } catch (error) {
    logger.error('Erro ao adicionar atividade no Timeline:', error);
    // Não lança erro para não quebrar o fluxo principal
  }
};
