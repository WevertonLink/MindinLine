import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../theme/globalStyles';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  spacing: spacingSize = 'none',
  style,
}) => {
  return (
    <View
      style={[
        styles.divider,
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        spacingSize !== 'none' && styles[`spacing_${spacingSize}`],
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    backgroundColor: colors.glass.border,
  },
  horizontal: {
    height: 1,
    width: '100%',
  },
  vertical: {
    width: 1,
    height: '100%',
  },

  // Spacing
  spacing_small: {
    marginVertical: spacing.sm,
  },
  spacing_medium: {
    marginVertical: spacing.md,
  },
  spacing_large: {
    marginVertical: spacing.lg,
  },
});

export default Divider;
