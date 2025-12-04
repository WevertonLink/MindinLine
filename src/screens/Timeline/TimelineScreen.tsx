import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTimeline } from '../../context/TimelineContext';
import ActivityCard from '../../components/ActivityCard';
import EmptyState from '../../components/EmptyState';
import {
  globalStyles,
  colors,
  spacing,
  borderRadius,
  typography,
} from '../../theme/globalStyles';
import { TimeRange } from '../../features/timeline/types';
import { formatDate } from '../../features/timeline/utils';

const TimelineScreen = () => {
  const {
    stats,
    loading,
    filters,
    setFilters,
    getDailyActivities,
    deleteActivity,
  } = useTimeline();

  const dailyActivities = getDailyActivities();

  const handleDeleteActivity = (activityId: string, activityTitle: string) => {
    Alert.alert(
      'Deletar Atividade',
      `Tem certeza que deseja deletar "${activityTitle}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteActivity(activityId);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar a atividade');
            }
          },
        },
      ]
    );
  };

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mês' },
    { value: 'all', label: 'Tudo' },
  ];

  if (loading) {
    return (
      <View style={[globalStyles.container, globalStyles.centered]}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
        <Text style={[globalStyles.bodyText, { marginTop: spacing.md }]}>
          Carregando timeline...
        </Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={globalStyles.title}>Timeline</Text>
          <Text style={globalStyles.subtitle}>
            Acompanhe sua evolução cognitiva
          </Text>
        </View>

        {/* Stats Cards */}
        {stats.totalActivities > 0 && (
          <View style={styles.statsGrid}>
            {/* Streak Atual */}
            <View style={[styles.statCard, styles.statCardPrimary]}>
              <Icon name="flame" size={28} color={colors.accent.primary} />
              <Text style={styles.statValue}>{stats.currentStreak}</Text>
              <Text style={styles.statLabel}>
                {stats.currentStreak === 1 ? 'dia seguido' : 'dias seguidos'}
              </Text>
            </View>

            {/* Atividades esta semana */}
            <View style={styles.statCard}>
              <Icon name="calendar" size={24} color={colors.status.info} />
              <Text style={styles.statValue}>{stats.thisWeekActivities}</Text>
              <Text style={styles.statLabel}>esta semana</Text>
            </View>

            {/* Tempo de foco esta semana */}
            <View style={styles.statCard}>
              <Icon name="timer" size={24} color={colors.status.success} />
              <Text style={styles.statValue}>{stats.thisWeekFocusTime}</Text>
              <Text style={styles.statLabel}>min de foco</Text>
            </View>

            {/* Maior streak */}
            <View style={styles.statCard}>
              <Icon name="trophy" size={24} color={colors.status.warning} />
              <Text style={styles.statValue}>{stats.longestStreak}</Text>
              <Text style={styles.statLabel}>recorde</Text>
            </View>
          </View>
        )}

        {/* Additional Stats */}
        {stats.totalActivities > 0 && (
          <View style={globalStyles.glassCard}>
            <View style={styles.additionalStatsRow}>
              <View style={styles.additionalStat}>
                <Text style={styles.additionalStatValue}>{stats.totalFocusTime}</Text>
                <Text style={styles.additionalStatLabel}>Min Totais de Foco</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.additionalStat}>
                <Text style={styles.additionalStatValue}>
                  {stats.mostProductiveDay || 'N/A'}
                </Text>
                <Text style={styles.additionalStatLabel}>Dia Mais Produtivo</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.additionalStat}>
                <Text style={styles.additionalStatValue}>
                  {stats.activitiesPerDay.toFixed(1)}
                </Text>
                <Text style={styles.additionalStatLabel}>Atividades/Dia</Text>
              </View>
            </View>
          </View>
        )}

        {/* Filtros de Range */}
        <View style={styles.filtersContainer}>
          {timeRanges.map(range => {
            const isSelected = filters.timeRange === range.value;
            return (
              <Pressable
                key={range.value}
                style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                onPress={() => setFilters({ timeRange: range.value })}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextSelected,
                  ]}
                >
                  {range.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Lista de Atividades */}
        {dailyActivities.length > 0 ? (
          dailyActivities.map(day => (
            <View key={day.date} style={styles.daySection}>
              {/* Day Header */}
              <View style={styles.dayHeader}>
                <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
                <View style={styles.daySummary}>
                  <Icon name="flash" size={14} color={colors.text.tertiary} />
                  <Text style={styles.daySummaryText}>
                    {day.totalActivities} {day.totalActivities === 1 ? 'atividade' : 'atividades'}
                  </Text>
                  {day.focusTime > 0 && (
                    <>
                      <Text style={styles.daySummaryDot}>•</Text>
                      <Text style={styles.daySummaryText}>
                        {Math.round(day.focusTime)}min foco
                      </Text>
                    </>
                  )}
                </View>
              </View>

              {/* Activities */}
              {day.activities.map(activity => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onLongPress={() => handleDeleteActivity(activity.id, activity.title)}
                />
              ))}
            </View>
          ))
        ) : (
          <EmptyState
            icon="time-outline"
            title="Nenhuma atividade registrada"
            message={
              filters.timeRange === 'today'
                ? 'Comece estudando, revisando flashcards ou completando tarefas'
                : 'Altere o filtro para ver atividades de outros períodos'
            }
          />
        )}

        {/* Info Footer */}
        {stats.totalActivities > 0 && (
          <View style={styles.infoBox}>
            <Icon name="information-circle-outline" size={20} color={colors.accent.primary} />
            <Text style={styles.infoText}>
              Suas atividades são registradas automaticamente quando você estuda,
              revisa flashcards, completa tarefas ou realiza sessões de foco.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statCardPrimary: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  statValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  additionalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  additionalStat: {
    flex: 1,
    alignItems: 'center',
  },
  additionalStatValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.primary,
    marginBottom: spacing.xs,
  },
  additionalStatLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.glass.border,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterChip: {
    flex: 1,
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  filterChipSelected: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  filterChipTextSelected: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  daySection: {
    marginBottom: spacing.lg,
  },
  dayHeader: {
    marginBottom: spacing.md,
  },
  dayDate: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  daySummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  daySummaryText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  daySummaryDot: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * 1.4,
  },
});

export default TimelineScreen;
