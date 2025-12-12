import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/globalStyles';
import { rotate } from '../utils/animations';

export type LoadingSize = 'small' | 'medium' | 'large';

interface LoadingSpinnerProps {
  size?: LoadingSize;
  color?: string;
  style?: ViewStyle;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = colors.accent.primary,
  style,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = rotate(rotateAnim, 1000);
    animation.start();

    return () => {
      animation.stop();
    };
  }, [rotateAnim]);

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 40;
      default:
        return 28;
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Icon name="sync-outline" size={getIconSize()} color={color} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LoadingSpinner;
