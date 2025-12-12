import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, globalStyles, borderRadius } from '../theme/globalStyles';

// ==========================================
// 🌟 EMPTY STATE COMPONENT
// ==========================================

interface EmptyStateAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  action?: EmptyStateAction;
  suggestions?: string[];
  onSuggestionPress?: (suggestion: string) => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  action,
  suggestions,
  onSuggestionPress,
}) => {
  return (
    <View style={styles.container}>
      <Icon name={icon} size={80} color={colors.text.tertiary} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {action && (
        <Pressable
          style={[
            action.variant === 'primary'
              ? globalStyles.buttonPrimary
              : globalStyles.buttonSecondary,
            styles.actionButton,
          ]}
          onPress={action.onPress}
        >
          <Text
            style={[
              globalStyles.buttonText,
              action.variant === 'secondary' && { color: colors.text.secondary },
            ]}
          >
            {action.label}
          </Text>
        </Pressable>
      )}

      {suggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Sugestões:</Text>
          <View style={styles.suggestionsGrid}>
            {suggestions.map((suggestion, index) => (
              <Pressable
                key={index}
                style={styles.suggestionChip}
                onPress={() => onSuggestionPress?.(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  icon: {
    marginBottom: spacing.lg,
    opacity: 0.5,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * 1.5,
    marginBottom: spacing.lg,
  },
  actionButton: {
    marginTop: spacing.md,
    minWidth: 200,
  },
  suggestionsContainer: {
    marginTop: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  suggestionsTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  suggestionChip: {
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  suggestionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
});

export default EmptyState;
