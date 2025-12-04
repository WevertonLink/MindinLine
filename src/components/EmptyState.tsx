import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../theme/globalStyles';

// ==========================================
// 🌟 EMPTY STATE COMPONENT
// ==========================================

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message }) => {
  return (
    <View style={styles.container}>
      <Icon name={icon} size={64} color={colors.text.tertiary} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
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
  },
});

export default EmptyState;
