import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  Insight,
  getInsightIconColor,
  getInsightBackgroundColor,
  getInsightBorderColor,
} from '../utils/insights';
import { spacing, borderRadius, typography } from '../theme/globalStyles';
import { createSlideUpFadeAnimation } from '../utils/animations';

interface InsightCardProps {
  insight: Insight;
  index?: number;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, index = 0 }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    createSlideUpFadeAnimation(opacity, translateY, index * 100).start();
  }, [opacity, translateY, index]);

  const iconColor = getInsightIconColor(insight.type);
  const backgroundColor = getInsightBackgroundColor(insight.type);
  const borderColor = getInsightBorderColor(insight.type);

  const content = (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor, borderColor, opacity, transform: [{ translateY }] },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: borderColor }]}>
        <Icon name={insight.icon} size={24} color={iconColor} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{insight.title}</Text>
        <Text style={styles.message}>{insight.message}</Text>
      </View>

      {insight.action && (
        <Icon name="chevron-forward" size={20} color={iconColor} />
      )}
    </Animated.View>
  );

  if (insight.action) {
    return (
      <Pressable
        onPress={insight.action.onPress}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  message: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: typography.fontSize.sm * 1.4,
  },
});

export default InsightCard;
