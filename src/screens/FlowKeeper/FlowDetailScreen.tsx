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
import { useFlowKeeper } from '../../context/FlowKeeperContext';
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
} from '../../features/flowkeeper/utils';

const FlowDetailScreen = ({ route, navigation }: any) => {
  const { flowId } = route.params;
  const { getFlowById, addStep, toggleStepCompletion, deleteStep } = useFlowKeeper();

  const flow = getFlowById(flowId);

  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDescription, setNewStepDescription] = useState('');
  const [newStepTime, setNewStepTime] = useState('');
  const [isAddingStep, setIsAddingStep] = useState(false);

  // Se fluxo não encontrado
  if (!flow) {
    return (
      <View style={[globalStyles.container, globalStyles.centered]}>
        <EmptyState
          icon="alert-circle-outline"
          title="Fluxo não encontrado"
          message="Este fluxo pode ter sido removido"
        />
      </View>
    );
  }

  const statusColor = getStatusColor(flow.status);
  const totalTime = calculateTotalEstimatedTime(flow.steps);
  const remainingTime = calculateRemainingTime(flow.steps);

  // Handler para adicionar step
  const handleAddStep = async () => {
    if (newStepTitle.trim().length < 3) {
      Alert.alert('Erro', 'O título deve ter no mínimo 3 caracteres');
      return;
    }

    try {
      setIsAddingStep(true);

      await addStep(flowId, {
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
      await toggleStepCompletion(flowId, stepId);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a etapa');
    }
  };

  // Handler para deletar step
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
              await deleteStep(flowId, stepId);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar a etapa');
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
        {/* Header do fluxo */}
        <View style={globalStyles.glassCard}>
          <View style={styles.flowHeader}>
            <View style={styles.flowTitleContainer}>
              <Text style={styles.flowTitle}>{flow.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusText}>{translateStatus(flow.status)}</Text>
              </View>
            </View>
          </View>

          {flow.description && (
            <Text style={styles.flowDescription}>{flow.description}</Text>
          )}

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${flow.progress}%`, backgroundColor: statusColor },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{flow.progress}%</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="list-outline" size={16} color={colors.text.tertiary} />
              <Text style={styles.statText}>
                {flow.steps.length} etapa{flow.steps.length !== 1 ? 's' : ''}
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
                {formatRelativeDate(flow.updatedAt)}
              </Text>
            </View>
          </View>
        </View>

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

          {flow.steps.length > 0 ? (
            flow.steps.map(step => (
              <StepItem
                key={step.id}
                step={step}
                onToggle={() => handleToggleStep(step.id)}
                onPress={() =>
                  navigation.navigate('StepDetail', { flowId, stepId: step.id })
                }
              />
            ))
          ) : (
            <EmptyState
              icon="clipboard-outline"
              title="Nenhuma etapa"
              message="Adicione etapas para estruturar seu fluxo de aprendizado"
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

export default FlowDetailScreen;
