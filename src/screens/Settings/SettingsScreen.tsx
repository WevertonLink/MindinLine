import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSettings } from '../../context/SettingsContext';
import {
  globalStyles,
  colors,
  spacing,
  borderRadius,
  typography,
} from '../../theme/globalStyles';

const SettingsScreen = ({ navigation }: any) => {
  const {
    settings,
    usageStats,
    loading,
    updateSettings,
    resetSettings,
    exportData,
    clearAllData,
    updateUsageStats,
  } = useSettings();

  const [exporting, setExporting] = useState(false);

  const handleToggleNotifications = async (value: boolean) => {
    await updateSettings({ app: { notificationsEnabled: value } });
  };

  const handleToggleSound = async (value: boolean) => {
    await updateSettings({ app: { soundEnabled: value } });
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      const data = await exportData();
      const jsonString = JSON.stringify(data, null, 2);

      Alert.alert(
        'Dados Exportados',
        `Total de ${data.flows.length} flows, ${data.flashcards.length} decks, ${data.tasks.length} tarefas e ${data.activities.length} atividades.\n\nOs dados estão prontos. Em uma versão futura, você poderá compartilhar este arquivo.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível exportar os dados');
    } finally {
      setExporting(false);
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Limpar Todos os Dados',
      'Esta ação irá DELETAR permanentemente todos os seus flows, decks, tarefas e atividades. As configurações serão resetadas. Esta ação NÃO pode ser desfeita!',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar Tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              await updateUsageStats();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível limpar os dados');
            }
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Resetar Configurações',
      'Tem certeza que deseja resetar todas as configurações para os valores padrão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetSettings();
              Alert.alert('Sucesso', 'Configurações resetadas!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível resetar as configurações');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[globalStyles.container, globalStyles.centered]}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
        <Text style={[globalStyles.bodyText, { marginTop: spacing.md }]}>
          Carregando configurações...
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
          <Text style={globalStyles.title}>Configurações</Text>
          <Text style={globalStyles.subtitle}>
            Personalize seu MindinLine
          </Text>
        </View>

        {/* Usage Stats */}
        {usageStats && (
          <View style={globalStyles.glassCard}>
            <Text style={styles.sectionTitle}>Estatísticas de Uso</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{usageStats.totalDaysUsed}</Text>
                <Text style={styles.statLabel}>dias usando</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{usageStats.totalFlows}</Text>
                <Text style={styles.statLabel}>flows</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{usageStats.totalDecks}</Text>
                <Text style={styles.statLabel}>decks</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{usageStats.totalTasks}</Text>
                <Text style={styles.statLabel}>tarefas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{usageStats.totalActivities}</Text>
                <Text style={styles.statLabel}>atividades</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{usageStats.totalFocusTime}</Text>
                <Text style={styles.statLabel}>min foco</Text>
              </View>
            </View>
          </View>
        )}

        {/* Preferências Gerais */}
        <View style={globalStyles.glassCard}>
          <Text style={styles.sectionTitle}>Preferências</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Icon name="notifications-outline" size={20} color={colors.text.secondary} />
              <Text style={styles.settingLabel}>Notificações</Text>
            </View>
            <Switch
              value={settings.app.notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.glass.border, true: colors.accent.primary }}
              thumbColor={colors.text.primary}
            />
          </View>

          <View style={globalStyles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Icon name="volume-high-outline" size={20} color={colors.text.secondary} />
              <Text style={styles.settingLabel}>Som</Text>
            </View>
            <Switch
              value={settings.app.soundEnabled}
              onValueChange={handleToggleSound}
              trackColor={{ false: colors.glass.border, true: colors.accent.primary }}
              thumbColor={colors.text.primary}
            />
          </View>

          <View style={globalStyles.divider} />

          <Pressable style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Icon name="color-palette-outline" size={20} color={colors.text.secondary} />
              <Text style={styles.settingLabel}>Tema</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>Glassmorphism Deep</Text>
              <Icon name="lock-closed" size={16} color={colors.text.tertiary} />
            </View>
          </Pressable>

          <View style={globalStyles.divider} />

          <Pressable style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Icon name="language-outline" size={20} color={colors.text.secondary} />
              <Text style={styles.settingLabel}>Idioma</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>Português (BR)</Text>
              <Icon name="lock-closed" size={16} color={colors.text.tertiary} />
            </View>
          </Pressable>
        </View>

        {/* Configurações por Módulo */}
        <View style={globalStyles.glassCard}>
          <Text style={styles.sectionTitle}>Módulos</Text>

          <Pressable
            style={styles.settingRow}
            onPress={() => navigation.navigate('FocusModeSettings')}
          >
            <View style={styles.settingLeft}>
              <Icon name="timer-outline" size={20} color={colors.accent.primary} />
              <Text style={styles.settingLabel}>Focus Mode (Pomodoro)</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
          </Pressable>

          <View style={globalStyles.divider} />

          <Pressable
            style={styles.settingRow}
            onPress={() => navigation.navigate('TasksSettings')}
          >
            <View style={styles.settingLeft}>
              <Icon name="checkmark-circle-outline" size={20} color={colors.status.success} />
              <Text style={styles.settingLabel}>Tarefas</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
          </Pressable>

          <View style={globalStyles.divider} />

          <Pressable
            style={styles.settingRow}
            onPress={() => navigation.navigate('FlashcardsSettings')}
          >
            <View style={styles.settingLeft}>
              <Icon name="layers-outline" size={20} color={colors.status.info} />
              <Text style={styles.settingLabel}>Flashcards</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
          </Pressable>

          <View style={globalStyles.divider} />

          <Pressable
            style={styles.settingRow}
            onPress={() => navigation.navigate('FlowKeeperSettings')}
          >
            <View style={styles.settingLeft}>
              <Icon name="library-outline" size={20} color={colors.status.warning} />
              <Text style={styles.settingLabel}>FlowKeeper</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
          </Pressable>
        </View>

        {/* Dados */}
        <View style={globalStyles.glassCard}>
          <Text style={styles.sectionTitle}>Dados</Text>

          <Pressable
            style={styles.settingRow}
            onPress={handleExportData}
            disabled={exporting}
          >
            <View style={styles.settingLeft}>
              <Icon name="download-outline" size={20} color={colors.text.secondary} />
              <Text style={styles.settingLabel}>
                {exporting ? 'Exportando...' : 'Exportar Dados'}
              </Text>
            </View>
            {exporting && <ActivityIndicator size="small" color={colors.accent.primary} />}
          </Pressable>

          <View style={globalStyles.divider} />

          <Pressable style={styles.settingRow} disabled>
            <View style={styles.settingLeft}>
              <Icon name="cloud-upload-outline" size={20} color={colors.text.tertiary} />
              <Text style={[styles.settingLabel, { color: colors.text.tertiary }]}>
                Importar Dados
              </Text>
            </View>
            <Text style={styles.comingSoon}>Em breve</Text>
          </Pressable>

          <View style={globalStyles.divider} />

          <Pressable style={styles.settingRow} onPress={handleResetSettings}>
            <View style={styles.settingLeft}>
              <Icon name="refresh-outline" size={20} color={colors.status.warning} />
              <Text style={[styles.settingLabel, { color: colors.status.warning }]}>
                Resetar Configurações
              </Text>
            </View>
          </Pressable>

          <View style={globalStyles.divider} />

          <Pressable style={styles.settingRow} onPress={handleClearAllData}>
            <View style={styles.settingLeft}>
              <Icon name="trash-outline" size={20} color={colors.status.error} />
              <Text style={[styles.settingLabel, { color: colors.status.error }]}>
                Limpar Todos os Dados
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Sobre */}
        <View style={globalStyles.glassCardSmall}>
          <View style={styles.aboutRow}>
            <Icon name="phone-portrait-outline" size={20} color={colors.text.tertiary} />
            <Text style={styles.aboutText}>MindinLine v{settings.version}</Text>
          </View>
          <View style={styles.aboutRow}>
            <Icon name="heart-outline" size={20} color={colors.status.error} />
            <Text style={styles.aboutText}>App para pessoas com TDAH</Text>
          </View>
          <View style={styles.aboutRow}>
            <Icon name="code-slash-outline" size={20} color={colors.text.tertiary} />
            <Text style={styles.aboutText}>Desenvolvido com vibe-coding</Text>
          </View>
        </View>
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
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  settingLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  comingSoon: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  aboutText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
});

export default SettingsScreen;
