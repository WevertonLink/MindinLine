import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Task } from '../features/tasks/types';
import {
  colors,
  spacing,
  borderRadius,
  typography,
} from '../theme/globalStyles';
import {
  getPriorityColor,
  getStatusColor,
  formatDueDate,
  isOverdue,
  isDueToday,
  calculateSubtasksProgress,
  translatePriority,
} from '../features/tasks/utils';

// ==========================================
// ✅ TASK CARD COMPONENT
// ==========================================

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  onLongPress?: () => void;
  onToggle: () => void;
}

const TaskCardComponent: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onLongPress,
  onToggle,
}) => {
  const priorityColor = getPriorityColor(task.priority);
  const statusColor = getStatusColor(task.status);
  const subtasksProgress = calculateSubtasksProgress(task.subtasks);
  const isTaskOverdue = isOverdue(task);
  const isTaskDueToday = isDueToday(task);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        task.status === 'completed' && styles.containerCompleted,
        pressed && styles.containerPressed,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {/* Priority indicator */}
      <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />

      <View style={styles.content}>
        {/* Checkbox + Title */}
        <View style={styles.header}>
          <Pressable
            style={[
              styles.checkbox,
              task.status === 'completed' && styles.checkboxCompleted,
            ]}
            onPress={onToggle}
          >
            {task.status === 'completed' && (
              <Icon name="checkmark" size={18} color={colors.text.primary} />
            )}
          </Pressable>

          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.title,
                task.status === 'completed' && styles.titleCompleted,
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>

            {task.description && (
              <Text style={styles.description} numberOfLines={1}>
                {task.description}
              </Text>
            )}
          </View>
        </View>

        {/* Meta info */}
        <View style={styles.metaRow}>
          {/* Priority badge */}
          <View style={[styles.badge, { backgroundColor: `${priorityColor}20`, borderColor: priorityColor }]}>
            <Text style={[styles.badgeText, { color: priorityColor }]}>
              {translatePriority(task.priority)}
            </Text>
          </View>

          {/* Due date */}
          {task.dueDate && (
            <View style={styles.metaItem}>
              <Icon
                name="calendar-outline"
                size={14}
                color={isTaskOverdue ? colors.status.error : isTaskDueToday ? colors.status.warning : colors.text.tertiary}
              />
              <Text
                style={[
                  styles.metaText,
                  isTaskOverdue && { color: colors.status.error },
                  isTaskDueToday && { color: colors.status.warning },
                ]}
              >
                {formatDueDate(task.dueDate)}
              </Text>
            </View>
          )}

          {/* Subtasks */}
          {task.subtasks.length > 0 && (
            <View style={styles.metaItem}>
              <Icon name="list-outline" size={14} color={colors.text.tertiary} />
              <Text style={styles.metaText}>
                {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
              </Text>
            </View>
          )}

          {/* Estimated time */}
          {task.estimatedMinutes && (
            <View style={styles.metaItem}>
              <Icon name="time-outline" size={14} color={colors.text.tertiary} />
              <Text style={styles.metaText}>
                {task.estimatedMinutes}min
              </Text>
            </View>
          )}
        </View>

        {/* Subtasks progress bar */}
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

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {task.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {task.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{task.tags.length - 3}</Text>
            )}
          </View>
        )}
      </View>

      {/* Arrow */}
      {onPress && (
        <Icon
          name="chevron-forward"
          size={20}
          color={colors.text.tertiary}
          style={styles.arrow}
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  containerCompleted: {
    opacity: 0.7,
  },
  containerPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  priorityIndicator: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    lineHeight: typography.fontSize.base * 1.4,
  },
  titleCompleted: {
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    lineHeight: typography.fontSize.sm * 1.4,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  badge: {
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    minWidth: 30,
    textAlign: 'right',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'center',
  },
  tag: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: borderRadius.sm,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  tagText: {
    fontSize: typography.fontSize.xs,
    color: colors.accent.primary,
  },
  moreTagsText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  arrow: {
    alignSelf: 'center',
    marginRight: spacing.sm,
  },
});

/**
 * TaskCard memoizado com comparação customizada
 * Evita re-renders desnecessários quando apenas outras tasks mudam
 */
const TaskCard = memo(TaskCardComponent, (prevProps, nextProps) => {
  // Retorna true se props são iguais (não deve re-renderizar)
  // Retorna false se props mudaram (deve re-renderizar)

  // Comparar campos principais da task
  if (
    prevProps.task.id !== nextProps.task.id ||
    prevProps.task.title !== nextProps.task.title ||
    prevProps.task.status !== nextProps.task.status ||
    prevProps.task.priority !== nextProps.task.priority ||
    prevProps.task.dueDate !== nextProps.task.dueDate ||
    prevProps.task.description !== nextProps.task.description ||
    prevProps.task.estimatedMinutes !== nextProps.task.estimatedMinutes
  ) {
    return false;
  }

  // Comparar subtasks (quantidade e progresso)
  if (prevProps.task.subtasks.length !== nextProps.task.subtasks.length) {
    return false;
  }

  const prevCompleted = prevProps.task.subtasks.filter(st => st.completed).length;
  const nextCompleted = nextProps.task.subtasks.filter(st => st.completed).length;
  if (prevCompleted !== nextCompleted) {
    return false;
  }

  // Comparar tags
  if (JSON.stringify(prevProps.task.tags) !== JSON.stringify(nextProps.task.tags)) {
    return false;
  }

  // Props são iguais, não re-renderizar
  return true;
});

export default TaskCard;
