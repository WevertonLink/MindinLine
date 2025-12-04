import {
  Flashcard,
  Deck,
  RecallDifficulty,
  SpacedRepetitionResult,
  FlashcardsStats,
} from './types';

// ==========================================
// 🔧 UTILITÁRIOS: FLASHCARDS
// ==========================================

/**
 * Gerar ID único
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ==========================================
// 📊 ALGORITMO DE REPETIÇÃO ESPAÇADA (SM-2)
// ==========================================

/**
 * Calcular próxima revisão usando algoritmo SM-2 (SuperMemo 2)
 *
 * @param flashcard - Flashcard atual
 * @param difficulty - Dificuldade do recall (again, hard, good, easy)
 * @returns Novo estado do flashcard (easeFactor, interval, nextReviewDate)
 */
export const calculateNextReview = (
  flashcard: Flashcard,
  difficulty: RecallDifficulty
): SpacedRepetitionResult => {
  let { easeFactor, interval, repetitions } = flashcard;

  // Mapear dificuldade para qualidade (0-5 no SM-2)
  const qualityMap: Record<RecallDifficulty, number> = {
    again: 0, // Esqueceu completamente
    hard: 3,  // Difícil de lembrar
    good: 4,  // Lembrou bem
    easy: 5,  // Muito fácil
  };

  const quality = qualityMap[difficulty];

  // Atualizar easeFactor (mínimo 1.3)
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  // Se qualidade < 3, resetar repetições e usar intervalo curto
  if (quality < 3) {
    repetitions = 0;
    interval = 1; // 1 dia
  } else {
    repetitions += 1;

    // Calcular novo intervalo
    if (repetitions === 1) {
      interval = 1; // 1 dia
    } else if (repetitions === 2) {
      interval = 6; // 6 dias
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  // Calcular próxima data de revisão
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReviewDate: nextReviewDate.toISOString(),
  };
};

/**
 * Verificar se flashcard precisa ser revisado hoje
 */
export const needsReview = (flashcard: Flashcard): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reviewDate = new Date(flashcard.nextReviewDate);
  reviewDate.setHours(0, 0, 0, 0);

  return reviewDate <= today;
};

/**
 * Verificar se flashcard é novo (nunca estudado)
 */
export const isNewCard = (flashcard: Flashcard): boolean => {
  return flashcard.repetitions === 0 && !flashcard.lastReviewedAt;
};

/**
 * Verificar se flashcard está em aprendizado
 */
export const isLearningCard = (flashcard: Flashcard): boolean => {
  return flashcard.repetitions > 0 && flashcard.repetitions < 5;
};

/**
 * Verificar se flashcard foi dominado
 */
export const isMasteredCard = (flashcard: Flashcard): boolean => {
  return flashcard.repetitions >= 5;
};

// ==========================================
// 📈 ESTATÍSTICAS DO DECK
// ==========================================

/**
 * Calcular estatísticas do deck
 */
export const calculateDeckStats = (flashcards: Flashcard[]) => {
  const totalCards = flashcards.length;
  const newCards = flashcards.filter(isNewCard).length;
  const learningCards = flashcards.filter(isLearningCard).length;
  const reviewCards = flashcards.filter(needsReview).length;
  const masteredCards = flashcards.filter(isMasteredCard).length;

  return {
    totalCards,
    newCards,
    learningCards,
    reviewCards,
    masteredCards,
  };
};

/**
 * Atualizar estatísticas do deck
 */
export const updateDeckStats = (deck: Deck): Deck => {
  const stats = calculateDeckStats(deck.flashcards);

  return {
    ...deck,
    ...stats,
    updatedAt: new Date().toISOString(),
  };
};

// ==========================================
// 📚 SESSÃO DE ESTUDO
// ==========================================

/**
 * Obter flashcards para estudar hoje (ordem de prioridade)
 * 1. Cards para revisar (vencidos)
 * 2. Cards em aprendizado
 * 3. Cards novos (limite de 20 por vez)
 */
