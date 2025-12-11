import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTrilhas } from '../../context/TrilhasContext';
import { useFlashcards } from '../../context/FlashcardsContext';
import StepItem from '../../components/StepItem';
import EmptyState from '../../components/EmptyState';
import {
  globalStyles,
  colors,
  spacing,
  borderRadius,
  typography,
} from '../../theme/globalStyles';
import {
  translateStatus,
  getStatusColor,
  formatRelativeDate,
  calculateTotalEstimatedTime,
  calculateRemainingTime,
  formatTime,
} from '../../features/trilhas/utils';

const TrilhaDetailScreen = ({ route, navigation }: any) => {
  const { trilhaId } = route.params;
  const { obterTrilhaPorId, adicionarEtapa, toggleEtapaConclusao, deletarEtapa, vincularDeck } = useTrilhas();
  const { createDeckFromSteps, getDeckById } = useFlashcards();

  const trilha = obterTrilhaPorId(trilhaId);

  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDescription, setNewStepDescription] = useState('');
  const [newStepTime, setNewStepTime] = useState('');
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [isCreatingDeck, setIsCreatingDeck] = useState(false);

  // Se trilha não encontrada
  if (!trilha) {
    return (
      <View style={[globalStyles.container, globalStyles.centered]}>
        <EmptyState
          icon="alert-circle-outline"
          title="Trilha não encontrada"
          message="Esta trilha pode ter sido removida"
        />
      </View>
    );
  }

  const statusColor = getStatusColor(trilha.status);
  const totalTime = calculateTotalEstimatedTime(trilha.steps);
  const remainingTime = calculateRemainingTime(trilha.steps);

  // Handler para adicionar etapa
  const handleAddStep = async () => {
    if (newStepTitle.trim().length < 3) {
      Alert.alert('Erro', 'O título deve ter no mínimo 3 caracteres');
      return;
    }

    try {
      setIsAddingStep(true);

      await adicionarEtapa(trilhaId, {
        title: newStepTitle.trim(),
        description: newStepDescription.trim() || undefined,
        estimatedTime: newStepTime ? parseInt(newStepTime) : undefined,
      });

      // Reset form
      setNewStepTitle('');
      setNewStepDescription('');
      setNewStepTime('');
      setShowAddStepModal(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar a etapa');
    } finally {
      setIsAddingStep(false);
    }
  };

  // Handler para toggle completion
  const handleToggleStep = async (stepId: string) => {
    try {
      await toggleEtapaConclusao(trilhaId, stepId);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a etapa');
    }
  };

  // Handler para deletar etapa
  const handleDeleteStep = (stepId: string, stepTitle: string) => {
    Alert.alert(
      'Deletar Etapa',
      `Tem certeza que deseja deletar "${stepTitle}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarEtapa(trilhaId, stepId);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar a etapa');
            }
          },
        },
      ]
    );
  };

  // Handler para criar flashcards das etapas
  const handleCreateFlashcards = async () => {
    if (trilha.steps.length === 0) {
      Alert.alert('Aviso', 'Adicione etapas primeiro para gerar flashcards');
      return;
    }

    Alert.alert(
      'Criar Flashcards',
      `Deseja gerar ${trilha.steps.length} flashcard${trilha.steps.length !== 1 ? 's' : ''} desta trilha?\n\nCada etapa será transformada em um flashcard para você memorizar.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Criar',
          onPress: async () => {
            try {
              setIsCreatingDeck(true);

              const deck = await createDeckFromSteps(
                trilhaId,
                trilha.title,
                trilha.steps.map(s => ({
                  id: s.id,
                  title: s.title,
                  description: s.description,
                }))
              );

              // Salvar linkedDeckId na trilha
              await vincularDeck(trilhaId, deck.id);

              Alert.alert(
                'Sucesso! 🎉',
                `Deck "${deck.title}" criado com ${deck.totalCards} flashcards.\n\nVá para a aba Flashcards para começar a estudar!`,
                [{ text: 'Ok' }]
              );
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível criar os flashcards');
            } finally {
              setIsCreatingDeck(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={globalStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header da trilha */}
        <View style={globalStyles.glassCard}>
          <View style={styles.flowHeader}>
            <View style={styles.flowTitleContainer}>
              <Text style={styles.flowTitle}>{trilha.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusText}>{translateStatus(trilha.status)}</Text>
              </View>
            </View>
          </View>

          {trilha.description && (
            <Text style={styles.flowDescription}>{trilha.description}</Text>
          )}

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${trilha.progress}%`, backgroundColor: statusColor },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{trilha.progress}%</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="list-outline" size={16} color={colors.text.tertiary} />
              <Text style={styles.statText}>
                {trilha.steps.length} etapa{trilha.steps.length !== 1 ? 's' : ''}
              </Text>
            </View>

            {totalTime > 0 && (
              <View style={styles.statItem}>
                <Icon name="time-outline" size={16} color={colors.text.tertiary} />
                <Text style={styles.statText}>{formatTime(totalTime)}</Text>
              </View>
            )}

            <View style={styles.statItem}>
              <Icon name="calendar-outline" size={16} color={colors.text.tertiary} />
              <Text style={styles.statText}>
                {formatRelativeDate(trilha.updatedAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Botão Criar Flashcards */}
        {trilha.steps.length > 0 && !trilha.linkedDeckId && (
          <Pressable
            style={[styles.createFlashcardsButton, isCreatingDeck && styles.buttonDisabled]}
            onPress={handleCreateFlashcards}
            disabled={isCreatingDeck}
          >
            <Icon name="layers" size={20} color={colors.accent.primary} />
            <Text style={styles.createFlashcardsText}>
              {isCreatingDeck
                ? 'Gerando Flashcards...'
                : `Gerar ${trilha.steps.length} Flashcard${trilha.steps.length !== 1 ? 's' : ''}`}
            </Text>
          </Pressable>
        )}

        {/* Deck Vinculado */}
        {trilha.linkedDeckId && getDeckById(trilha.linkedDeckId) && (
          <Pressable
            style={styles.linkedDeckCard}
            onPress={() => {
              navigation.navigate('FlashcardsTab', {
                screen: 'DeckDetail',
                params: { deckId: trilha.linkedDeckId },
              });
            }}
          >
            <Icon name="layers" size={24} color={colors.accent.primary} />
            <View style={styles.linkedDeckInfo}>
              <Text style={styles.linkedDeckTitle}>
                Deck de Flashcards Vinculado
              </Text>
              <Text style={styles.linkedDeckSubtitle}>
                {getDeckById(trilha.linkedDeckId)?.title}
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
          </Pressable>
        )}

        {/* Etapas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Etapas</Text>
            <Pressable
              style={styles.addButton}
              onPress={() => setShowAddStepModal(true)}
            >
              <Icon name="add-circle" size={24} color={colors.accent.primary} />
            </Pressable>
          </View>

          {trilha.steps.length > 0 ? (
            trilha.steps.map(step => (
              <StepItem
                key={step.id}
                step={step}
                onToggle={() => handleToggleStep(step.id)}
                onPress={() =>
                  navigation.navigate('StepDetail', { trilhaId, stepId: step.id })
                }
              />
            ))
          ) : (
            <EmptyState
              icon="clipboard-outline"
              title="Nenhuma etapa"
              message="Adicione etapas para estruturar sua trilha de aprendizado"
            />
          )}
        </View>
      </ScrollView>

      {/* Modal de adicionar step */}
      <Modal
        visible={showAddStepModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddStepModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Etapa</Text>
              <Pressable onPress={() => setShowAddStepModal(false)}>
                <Icon name="close" size={24} color={colors.text.primary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Título */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>
                  Título <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Estudar fundamentos"
                  placeholderTextColor={colors.text.tertiary}
                  value={newStepTitle}
                  onChangeText={setNewStepTitle}
                  maxLength={100}
                />
              </View>

              {/* Descrição */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Descrição (opcional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Descreva o que precisa ser feito..."
                  placeholderTextColor={colors.text.tertiary}
                  value={newStepDescription}
                  onChangeText={setNewStepDescription}
                  multiline
                  numberOfLines={3}
                  maxLength={300}
                  textAlignVertical="top"
                />
              </View>

              {/* Tempo estimado */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Tempo estimado (minutos)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 60"
                  placeholderTextColor={colors.text.tertiary}
                  value={newStepTime}
                  onChangeText={setNewStepTime}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
            </ScrollView>

            {/* Botões */}
            <View style={styles.modalFooter}>
              <Pressable
                style={[globalStyles.buttonSecondary, styles.modalButton]}
                onPress={() => setShowAddStepModal(false)}
              >
                <Text style={globalStyles.buttonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[globalStyles.buttonPrimary, styles.modalButton]}
                onPress={handleAddStep}
                disabled={isAddingStep}
              >
                <Text style={globalStyles.buttonText}>
                  {isAddingStep ? 'Adicionando...' : 'Adicionar'}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  flowHeader: {
    marginBottom: spacing.md,
  },
  flowTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  flowTitle: {
    flex: 1,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  statusBadge: {
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  flowDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    lineHeight: typography.fontSize.base * 1.5,
    marginBottom: spacing.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    minWidth: 40,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  addButton: {
    padding: spacing.xs,
  },
  createFlashcardsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(91, 126, 255, 0.1)',
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.accent.primary,
    borderStyle: 'dashed',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  createFlashcardsText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.accent.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  linkedDeckCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.accent.primary,
    padding: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  linkedDeckInfo: {
    flex: 1,
  },
  linkedDeckTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  linkedDeckSubtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  modalSection: {
    marginBottom: spacing.lg,
  },
  modalLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.status.error,
  },
  input: {
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  textArea: {
    minHeight: 80,
    paddingTop: spacing.md,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
  },
});

export default TrilhaDetailScreen;
