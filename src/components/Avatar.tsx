import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, borderRadius, typography } from '../theme/globalStyles';

export type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';
export type AvatarVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';

interface AvatarProps {
  source?: string | { uri: string };
  name?: string;
  icon?: string;
  size?: AvatarSize;
  variant?: AvatarVariant;
  style?: ViewStyle;
}

const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  icon,
  size = 'medium',
  variant = 'default',
  style,
}) => {
  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const getSizeValue = () => {
    switch (size) {
      case 'small':
        return 32;
      case 'large':
        return 64;
      case 'xlarge':
        return 96;
      default:
        return 48;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 32;
      case 'xlarge':
        return 48;
      default:
        return 24;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return typography.fontSize.xs;
      case 'large':
        return typography.fontSize.xl;
      case 'xlarge':
        return typography.fontSize['2xl'];
      default:
        return typography.fontSize.base;
    }
  };

  const sizeValue = getSizeValue();

  const containerStyle = [
    styles.avatar,
    styles[`avatar_${variant}`],
    { width: sizeValue, height: sizeValue, borderRadius: sizeValue / 2 },
    style,
  ];

  // Image avatar
  if (source) {
    const imageSource = typeof source === 'string' ? { uri: source } : source;
    return (
      <View style={containerStyle}>
        <Image source={imageSource} style={styles.image} />
      </View>
    );
  }

  // Icon avatar
  if (icon) {
    return (
      <View style={containerStyle}>
        <Icon name={icon} size={getIconSize()} color={colors.text.primary} />
      </View>
    );
  }

  // Initials avatar
  if (name) {
    return (
      <View style={containerStyle}>
        <Text style={[styles.initials, { fontSize: getFontSize() }]}>
          {getInitials(name)}
        </Text>
      </View>
    );
  }

  // Fallback avatar
  return (
    <View style={containerStyle}>
      <Icon name="person" size={getIconSize()} color={colors.text.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // Variants
  avatar_default: {
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  avatar_primary: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 2,
    borderColor: colors.accent.primary,
  },
  avatar_success: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 2,
    borderColor: colors.status.success,
  },
  avatar_warning: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderWidth: 2,
    borderColor: colors.status.warning,
  },
  avatar_error: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 2,
    borderColor: colors.status.error,
  },

  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
});

export default Avatar;
