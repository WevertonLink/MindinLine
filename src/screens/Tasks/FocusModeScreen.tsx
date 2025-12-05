import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Vibration,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTasks } from '../../context/TasksContext';
import { useSettings } from '../../context/SettingsContext';
import {
  globalStyles,
  colors,
  spacing,
  borderRadius,
  typography,
} from '../../theme/globalStyles';
import { formatTimerSeconds } from '../../features/tasks/utils';

const FocusModeScreen = ({ route, navigation }: any) => {
  const { taskId } = route.params;
  const {
    getTaskById,
    activeFocusSession,
    focusModeConfig,
    pauseFocusSession,
    resumeFocusSession,
    completeFocusSession,
    cancelFocusSession,
  } = useTasks();
  const { settings } = useSettings();

  const task = getTaskById(taskId);

  // Calcular tempo restante diretamente do Context
  const timeRemaining = activeFocusSession
    ? Math.max(0, activeFocusSession.duration - activeFocusSession.elapsed)
    : 0;

  // Auto-completar quando timer terminar
  useEffect(() => {
    if (!activeFocusSession) return;

    // Se elapsed >= duration e sessão não está mais rodando, completar
    if (activeFocusSession.elapsed >= activeFocusSession.duration && !activeFocusSession.isRunning) {
      handleComplete();
    }
  }, [activeFocusSession?.elapsed, activeFocusSession?.isRunning]);

  if (!task || !activeFocusSession) {
    return (
      <View style={[globalStyles.container, globalStyles.centered]}>
        <Text style={globalStyles.title}>Sessão não encontrada</Text>
        <Pressable
          style={[globalStyles.buttonPrimary, { marginTop: spacing.lg }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={globalStyles.buttonText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const progress = ((activeFocusSession.duration - timeRemaining) / activeFocusSession.duration) * 100;
  const isFocusMode = activeFocusSession.type === 'focus';

  const handlePause = async () => {
    await pauseFocusSession();
  };

  const handleResume = async () => {
    await resumeFocusSession();
  };

  const handleComplete = async () => {
    // Vibração quando sessão completar (se habilitado)
    if (settings.focusMode.vibrationEnabled) {
      // Padrão de vibração: [pausa, vibra, pausa, vibra]
      // 0ms pausa inicial, 500ms vibra, 200ms pausa, 500ms vibra
      Vibration.vibrate([0, 500, 200, 500]);
    }

    // TODO: Tocar som quando sessão completar (se habilitado)
    // if (settings.focusMode.soundEnabled) {
    //   // Requer instalação de biblioteca de áudio (react-native-sound ou expo-av)
    //   // e adicionar arquivo de áudio em assets/sounds/timer_complete.mp3
    //   sound.play();
    // }

    await completeFocusSession();

    Alert.alert(
      'Sessão Concluída!',
      `Você completou uma sessão de ${isFocusMode ? 'foco' : 'pausa'}!`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar Sessão',
      'Tem certeza que deseja cancelar esta sessão?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            await cancelFocusSession();
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={[globalStyles.container, styles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleCancel}>
          <Icon name="close" size={28} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {isFocusMode ? 'Modo de Foco' : 'Intervalo'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Timer Circle */}
      <View style={styles.timerContainer}>
        <View style={styles.timerCircle}>
          <View style={[styles.timerProgress, { height: `${progress}%` }]} />
          <View style={styles.timerContent}>
            <Text style={styles.timerText}>{formatTimerSeconds(timeRemaining)}</Text>
            <Text style={styles.timerLabel}>
              {isFocusMode ? 'Mantenha o foco' : 'Descanse'}
            </Text>
          </View>
        </View>
      </View>

      {/* Task info */}
      <View style={styles.taskInfo}>
        <Icon
          name={isFocusMode ? 'flash' : 'cafe'}
          size={32}
          color={isFocusMode ? colors.accent.primary : colors.status.success}
        />
        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.sessionInfo}>
          Sessão {activeFocusSession.completedSessions + 1} • {activeFocusSession.duration / 60} min
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {activeFocusSession.isRunning ? (
          <Pressable style={styles.pauseButton} onPress={handlePause}>
            <Icon name="pause" size={40} color={colors.text.primary} />
          </Pressable>
        ) : (
          <Pressable style={styles.playButton} onPress={handleResume}>
            <Icon name="play" size={40} color={colors.text.primary} />
          </Pressable>
        )}
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Icon name="bulb-outline" size={20} color={colors.status.info} />
        <Text style={styles.infoText}>
          {isFocusMode
            ? 'Concentre-se na tarefa e evite distrações'
            : 'Relaxe e descanse para manter a produtividade'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.glass.background,
    borderWidth: 8,
    borderColor: colors.accent.primary,
    overflow: 'hidden',
    position: 'relative',
  },
  timerProgress: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  timerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 64,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  timerLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  taskInfo: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  taskTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  sessionInfo: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  controls: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  pauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.status.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    padding: spacing.md,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * 1.4,
  },
});

export default FocusModeScreen;
