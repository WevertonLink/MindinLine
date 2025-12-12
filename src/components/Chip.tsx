import React, { useRef } from 'react';
import { Pressable, Text, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography } from '../theme/globalStyles';
import { pressIn, pressOut } from '../utils/animations';

export type ChipVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';

interface ChipProps {
  label: string;
  onPress?: () => void;
  variant?: ChipVariant;
  selected?: boolean;
  icon?: string;
  onRemove?: () => void;
  disabled?: boolean;
}

const Chip: React.FC<ChipProps> = ({
  label,
  onPress,
  variant = 'default',
  selected = false,
  icon,
  onRemove,
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled && onPress) {
      pressIn(scaleAnim).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled && onPress) {
      pressOut(scaleAnim).start();
    }
  };

  const getIconColor = () => {
    if (selected) {
      return variant === 'default' ? colors.text.primary : colors.text.primary;
    }

    switch (variant) {
      case 'primary':
        return colors.accent.primary;
      case 'success':
        return colors.status.success;
      case 'warning':
        return colors.status.warning;
      case 'error':
        return colors.status.error;
      default:
        return colors.text.secondary;
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={({ pressed }) => [
          styles.chip,
          styles[`chip_${variant}`],
          selected && styles.chipSelected,
          selected && styles[`chipSelected_${variant}`],
          disabled && styles.chipDisabled,
          pressed && !disabled && styles.chipPressed,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || !onPress}
      >
      {icon && (
        <Icon
          name={icon}
          size={16}
          color={getIconColor()}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          styles[`text_${variant}`],
          selected && styles.textSelected,
          disabled && styles.textDisabled,
        ]}
      >
        {label}
      </Text>
      {onRemove && (
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          style={styles.removeButton}
        >
          <Icon name="close-circle" size={16} color={getIconColor()} />
        </Pressable>
      )}
    </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.xs,
  },
  icon: {
    marginRight: 0,
  },
  removeButton: {
    marginLeft: spacing.xs,
  },

  // Variants - Default State
  chip_default: {
    backgroundColor: colors.glass.background,
    borderColor: colors.glass.border,
  },
  chip_primary: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  chip_success: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  chip_warning: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  chip_error: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },

  // Selected State
  chipSelected: {
    borderWidth: 2,
  },
  chipSelected_default: {
    backgroundColor: colors.glass.border,
    borderColor: colors.text.secondary,
  },
  chipSelected_primary: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  chipSelected_success: {
    backgroundColor: colors.status.success,
    borderColor: colors.status.success,
  },
  chipSelected_warning: {
    backgroundColor: colors.status.warning,
    borderColor: colors.status.warning,
  },
  chipSelected_error: {
    backgroundColor: colors.status.error,
    borderColor: colors.status.error,
  },

  // Disabled State
  chipDisabled: {
    opacity: 0.5,
  },

  // Pressed State
  chipPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  // Text Variants
  text_default: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  text_primary: {
    color: colors.accent.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  text_success: {
    color: colors.status.success,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  text_warning: {
    color: colors.status.warning,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  text_error: {
    color: colors.status.error,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // Text States
  text: {},
  textSelected: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  textDisabled: {
    color: colors.text.tertiary,
  },
});

export default Chip;
