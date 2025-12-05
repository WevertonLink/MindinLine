import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFlashcards } from '../../context/FlashcardsContext';
import { useSettings } from '../../context/SettingsContext';
import { RecallDifficulty, Flashcard } from '../../features/flashcards/types';
import { getCardsToStudy, formatNextReview, shuffleArray } from '../../features/flashcards/utils';
import {
  globalStyles,
  colors,
  spacing,
  borderRadius,
  typography,
} from '../../theme/globalStyles';

const StudyModeScreen = ({ route, navigation }: any) => {
  const { deckId } = route.params;
  const { getDeckById, reviewFlashcard } = useFlashcards();
  const { settings } = useSettings();

  const deck = getDeckById(deckId);
  const [cardsToStudy, setCardsToStudy] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Animação de flip
  const [flipAnim] = useState(new Animated.Value(0));

  // Carregar cards ao iniciar
  useEffect(() => {
    if (deck) {
      let cards = getCardsToStudy(deck);

      // Embaralhar se configurado
      if (settings.flashcards.shuffleCards) {
        cards = shuffleArray(cards);
      }

      setCardsToStudy(cards);
      if (cards.length === 0) {
        setSessionCompleted(true);
      }
    }
  }, [deck, settings.flashcards.shuffleCards]);

  // Se deck não encontrado ou sem cards (e sessão não foi apenas completada)
  if (!deck || (cardsToStudy.length === 0 && !sessionCompleted)) {
    return (
      <View style={[globalStyles.container, globalStyles.centered]}>
        <Icon name="checkmark-circle-outline" size={80} color={colors.status.success} />
        <Text style={[globalStyles.title, { marginTop: spacing.lg }]}>
          Tudo Revisado!
        </Text>
        <Text style={globalStyles.subtitle}>
          Não há flashcards para estudar agora
        </Text>
        <Pressable
          style={[globalStyles.buttonPrimary, { marginTop: spacing.xl }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={globalStyles.buttonText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const currentCard = cardsToStudy[currentIndex];
  const progress = ((currentIndex + 1) / cardsToStudy.length) * 100;

  // Validação de currentCard
  if (!currentCard) {
    return (
      <View style={[globalStyles.container, globalStyles.centered]}>
        <Icon name="alert-circle-outline" size={80} color={colors.status.warning} />
        <Text style={[globalStyles.title, { marginTop: spacing.lg }]}>
          Nenhum Card Disponível
        </Text>
        <Text style={globalStyles.subtitle}>
          Não há flashcards para estudar no momento
        </Text>
        <Pressable
          style={[globalStyles.buttonPrimary, { marginTop: spacing.xl }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={globalStyles.buttonText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  // Handler para flip
  const handleFlip = () => {
    Animated.timing(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setIsFlipped(!isFlipped);
  };

  // Handler para review
  const handleReview = async (difficulty: RecallDifficulty) => {
    if (!currentCard) return;

    try {
      setIsReviewing(true);

      // Aplicar algoritmo SM-2
      await reviewFlashcard(deckId, currentCard.id, difficulty);

      // Ir para próximo card
      if (currentIndex < cardsToStudy.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
        flipAnim.setValue(0);
      } else {
        // Fim da sessão - marcar como completa e navegar de volta
        setSessionCompleted(true);
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível registrar a revisão');
    } finally {
      setIsReviewing(false);
    }
  };

  // Botões de dificuldade
  const difficultyButtons: {
    difficulty: RecallDifficulty;
    label: string;
    color: string;
    icon: string;
  }[] = [
    { difficulty: 'again', label: 'Novamente', color: colors.status.error, icon: 'close-circle' },
    { difficulty: 'hard', label: 'Difícil', color: colors.status.warning, icon: 'alert-circle' },
    { difficulty: 'good', label: 'Bom', color: colors.status.info, icon: 'checkmark-circle' },
    { difficulty: 'easy', label: 'Fácil', color: colors.status.success, icon: 'checkmark-done-circle' },
  ];

  // Interpolação de rotação
  const frontRotation = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotation = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  // Tela de sessão concluída
  if (sessionCompleted && cardsToStudy.length > 0) {
    return (
      <View style={[globalStyles.container, globalStyles.centered]}>
        <Icon name="trophy" size={80} color={colors.accent.primary} />
        <Text style={[globalStyles.title, { marginTop: spacing.lg }]}>
          Parabéns!
        </Text>
        <Text style={globalStyles.subtitle}>
          Você revisou {cardsToStudy.length} flashcard{cardsToStudy.length !== 1 ? 's' : ''}
        </Text>
        <Text style={[globalStyles.bodyText, { marginTop: spacing.md, color: colors.text.tertiary }]}>
          Continue assim para dominar o conteúdo!
        </Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Icon name="close" size={28} color={colors.text.primary} />
        </Pressable>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{deck.title}</Text>
          <Text style={styles.headerProgress}>
            {currentIndex + 1} / {cardsToStudy.length}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* Card Container */}
      <View style={styles.cardContainer}>
        <Pressable onPress={handleFlip} style={styles.cardPressable}>
          {/* Frente */}
          <Animated.View
            style={[
              styles.card,
              styles.cardFront,
              {
                transform: [{ rotateY: frontRotation }],
                opacity: frontOpacity,
              },
            ]}
          >
            <Text style={styles.cardLabel}>FRENTE</Text>
            <Text style={styles.cardText}>{currentCard.front}</Text>
            <View style={styles.flipHint}>
              <Icon name="sync-outline" size={20} color={colors.text.tertiary} />
              <Text style={styles.flipHintText}>Toque para virar</Text>
            </View>
          </Animated.View>

          {/* Verso */}
          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              {
                transform: [{ rotateY: backRotation }],
                opacity: backOpacity,
              },
            ]}
          >
            <Text style={styles.cardLabel}>VERSO</Text>
            <Text style={styles.cardText}>{currentCard.back}</Text>
          </Animated.View>
        </Pressable>

        {/* Card Info */}
        <View style={styles.cardInfo}>
          <View style={styles.cardInfoItem}>
            <Icon name="repeat-outline" size={16} color={colors.text.tertiary} />
            <Text style={styles.cardInfoText}>
              {currentCard.repetitions}x revisões
            </Text>
          </View>
          {currentCard.nextReviewDate && (
            <View style={styles.cardInfoItem}>
              <Icon name="time-outline" size={16} color={colors.text.tertiary} />
              <Text style={styles.cardInfoText}>
                Próxima: {formatNextReview(currentCard.nextReviewDate)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Difficulty Buttons */}
      {isFlipped && (
        <View style={styles.difficultyContainer}>
          <Text style={styles.difficultyLabel}>Como foi sua lembrança?</Text>

          <View style={styles.difficultyButtons}>
            {difficultyButtons.map(btn => (
              <Pressable
                key={btn.difficulty}
                style={({ pressed }) => [
                  styles.difficultyButton,
                  { borderColor: btn.color },
                  pressed && styles.difficultyButtonPressed,
                ]}
                onPress={() => handleReview(btn.difficulty)}
                disabled={isReviewing}
              >
                <Icon name={btn.icon} size={24} color={btn.color} />
                <Text style={[styles.difficultyButtonText, { color: btn.color }]}>
                  {btn.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Skip hint (if not flipped) */}
      {!isFlipped && (
        <View style={styles.skipHint}>
          <Text style={styles.skipHintText}>
            Vire o card para avaliar sua lembrança
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  closeButton: {
    padding: spacing.xs,
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  headerProgress: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.primary,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  cardPressable: {
    width: '100%',
    aspectRatio: 1.5,
    maxHeight: 400,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.accent.primary,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
  },
  cardFront: {},
  cardBack: {},
  cardLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.primary,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  cardText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: typography.fontSize['2xl'] * 1.4,
  },
  flipHint: {
    position: 'absolute',
    bottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  flipHintText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  cardInfo: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  cardInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardInfoText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  difficultyContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: 'rgba(10, 14, 39, 0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
  },
  difficultyLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  difficultyButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: borderRadius.md,
    borderWidth: 2,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  difficultyButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  difficultyButtonText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  skipHint: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: 'rgba(10, 14, 39, 0.7)',
  },
  skipHintText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
});

export default StudyModeScreen;
