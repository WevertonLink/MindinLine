import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTasks } from '../../context/TasksContext';
import { useFlashcards } from '../../context/FlashcardsContext';
import { useTimeline } from '../../context/TimelineContext';
import { useTrilhas } from '../../context/TrilhasContext';
import { ModuleCard, Card, StatsRow, IconButton } from '../../components';
import HelpButton from '../../components/HelpButton';
import { helpContent } from '../../data/helpContent';
import {
  globalStyles,
  colors,
  spacing,
  typography,
} from '../../theme/globalStyles';

const HomeScreen = ({ navigation }: any) => {
  const { tasks, stats: taskStats } = useTasks();
  const { stats: flashcardStats } = useFlashcards();
  const { stats: timelineStats, activities } = useTimeline();
  const { trilhas } = useTrilhas();

  const streak = timelineStats.currentStreak;

  // Estatísticas rápidas
  const todayTasks = tasks.filter(t => {
    if (!t.dueDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(t.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate <= today && t.status !== 'completed';
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getMotivationalMessage = () => {
    if (streak > 0) return `${streak} dias de sequência! Continue assim!`;
    if (todayTasks.length > 0) return `${todayTasks.length} tarefa${todayTasks.length > 1 ? 's' : ''} para hoje`;
    if (flashcardStats.cardsToReviewToday > 0) return `${flashcardStats.cardsToReviewToday} cards para revisar`;
    return 'Pronto para aprender algo novo?';
  };

  return (
    <View style={globalStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo + Branding Header */}
        <View style={styles.brandingHeader}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🧠</Text>
            <Text style={styles.appName}>MindinLine</Text>
          </View>
          <IconButton
            icon="person-circle-outline"
            variant="ghost"
            size="medium"
            onPress={() => {}}
          />
        </View>

        {/* Greeting Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.greeting}>{getGreeting()}! 👋</Text>
            <HelpButton content={helpContent['home.welcome'].content} />
          </View>
          <Text style={styles.subtitle}>{getMotivationalMessage()}</Text>
        </View>

        {/* Stats Overview */}
        <Card variant="glass" size="small" style={styles.statsCard}>
          <StatsRow
            stats={[
              { icon: 'flame', value: streak, label: 'dias', color: colors.accent.primary },
              { icon: 'checkmark-done', value: taskStats.completedTasks, label: 'completas', color: colors.status.success },
              { icon: 'layers', value: flashcardStats.activeDecks, label: 'decks', color: colors.status.info },
              { icon: 'library', value: trilhas.length, label: 'trilhas', color: colors.status.warning },
            ]}
          />
        </Card>

        {/* Quick Actions */}
        <Card variant="glass" size="medium">
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.quickActions}>
            <Pressable
              style={styles.quickAction}
              onPress={() => navigation.navigate('TasksTab', { screen: 'CreateTask' })}
            >
              <Icon name="add-circle" size={32} color={colors.status.success} />
              <Text style={styles.quickActionText}>Nova Tarefa</Text>
            </Pressable>

            <Pressable
              style={styles.quickAction}
              onPress={() => navigation.navigate('FlashcardsTab', { screen: 'CreateDeck' })}
            >
              <Icon name="duplicate" size={32} color={colors.status.info} />
              <Text style={styles.quickActionText}>Novo Deck</Text>
            </Pressable>

            <Pressable
              style={styles.quickAction}
              onPress={() => navigation.navigate('TrilhasTab', { screen: 'CreateTrilha' })}
            >
              <Icon name="map" size={32} color={colors.status.warning} />
              <Text style={styles.quickActionText}>Nova Trilha</Text>
            </Pressable>

            <Pressable
              style={styles.quickAction}
              onPress={() => navigation.navigate('TimelineTab')}
            >
              <Icon name="stats-chart" size={32} color={colors.accent.secondary} />
              <Text style={styles.quickActionText}>Timeline</Text>
            </Pressable>
          </View>
        </Card>

        {/* Module Cards */}
        <Text style={styles.sectionTitle}>Seus Módulos</Text>

        {/* Flashcards Module */}
        <ModuleCard
          icon="layers-outline"
          title="Flashcards"
          subtitle="Repetição espaçada inteligente"
          stats={[
            { icon: 'cube', value: flashcardStats.totalDecks, label: 'decks' },
            { icon: 'albums', value: flashcardStats.totalCards, label: 'cards' },
            { icon: 'alert-circle', value: flashcardStats.cardsToReviewToday, label: 'revisar', color: colors.status.warning },
            { icon: 'checkmark-circle', value: flashcardStats.cardsMastered, label: 'dominados', color: colors.status.success },
          ]}
          onPress={() => navigation.navigate('FlashcardsTab')}
          color={colors.status.info}
        />

        {/* Tasks Module */}
        <ModuleCard
          icon="checkmark-circle-outline"
          title="Tarefas"
          subtitle="Produtividade com Pomodoro"
          stats={[
            { icon: 'list', value: taskStats.totalTasks, label: 'total' },
            { icon: 'today', value: todayTasks.length, label: 'hoje', color: colors.status.warning },
            { icon: 'checkmark-done', value: taskStats.completedTasks, label: 'completas', color: colors.status.success },
            { icon: 'timer', value: taskStats.totalFocusTime, label: 'min foco', color: colors.accent.primary },
          ]}
          onPress={() => navigation.navigate('TasksTab')}
          color={colors.status.success}
        />

        {/* Trilhas Module */}
        <ModuleCard
          icon="library-outline"
          title="Trilhas de Estudo"
          subtitle="Roteiros estruturados"
          stats={[
            { icon: 'book', value: trilhas.length, label: 'trilhas' },
            { icon: 'play-circle', value: trilhas.filter(t => t.status === 'active').length, label: 'ativas' },
            { icon: 'checkmark-circle', value: trilhas.filter(t => t.status === 'completed').length, label: 'completas', color: colors.status.success },
          ]}
          onPress={() => navigation.navigate('TrilhasTab')}
          color={colors.status.warning}
        />

        {/* Timeline Module */}
        <ModuleCard
          icon="time-outline"
          title="Timeline"
          subtitle="Acompanhe seu progresso"
          stats={[
            { icon: 'flame', value: streak, label: 'dias', color: colors.accent.primary },
            { icon: 'git-commit', value: activities.length, label: 'atividades' },
          ]}
          onPress={() => navigation.navigate('TimelineTab')}
          color={colors.accent.secondary}
        />
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
    paddingBottom: spacing.xl * 2,
  },
  brandingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoEmoji: {
    fontSize: 40,
  },
  appName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  greeting: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  statsCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
  },
  quickActionText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default HomeScreen;
