import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import StatCard from './StatCard';
import { colors, spacing, borderRadius, typography } from '../theme/globalStyles';

interface ModuleStat {
  icon: string;
  value: string | number;
  label: string;
  color?: string;
}

interface ModuleCardProps {
  icon: string;
  title: string;
  subtitle: string;
  stats?: ModuleStat[];
  onPress: () => void;
  color?: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  icon,
  title,
  subtitle,
  stats = [],
  onPress,
  color = colors.accent.primary,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Icon name={icon} size={32} color={color} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
      </View>

      {/* Stats Grid */}
      {stats.length > 0 && (
        <>
          <View style={styles.divider} />
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.stat}>
                <View style={styles.statIconRow}>
                  <Icon name={stat.icon} size={20} color={stat.color || colors.text.secondary} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.glass.border,
    marginVertical: spacing.md,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  stat: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
  },
  statIconRow: {
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default ModuleCard;
