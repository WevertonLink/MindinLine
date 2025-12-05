import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Activity } from '../features/timeline/types';
import {
  getActivityIcon,
  getActivityColor,
  translateActivityType,
  formatActivityTime,
  formatDuration,
} from '../features/timeline/utils';
import { colors, spacing, borderRadius, typography } from '../theme/globalStyles';

interface ActivityCardProps {
  activity: Activity;
  onPress?: () => void;
  onLongPress?: () => void;
}

const ActivityCardComponent: React.FC<ActivityCardProps> = ({
  activity,
  onPress,
  onLongPress,
}) => {
  const iconName = getActivityIcon(activity.type);
  const iconColor = getActivityColor(activity.type);
  const typeLabel = translateActivityType(activity.type);
  const timeLabel = formatActivityTime(activity.timestamp);

  const renderMetadata = () => {
    const { metadata } = activity;
    if (!metadata) return null;

    const metaItems: string[] = [];

    // FlowKeeper metadata
    if (metadata.flowTitle) {
      metaItems.push(metadata.flowTitle);
    }
    if (metadata.stepTitle) {
      metaItems.push(metadata.stepTitle);
    }
    if (metadata.materialType) {
      const types: Record<string, string> = {
        video: 'Vídeo',
        article: 'Artigo',
        book: 'Livro',
        pdf: 'PDF',
        link: 'Link',
        note: 'Nota',
      };
      metaItems.push(types[metadata.materialType]);
    }

    // Flashcards metadata
    if (metadata.deckTitle) {
      metaItems.push(metadata.deckTitle);
    }
    if (metadata.cardsReviewed) {
      metaItems.push(`${metadata.cardsReviewed} cards`);
    }

    // Tasks metadata
    if (metadata.taskTitle) {
      metaItems.push(metadata.taskTitle);
    }
    if (metadata.taskPriority) {
      const priorities: Record<string, string> = {
        low: 'Baixa',
        medium: 'Média',
        high: 'Alta',
        urgent: 'Urgente',
      };
      metaItems.push(priorities[metadata.taskPriority]);
    }

    // Focus Sessions metadata
    if (metadata.duration) {
      metaItems.push(formatDuration(metadata.duration));
    }

    if (metaItems.length === 0) return null;

    return (
      <View style={styles.metadataContainer}>
        {metaItems.map((item, index) => (
          <View key={index} style={styles.metadataChip}>
            <Text style={styles.metadataText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {/* Left indicator */}
      <View style={[styles.indicator, { backgroundColor: iconColor }]} />

      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
        <Icon name={iconName} size={24} color={iconColor} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.typeLabel}>{typeLabel}</Text>
            <View style={styles.dot} />
            <Text style={styles.timeLabel}>{timeLabel}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {activity.title}
        </Text>

        {/* Description */}
        {activity.description && (
          <Text style={styles.description} numberOfLines={2}>
            {activity.description}
          </Text>
        )}

        {/* Metadata */}
        {renderMetadata()}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  containerPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  indicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.accent.primary,
    textTransform: 'uppercase',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.text.tertiary,
    marginHorizontal: spacing.xs,
  },
  timeLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    lineHeight: typography.fontSize.base * 1.4,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * 1.4,
    marginBottom: spacing.xs,
  },
  metadataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  metadataChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.sm,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  metadataText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
});

/**
 * ActivityCard memoizado com comparação customizada
 * Evita re-renders desnecessários quando apenas outras atividades mudam
 */
const ActivityCard = memo(ActivityCardComponent, (prevProps, nextProps) => {
  // Retorna true se props são iguais (não deve re-renderizar)
  // Retorna false se props mudaram (deve re-renderizar)

  // Comparar campos principais da atividade
  if (
    prevProps.activity.id !== nextProps.activity.id ||
    prevProps.activity.type !== nextProps.activity.type ||
    prevProps.activity.title !== nextProps.activity.title ||
    prevProps.activity.description !== nextProps.activity.description ||
    prevProps.activity.timestamp !== nextProps.activity.timestamp
  ) {
    return false;
  }

  // Comparar metadata (JSON comparison para objeto complexo)
  if (JSON.stringify(prevProps.activity.metadata) !== JSON.stringify(nextProps.activity.metadata)) {
    return false;
  }

  // Props são iguais, não re-renderizar
  return true;
});

export default ActivityCard;
