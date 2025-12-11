import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTasks } from '../../context/TasksContext';
import EmptyState from '../../components/EmptyState';
import {
  globalStyles,
  colors,
  spacing,
  borderRadius,
  typography,
} from '../../theme/globalStyles';
import {
  getPriorityColor,
  getStatusColor,
  translatePriority,
  translateStatus,
  translateCategory,
  formatDueDate,
  calculateSubtasksProgress,
  formatTime,
} from '../../features/tasks/utils';

const TaskDetailScreen = ({ route, navigation }: any) => {
  const { taskId } = route.params;
  const {
    getTaskById,
    toggleTaskStatus,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    startFocusSession,
    startTaskTimer,
    pauseTaskTimer,
    stopTaskTimer,
  } = useTasks();

  const task = getTaskById(taskId);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now()); // Para atualizar timer em tempo real

  // Atualizar timer a cada segundo se estiver rodando
  useEffect(() => {
    if (!task?.timeTracking?.isRunning) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [task?.timeTracking?.isRunning]);

  // Helper para calcular segundos atuais do timer
  const getCurrentSeconds = (): number => {
    if (!task?.timeTracking) return 0;

    let total = task.timeTracking.totalSeconds;

    if (task.timeTracking.isRunning && task.timeTracking.startedAt) {
      const elapsed = Math.floor(
        (Date.now() - new Date(task.timeTracking.startedAt).getTime()) / 1000
      );
      total += elapsed;
    }

    return total;
  };

  // Helper para formatar duração
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!task) {
    return (
      <View style={[globalStyles.container, globalStyles.centered]}>
        <EmptyState
          icon="alert-circle-outline"
          title="Tarefa não encontrada"
          message="Esta tarefa pode ter sido removida"
        />
      </View>
    );
  }

  const priorityColor = getPriorityColor(task.priority);
  const statusColor = getStatusColor(task.status);
  const subtasksProgress = calculateSubtasksProgress(task.subtasks);

  const handleAddSubtask = async () => {
    if (subtaskTitle.trim().length < 3) {
      Alert.alert('Erro', 'O título deve ter no mínimo 3 caracteres');
      return;
    }

    try {
      await addSubtask(taskId, { title: subtaskTitle.trim() });
      setSubtaskTitle('');
      setShowAddSubtask(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar a subtarefa');
    }
  };

  const handleDeleteTask = () => {
    Alert.alert('Deletar Tarefa', `Tem certeza que deseja deletar "${task.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTask(taskId);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível deletar a tarefa');
          }
        },
      },
    ]);
  };

  const handleStartFocus = async () => {
    try {
      await startFocusSession(taskId, 'focus');
      navigation.navigate('FocusMode', { taskId });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível iniciar sessão de foco');
    }
  };

  return (
    <View style={globalStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={globalStyles.glassCard}>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{translateStatus(task.status)}</Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
              <Text style={styles.priorityText}>{translatePriority(task.priority)}</Text>
            </View>
          </View>

          <Text style={styles.taskTitle}>{task.title}</Text>

          {task.description && (
            <Text style={styles.taskDescription}>{task.description}</Text>
          )}

          {/* Meta info */}
          <View style={styles.metaRow}>
            {task.category && (
              <View style={styles.metaItem}>
                <Icon name="pricetag-outline" size={16} color={colors.text.tertiary} />
                <Text style={styles.metaText}>{translateCategory(task.category)}</Text>
              </View>
            )}
            {task.dueDate && (
              <View style={styles.metaItem}>
                <Icon name="calendar-outline" size={16} color={colors.text.tertiary} />
                <Text style={styles.metaText}>{formatDueDate(task.dueDate)}</Text>
              </View>
            )}
            {task.estimatedMinutes && (
              <View style={styles.metaItem}>
                <Icon name="time-outline" size={16} color={colors.text.tertiary} />
                <Text style={styles.metaText}>{formatTime(task.estimatedMinutes)}</Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <Pressable
              style={[globalStyles.buttonPrimary, styles.actionButton]}
              onPress={() => toggleTaskStatus(taskId)}
            >
              <Icon
                name={task.status === 'completed' ? 'refresh' : 'checkmark'}
                size={20}
                color={colors.text.primary}
              />
              <Text style={[globalStyles.buttonText, { marginLeft: spacing.xs }]}>
                {task.status === 'completed' ? 'Reabrir' : 'Concluir'}
              </Text>
            </Pressable>

            <Pressable
              style={[globalStyles.buttonSecondary, styles.actionButton]}
              onPress={handleStartFocus}
            >
              <Icon name="timer-outline" size={20} color={colors.text.primary} />
              <Text style={[globalStyles.buttonText, { marginLeft: spacing.xs }]}>
                Foco
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Timer Section */}
        <View style={[globalStyles.glassCard, styles.timerSection]}>
          <View style={styles.timerHeader}>
            <Icon name="timer-outline" size={24} color={colors.accent.primary} />
            <Text style={styles.sectionTitle}>Timer</Text>
          </View>

          {/* Display do tempo atual */}
          {task.timeTracking && (
            <View style={styles.timerDisplay}>
              <Text style={styles.timerText}>{formatDuration(getCurrentSeconds())}</Text>
              {task.estimatedMinutes && (
                <Text style={styles.estimateText}>
                  Estimado: {task.estimatedMinutes}min
                </Text>
              )}
            </View>
          )}

          {/* Controles do timer */}
          <View style={styles.timerControls}>
            {!task.timeTracking?.isRunning ? (
              <Pressable
                style={[globalStyles.buttonPrimary, styles.timerButton]}
                onPress={() => startTaskTimer(taskId)}
              >
                <Icon name="play-circle-outline" size={24} color={colors.text.primary} />
                <Text style={[globalStyles.buttonText, { marginLeft: spacing.xs }]}>
                  Iniciar
                </Text>
              </Pressable>
            ) : (
              <View style={styles.activeTimerRow}>
                <Pressable
                  style={[globalStyles.buttonSecondary, styles.timerButton]}
                  onPress={() => pauseTaskTimer(taskId)}
                >
                  <Icon name="pause-circle-outline" size={24} color={colors.text.primary} />
                  <Text style={[globalStyles.buttonText, { marginLeft: spacing.xs }]}>
                    Pausar
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.stopButton, styles.timerButton]}
                  onPress={() => {
                    Alert.alert(
                      'Parar Timer',
                      'Deseja parar e salvar esta sessão no histórico?',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Parar',
                          style: 'destructive',
                          onPress: () => stopTaskTimer(taskId),
                        },
                      ]
                    );
                  }}
                >
                  <Icon name="stop-circle-outline" size={24} color="#FFF" />
                  <Text style={[globalStyles.buttonText, { marginLeft: spacing.xs, color: '#FFF' }]}>
                    Parar
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Histórico de sessões */}
          {task.timeTracking?.sessions && task.timeTracking.sessions.length > 0 && (
            <View style={styles.sessionsHistory}>
              <Text style={styles.historyTitle}>Sessões Anteriores</Text>
              {task.timeTracking.sessions.slice(-3).reverse().map((session, index) => {
                const date = new Date(session.endedAt);
                const dateStr = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

                return (
                  <View key={index} style={styles.sessionRow}>
                    <Text style={styles.sessionDate}>{dateStr}</Text>
                    <Text style={styles.sessionDuration}>
                      {formatDuration(session.duration)}
                    </Text>
                  </View>
                );
              })}
              {task.timeTracking.sessions.length > 3 && (
                <Text style={styles.moreSessionsText}>
                  +{task.timeTracking.sessions.length - 3} sessões anteriores
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Recorrência */}
        {task.isRecurring && task.recurrence && (
          <View style={globalStyles.glassCard}>
            <View style={styles.timerHeader}>
              <Icon name="repeat-outline" size={24} color={colors.accent.primary} />
              <Text style={styles.sectionTitle}>Recorrência</Text>
            </View>

            <View style={styles.recurrenceInfo}>
              <View style={styles.recurrenceRow}>
                <Icon name="calendar" size={20} color={colors.text.secondary} />
                <Text style={styles.recurrenceText}>
                  {task.recurrence.type === 'daily' && `A cada ${task.recurrence.interval} dia(s)`}
                  {task.recurrence.type === 'weekly' && `A cada ${task.recurrence.interval} semana(s)`}
                  {task.recurrence.type === 'monthly' && `A cada ${task.recurrence.interval} mês(meses)`}
                </Text>
              </View>

              {task.recurrence.endDate && (
                <View style={styles.recurrenceRow}>
                  <Icon name="flag" size={20} color={colors.text.secondary} />
                  <Text style={styles.recurrenceText}>
                    Até {new Date(task.recurrence.endDate).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
              )}

              <View style={styles.recurrenceBadge}>
                <Icon name="sync" size={16} color={colors.status.success} />
                <Text style={styles.recurrenceBadgeText}>
                  Nova tarefa será criada automaticamente ao concluir
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Subtasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Subtarefas ({task.subtasks.length})</Text>
            <Pressable onPress={() => setShowAddSubtask(true)}>
              <Icon name="add-circle" size={24} color={colors.accent.primary} />
            </Pressable>
          </View>

          {task.subtasks.length > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${subtasksProgress}%`, backgroundColor: statusColor },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{subtasksProgress}%</Text>
            </View>
          )}

          {task.subtasks.length > 0 ? (
            task.subtasks.map(subtask => (
              <View key={subtask.id} style={styles.subtaskItem}>
                <Pressable
                  style={[
                    styles.subtaskCheckbox,
                    subtask.completed && styles.subtaskCheckboxCompleted,
                  ]}
                  onPress={() => toggleSubtask(taskId, subtask.id)}
                >
                  {subtask.completed && (
                    <Icon name="checkmark" size={16} color={colors.text.primary} />
                  )}
                </Pressable>
                <Text
                  style={[
                    styles.subtaskTitle,
                    subtask.completed && styles.subtaskTitleCompleted,
                  ]}
                >
                  {subtask.title}
                </Text>
                <Pressable onPress={() => deleteSubtask(taskId, subtask.id)}>
                  <Icon name="trash-outline" size={18} color={colors.status.error} />
                </Pressable>
              </View>
            ))
          ) : (
            <EmptyState
              icon="list-outline"
              title="Nenhuma subtarefa"
              message="Adicione subtarefas para dividir esta tarefa em etapas menores"
            />
          )}
        </View>

        {/* Delete button */}
        <Pressable style={styles.deleteButton} onPress={handleDeleteTask}>
          <Icon name="trash-outline" size={20} color={colors.status.error} />
          <Text style={styles.deleteButtonText}>Deletar Tarefa</Text>
        </Pressable>
      </ScrollView>

      {/* Modal Add Subtask */}
      <Modal visible={showAddSubtask} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Subtarefa</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Revisar capítulo 1"
              placeholderTextColor={colors.text.tertiary}
              value={subtaskTitle}
              onChangeText={setSubtaskTitle}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[globalStyles.buttonSecondary, styles.modalButton]}
                onPress={() => setShowAddSubtask(false)}
              >
                <Text style={globalStyles.buttonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[globalStyles.buttonPrimary, styles.modalButton]}
                onPress={handleAddSubtask}
              >
                <Text style={globalStyles.buttonText}>Adicionar</Text>
              </Pressable>
            </View>
          </View>
        </View>
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
  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statusBadge: {
    borderRadius: borderRadius.sm,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  priorityBadge: {
    borderRadius: borderRadius.sm,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  priorityText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  taskTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  taskDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.5,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 6,
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
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  subtaskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskCheckboxCompleted: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  subtaskTitle: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  subtaskTitleCompleted: {
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
  },
  deleteButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.status.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
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
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
  // Timer styles
  timerSection: {
    marginTop: spacing.lg,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  timerDisplay: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  timerText: {
    fontSize: 48,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.primary,
    fontVariant: ['tabular-nums'],
  },
  estimateText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  timerControls: {
    gap: spacing.md,
  },
  activeTimerRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timerButton: {
    flex: 1,
  },
  stopButton: {
    backgroundColor: colors.status.error,
    borderColor: colors.status.error,
  },
  sessionsHistory: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
  },
  historyTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  sessionDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  sessionDuration: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  moreSessionsText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  // Recurrence styles
  recurrenceInfo: {
    gap: spacing.md,
  },
  recurrenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  recurrenceText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    flex: 1,
  },
  recurrenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  recurrenceBadgeText: {
    fontSize: typography.fontSize.sm,
    color: colors.status.success,
    flex: 1,
  },
});

export default TaskDetailScreen;
