// ==========================================
// 🧪 TESTES: Flashcards Utils (SM-2 Algorithm)
// ==========================================

import { calculateNextReview, needsReview } from '../../../src/features/flashcards/utils';
import { Flashcard, RecallDifficulty } from '../../../src/features/flashcards/types';

describe('SM-2 Algorithm - calculateNextReview', () => {
  // Helper para criar flashcard base
  const createBaseFlashcard = (overrides?: Partial<Flashcard>): Flashcard => ({
    id: 'test-1',
    deckId: 'deck-1',
    front: 'Test Front',
    back: 'Test Back',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReviewDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  describe('Ease Factor Adjustment', () => {
    it('deve DIMINUIR easeFactor para "again" (quality=0)', () => {
      const flashcard = createBaseFlashcard({ easeFactor: 2.5 });
      const result = calculateNextReview(flashcard, 'again');

      expect(result.easeFactor).toBeLessThan(2.5);
    });

    it('deve DIMINUIR easeFactor para "hard" (quality=3)', () => {
      const flashcard = createBaseFlashcard({ easeFactor: 2.5 });
      const result = calculateNextReview(flashcard, 'hard');

      // Quality=3: EF = 2.5 + (0.1 - 2 * (0.08 + 2 * 0.02))
      // EF = 2.5 + (0.1 - 2 * 0.12) = 2.5 + (0.1 - 0.24) = 2.5 - 0.14 = 2.36
      expect(result.easeFactor).toBeCloseTo(2.36, 2);
    });

    it('deve MANTER easeFactor aproximadamente para "good" (quality=4)', () => {
      const flashcard = createBaseFlashcard({ easeFactor: 2.5 });
      const result = calculateNextReview(flashcard, 'good');

      // Quality=4: EF = 2.5 + (0.1 - 1 * (0.08 + 1 * 0.02))
      // EF = 2.5 + (0.1 - 0.1) = 2.5
      expect(result.easeFactor).toBeCloseTo(2.5, 2);
    });

    it('deve AUMENTAR easeFactor para "easy" (quality=5)', () => {
      const flashcard = createBaseFlashcard({ easeFactor: 2.5 });
      const result = calculateNextReview(flashcard, 'easy');

      // Quality=5: EF = 2.5 + (0.1 - 0 * (0.08 + 0 * 0.02))
      // EF = 2.5 + 0.1 = 2.6
      expect(result.easeFactor).toBeCloseTo(2.6, 2);
      expect(result.easeFactor).toBeGreaterThan(2.5);
    });

    it('deve NUNCA ir abaixo do mínimo de 1.3', () => {
      let flashcard = createBaseFlashcard({ easeFactor: 1.4 });

      // Simular várias respostas "again" consecutivas
      for (let i = 0; i < 20; i++) {
        const result = calculateNextReview(flashcard, 'again');
        flashcard = { ...flashcard, easeFactor: result.easeFactor };
      }

      expect(flashcard.easeFactor).toBeGreaterThanOrEqual(1.3);
      expect(flashcard.easeFactor).toBeLessThan(1.4); // Deve ter diminuído mas não abaixo de 1.3
    });
  });

  describe('Interval Calculation - Quality < 3 (again, hard parcialmente)', () => {
    it('deve RESETAR repetitions e interval=1 para "again"', () => {
      const flashcard = createBaseFlashcard({
        repetitions: 5,
        interval: 20,
        easeFactor: 2.5,
      });

      const result = calculateNextReview(flashcard, 'again');

      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });
  });

  describe('Interval Calculation - Quality >= 3 (hard, good, easy)', () => {
    it('deve calcular intervalo de 1 dia na PRIMEIRA revisão bem-sucedida', () => {
      const flashcard = createBaseFlashcard({ repetitions: 0 });
      const result = calculateNextReview(flashcard, 'good');

      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
    });

    it('deve calcular intervalo de 6 dias na SEGUNDA revisão bem-sucedida', () => {
      const flashcard = createBaseFlashcard({ repetitions: 1, interval: 1 });
      const result = calculateNextReview(flashcard, 'good');

      expect(result.repetitions).toBe(2);
      expect(result.interval).toBe(6);
    });

    it('deve calcular intervalo baseado em easeFactor na TERCEIRA revisão+', () => {
      const flashcard = createBaseFlashcard({
        repetitions: 2,
        interval: 6,
        easeFactor: 2.5,
      });

      const result = calculateNextReview(flashcard, 'good');

      expect(result.repetitions).toBe(3);
      expect(result.interval).toBe(Math.round(6 * 2.5)); // 15 dias
    });

    it('deve aumentar intervalo exponencialmente em revisões subsequentes', () => {
      let flashcard = createBaseFlashcard({ easeFactor: 2.5 });

      // 1ª revisão (good)
      let result = calculateNextReview(flashcard, 'good');
      expect(result.interval).toBe(1);

      // 2ª revisão (good)
      flashcard = { ...flashcard, ...result };
      result = calculateNextReview(flashcard, 'good');
      expect(result.interval).toBe(6);

      // 3ª revisão (good)
      flashcard = { ...flashcard, ...result };
      result = calculateNextReview(flashcard, 'good');
      expect(result.interval).toBe(15); // 6 * 2.5

      // 4ª revisão (good)
      flashcard = { ...flashcard, ...result };
      result = calculateNextReview(flashcard, 'good');
      expect(result.interval).toBe(38); // 15 * 2.5 arredondado
    });
  });

  describe('Sequências Realistas de Estudo', () => {
    it('deve simular sequência de aprendizado normal (good → good → good)', () => {
      let flashcard = createBaseFlashcard();

      // Primeira revisão: good
      let result = calculateNextReview(flashcard, 'good');
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
      expect(result.easeFactor).toBeCloseTo(2.5, 1);

      // Segunda revisão: good
      flashcard = { ...flashcard, ...result };
      result = calculateNextReview(flashcard, 'good');
      expect(result.interval).toBe(6);
      expect(result.repetitions).toBe(2);

      // Terceira revisão: good
      flashcard = { ...flashcard, ...result };
      result = calculateNextReview(flashcard, 'good');
      expect(result.interval).toBe(Math.round(6 * result.easeFactor));
      expect(result.repetitions).toBe(3);
    });

    it('deve simular aprendizado difícil com recomeço (good → again → good)', () => {
      let flashcard = createBaseFlashcard();

      // Primeira tentativa: good
      let result = calculateNextReview(flashcard, 'good');
      expect(result.repetitions).toBe(1);

      // Segunda tentativa: ESQUECEU (again)
      flashcard = { ...flashcard, ...result };
      result = calculateNextReview(flashcard, 'again');
      expect(result.repetitions).toBe(0); // Resetou
      expect(result.interval).toBe(1); // Começa de novo
      expect(result.easeFactor).toBeLessThan(2.5); // EF diminuiu

      // Terceira tentativa: good novamente
      flashcard = { ...flashcard, ...result };
      result = calculateNextReview(flashcard, 'good');
      expect(result.repetitions).toBe(1); // Recomeçou a contar
      expect(result.interval).toBe(1);
    });

    it('deve simular aprendizado muito fácil (easy → easy → easy)', () => {
      let flashcard = createBaseFlashcard();

      // Primeira: easy
      let result = calculateNextReview(flashcard, 'easy');
      const ef1 = result.easeFactor;
      expect(ef1).toBeGreaterThan(2.5);

      // Segunda: easy
      flashcard = { ...flashcard, ...result };
      result = calculateNextReview(flashcard, 'easy');
      expect(result.easeFactor).toBeGreaterThan(ef1); // Continua aumentando

      // Terceira: easy
      flashcard = { ...flashcard, ...result };
      result = calculateNextReview(flashcard, 'easy');
      expect(result.interval).toBeGreaterThan(6); // Intervalo cresce mais rápido
    });

    it('deve simular alternância entre easy e hard', () => {
      let flashcard = createBaseFlashcard();

      // Easy
      let result = calculateNextReview(flashcard, 'easy');
      const ef1 = result.easeFactor;

      // Hard
      flashcard = { ...flashcard, ...result };
      result = calculateNextReview(flashcard, 'hard');
      expect(result.easeFactor).toBeLessThan(ef1); // EF diminui

      // Easy novamente
      flashcard = { ...flashcard, ...result };
      result = calculateNextReview(flashcard, 'easy');
      expect(result.easeFactor).toBeGreaterThan(result.easeFactor); // Tenta recuperar
    });
  });

  describe('Next Review Date', () => {
    it('deve retornar próxima data de revisão como ISO string', () => {
      const flashcard = createBaseFlashcard();
      const result = calculateNextReview(flashcard, 'good');

      expect(typeof result.nextReviewDate).toBe('string');
      expect(result.nextReviewDate).toMatch(/^\d{4}-\d{2}-\d{2}T/); // Formato ISO
    });

    it('deve calcular data correta para interval=1', () => {
      const flashcard = createBaseFlashcard();
      const before = new Date();
      const result = calculateNextReview(flashcard, 'good');
      const after = new Date(result.nextReviewDate);

      const diffDays = Math.round((after.getTime() - before.getTime()) / 86400000);
      expect(diffDays).toBe(1); // 1 dia no futuro
    });

    it('deve calcular data correta para interval=6', () => {
      const flashcard = createBaseFlashcard({ repetitions: 1, interval: 1 });
      const before = new Date();
      const result = calculateNextReview(flashcard, 'good');
      const after = new Date(result.nextReviewDate);

      const diffDays = Math.round((after.getTime() - before.getTime()) / 86400000);
      expect(diffDays).toBe(6); // 6 dias no futuro
    });
  });

  describe('Edge Cases', () => {
    it('deve lidar com easeFactor inicial muito baixo', () => {
      const flashcard = createBaseFlashcard({ easeFactor: 1.3 });
      const result = calculateNextReview(flashcard, 'again');

      expect(result.easeFactor).toBe(1.3); // Não vai abaixo
    });

    it('deve lidar com easeFactor inicial muito alto', () => {
      const flashcard = createBaseFlashcard({ easeFactor: 4.0 });
      const result = calculateNextReview(flashcard, 'easy');

      expect(result.easeFactor).toBeGreaterThan(4.0);
      // Sem limite máximo no SM-2
    });

    it('deve lidar com muitas repetitions', () => {
      const flashcard = createBaseFlashcard({ repetitions: 100, interval: 1000 });
      const result = calculateNextReview(flashcard, 'good');

      expect(result.repetitions).toBe(101);
      expect(result.interval).toBeGreaterThan(1000);
    });
  });
});

describe('needsReview', () => {
  const createFlashcard = (daysUntilReview: number): Flashcard => {
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + daysUntilReview);

    return {
      id: 'test-1',
      deckId: 'deck-1',
      front: 'Test',
      back: 'Test',
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: nextReviewDate.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  it('deve retornar true se revisão é para hoje', () => {
    const flashcard = createFlashcard(0); // Hoje
    expect(needsReview(flashcard)).toBe(true);
  });

  it('deve retornar true se revisão estava agendada para ontem', () => {
    const flashcard = createFlashcard(-1); // Ontem
    expect(needsReview(flashcard)).toBe(true);
  });

  it('deve retornar false se revisão é para amanhã', () => {
    const flashcard = createFlashcard(1); // Amanhã
    expect(needsReview(flashcard)).toBe(false);
  });

  it('deve retornar false se revisão é para daqui a 7 dias', () => {
    const flashcard = createFlashcard(7);
    expect(needsReview(flashcard)).toBe(false);
  });

  it('deve retornar true se revisão está muito atrasada', () => {
    const flashcard = createFlashcard(-30); // 30 dias atrasada
    expect(needsReview(flashcard)).toBe(true);
  });
});
