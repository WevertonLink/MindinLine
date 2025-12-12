import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography } from '../theme/globalStyles';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
export type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: string;
}

const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'medium',
  icon,
}) => {
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 18;
      default:
        return 14;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return colors.status.success;
      case 'warning':
        return colors.status.warning;
      case 'error':
        return colors.status.error;
      case 'info':
        return colors.status.info;
      case 'primary':
        return colors.accent.primary;
      default:
        return colors.text.secondary;
    }
  };

  return (
    <View style={[styles.badge, styles[`badge_${variant}`], styles[`badge_${size}`]]}>
      {icon && (
        <Icon
          name={icon}
          size={getIconSize()}
          color={getIconColor()}
          style={styles.icon}
        />
      )}
      <Text style={[styles.text, styles[`text_${variant}`], styles[`text_${size}`]]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  icon: {
    marginRight: 4,
  },

  // Sizes
  badge_small: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  badge_medium: {
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
  },
  badge_large: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },

  // Variants
  badge_success: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  badge_warning: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  badge_error: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  badge_info: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  badge_primary: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  badge_neutral: {
    backgroundColor: colors.glass.background,
    borderColor: colors.glass.border,
  },

  // Text Sizes
  text_small: {
    fontSize: typography.fontSize.xs,
  },
  text_medium: {
    fontSize: typography.fontSize.sm,
  },
  text_large: {
    fontSize: typography.fontSize.base,
  },

  // Text Variants
  text_success: {
    color: colors.status.success,
    fontWeight: typography.fontWeight.medium,
  },
  text_warning: {
    color: colors.status.warning,
    fontWeight: typography.fontWeight.medium,
  },
  text_error: {
    color: colors.status.error,
    fontWeight: typography.fontWeight.medium,
  },
  text_info: {
    color: colors.status.info,
    fontWeight: typography.fontWeight.medium,
  },
  text_primary: {
    color: colors.accent.primary,
    fontWeight: typography.fontWeight.medium,
  },
  text_neutral: {
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },

  text: {},
});

export default Badge;
