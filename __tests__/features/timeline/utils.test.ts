// ==========================================
// 🧪 TESTES: Timeline Utils
// ==========================================

import { calculateStreak } from '../../../src/features/timeline/utils';
import { Activity } from '../../../src/features/timeline/types';

describe('calculateStreak', () => {
  // Helper para criar atividades com timestamps específicos
  const createActivity = (daysAgo: number): Activity => ({
    id: `activity-${daysAgo}`,
    type: 'task_completed',
    title: 'Test Activity',
    timestamp: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    metadata: {},
  });

  describe('Casos básicos', () => {
    it('deve retornar streak 0 para array vazio', () => {
      expect(calculateStreak([])).toEqual({ current: 0, longest: 0 });
    });

    it('deve retornar streak 1 para uma única atividade hoje', () => {
      const activities = [createActivity(0)]; // Hoje
      const result = calculateStreak(activities);

      expect(result.current).toBe(1);
      expect(result.longest).toBe(1);
    });

    it('deve retornar streak 1 para uma única atividade ontem', () => {
      const activities = [createActivity(1)]; // Ontem
      const result = calculateStreak(activities);

      expect(result.current).toBe(1);
      expect(result.longest).toBe(1);
    });
  });

  describe('Current streak - Mantém streak com atividade ontem', () => {
    it('deve calcular current streak quando atividade existe hoje', () => {
      const activities = [
        createActivity(0), // Hoje
        createActivity(1), // Ontem
        createActivity(2), // 2 dias atrás
      ];

      const result = calculateStreak(activities);
      expect(result.current).toBe(3);
    });

    it('deve MANTER streak se última atividade foi ontem (FIX DO BUG)', () => {
      const activities = [
        createActivity(1), // Ontem (última atividade)
        createActivity(2), // 2 dias atrás
        createActivity(3), // 3 dias atrás
      ];

      const result = calculateStreak(activities);
      expect(result.current).toBe(3); // Não deve zerar!
    });

    it('deve ZERAR streak se última atividade foi há 2 dias', () => {
      const activities = [
        createActivity(2), // 2 dias atrás (última)
        createActivity(3), // 3 dias atrás
      ];

      const result = calculateStreak(activities);
      expect(result.current).toBe(0); // Streak quebrado
    });

    it('deve ZERAR streak se última atividade foi há 3+ dias', () => {
      const activities = [
        createActivity(5), // 5 dias atrás
        createActivity(6), // 6 dias atrás
        createActivity(7), // 7 dias atrás
      ];

      const result = calculateStreak(activities);
      expect(result.current).toBe(0);
    });
  });

  describe('Current streak - Detecta gaps', () => {
    it('deve parar de contar quando encontrar gap', () => {
      const activities = [
        createActivity(0), // Hoje
        createActivity(1), // Ontem
        // GAP de 1 dia aqui
        createActivity(3), // 3 dias atrás
        createActivity(4), // 4 dias atrás
      ];

      const result = calculateStreak(activities);
      expect(result.current).toBe(2); // Apenas hoje e ontem
    });

    it('deve calcular streak corretamente com múltiplas atividades no mesmo dia', () => {
      const now = Date.now();
      const activities: Activity[] = [
        {
          id: '1',
          type: 'task_completed',
          title: 'Task 1',
          timestamp: new Date(now).toISOString(),
          metadata: {},
        },
        {
          id: '2',
          type: 'task_completed',
          title: 'Task 2',
          timestamp: new Date(now - 3600000).toISOString(), // 1h antes
          metadata: {},
        },
        {
          id: '3',
          type: 'task_completed',
          title: 'Task 3',
          timestamp: new Date(now - 86400000).toISOString(), // Ontem
          metadata: {},
        },
      ];

      const result = calculateStreak(activities);
      expect(result.current).toBe(2); // 2 dias (hoje e ontem), mesmo com múltiplas atividades hoje
    });
  });

  describe('Longest streak', () => {
    it('deve calcular longest streak corretamente sem gaps', () => {
      const activities = [
        createActivity(0), // Streak de 5 dias
        createActivity(1),
        createActivity(2),
        createActivity(3),
        createActivity(4),
      ];

      const result = calculateStreak(activities);
      expect(result.current).toBe(5);
      expect(result.longest).toBe(5);
    });

    it('deve calcular longest streak corretamente COM gaps', () => {
      const activities = [
        createActivity(0), // Streak atual de 2 dias
        createActivity(1),
        // GAP de 2 dias
        createActivity(4), // Streak anterior de 3 dias (LONGEST)
        createActivity(5),
        createActivity(6),
        // GAP de 1 dia
        createActivity(8), // Streak de 2 dias
        createActivity(9),
      ];

      const result = calculateStreak(activities);
      expect(result.current).toBe(2);
      expect(result.longest).toBe(3); // O maior streak foi de 3 dias
    });

    it('deve identificar longest streak no meio do histórico', () => {
      const activities = [
        createActivity(0), // Streak de 1 dia (current)
        // GAP
        createActivity(5), // Streak de 5 dias (LONGEST)
        createActivity(6),
        createActivity(7),
        createActivity(8),
        createActivity(9),
        // GAP
        createActivity(12), // Streak de 2 dias
        createActivity(13),
      ];

      const result = calculateStreak(activities);
      expect(result.current).toBe(1);
      expect(result.longest).toBe(5);
    });

    it('deve calcular longest streak igual ao current quando não há gaps', () => {
      const activities = [
        createActivity(0),
        createActivity(1),
        createActivity(2),
        createActivity(3),
      ];

      const result = calculateStreak(activities);
      expect(result.current).toBe(4);
      expect(result.longest).toBe(4);
    });
  });

  describe('Edge cases', () => {
    it('deve lidar com atividades fora de ordem', () => {
      const now = Date.now();
      const activities: Activity[] = [
        {
          id: '1',
          type: 'task_completed',
          title: 'Task 1',
          timestamp: new Date(now - 86400000).toISOString(), // Ontem
          metadata: {},
        },
        {
          id: '2',
          type: 'task_completed',
          title: 'Task 2',
          timestamp: new Date(now).toISOString(), // Hoje
          metadata: {},
        },
        {
          id: '3',
          type: 'task_completed',
          title: 'Task 3',
          timestamp: new Date(now - 2 * 86400000).toISOString(), // 2 dias atrás
          metadata: {},
        },
      ];

      const result = calculateStreak(activities);
      expect(result.current).toBe(3); // Deve ordenar corretamente
    });

    it('deve lidar com timestamps no mesmo milissegundo', () => {
      const now = Date.now();
      const timestamp = new Date(now).toISOString();

      const activities: Activity[] = [
        { id: '1', type: 'task_completed', title: 'Task 1', timestamp, metadata: {} },
        { id: '2', type: 'task_completed', title: 'Task 2', timestamp, metadata: {} },
        { id: '3', type: 'task_completed', title: 'Task 3', timestamp, metadata: {} },
      ];

      const result = calculateStreak(activities);
      expect(result.current).toBe(1); // Mesmo dia = streak de 1
      expect(result.longest).toBe(1);
    });

    it('deve lidar com streak muito longo (30+ dias)', () => {
      const activities: Activity[] = [];
      for (let i = 0; i < 50; i++) {
        activities.push(createActivity(i));
      }

      const result = calculateStreak(activities);
      expect(result.current).toBe(50);
      expect(result.longest).toBe(50);
    });
  });

  describe('Diferentes tipos de atividades', () => {
    it('deve contar streak independente do tipo de atividade', () => {
      const now = Date.now();
      const activities: Activity[] = [
        {
          id: '1',
          type: 'task_completed',
          title: 'Task',
          timestamp: new Date(now).toISOString(),
          metadata: {},
        },
        {
          id: '2',
          type: 'flashcard_review',
          title: 'Flashcard',
          timestamp: new Date(now - 86400000).toISOString(),
          metadata: {},
        },
        {
          id: '3',
          type: 'focus_session',
          title: 'Focus',
          timestamp: new Date(now - 2 * 86400000).toISOString(),
          metadata: {},
        },
      ];

      const result = calculateStreak(activities);
      expect(result.current).toBe(3); // Tipos diferentes contam normalmente
    });
  });
});
