import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Divider from './Divider';
import { colors, spacing, typography } from '../theme/globalStyles';

interface Stat {
  icon?: string;
  value: string | number;
  label: string;
  color?: string;
}

interface StatsRowProps {
  stats: Stat[];
  showDividers?: boolean;
}

const StatsRow: React.FC<StatsRowProps> = ({ stats, showDividers = true }) => {
  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <React.Fragment key={index}>
          <View style={styles.stat}>
            {stat.icon && (
              <Icon
                name={stat.icon}
                size={20}
                color={stat.color || colors.accent.primary}
                style={styles.icon}
              />
            )}
            <Text style={[styles.value, stat.color && { color: stat.color }]}>
              {stat.value}
            </Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
          {showDividers && index < stats.length - 1 && (
            <Divider orientation="vertical" />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  icon: {
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.primary,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default StatsRow;
