import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { FlowStep } from '../features/flowkeeper/types';
import {
  colors,
  spacing,
  borderRadius,
  typography,
} from '../theme/globalStyles';
import { formatTime } from '../features/flowkeeper/utils';

// ==========================================
// ✅ STEP ITEM COMPONENT
// ==========================================

interface StepItemProps {
  step: FlowStep;
  onPress?: () => void;
  onToggle: () => void;
  showOrder?: boolean;
}

const StepItem: React.FC<StepItemProps> = ({
  step,
  onPress,
  onToggle,
  showOrder = true,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        step.completed && styles.containerCompleted,
        pressed && styles.containerPressed,
      ]}
      onPress={onPress}
    >
      {/* Checkbox */}
      <Pressable
        style={[styles.checkbox, step.completed && styles.checkboxCompleted]}
        onPress={onToggle}
      >
        {step.completed && (
          <Icon name="checkmark" size={18} color={colors.text.primary} />
        )}
      </Pressable>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <View style={styles.titleRow}>
          {showOrder && (
            <Text style={styles.orderNumber}>{step.order + 1}.</Text>
          )}
          <Text
            style={[styles.title, step.completed && styles.titleCompleted]}
            numberOfLines={2}
          >
            {step.title}
          </Text>
        </View>

        {/* Description */}
        {step.description && (
          <Text style={styles.description} numberOfLines={2}>
            {step.description}
          </Text>
        )}

        {/* Footer info */}
        <View style={styles.footer}>
          {/* Materials count */}
          {step.materials.length > 0 && (
            <View style={styles.footerItem}>
              <Icon name="link-outline" size={14} color={colors.text.tertiary} />
              <Text style={styles.footerText}>
                {step.materials.length} material
                {step.materials.length !== 1 ? 'is' : ''}
              </Text>
            </View>
          )}

          {/* Estimated time */}
          {step.estimatedTime && (
            <View style={styles.footerItem}>
              <Icon name="time-outline" size={14} color={colors.text.tertiary} />
              <Text style={styles.footerText}>
                {formatTime(step.estimatedTime)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Arrow indicator */}
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
    alignItems: 'flex-start',
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  containerCompleted: {
    opacity: 0.7,
  },
  containerPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
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
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  orderNumber: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  title: {
    flex: 1,
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
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
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
  arrow: {
    marginLeft: spacing.sm,
    marginTop: 2,
  },
});

export default StepItem;
