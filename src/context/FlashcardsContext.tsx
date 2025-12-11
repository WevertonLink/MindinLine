import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Deck,
  Flashcard,
  CreateDeckInput,
  UpdateDeckInput,
  CreateFlashcardInput,
  UpdateFlashcardInput,
  RecallDifficulty,
  FlashcardsStats,
} from '../features/flashcards/types';
import {
  generateId,
  calculateNextReview,
  calculateStats,
  updateDeckStats,
} from '../features/flashcards/utils';
import { saveFlashcards, loadFlashcards } from '../services/storage';
import { addTimelineActivity } from '../services/timelineService';

// ==========================================
// 🎴 FLASHCARDS CONTEXT
// ==========================================

interface FlashcardsContextData {
  // Estado
  decks: Deck[];
  stats: FlashcardsStats;
  loading: boolean;

  // CRUD de Decks
  createDeck: (input: CreateDeckInput) => Promise<Deck>;
  updateDeck: (deckId: string, input: UpdateDeckInput) => Promise<void>;
  deleteDeck: (deckId: string) => Promise<void>;
  getDeckById: (deckId: string) => Deck | undefined;

  // CRUD de Flashcards
  addFlashcard: (deckId: string, input: CreateFlashcardInput) => Promise<Flashcard>;
  updateFlashcard: (
    deckId: string,
    flashcardId: string,
    input: UpdateFlashcardInput
  ) => Promise<void>;
  deleteFlashcard: (deckId: string, flashcardId: string) => Promise<void>;

  // Estudo e Revisão
  reviewFlashcard: (
    deckId: string,
    flashcardId: string,
    difficulty: RecallDifficulty
  ) => Promise<void>;

  // Utilitários
  refreshDecks: () => Promise<void>;

  // Export/Import
  exportDeck: (deckId: string) => Promise<string>;
  importDeck: (deckData: string) => Promise<void>;

  // Integração com Trilhas
  createDeckFromSteps: (
    trilhaId: string,
    trilhaTitulo: string,
    steps: Array<{ id: string; title: string; description?: string }>
  ) => Promise<Deck>;
}

const FlashcardsContext = createContext<FlashcardsContextData>({} as FlashcardsContextData);

// ==========================================
// 🔧 PROVIDER
// ==========================================

interface FlashcardsProviderProps {
  children: ReactNode;
}

