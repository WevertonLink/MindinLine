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
import TaskCard from '../../components/TaskCard';
import EmptyState from '../../components/EmptyState';
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
      Alert.alert('Erro', 'O título deve ter no mínimo 3 caracteres');
      return;
    }

    try {
      const input: CreateTaskInput = {
        title: quickTaskTitle.trim(),
        priority: 'medium',
      };

      await createTask(input);
      setQuickTaskTitle('');
      setShowQuickAdd(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a tarefa');
    }
  };

  const handleDeleteTask = useCallback((taskId: string, taskTitle: string) => {
    Alert.alert('Deletar Tarefa', `Tem certeza que deseja deletar "${taskTitle}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTask(taskId);
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível deletar a tarefa');
          }
        },
      },
    ]);
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
      {/* Header com stats */}
      <View style={styles.header}>
        <Text style={globalStyles.title}>Tasks</Text>
        <Text style={globalStyles.subtitle}>
          Gerencie suas tarefas com foco e produtividade
        </Text>

        {tasks.length > 0 && (
          <View style={styles.statsContainer}>
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
        )}
      </View>

      {/* Search bar */}
      {tasks.length > 0 && (
        <View style={styles.searchContainer}>
          <Icon name="search-outline" size={20} color={colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar tarefas..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color={colors.text.tertiary} />
            </Pressable>
          )}
        </View>
      )}

      {/* Filter tabs */}
      {tasks.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterTabs}
          contentContainerStyle={styles.filterTabsContent}
        >
          {[
            { key: 'all', label: 'Todas', count: tasks.length },
            { key: 'todo', label: 'A Fazer', count: stats.todoTasks },
            { key: 'in_progress', label: 'Em Progresso', count: stats.inProgressTasks },
            { key: 'completed', label: 'Concluídas', count: stats.completedTasks },
          ].map(filter => (
            <Pressable
              key={filter.key}
              style={[
                styles.filterTab,
                filterStatus === filter.key && styles.filterTabActive,
              ]}
              onPress={() => setFilterStatus(filter.key as TaskStatus | 'all')}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filterStatus === filter.key && styles.filterTabTextActive,
                ]}
              >
                {filter.label} ({filter.count})
              </Text>
            </Pressable>
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
        />
      );
    }
    return (
      <EmptyState
        icon="checkmark-circle-outline"
        title="Nenhuma tarefa criada"
        message="Crie sua primeira tarefa para começar a organizar seu dia com foco e produtividade"
      />
    );
  }, [tasks.length, searchQuery]);

  const renderListFooter = useCallback(() => (
    <>
      {/* Botão de adicionar rápido */}
      {!showQuickAdd && (
        <Pressable
          style={({ pressed }) => [
            globalStyles.buttonSecondary,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => setShowQuickAdd(true)}
        >
          <Icon name="flash" size={20} color={colors.text.primary} />
          <Text style={[globalStyles.buttonText, { marginLeft: spacing.sm }]}>
            Adicionar Rápido
          </Text>
        </Pressable>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.md,
    marginTop: spacing.md,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    paddingVertical: spacing.xs,
  },
  filterTabs: {
    marginBottom: spacing.lg,
  },
  filterTabsContent: {
    gap: spacing.sm,
  },
  filterTab: {
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  filterTabActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  filterTabText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  filterTabTextActive: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
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
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
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
