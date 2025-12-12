import React, { useRef } from 'react';
import { Pressable, StyleSheet, ViewStyle, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '../theme/globalStyles';
import { pressIn, pressOut } from '../utils/animations';

export type IconButtonVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'ghost';
export type IconButtonSize = 'small' | 'medium' | 'large';

interface IconButtonProps {
  icon: string;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  style?: ViewStyle;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  variant = 'default',
  size = 'medium',
  disabled = false,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled) {
      pressIn(scaleAnim).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      pressOut(scaleAnim).start();
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 18;
      case 'large':
        return 28;
      default:
        return 22;
    }
  };

  const getIconColor = () => {
    if (disabled) return colors.text.tertiary;

    switch (variant) {
      case 'primary':
        return colors.accent.primary;
      case 'success':
        return colors.status.success;
      case 'warning':
        return colors.status.warning;
      case 'error':
        return colors.status.error;
      case 'ghost':
        return colors.text.secondary;
      default:
        return colors.text.secondary;
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles[`button_${variant}`],
          styles[`button_${size}`],
          disabled && styles.buttonDisabled,
          pressed && !disabled && styles.buttonPressed,
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        hitSlop={8}
    >
      <Icon name={icon} size={getIconSize()} color={getIconColor()} />
    </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },

  // Sizes
  button_small: {
    width: 32,
    height: 32,
  },
  button_medium: {
    width: 40,
    height: 40,
  },
  button_large: {
    width: 48,
    height: 48,
  },

  // Variants
  button_default: {
    backgroundColor: colors.glass.background,
    borderColor: colors.glass.border,
  },
  button_primary: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  button_success: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  button_warning: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  button_error: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  button_ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },

  // States
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});

export default IconButton;
