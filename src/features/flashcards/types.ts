// ==========================================
// 🎴 TIPOS E INTERFACES: FLASHCARDS
// ==========================================

/**
 * Dificuldade de recall do flashcard
 */
export type RecallDifficulty = 'again' | 'hard' | 'good' | 'easy';

/**
 * Status do deck
 */
export type DeckStatus = 'active' | 'archived' | 'completed';

/**
 * Categoria do deck
 */
export type DeckCategory =
  | 'language'
  | 'programming'
  | 'science'
  | 'math'
  | 'history'
  | 'general'
  | 'other';

/**
 * Flashcard individual
 */
export interface Flashcard {
  id: string;
  deckId: string;
  front: string; // Pergunta/termo
  back: string; // Resposta/definição
  imageUrl?: string;
  audioUrl?: string;

  // Sistema de repetição espaçada
  easeFactor: number; // Fator de facilidade (>= 1.3)
  interval: number; // Intervalo em dias
  repetitions: number; // Número de repetições corretas consecutivas
  nextReviewDate: string; // Próxima data de revisão (ISO)
  lastReviewedAt?: string;

  createdAt: string;
  updatedAt: string;
}

/**
 * Deck (coleção de flashcards)
 */
export interface Deck {
  id: string;
  title: string;
  description?: string;
  category?: DeckCategory;
  status: DeckStatus;

  // Flashcards do deck
  flashcards: Flashcard[];

  // Estatísticas
  totalCards: number;
  newCards: number; // Nunca estudados
  learningCards: number; // Em aprendizado
  reviewCards: number; // Para revisar hoje
  masteredCards: number; // Dominados (repetitions >= 5)

  createdAt: string;
  updatedAt: string;
  lastStudiedAt?: string;
  tags?: string[];
}

/**
 * Input para criar deck
 */
export interface CreateDeckInput {
  title: string;
  description?: string;
  category?: DeckCategory;
  tags?: string[];
}

/**
 * Input para atualizar deck
 */
export interface UpdateDeckInput {
  title?: string;
  description?: string;
  category?: DeckCategory;
  status?: DeckStatus;
  tags?: string[];
}

/**
 * Input para criar flashcard
 */
export interface CreateFlashcardInput {
  front: string;
  back: string;
  imageUrl?: string;
  audioUrl?: string;
}

/**
 * Input para atualizar flashcard
 */
export interface UpdateFlashcardInput {
  front?: string;
  back?: string;
  imageUrl?: string;
  audioUrl?: string;
}

/**
 * Review de um flashcard (resposta do usuário)
 */
export interface FlashcardReview {
  flashcardId: string;
  difficulty: RecallDifficulty;
  reviewedAt: string;
}

/**
 * Resultado do algoritmo de repetição espaçada
 */
export interface SpacedRepetitionResult {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
}

/**
 * Sessão de estudo
 */
export interface StudySession {
  deckId: string;
  startedAt: string;
  endedAt?: string;
  cardsStudied: number;
  cardsCorrect: number;
  cardsIncorrect: number;
  duration?: number; // segundos
}

/**
 * Estatísticas gerais dos flashcards
 */
export interface FlashcardsStats {
  totalDecks: number;
  activeDecks: number;
  totalCards: number;
  cardsToReviewToday: number;
  cardsMastered: number;
  studyStreak: number; // dias consecutivos de estudo
  totalStudySessions: number;
}

/**
 * Filtros para listar decks
 */
export interface DeckFilters {
  status?: DeckStatus;
  category?: DeckCategory;
  searchQuery?: string;
}

/**
 * Opções de ordenação
 */
export type DeckSortBy = 'createdAt' | 'updatedAt' | 'title' | 'cardsToReview';

export type SortOrder = 'asc' | 'desc';
