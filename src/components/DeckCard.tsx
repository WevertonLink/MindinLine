import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Deck } from '../features/flashcards/types';
import {
  colors,
  spacing,
  borderRadius,
  typography,
} from '../theme/globalStyles';
import { formatRelativeDate, translateCategory } from '../features/flashcards/utils';

interface DeckCardProps {
  deck: Deck;
  onPress: () => void;
  onLongPress?: () => void;
}

const DeckCardComponent: React.FC<DeckCardProps> = ({ deck, onPress, onLongPress }) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {deck.title}
        </Text>
        {deck.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {translateCategory(deck.category)}
            </Text>
          </View>
        )}
      </View>

      {/* Description */}
      {deck.description && (
        <Text style={styles.description} numberOfLines={2}>
          {deck.description}
        </Text>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Icon name="layers" size={16} color={colors.accent.primary} />
          <Text style={styles.statText}>{deck.totalCards}</Text>
        </View>

        {deck.reviewCards > 0 && (
          <View style={[styles.statItem, styles.reviewBadge]}>
            <Icon name="time" size={16} color={colors.status.warning} />
            <Text style={[styles.statText, { color: colors.status.warning }]}>
              {deck.reviewCards} p/ revisar
            </Text>
          </View>
        )}

        {deck.masteredCards > 0 && (
          <View style={styles.statItem}>
            <Icon name="checkmark-circle" size={16} color={colors.status.success} />
            <Text style={styles.statText}>{deck.masteredCards}</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {formatRelativeDate(deck.updatedAt)}
        </Text>
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
    marginBottom: spacing.sm,
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
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    lineHeight: typography.fontSize.sm * 1.4,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
    paddingTop: spacing.sm,
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
});

/**
 * DeckCard memoizado com comparação customizada
 * Evita re-renders desnecessários quando apenas outros decks mudam
 */
const DeckCard = memo(DeckCardComponent, (prevProps, nextProps) => {
  // Retorna true se props são iguais (não deve re-renderizar)
  // Retorna false se props mudaram (deve re-renderizar)

  // Comparar campos principais do deck
  if (
    prevProps.deck.id !== nextProps.deck.id ||
    prevProps.deck.title !== nextProps.deck.title ||
    prevProps.deck.description !== nextProps.deck.description ||
    prevProps.deck.category !== nextProps.deck.category ||
    prevProps.deck.totalCards !== nextProps.deck.totalCards ||
    prevProps.deck.reviewCards !== nextProps.deck.reviewCards ||
    prevProps.deck.masteredCards !== nextProps.deck.masteredCards ||
    prevProps.deck.updatedAt !== nextProps.deck.updatedAt
  ) {
    return false;
  }

  // Props são iguais, não re-renderizar
  return true;
});

export default DeckCard;
