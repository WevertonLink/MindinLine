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
import { pick, types as DocumentPickerTypes } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from '../../context/SettingsContext';
import { Card, Divider, SectionHeader } from '../../components';
import HelpButton from '../../components/HelpButton';
import { helpContent } from '../../data/helpContent';
import { errorMessages, successMessages, confirmMessages } from '../../utils/messages';
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
    importData,
    clearAllData,
    updateUsageStats,
  } = useSettings();

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

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
        successMessages.settings.exported.title,
        successMessages.settings.exported.message,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        errorMessages.settings.export.title,
        errorMessages.settings.export.message
      );
    } finally {
      setExporting(false);
    }
  };

  const handleImportData = async () => {
    try {
      setImporting(true);

      // Abrir file picker
      const result = await pick({
        type: [DocumentPickerTypes.allFiles],
        copyTo: 'cachesDirectory',
      });

      if (!result || result.length === 0) {
        setImporting(false);
        return;
      }

      const [file] = result;

      // Usar URI do arquivo diretamente
      const fileUri = file.uri;

      // Ler conteúdo do arquivo
      const fileContent = await RNFS.readFile(fileUri, 'utf8');
      const data = JSON.parse(fileContent);

      // Validar estrutura básica
      if (!data.version || !data.exportedAt) {
        throw new Error('Arquivo inválido - estrutura não reconhecida');
      }

      // Mostrar preview e confirmar
      const flowsCount = data.flows?.length || 0;
      const decksCount = data.flashcards?.length || 0;
      const tasksCount = data.tasks?.length || 0;
      const activitiesCount = data.activities?.length || 0;
      const exportDate = new Date(data.exportedAt).toLocaleDateString('pt-BR');

      const importConfirm = confirmMessages.import.data({
        trilhas: flowsCount,
        decks: decksCount,
        tasks: tasksCount,
        activities: activitiesCount,
        date: exportDate,
      });

      Alert.alert(
        importConfirm.title,
        importConfirm.message,
        [
          {
            text: importConfirm.cancelText,
            style: 'cancel',
            onPress: () => setImporting(false)
          },
          {
            text: importConfirm.confirmText,
            style: 'destructive',
            onPress: async () => {
              try {
                await importData(data);
                // O Alert de sucesso já está no importData do Context
                setImporting(false);
              } catch (error) {
                Alert.alert(
                  errorMessages.settings.import.title,
                  errorMessages.settings.import.message
                );
                setImporting(false);
              }
            },
          },
        ],
        { onDismiss: () => setImporting(false) }
      );
    } catch (error: any) {
      // Usuário cancelou ou erro ao selecionar
      if (error && error.code === 'ERR_PICKER_CANCELLED') {
        setImporting(false);
        return;
      }

      console.error('Erro ao importar dados:', error);
      const errorMsg = error.message?.includes('inválido')
        ? errorMessages.settings.invalidFile
        : errorMessages.settings.import;

      Alert.alert(errorMsg.title, errorMsg.message);
      setImporting(false);
    }
  };

  const handleClearAllData = () => {
    const clearConfirm = confirmMessages.delete.allData;

    Alert.alert(
      clearConfirm.title,
      clearConfirm.message,
      [
        { text: clearConfirm.cancelText, style: 'cancel' },
        {
          text: clearConfirm.confirmText,
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              await updateUsageStats();
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
              Alert.alert(
                successMessages.settings.reset.title,
                successMessages.settings.reset.message
              );
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
  };

  const handleResetOnboarding = async () => {
    Alert.alert(
      'Resetar Onboarding',
      'Isso fará o tutorial de boas-vindas aparecer novamente na próxima vez que você abrir o app.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@mindinline:onboarding_completed');
              Alert.alert(
                'Sucesso',
                'O onboarding será exibido novamente ao reiniciar o app.'
              );
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
          <Card variant="glass" size="medium">
            <Text style={styles.sectionTitle}>Estatísticas de Uso</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{usageStats.totalDaysUsed}</Text>
                <Text style={styles.statLabel}>dias usando</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{usageStats.totalTrilhas}</Text>
                <Text style={styles.statLabel}>trilhas</Text>
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
          </Card>
        )}

        {/* Preferências Gerais */}
        <Card variant="glass" size="medium">
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

          <Divider spacing="none" />

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
            onPress={() => navigation.navigate('TrilhasSettings')}
          >
            <View style={styles.settingLeft}>
              <Icon name="library-outline" size={20} color={colors.status.warning} />
              <Text style={styles.settingLabel}>Trilhas de Aprendizado</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
          </Pressable>
        </View>

        {/* Dados */}
        <View style={globalStyles.glassCard}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Dados</Text>
            <HelpButton content={helpContent['settings.export'].content} size={18} />
          </View>

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

          <Pressable style={styles.settingRow} onPress={handleImportData} disabled={importing}>
            <View style={styles.settingLeft}>
              <Icon name="cloud-upload-outline" size={20} color={colors.accent.primary} />
              <Text style={styles.settingLabel}>
                Importar Dados
              </Text>
            </View>
            {importing && <ActivityIndicator size="small" color={colors.accent.primary} />}
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

          <Pressable style={styles.settingRow} onPress={handleResetOnboarding}>
            <View style={styles.settingLeft}>
              <Icon name="rocket-outline" size={20} color={colors.status.info} />
              <Text style={[styles.settingLabel, { color: colors.status.info }]}>
                Resetar Onboarding
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
        <Card variant="glass" size="small">
          <View style={styles.aboutRow}>
            <Icon name="phone-portrait-outline" size={20} color={colors.text.tertiary} />
            <Text style={styles.aboutText}>MindinLine v{settings.version}</Text>
          </View>
        </Card>
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
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
