import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Flow } from '../features/flowkeeper/types';
import {
  globalStyles,
  colors,
  spacing,
  borderRadius,
  typography,
} from '../theme/globalStyles';
import {
  formatRelativeDate,
  translateCategory,
  translateStatus,
  getStatusColor,
} from '../features/flowkeeper/utils';

// ==========================================
// 🎴 FLOW CARD COMPONENT
// ==========================================

interface FlowCardProps {
  flow: Flow;
  onPress: () => void;
  onLongPress?: () => void;
}

const FlowCard: React.FC<FlowCardProps> = ({ flow, onPress, onLongPress }) => {
  const statusColor = getStatusColor(flow.status);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {flow.title}
          </Text>
          {flow.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {translateCategory(flow.category)}
              </Text>
            </View>
          )}
        </View>

        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{translateStatus(flow.status)}</Text>
        </View>
      </View>

      {/* Description */}
      {flow.description && (
        <Text style={styles.description} numberOfLines={2}>
          {flow.description}
        </Text>
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

      {/* Footer */}
      <View style={styles.footer}>
        {/* Steps count */}
        <View style={styles.footerItem}>
          <Icon name="list-outline" size={16} color={colors.text.tertiary} />
          <Text style={styles.footerText}>
            {flow.steps.length} etapa{flow.steps.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Date */}
        <View style={styles.footerItem}>
          <Icon name="time-outline" size={16} color={colors.text.tertiary} />
          <Text style={styles.footerText}>
            {formatRelativeDate(flow.updatedAt)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.lg,
    marginBottom: spacing.base,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  categoryBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.accent.secondary,
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
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    lineHeight: typography.fontSize.sm * 1.4,
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
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    minWidth: 35,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
});

export default FlowCard;
