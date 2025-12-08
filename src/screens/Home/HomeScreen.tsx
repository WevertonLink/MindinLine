import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTasks } from '../../context/TasksContext';
import { useFlashcards } from '../../context/FlashcardsContext';
import { useTimeline } from '../../context/TimelineContext';
import { useFlowKeeper } from '../../context/FlowKeeperContext';
import {
  globalStyles,
  colors,
  spacing,
  borderRadius,
  typography,
} from '../../theme/globalStyles';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 2 - spacing.md) / 2;

const HomeScreen = ({ navigation }: any) => {
  const { tasks, stats: taskStats } = useTasks();
  const { decks, stats: flashcardStats } = useFlashcards();
  const { streak, activities } = useTimeline();
  const { flows } = useFlowKeeper();

  // Estatísticas rápidas
  const todayTasks = tasks.filter(t => {
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}! 👋</Text>
            <Text style={styles.subtitle}>{getMotivationalMessage()}</Text>
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: colors.accent.primary }]}>
            <Icon name="flame-outline" size={24} color={colors.accent.primary} />
            <Text style={styles.statNumber}>{streak}</Text>
            <Text style={styles.statLabel}>dias</Text>
          </View>

          <View style={[styles.statCard, { borderColor: colors.status.success }]}>
            <Icon name="checkmark-done-outline" size={24} color={colors.status.success} />
            <Text style={styles.statNumber}>{taskStats.completedCount}</Text>
            <Text style={styles.statLabel}>completas</Text>
          </View>

          <View style={[styles.statCard, { borderColor: colors.status.info }]}>
            <Icon name="layers-outline" size={24} color={colors.status.info} />
            <Text style={styles.statNumber}>{flashcardStats.activeDecks}</Text>
            <Text style={styles.statLabel}>decks</Text>
          </View>

          <View style={[styles.statCard, { borderColor: colors.status.warning }]}>
            <Icon name="library-outline" size={24} color={colors.status.warning} />
            <Text style={styles.statNumber}>{flows.length}</Text>
            <Text style={styles.statLabel}>trilhas</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={globalStyles.glassCard}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.quickActions}>
            <Pressable
              style={styles.quickAction}
              onPress={() => navigation.navigate('TasksTab', {
                screen: 'CreateTask',
              })}
            >
              <Icon name="add-circle" size={32} color={colors.status.success} />
              <Text style={styles.quickActionText}>Nova Tarefa</Text>
            </Pressable>

            <Pressable
              style={styles.quickAction}
              onPress={() => navigation.navigate('FlashcardsTab', {
                screen: 'CreateDeck',
              })}
            >
              <Icon name="duplicate" size={32} color={colors.status.info} />
              <Text style={styles.quickActionText}>Novo Deck</Text>
            </Pressable>

            <Pressable
              style={styles.quickAction}
              onPress={() => navigation.navigate('FlowKeeperTab', {
                screen: 'CreateFlow',
              })}
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
        </View>

        {/* Module Cards */}
        <Text style={styles.sectionTitle}>Seus Módulos</Text>

        {/* Flashcards Module */}
        <Pressable
          style={globalStyles.glassCard}
          onPress={() => navigation.navigate('FlashcardsTab')}
        >
          <View style={styles.moduleHeader}>
            <View style={styles.moduleIcon}>
              <Icon name="layers-outline" size={28} color={colors.status.info} />
            </View>
            <View style={styles.moduleInfo}>
              <Text style={styles.moduleTitle}>Flashcards</Text>
              <Text style={styles.moduleSubtitle}>Repetição espaçada inteligente</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
          </View>

          <View style={styles.moduleStats}>
            <View style={styles.moduleStat}>
              <Text style={styles.moduleStatNumber}>{flashcardStats.totalDecks}</Text>
              <Text style={styles.moduleStatLabel}>decks</Text>
            </View>
            <View style={styles.moduleStat}>
              <Text style={styles.moduleStatNumber}>{flashcardStats.totalCards}</Text>
              <Text style={styles.moduleStatLabel}>cards</Text>
            </View>
            <View style={styles.moduleStat}>
              <Text style={[styles.moduleStatNumber, { color: colors.status.warning }]}>
                {flashcardStats.cardsToReviewToday}
              </Text>
              <Text style={styles.moduleStatLabel}>revisar</Text>
            </View>
            <View style={styles.moduleStat}>
              <Text style={[styles.moduleStatNumber, { color: colors.status.success }]}>
                {flashcardStats.cardsMastered}
              </Text>
              <Text style={styles.moduleStatLabel}>dominados</Text>
            </View>
          </View>
        </Pressable>

        {/* Tasks Module */}
        <Pressable
          style={globalStyles.glassCard}
          onPress={() => navigation.navigate('TasksTab')}
        >
          <View style={styles.moduleHeader}>
            <View style={styles.moduleIcon}>
              <Icon name="checkmark-circle-outline" size={28} color={colors.status.success} />
            </View>
            <View style={styles.moduleInfo}>
              <Text style={styles.moduleTitle}>Tarefas</Text>
              <Text style={styles.moduleSubtitle}>Produtividade com Pomodoro</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
          </View>

          <View style={styles.moduleStats}>
            <View style={styles.moduleStat}>
              <Text style={styles.moduleStatNumber}>{taskStats.totalCount}</Text>
              <Text style={styles.moduleStatLabel}>total</Text>
            </View>
            <View style={styles.moduleStat}>
              <Text style={[styles.moduleStatNumber, { color: colors.status.warning }]}>
                {todayTasks.length}
              </Text>
              <Text style={styles.moduleStatLabel}>hoje</Text>
            </View>
            <View style={styles.moduleStat}>
              <Text style={[styles.moduleStatNumber, { color: colors.status.success }]}>
                {taskStats.completedCount}
              </Text>
              <Text style={styles.moduleStatLabel}>completas</Text>
            </View>
            <View style={styles.moduleStat}>
              <Text style={[styles.moduleStatNumber, { color: colors.accent.primary }]}>
                {taskStats.totalFocusTime}
              </Text>
              <Text style={styles.moduleStatLabel}>min foco</Text>
            </View>
          </View>
        </Pressable>

        {/* FlowKeeper Module */}
        <Pressable
          style={globalStyles.glassCard}
          onPress={() => navigation.navigate('FlowKeeperTab')}
        >
          <View style={styles.moduleHeader}>
            <View style={styles.moduleIcon}>
              <Icon name="library-outline" size={28} color={colors.status.warning} />
            </View>
            <View style={styles.moduleInfo}>
              <Text style={styles.moduleTitle}>Trilhas de Estudo</Text>
              <Text style={styles.moduleSubtitle}>Roteiros estruturados</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
          </View>

          <View style={styles.moduleStats}>
            <View style={styles.moduleStat}>
              <Text style={styles.moduleStatNumber}>{flows.length}</Text>
              <Text style={styles.moduleStatLabel}>trilhas</Text>
            </View>
            <View style={styles.moduleStat}>
              <Text style={styles.moduleStatNumber}>
                {flows.filter(f => f.status === 'active').length}
              </Text>
              <Text style={styles.moduleStatLabel}>ativas</Text>
            </View>
            <View style={styles.moduleStat}>
              <Text style={[styles.moduleStatNumber, { color: colors.status.success }]}>
                {flows.filter(f => f.status === 'completed').length}
              </Text>
              <Text style={styles.moduleStatLabel}>completas</Text>
            </View>
          </View>
        </Pressable>

        {/* Timeline Module */}
        <Pressable
          style={globalStyles.glassCard}
          onPress={() => navigation.navigate('TimelineTab')}
        >
          <View style={styles.moduleHeader}>
            <View style={styles.moduleIcon}>
              <Icon name="time-outline" size={28} color={colors.accent.secondary} />
            </View>
            <View style={styles.moduleInfo}>
              <Text style={styles.moduleTitle}>Timeline</Text>
              <Text style={styles.moduleSubtitle}>Acompanhe seu progresso</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
          </View>

          <View style={styles.moduleStats}>
            <View style={styles.moduleStat}>
              <Text style={[styles.moduleStatNumber, { color: colors.accent.primary }]}>
                {streak}
              </Text>
              <Text style={styles.moduleStatLabel}>dias</Text>
            </View>
            <View style={styles.moduleStat}>
              <Text style={styles.moduleStatNumber}>{activities.length}</Text>
              <Text style={styles.moduleStatLabel}>atividades</Text>
            </View>
          </View>
        </Pressable>
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
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    padding: spacing.sm,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
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
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  moduleSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  moduleStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
  },
  moduleStat: {
    alignItems: 'center',
  },
  moduleStatNumber: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  moduleStatLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
});

export default HomeScreen;