export const FlashcardsProvider: React.FC<FlashcardsProviderProps> = ({ children }) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [stats, setStats] = useState<FlashcardsStats>({
    totalDecks: 0,
    activeDecks: 0,
    totalCards: 0,
    cardsToReviewToday: 0,
    cardsMastered: 0,
    studyStreak: 0,
    totalStudySessions: 0,
  });
  const [loading, setLoading] = useState(true);

  // Carregar decks do storage ao iniciar
  useEffect(() => {
    loadDecksFromStorage();
  }, []);

  // Atualizar stats sempre que decks mudar
  useEffect(() => {
    setStats(calculateStats(decks));
  }, [decks]);

  // Carregar decks do AsyncStorage
  const loadDecksFromStorage = async () => {
    try {
      setLoading(true);
      const savedDecks = await loadFlashcards();
      if (savedDecks && Array.isArray(savedDecks)) {
        setDecks(savedDecks);
      }
    } catch (error) {
      console.error('Erro ao carregar decks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Salvar decks no AsyncStorage
  const saveDecksToStorage = async (updatedDecks: Deck[]) => {
    try {
      await saveFlashcards(updatedDecks);
      setDecks(updatedDecks);
    } catch (error) {
      console.error('Erro ao salvar decks:', error);
      throw error;
    }
  };

  // ==========================================
  // CRUD DE DECKS
  // ==========================================

  const createDeck = async (input: CreateDeckInput): Promise<Deck> => {
    const newDeck: Deck = {
      id: generateId(),
      title: input.title,
      description: input.description,
      category: input.category,
      status: 'active',
      flashcards: [],
      totalCards: 0,
      newCards: 0,
      learningCards: 0,
      reviewCards: 0,
      masteredCards: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: input.tags || [],
    };

    const updatedDecks = [...decks, newDeck];
    await saveDecksToStorage(updatedDecks);

    return newDeck;
  };

  const updateDeck = async (deckId: string, input: UpdateDeckInput): Promise<void> => {
    const updatedDecks = decks.map(deck => {
      if (deck.id === deckId) {
        return {
          ...deck,
          ...input,
          updatedAt: new Date().toISOString(),
        };
      }
      return deck;
    });

    await saveDecksToStorage(updatedDecks);
  };

  const deleteDeck = async (deckId: string): Promise<void> => {
    const updatedDecks = decks.filter(deck => deck.id !== deckId);
    await saveDecksToStorage(updatedDecks);
  };

  const getDeckById = (deckId: string): Deck | undefined => {
    return decks.find(deck => deck.id === deckId);
  };

  // ==========================================
  // CRUD DE FLASHCARDS
  // ==========================================

  const addFlashcard = async (
    deckId: string,
    input: CreateFlashcardInput
  ): Promise<Flashcard> => {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) throw new Error('Deck não encontrado');

    // Criar novo flashcard com valores iniciais para SM-2
    const newFlashcard: Flashcard = {
      id: generateId(),
      deckId,
      front: input.front,
      back: input.back,
      imageUrl: input.imageUrl,
      audioUrl: input.audioUrl,
      easeFactor: 2.5, // Valor inicial padrão
      interval: 0,
      repetitions: 0,
      nextReviewDate: new Date().toISOString(), // Disponível imediatamente
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedFlashcards = [...deck.flashcards, newFlashcard];

    // Atualizar deck com novo flashcard e stats atualizadas
    const updatedDeck = updateDeckStats({
      ...deck,
      flashcards: updatedFlashcards,
    });

    const updatedDecks = decks.map(d => (d.id === deckId ? updatedDeck : d));
    await saveDecksToStorage(updatedDecks);

    return newFlashcard;
  };

  const updateFlashcard = async (
    deckId: string,
    flashcardId: string,
    input: UpdateFlashcardInput
  ): Promise<void> => {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) throw new Error('Deck não encontrado');

    const updatedFlashcards = deck.flashcards.map(card => {
      if (card.id === flashcardId) {
        return {
          ...card,
          ...input,
          updatedAt: new Date().toISOString(),
        };
      }
      return card;
    });

    const updatedDeck = {
      ...deck,
      flashcards: updatedFlashcards,
      updatedAt: new Date().toISOString(),
    };

    const updatedDecks = decks.map(d => (d.id === deckId ? updatedDeck : d));
    await saveDecksToStorage(updatedDecks);
  };

  const deleteFlashcard = async (deckId: string, flashcardId: string): Promise<void> => {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) throw new Error('Deck não encontrado');

    const updatedFlashcards = deck.flashcards.filter(card => card.id !== flashcardId);

    // Atualizar deck com stats recalculadas
    const updatedDeck = updateDeckStats({
      ...deck,
      flashcards: updatedFlashcards,
    });

    const updatedDecks = decks.map(d => (d.id === deckId ? updatedDeck : d));
    await saveDecksToStorage(updatedDecks);
  };

  // ==========================================
  // ESTUDO E REVISÃO
  // ==========================================

  const reviewFlashcard = async (
    deckId: string,
    flashcardId: string,
    difficulty: RecallDifficulty
  ): Promise<void> => {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) throw new Error('Deck não encontrado');

    const flashcard = deck.flashcards.find(c => c.id === flashcardId);
    if (!flashcard) throw new Error('Flashcard não encontrado');

    // Calcular próxima revisão usando SM-2
    const reviewResult = calculateNextReview(flashcard, difficulty);

    // Atualizar flashcard com novos valores
    const updatedFlashcards = deck.flashcards.map(card => {
      if (card.id === flashcardId) {
        return {
          ...card,
          ...reviewResult,
          lastReviewedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return card;
    });

    // Atualizar deck com stats recalculadas
    const updatedDeck = updateDeckStats({
      ...deck,
      flashcards: updatedFlashcards,
      lastStudiedAt: new Date().toISOString(),
    });

    const updatedDecks = decks.map(d => (d.id === deckId ? updatedDeck : d));
    await saveDecksToStorage(updatedDecks);

    // Registrar no Timeline
    const cardPreview = flashcard?.front
      ? `Card: ${flashcard.front.substring(0, 50)}${flashcard.front.length > 50 ? '...' : ''}`
      : 'Card revisado';

    await addTimelineActivity({
      type: 'flashcard_review',
      title: `Revisão: ${deck.title}`,
      description: cardPreview,
      metadata: {
        deckId: deck.id,
        deckTitle: deck.title,
        cardsReviewed: 1,
        averageDifficulty: difficulty,
      },
    });
  };

  // ==========================================
  // UTILITÁRIOS
  // ==========================================

  const refreshDecks = async (): Promise<void> => {
    await loadDecksFromStorage();
  };

  // ==========================================
  // INTEGRAÇÃO COM TRILHAS
  // ==========================================

  const createDeckFromSteps = async (
    trilhaId: string,
    trilhaTitulo: string,
    steps: Array<{ id: string; title: string; description?: string }>
  ): Promise<Deck> => {
    // Criar novo deck
    const newDeck: Deck = {
      id: generateId(),
      title: `📚 ${trilhaTitulo}`,
      description: `Flashcards gerados da trilha: ${trilhaTitulo}`,
      category: 'general',
      status: 'active',
      flashcards: [],
      totalCards: 0,
      newCards: 0,
      learningCards: 0,
      reviewCards: 0,
      masteredCards: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['trilha', trilhaId],
    };

    // Criar flashcards para cada step
    const flashcards: Flashcard[] = steps.map(step => ({
      id: generateId(),
      deckId: newDeck.id,
      front: step.title,
      back: step.description || 'Estudar e dominar este tópico',
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReviewDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    newDeck.flashcards = flashcards;

    // Atualizar stats do deck
    const updatedDeck = updateDeckStats(newDeck);

    const updatedDecks = [...decks, updatedDeck];
    await saveDecksToStorage(updatedDecks);

    // Registrar no Timeline
    await addTimelineActivity({
      type: 'flashcard_review',
      title: `Deck criado: ${newDeck.title}`,
      description: `${flashcards.length} flashcards gerados automaticamente da trilha`,
      metadata: {
        deckId: newDeck.id,
        deckTitle: newDeck.title,
        flowId,
      },
    });

    return updatedDeck;
  };

  // ==========================================
  // EXPORT/IMPORT
  // ==========================================

  const exportDeck = async (deckId: string): Promise<string> => {
    try {
      const deck = decks.find(d => d.id === deckId);
      if (!deck) {
        throw new Error('Deck não encontrado');
      }

      const exportData = {
        deck,
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Erro ao exportar deck:', error);
      throw error;
    }
  };

  const importDeck = async (deckData: string): Promise<void> => {
    try {
      const parsed = JSON.parse(deckData);

      // Validar estrutura
      if (!parsed.deck || !parsed.version) {
        throw new Error('Arquivo inválido - estrutura não reconhecida');
      }

      const importedDeck: Deck = parsed.deck;

      // Verificar se deck já existe pelo título
      const existingDeck = decks.find(d => d.title === importedDeck.title);
      if (existingDeck) {
        throw new Error(`Já existe um deck com o nome "${importedDeck.title}"`);
      }

      // Gerar novos IDs para evitar conflitos
      const newDeckId = generateId();
      const newDeck: Deck = {
        ...importedDeck,
        id: newDeckId,
        flashcards: importedDeck.flashcards.map(card => ({
          ...card,
          id: generateId(),
          deckId: newDeckId,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Atualizar stats do deck importado
      const updatedDeck = updateDeckStats(newDeck);

      const updatedDecks = [...decks, updatedDeck];
      await saveDecksToStorage(updatedDecks);

      // Registrar no Timeline
      await addTimelineActivity({
        type: 'flashcard_review',
        title: `Deck importado: ${newDeck.title}`,
        description: `${newDeck.flashcards.length} flashcards importados`,
        metadata: {
          deckId: newDeck.id,
          deckTitle: newDeck.title,
        },
      });
    } catch (error) {
      console.error('Erro ao importar deck:', error);
      throw error;
    }
  };

  // ==========================================
  // PROVIDER VALUE
  // ==========================================

  const value: FlashcardsContextData = {
    decks,
    stats,
    loading,
    createDeck,
    updateDeck,
    deleteDeck,
    getDeckById,
    addFlashcard,
    updateFlashcard,
    deleteFlashcard,
    reviewFlashcard,
    refreshDecks,
    exportDeck,
    importDeck,
    createDeckFromSteps,
  };

  return <FlashcardsContext.Provider value={value}>{children}</FlashcardsContext.Provider>;
};

// ==========================================
// 🪝 HOOK
// ==========================================

export const useFlashcards = () => {
  const context = useContext(FlashcardsContext);

  if (!context) {
    throw new Error('useFlashcards must be used within FlashcardsProvider');
  }

  return context;
};

export default FlashcardsContext;
