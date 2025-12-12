import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTimeline } from '../../context/TimelineContext';
import { useFlashcards } from '../../context/FlashcardsContext';
import ActivityCard from '../../components/ActivityCard';
import { Card, Chip, SectionHeader, StatsRow } from '../../components';
import EmptyState from '../../components/EmptyState';
import HelpButton from '../../components/HelpButton';
import { helpContent } from '../../data/helpContent';
import { errorMessages } from '../../utils/messages';
import {
  globalStyles,
  colors,
  spacing,
  borderRadius,
  typography,
} from '../../theme/globalStyles';
import { TimeRange } from '../../features/timeline/types';
import { formatDate } from '../../features/timeline/utils';

const TimelineScreen = ({ navigation }: any) => {
  const {
    stats,
    loading,
    filters,
    setFilters,
    getDailyActivities,
    deleteActivity,
  } = useTimeline();
  const { stats: flashcardsStats } = useFlashcards();

  const dailyActivities = getDailyActivities();

  const handleDeleteActivity = useCallback((activityId: string, activityTitle: string) => {
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
              Alert.alert(
                errorMessages.generic.title,
                errorMessages.generic.message
              );
            }
          },
        },
      ]
    );
  }, [deleteActivity]);

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mês' },
    { value: 'all', label: 'Tudo' },
  ];

  // SectionList configuration
  const sections = dailyActivities.map(day => ({
    title: day.date,
    data: day.activities,
    totalActivities: day.totalActivities,
    focusTime: day.focusTime,
  }));

  const renderSectionHeader = useCallback(({ section }: any) => (
    <View style={styles.dayHeader}>
      <Text style={styles.dayDate}>{formatDate(section.title)}</Text>
      <View style={styles.daySummary}>
        <Icon name="flash" size={14} color={colors.text.tertiary} />
        <Text style={styles.daySummaryText}>
          {section.totalActivities} {section.totalActivities === 1 ? 'atividade' : 'atividades'}
        </Text>
        {section.focusTime > 0 && (
          <>
            <Text style={styles.daySummaryDot}>•</Text>
            <Text style={styles.daySummaryText}>
              {Math.round(section.focusTime)}min foco
            </Text>
          </>
        )}
      </View>
    </View>
  ), []);

  const renderActivityItem = useCallback(({ item: activity }: any) => (
    <ActivityCard
      activity={activity}
      onLongPress={() => handleDeleteActivity(activity.id, activity.title)}
    />
  ), [handleDeleteActivity]);

  const keyExtractor = useCallback((item: any) => item.id, []);

  const renderListHeader = useCallback(() => (
    <>
      {/* Header */}
      <SectionHeader
        title="Timeline"
        subtitle="Acompanhe sua evolução cognitiva"
        icon="time-outline"
        helpContent={helpContent['timeline.overview'].content}
      />

      {/* Flashcards a Revisar Widget */}
      {flashcardsStats.cardsToReviewToday > 0 && (
        <Pressable
          style={styles.reviewWidget}
          onPress={() => {
            navigation.navigate('FlashcardsTab', {
              screen: 'FlashcardsHome',
            });
          }}
        >
          <View style={styles.reviewWidgetIcon}>
            <Icon name="layers" size={28} color={colors.accent.primary} />
          </View>
          <View style={styles.reviewWidgetContent}>
            <Text style={styles.reviewWidgetTitle}>Revisar Flashcards</Text>
            <Text style={styles.reviewWidgetSubtitle}>
              {flashcardsStats.cardsToReviewToday} card{flashcardsStats.cardsToReviewToday !== 1 ? 's' : ''} aguardando revisão
            </Text>
          </View>
          <Icon name="chevron-forward" size={20} color={colors.accent.primary} />
        </Pressable>
      )}

      {/* Stats Cards */}
      {stats.totalActivities > 0 && (
        <View style={styles.statsGrid}>
          {/* Streak Atual */}
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <View style={styles.statIconRow}>
              <Icon name="flame" size={28} color={colors.accent.primary} />
              <HelpButton
                content={helpContent['timeline.stat.streak'].content}
                size={16}
              />
            </View>
            <Text style={styles.statValue}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>
              {stats.currentStreak === 1 ? 'dia seguido' : 'dias seguidos'}
            </Text>
          </View>

          {/* Atividades esta semana */}
          <View style={styles.statCard}>
            <View style={styles.statIconRow}>
              <Icon name="calendar" size={24} color={colors.status.info} />
              <HelpButton
                content={helpContent['timeline.stat.week'].content}
                size={16}
              />
            </View>
            <Text style={styles.statValue}>{stats.thisWeekActivities}</Text>
            <Text style={styles.statLabel}>esta semana</Text>
          </View>

          {/* Tempo de foco esta semana */}
          <View style={styles.statCard}>
            <View style={styles.statIconRow}>
              <Icon name="timer" size={24} color={colors.status.success} />
              <HelpButton
                content={helpContent['timeline.stat.focus'].content}
                size={16}
              />
            </View>
            <Text style={styles.statValue}>{stats.thisWeekFocusTime}</Text>
            <Text style={styles.statLabel}>min de foco</Text>
          </View>

          {/* Maior streak */}
          <View style={styles.statCard}>
            <View style={styles.statIconRow}>
              <Icon name="trophy" size={24} color={colors.status.warning} />
              <HelpButton
                content={helpContent['timeline.stat.record'].content}
                size={16}
              />
            </View>
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
        {timeRanges.map(range => (
          <Chip
            key={range.value}
            label={range.label}
            variant="primary"
            selected={filters.timeRange === range.value}
            onPress={() => setFilters({ timeRange: range.value })}
          />
        ))}
      </View>
    </>
  ), [flashcardsStats.cardsToReviewToday, stats, filters.timeRange, navigation, setFilters]);

  const renderListEmpty = useCallback(() => {
    if (filters.timeRange !== 'all' && stats.totalActivities > 0) {
      return (
        <EmptyState
          icon="calendar-outline"
          title="Nenhuma atividade neste período"
          message="Altere o filtro acima para ver atividades de outros períodos."
          action={{
            label: 'Ver Tudo',
            onPress: () => setFilters({ timeRange: 'all' }),
            variant: 'secondary',
          }}
        />
      );
    }

    return (
      <EmptyState
        icon="time-outline"
        title="Sua jornada começa agora"
        message="Suas atividades serão registradas automaticamente enquanto você usa o app."
        suggestions={[
          'Criar um deck de flashcards',
          'Adicionar uma tarefa',
          'Iniciar uma trilha de estudo',
        ]}
        onSuggestionPress={(suggestion) => {
          if (suggestion.includes('flashcards')) {
            navigation.navigate('FlashcardsTab', { screen: 'CreateDeck' });
          } else if (suggestion.includes('tarefa')) {
            navigation.navigate('TasksTab', { screen: 'CreateTask' });
          } else {
            navigation.navigate('TrilhasTab', { screen: 'CreateTrilha' });
          }
        }}
      />
    );
  }, [filters.timeRange, stats.totalActivities, navigation, setFilters]);

  const renderListFooter = useCallback(() => {
    if (stats.totalActivities === 0) return null;

    return (
      <View style={styles.infoBox}>
        <Icon name="information-circle-outline" size={20} color={colors.accent.primary} />
        <Text style={styles.infoText}>
          Suas atividades são registradas automaticamente quando você estuda,
          revisa flashcards, completa tarefas ou realiza sessões de foco.
        </Text>
      </View>
    );
  }, [stats.totalActivities]);

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
      <SectionList
        sections={sections}
        renderItem={renderActivityItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderListEmpty}
        ListFooterComponent={renderListFooter}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reviewWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(91, 126, 255, 0.1)',
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.accent.primary,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  reviewWidgetIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(91, 126, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewWidgetContent: {
    flex: 1,
  },
  reviewWidgetTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  reviewWidgetSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
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
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
