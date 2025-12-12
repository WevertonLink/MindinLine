import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTasks } from '../../context/TasksContext';
import { useToast } from '../../context/ToastContext';
import TaskCard from '../../components/TaskCard';
import { Button, Card, Chip, SectionHeader } from '../../components';
import EmptyState from '../../components/EmptyState';
import SearchBar from '../../components/SearchBar';
import HelpButton from '../../components/HelpButton';
import { helpContent } from '../../data/helpContent';
import { errorMessages, confirmMessages } from '../../utils/messages';
import {
  globalStyles,
  colors,
  spacing,
  borderRadius,
  typography,
} from '../../theme/globalStyles';
import {
  filterTasksBySearch,
  sortTasks,
} from '../../features/tasks/utils';
import { TaskStatus, CreateTaskInput } from '../../features/tasks/types';

const TasksHomeScreen = ({ navigation }: any) => {
  const { tasks, stats, loading, createTask, toggleTaskStatus, deleteTask } = useTasks();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');

  // Filter and sort tasks
  let filteredTasks = filterTasksBySearch(tasks, searchQuery);

  if (filterStatus !== 'all') {
    filteredTasks = filteredTasks.filter(t => t.status === filterStatus);
  }

  filteredTasks = sortTasks(filteredTasks, 'dueDate', 'asc');

  // Quick add task
  const handleQuickAdd = async () => {
    if (quickTaskTitle.trim().length < 3) {
      toast.warning(
        errorMessages.validation.emptyTitle.title,
        errorMessages.validation.emptyTitle.message
      );
      return;
    }

    try {
      const input: CreateTaskInput = {
        title: quickTaskTitle.trim(),
        priority: 'medium',
      };

      await createTask(input);
      toast.success('Tarefa criada!', `"${quickTaskTitle.trim()}" adicionada à lista.`);
      setQuickTaskTitle('');
      setShowQuickAdd(false);
    } catch (error) {
      toast.error(
        errorMessages.tasks.create.title,
        errorMessages.tasks.create.message
      );
    }
  };

  const handleDeleteTask = useCallback((taskId: string, taskTitle: string) => {
    const deleteConfirm = confirmMessages.delete.task(taskTitle);

    Alert.alert(
      deleteConfirm.title,
      deleteConfirm.message,
      [
        { text: deleteConfirm.cancelText, style: 'cancel' },
        {
          text: deleteConfirm.confirmText,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(taskId);
              toast.success('Tarefa deletada', `"${taskTitle}" foi removida.`);
            } catch (error) {
              toast.error(
                errorMessages.tasks.delete.title,
                errorMessages.tasks.delete.message
              );
            }
          },
        },
      ]
    );
  }, [deleteTask]);

  // FlatList render functions
  const renderTaskItem = useCallback(({ item: task }: { item: typeof filteredTasks[0] }) => (
    <TaskCard
      task={task}
      onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
      onLongPress={() => handleDeleteTask(task.id, task.title)}
      onToggle={() => toggleTaskStatus(task.id)}
    />
  ), [navigation, handleDeleteTask, toggleTaskStatus]);

  const keyExtractor = useCallback((item: typeof filteredTasks[0]) => item.id, []);

  const renderListHeader = useCallback(() => (
    <>
      {/* Header */}
      <SectionHeader
        title="Tasks"
        subtitle="Gerencie suas tarefas com foco e produtividade"
        icon="checkmark-circle-outline"
        helpContent={helpContent['tasks.overview'].content}
      />

      {/* Stats */}
      {tasks.length > 0 && (
        <Card variant="glass" size="medium" style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.todoTasks}</Text>
              <Text style={styles.statLabel}>A Fazer</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.status.info }]}>
                {stats.inProgressTasks}
              </Text>
              <Text style={styles.statLabel}>Em Progresso</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.status.success }]}>
                {stats.completedTasks}
              </Text>
              <Text style={styles.statLabel}>Concluídas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.status.error }]}>
                {stats.overdueTasks}
              </Text>
              <Text style={styles.statLabel}>Atrasadas</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Search bar */}
      {tasks.length > 0 && (
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar tarefas..."
        />
      )}

      {/* Filter chips */}
      {tasks.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterChips}
          contentContainerStyle={styles.filterChipsContent}
        >
          {[
            { key: 'all', label: `Todas (${tasks.length})` },
            { key: 'todo', label: `A Fazer (${stats.todoTasks})` },
            { key: 'in_progress', label: `Em Progresso (${stats.inProgressTasks})` },
            { key: 'completed', label: `Concluídas (${stats.completedTasks})` },
          ].map(filter => (
            <Chip
              key={filter.key}
              label={filter.label}
              variant="primary"
              selected={filterStatus === filter.key}
              onPress={() => setFilterStatus(filter.key as TaskStatus | 'all')}
            />
          ))}
        </ScrollView>
      )}

      {/* Quick add */}
      {showQuickAdd && (
        <View style={styles.quickAddContainer}>
          <TextInput
            style={styles.quickAddInput}
            placeholder="Ex: Revisar flashcards de inglês"
            placeholderTextColor={colors.text.tertiary}
            value={quickTaskTitle}
            onChangeText={setQuickTaskTitle}
            autoFocus
            onSubmitEditing={handleQuickAdd}
          />
          <Pressable onPress={handleQuickAdd} style={styles.quickAddButton}>
            <Icon name="add-circle" size={24} color={colors.accent.primary} />
          </Pressable>
          <Pressable onPress={() => setShowQuickAdd(false)} style={styles.quickAddButton}>
            <Icon name="close-circle" size={24} color={colors.text.tertiary} />
          </Pressable>
        </View>
      )}
    </>
  ), [tasks.length, stats, searchQuery, filterStatus, showQuickAdd, quickTaskTitle, handleQuickAdd]);

  const renderListEmpty = useCallback(() => {
    if (tasks.length > 0) {
      return (
        <EmptyState
          icon="search-outline"
          title="Nenhum resultado"
          message={`Não encontramos tarefas com "${searchQuery}"`}
          action={{
            label: 'Limpar Busca',
            onPress: () => setSearchQuery(''),
            variant: 'secondary',
          }}
        />
      );
    }
    return (
      <EmptyState
        icon="checkmark-circle-outline"
        title="Organize seu dia"
        message="Tarefas ajudam você a manter o foco e acompanhar o que precisa ser feito."
        action={{
          label: 'Criar Primeira Tarefa',
          onPress: () => navigation.navigate('CreateTask'),
          variant: 'primary',
        }}
        suggestions={[
          'Revisar flashcards de inglês',
          'Estudar 1h de programação',
          'Fazer exercícios de matemática',
        ]}
        onSuggestionPress={(suggestion) => {
          setQuickTaskTitle(suggestion);
          setShowQuickAdd(true);
        }}
      />
    );
  }, [tasks.length, searchQuery, navigation]);

  const renderListFooter = useCallback(() => (
    <>
      {/* Botão de adicionar rápido */}
      {!showQuickAdd && (
        <Button
          label="Adicionar Rápido"
          icon="flash"
          variant="secondary"
          onPress={() => setShowQuickAdd(true)}
          fullWidth
        />
      )}
    </>
  ), [showQuickAdd]);

  if (loading) {
    return (
      <View style={[globalStyles.container, globalStyles.centered]}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
        <Text style={[globalStyles.bodyText, { marginTop: spacing.md }]}>
          Carregando tarefas...
        </Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderListEmpty}
        ListFooterComponent={renderListFooter}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />

      {/* FAB - Floating Action Button */}
      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTask')}
      >
        <Icon name="add" size={28} color={colors.text.primary} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  statsCard: {
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  filterChips: {
    marginBottom: spacing.lg,
  },
  filterChipsContent: {
    gap: spacing.sm,
  },
  quickAddContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.accent.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  quickAddInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    paddingVertical: spacing.xs,
  },
  quickAddButton: {
    padding: spacing.xs,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default TasksHomeScreen;
