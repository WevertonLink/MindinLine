import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalStyles, colors, spacing, borderRadius, typography } from '../theme/globalStyles';

interface StatCardProps {
  icon: string;
  iconColor?: string;
  value: string | number;
  label: string;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  borderColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  iconColor = colors.accent.primary,
  value,
  label,
  size = 'medium',
  onPress,
  borderColor,
}) => {
  const fontSize = {
    small: typography.fontSize.lg,
    medium: typography.fontSize.xl,
    large: typography.fontSize['2xl'],
  }[size];

  const iconSize = {
    small: 20,
    medium: 24,
    large: 28,
  }[size];

  const Component = onPress ? Pressable : View;

  return (
    <Component
      style={[
        styles.container,
        borderColor && { borderColor, borderWidth: 2 },
        onPress && styles.pressable,
      ]}
      onPress={onPress}
    >
      <Icon name={icon} size={iconSize} color={iconColor} />
      <Text style={[styles.value, { fontSize }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
  },
  pressable: {
    opacity: 1,
  },
  value: {
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: 2,
  },
});

export default StatCard;