export const getCardsToStudy = (
  deck: Deck,
  maxNewCards: number = 20
): Flashcard[] => {
  const { flashcards } = deck;

  // Cards para revisar (vencidos)
  const reviewCards = flashcards.filter(needsReview);

  // Cards em aprendizado
  const learningCards = flashcards.filter(isLearningCard);

  // Cards novos (limitar quantidade)
  const newCards = flashcards
    .filter(isNewCard)
    .slice(0, maxNewCards);

  // Combinar e embaralhar
  return shuffleArray([...reviewCards, ...learningCards, ...newCards]);
};

/**
 * Embaralhar array (Fisher-Yates shuffle)
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ==========================================
// 🔍 FILTROS E BUSCA
// ==========================================

/**
 * Filtrar decks por query de busca
 */
export const filterDecksBySearch = (decks: Deck[], query: string): Deck[] => {
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) return decks;

  return decks.filter(
    deck =>
      deck.title.toLowerCase().includes(lowerQuery) ||
      deck.description?.toLowerCase().includes(lowerQuery) ||
      deck.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

// ==========================================
// 🎯 ESTATÍSTICAS GERAIS
// ==========================================

/**
 * Calcular estatísticas gerais de todos os decks
 */
export const calculateStats = (decks: Deck[]): FlashcardsStats => {
  const totalDecks = decks.length;
  const activeDecks = decks.filter(d => d.status === 'active').length;

  let totalCards = 0;
  let cardsToReviewToday = 0;
  let cardsMastered = 0;

  decks.forEach(deck => {
    totalCards += deck.totalCards;
    cardsToReviewToday += deck.reviewCards;
    cardsMastered += deck.masteredCards;
  });

  return {
    totalDecks,
    activeDecks,
    totalCards,
    cardsToReviewToday,
    cardsMastered,
    studyStreak: 0, // TODO: implementar cálculo de streak
    totalStudySessions: 0, // TODO: implementar contador de sessões
  };
};

// ==========================================
// 📅 FORMATAÇÃO
// ==========================================

/**
 * Formatar data para exibição
 */
export const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Formatar data relativa
 */
export const formatRelativeDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Há ${Math.floor(diffDays / 30)} meses`;
  return `Há ${Math.floor(diffDays / 365)} anos`;
};

/**
 * Formatar próxima revisão (dias restantes)
 */
export const formatNextReview = (nextReviewDate: string): string => {
  const reviewDate = new Date(nextReviewDate);
  reviewDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = reviewDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Atrasado';
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Amanhã';
  if (diffDays < 7) return `Em ${diffDays} dias`;
  if (diffDays < 30) return `Em ${Math.ceil(diffDays / 7)} semanas`;
  return `Em ${Math.ceil(diffDays / 30)} meses`;
};

// ==========================================
// 🔤 TRADUÇÕES
// ==========================================

/**
 * Traduzir categoria
 */
export const translateCategory = (category: string): string => {
  const translations: Record<string, string> = {
    language: 'Idiomas',
    programming: 'Programação',
    science: 'Ciências',
    math: 'Matemática',
    history: 'História',
    general: 'Geral',
    other: 'Outro',
  };

  return translations[category] || category;
};

/**
 * Traduzir status
 */
export const translateStatus = (status: string): string => {
  const translations: Record<string, string> = {
    active: 'Ativo',
    archived: 'Arquivado',
    completed: 'Concluído',
  };

  return translations[status] || status;
};

/**
 * Traduzir dificuldade
 */
export const translateDifficulty = (difficulty: RecallDifficulty): string => {
  const translations: Record<RecallDifficulty, string> = {
    again: 'Novamente',
    hard: 'Difícil',
    good: 'Bom',
    easy: 'Fácil',
  };

  return translations[difficulty];
};

// ==========================================
// ✅ VALIDAÇÕES
// ==========================================

/**
 * Validar título
 */
export const validateTitle = (title: string): boolean => {
  return title.trim().length >= 3;
};

/**
 * Validar flashcard
 */
export const validateFlashcard = (front: string, back: string): boolean => {
  return front.trim().length >= 1 && back.trim().length >= 1;
};
