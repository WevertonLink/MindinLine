import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable, TextInputProps } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography } from '../theme/globalStyles';

export type InputType = 'text' | 'search' | 'number' | 'email' | 'password';

interface InputComponentProps extends TextInputProps {
  label?: string;
  type?: InputType;
  error?: string;
  hint?: string;
  icon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  onClear?: () => void;
}

const Input: React.FC<InputComponentProps> = ({
  label,
  type = 'text',
  error,
  hint,
  icon,
  rightIcon,
  onRightIconPress,
  onClear,
  value,
  placeholder,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const getKeyboardType = () => {
    switch (type) {
      case 'number':
        return 'numeric';
      case 'email':
        return 'email-address';
      default:
        return 'default';
    }
  };

  const getAutoCapitalize = () => {
    if (type === 'email') return 'none';
    return textInputProps.autoCapitalize || 'sentences';
  };

  const getSecureTextEntry = () => {
    if (type === 'password') return !isPasswordVisible;
    return false;
  };

  const handleTogglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (textInputProps.onChangeText) {
      textInputProps.onChangeText('');
    }
  };

  const showClearButton = type === 'search' && value && value.length > 0;
  const showPasswordToggle = type === 'password';
  const finalRightIcon = showPasswordToggle
    ? (isPasswordVisible ? 'eye-off-outline' : 'eye-outline')
    : rightIcon;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {icon && (
          <Icon
            name={icon}
            size={20}
            color={error ? colors.status.error : isFocused ? colors.accent.primary : colors.text.tertiary}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithLeftIcon,
            (showClearButton || finalRightIcon) && styles.inputWithRightIcon,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          value={value}
          keyboardType={getKeyboardType()}
          autoCapitalize={getAutoCapitalize()}
          secureTextEntry={getSecureTextEntry()}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />

        {showClearButton && (
          <Pressable onPress={handleClear} hitSlop={8} style={styles.rightIcon}>
            <Icon name="close-circle" size={20} color={colors.text.tertiary} />
          </Pressable>
        )}

        {finalRightIcon && !showClearButton && (
          <Pressable
            onPress={showPasswordToggle ? handleTogglePasswordVisibility : onRightIconPress}
            hitSlop={8}
            style={styles.rightIcon}
          >
            <Icon
              name={finalRightIcon}
              size={20}
              color={error ? colors.status.error : isFocused ? colors.accent.primary : colors.text.tertiary}
            />
          </Pressable>
        )}
      </View>

      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingHorizontal: spacing.md,
  },
  inputContainerFocused: {
    borderColor: colors.accent.primary,
    backgroundColor: 'rgba(91, 126, 255, 0.05)',
  },
  inputContainerError: {
    borderColor: colors.status.error,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: spacing.xs,
  },
  leftIcon: {
    marginRight: spacing.xs,
  },
  rightIcon: {
    marginLeft: spacing.xs,
  },
  hint: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  error: {
    fontSize: typography.fontSize.xs,
    color: colors.status.error,
    marginTop: spacing.xs,
  },
});

export default Input;
