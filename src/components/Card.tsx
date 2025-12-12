import React, { ReactNode } from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/globalStyles';

export type CardVariant = 'glass' | 'flat' | 'elevated' | 'outlined';
export type CardSize = 'small' | 'medium' | 'large';

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  onPress?: () => void;
  style?: ViewStyle;
  pressable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  size = 'medium',
  onPress,
  style,
  pressable = false,
}) => {
  const cardStyle = [
    styles.card,
    styles[`card_${variant}`],
    styles[`card_${size}`],
    style,
  ];

  if (onPress || pressable) {
    return (
      <Pressable
        style={({ pressed }) => [
          ...cardStyle,
          pressed && styles.cardPressed,
        ]}
        onPress={onPress}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },

  // Variants
  card_glass: {
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  card_flat: {
    backgroundColor: colors.background.secondary,
    borderWidth: 0,
  },
  card_elevated: {
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
    shadowColor: colors.accent.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  card_outlined: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.accent.primary,
  },

  // Sizes
  card_small: {
    padding: spacing.md,
  },
  card_medium: {
    padding: spacing.lg,
  },
  card_large: {
    padding: spacing.xl,
  },

  // States
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});

export default Card;
