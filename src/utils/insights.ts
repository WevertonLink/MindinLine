// ==========================================
// SISTEMA DE INSIGHTS INTELIGENTES
// ==========================================

export type InsightType = 'success' | 'warning' | 'info' | 'tip';
export type InsightCategory = 'productivity' | 'learning' | 'streak' | 'achievement';

export interface Insight {
  id: string;
  type: InsightType;
  category: InsightCategory;
  icon: string;
  title: string;
  message: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface InsightsData {
  // Timeline stats
  currentStreak: number;
  longestStreak: number;
  totalActivities: number;
  thisWeekActivities: number;
  thisWeekFocusTime: number;
  activitiesPerDay: number;
  mostProductiveDay?: string;

  // Flashcards stats
  totalCards: number;
  cardsToReviewToday: number;
  cardsMastered: number;
  activeDecks: number;

  // Tasks stats
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;

  // Trilhas stats
  totalTrilhas: number;
  completedTrilhas: number;
}

// ==========================================
// GERAÇÃO DE INSIGHTS
// ==========================================

export const generateInsights = (data: InsightsData): Insight[] => {
  const insights: Insight[] = [];

  // STREAK INSIGHTS
  if (data.currentStreak > 0) {
    if (data.currentStreak >= 7) {
      insights.push({
        id: 'streak_milestone',
        type: 'success',
        category: 'streak',
        icon: 'flame',
        title: `${data.currentStreak} dias seguidos!`,
        message: 'Você está construindo um hábito incrível. Continue assim!',
      });
    } else if (data.currentStreak >= 3) {
      insights.push({
        id: 'streak_growing',
        type: 'info',
        category: 'streak',
        icon: 'flame',
        title: 'Sequência crescendo',
        message: `${data.currentStreak} dias de estudos. Faltam ${7 - data.currentStreak} dias para 1 semana!`,
      });
    }
  }

  if (data.currentStreak === data.longestStreak && data.currentStreak >= 5) {
    insights.push({
      id: 'streak_record',
      type: 'success',
      category: 'achievement',
      icon: 'trophy',
      title: 'Novo recorde!',
      message: `Esta é sua maior sequência até agora: ${data.currentStreak} dias.`,
    });
  }

  // FLASHCARDS INSIGHTS
  if (data.cardsToReviewToday > 0) {
    if (data.cardsToReviewToday > 20) {
      insights.push({
        id: 'cards_many',
        type: 'warning',
        category: 'learning',
        icon: 'layers',
        title: `${data.cardsToReviewToday} cards para revisar`,
        message: 'Muitos cards acumulados! Tente revisar um pouco por dia.',
      });
    } else if (data.cardsToReviewToday <= 10) {
      insights.push({
        id: 'cards_manageable',
        type: 'info',
        category: 'learning',
        icon: 'layers',
        title: 'Revisões em dia',
        message: `Apenas ${data.cardsToReviewToday} cards para hoje. Ótimo controle!`,
      });
    }
  } else if (data.totalCards > 0) {
    insights.push({
      id: 'cards_none',
      type: 'success',
      category: 'learning',
      icon: 'checkmark-circle',
      title: 'Sem revisões pendentes!',
      message: 'Você revisou todos os cards de hoje. Parabéns!',
    });
  }

  if (data.cardsMastered > 0 && data.totalCards > 0) {
    const masteredPercentage = (data.cardsMastered / data.totalCards) * 100;
    if (masteredPercentage >= 50) {
      insights.push({
        id: 'cards_mastery',
        type: 'success',
        category: 'achievement',
        icon: 'school',
        title: 'Dominando o conteúdo',
        message: `${masteredPercentage.toFixed(0)}% dos seus cards estão dominados!`,
      });
    }
  }

  // TASKS INSIGHTS
  if (data.overdueTasks > 0) {
    insights.push({
      id: 'tasks_overdue',
      type: 'warning',
      category: 'productivity',
      icon: 'alert-circle',
      title: `${data.overdueTasks} ${data.overdueTasks === 1 ? 'tarefa atrasada' : 'tarefas atrasadas'}`,
      message: 'Priorize estas tarefas para manter sua produtividade.',
    });
  }

  if (data.todoTasks === 0 && data.inProgressTasks === 0 && data.completedTasks > 0) {
    insights.push({
      id: 'tasks_clear',
      type: 'success',
      category: 'productivity',
      icon: 'checkmark-done-circle',
      title: 'Inbox zerado!',
      message: 'Todas as tarefas concluídas. Hora de relaxar ou planejar novas metas.',
    });
  }

  if (data.completedTasks > data.todoTasks + data.inProgressTasks && data.completedTasks >= 5) {
    insights.push({
      id: 'tasks_productive',
      type: 'success',
      category: 'productivity',
      icon: 'trending-up',
      title: 'Muito produtivo!',
      message: `${data.completedTasks} tarefas completadas. Você está no ritmo!`,
    });
  }

  // PRODUCTIVITY INSIGHTS
  if (data.thisWeekActivities > 0) {
    const avgPerDay = data.activitiesPerDay;

    if (avgPerDay >= 5) {
      insights.push({
        id: 'productivity_high',
        type: 'success',
        category: 'productivity',
        icon: 'flash',
        title: 'Ritmo excepcional',
        message: `Média de ${avgPerDay.toFixed(1)} atividades por dia. Continue assim!`,
      });
    } else if (avgPerDay < 2 && data.totalActivities > 0) {
      insights.push({
        id: 'productivity_low',
        type: 'tip',
        category: 'productivity',
        icon: 'bulb',
        title: 'Aumente o ritmo',
        message: 'Tente fazer pelo menos 2-3 atividades por dia para melhor progresso.',
      });
    }
  }

  if (data.thisWeekFocusTime > 0) {
    const hoursThisWeek = Math.floor(data.thisWeekFocusTime / 60);

    if (hoursThisWeek >= 10) {
      insights.push({
        id: 'focus_excellent',
        type: 'success',
        category: 'productivity',
        icon: 'timer',
        title: `${hoursThisWeek}h de foco esta semana`,
        message: 'Excelente dedicação! Você está investindo tempo de qualidade.',
      });
    } else if (hoursThisWeek >= 5) {
      insights.push({
        id: 'focus_good',
        type: 'info',
        category: 'productivity',
        icon: 'timer',
        title: 'Bom tempo de foco',
        message: `${hoursThisWeek}h esta semana. Meta ideal: 10h semanais.`,
      });
    }
  }

  // TRILHAS INSIGHTS
  if (data.totalTrilhas > 0 && data.completedTrilhas === 0) {
    insights.push({
      id: 'trilhas_start',
      type: 'tip',
      category: 'learning',
      icon: 'library',
      title: 'Trilhas aguardando',
      message: `${data.totalTrilhas} ${data.totalTrilhas === 1 ? 'trilha criada' : 'trilhas criadas'}. Comece a progredir!`,
    });
  }

  if (data.completedTrilhas > 0) {
    const completionRate = (data.completedTrilhas / data.totalTrilhas) * 100;
    insights.push({
      id: 'trilhas_progress',
      type: 'success',
      category: 'learning',
      icon: 'ribbon',
      title: `${data.completedTrilhas} ${data.completedTrilhas === 1 ? 'trilha' : 'trilhas'} completa${data.completedTrilhas > 1 ? 's' : ''}`,
      message: `${completionRate.toFixed(0)}% das suas trilhas concluídas!`,
    });
  }

  // GENERAL TIPS
  if (insights.length === 0 && data.totalActivities === 0) {
    insights.push({
      id: 'getting_started',
      type: 'tip',
      category: 'productivity',
      icon: 'rocket',
      title: 'Comece sua jornada',
      message: 'Crie seu primeiro deck, adicione uma tarefa ou inicie uma trilha de estudo!',
    });
  }

  // Return top 3 most relevant insights
  return insights.slice(0, 3);
};

// ==========================================
// HELPERS
// ==========================================

export const getInsightIconColor = (type: InsightType): string => {
  switch (type) {
    case 'success':
      return '#22c55e'; // green
    case 'warning':
      return '#fb923c'; // orange
    case 'info':
      return '#5b7eff'; // blue
    case 'tip':
      return '#a78bfa'; // purple
  }
};

export const getInsightBackgroundColor = (type: InsightType): string => {
  switch (type) {
    case 'success':
      return 'rgba(34, 197, 94, 0.1)';
    case 'warning':
      return 'rgba(251, 146, 60, 0.1)';
    case 'info':
      return 'rgba(91, 126, 255, 0.1)';
    case 'tip':
      return 'rgba(167, 139, 250, 0.1)';
  }
};

export const getInsightBorderColor = (type: InsightType): string => {
  switch (type) {
    case 'success':
      return 'rgba(34, 197, 94, 0.3)';
    case 'warning':
      return 'rgba(251, 146, 60, 0.3)';
    case 'info':
      return 'rgba(91, 126, 255, 0.3)';
    case 'tip':
      return 'rgba(167, 139, 250, 0.3)';
  }
};
