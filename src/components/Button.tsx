import React, { useRef } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography } from '../theme/globalStyles';
import { pressIn, pressOut } from '../utils/animations';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled && !loading) {
      pressIn(scaleAnim).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      pressOut(scaleAnim).start();
    }
  };

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`button_${size}`]];

    if (fullWidth) {
      baseStyle.push(styles.buttonFullWidth);
    }

    if (disabled || loading) {
      baseStyle.push(styles.buttonDisabled);
    } else {
      baseStyle.push(styles[`button_${variant}`]);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`text_${size}`]];

    if (disabled || loading) {
      baseStyle.push(styles.textDisabled);
    } else {
      baseStyle.push(styles[`text_${variant}`]);
    }

    return baseStyle;
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  const getIconColor = () => {
    if (disabled || loading) {
      return colors.text.tertiary;
    }

    switch (variant) {
      case 'primary':
      case 'danger':
      case 'success':
        return colors.text.primary;
      case 'secondary':
        return colors.text.primary;
      case 'outline':
        return colors.accent.primary;
      case 'ghost':
        return colors.text.secondary;
      default:
        return colors.text.primary;
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={({ pressed }) => [
          ...getButtonStyle(),
          pressed && !disabled && !loading && styles.buttonPressed,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'outline' || variant === 'ghost' ? colors.accent.primary : colors.text.primary}
          />
        ) : (
          <View style={styles.content}>
            {icon && iconPosition === 'left' && (
              <Icon name={icon} size={getIconSize()} color={getIconColor()} />
            )}
            <Text style={getTextStyle()}>{label}</Text>
            {icon && iconPosition === 'right' && (
              <Icon name={icon} size={getIconSize()} color={getIconColor()} />
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  buttonFullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  // Sizes
  button_small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  button_medium: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  button_large: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },

  // Variants
  button_primary: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  button_secondary: {
    backgroundColor: colors.glass.background,
    borderColor: colors.glass.border,
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderColor: colors.accent.primary,
  },
  button_ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  button_danger: {
    backgroundColor: colors.status.error,
    borderColor: colors.status.error,
  },
  button_success: {
    backgroundColor: colors.status.success,
    borderColor: colors.status.success,
  },

  // States
  buttonDisabled: {
    backgroundColor: colors.glass.background,
    borderColor: colors.glass.border,
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.8,
  },

  // Text Sizes
  text_small: {
    fontSize: typography.fontSize.sm,
  },
  text_medium: {
    fontSize: typography.fontSize.base,
  },
  text_large: {
    fontSize: typography.fontSize.lg,
  },

  // Text Variants
  text_primary: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  text_secondary: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  text_outline: {
    color: colors.accent.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  text_ghost: {
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  text_danger: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  text_success: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },

  // Text States
  text: {
    textAlign: 'center',
  },
  textDisabled: {
    color: colors.text.tertiary,
  },
});

export default Button;
