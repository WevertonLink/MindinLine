import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  TextInput,
  Alert,
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

const TasksSettingsScreen = ({ navigation }: any) => {
  const { settings, updateSettings, resetSection } = useSettings();

  const [autoArchiveDays, setAutoArchiveDays] = useState(
    settings.tasks.autoArchiveCompletedDays.toString()
  );
  const [defaultReminderMinutes, setDefaultReminderMinutes] = useState(
    settings.tasks.defaultReminderMinutes.toString()
  );
  const [defaultPriority, setDefaultPriority] = useState(settings.tasks.defaultPriority);

  const handleSave = async () => {
    const archiveDays = parseInt(autoArchiveDays);
    const reminderMinutes = parseInt(defaultReminderMinutes);

    if (isNaN(archiveDays) || archiveDays < 1 || archiveDays > 365) {
      Alert.alert('Erro', 'Dias para arquivar deve estar entre 1 e 365');
      return;
    }
    if (isNaN(reminderMinutes) || reminderMinutes < 5 || reminderMinutes > 1440) {
      Alert.alert('Erro', 'Lembrete deve estar entre 5 e 1440 minutos (24h)');
      return;
    }

    try {
      await updateSettings({
        tasks: {
          autoArchiveCompletedDays: archiveDays,
          defaultReminderMinutes: reminderMinutes,
          defaultPriority,
        },
      });
      Alert.alert('Sucesso', 'Configurações salvas!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as configurações');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Resetar Configurações',
      'Tem certeza que deseja resetar as configurações de Tarefas para os valores padrão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetSection('tasks');
              setAutoArchiveDays('30');
              setDefaultReminderMinutes('60');
              setDefaultPriority('medium');
              Alert.alert('Sucesso', 'Configurações resetadas!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível resetar');
            }
          },
        },
      ]
    );
  };

  const handleToggle = async (key: string, value: boolean) => {
    await updateSettings({ tasks: { [key]: value } });
  };

  const priorityOptions = [
    { value: 'low', label: 'Baixa', icon: 'chevron-down', color: colors.status.info },
    { value: 'medium', label: 'Média', icon: 'remove', color: colors.status.warning },
    { value: 'high', label: 'Alta', icon: 'chevron-up', color: colors.status.error },
  ];

  return (
    <View style={globalStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Padrões */}
        <View style={globalStyles.glassCard}>
          <Text style={styles.sectionTitle}>Padrões</Text>

          <View style={styles.priorityRow}>
            <Text style={styles.inputLabel}>Prioridade padrão</Text>
            <View style={styles.priorityOptions}>
              {priorityOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.priorityButton,
                    defaultPriority === option.value && styles.priorityButtonActive,
                    defaultPriority === option.value && { borderColor: option.color },
                  ]}
                  onPress={() => setDefaultPriority(option.value as any)}
                >
                  <Icon
                    name={option.icon}
                    size={16}
                    color={defaultPriority === option.value ? option.color : colors.text.tertiary}
                  />
                  <Text
                    style={[
                      styles.priorityText,
                      defaultPriority === option.value && { color: option.color },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Lembrete (minutos)</Text>
              <TextInput
                style={styles.input}
                value={defaultReminderMinutes}
                onChangeText={setDefaultReminderMinutes}
                keyboardType="numeric"
                maxLength={4}
                placeholder="60"
                placeholderTextColor={colors.text.tertiary}
              />
              <Text style={styles.inputHint}>
                {parseInt(defaultReminderMinutes) >= 60
                  ? `${Math.floor(parseInt(defaultReminderMinutes) / 60)}h`
                  : `${defaultReminderMinutes}min`}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Auto-arquivar (dias)</Text>
              <TextInput
                style={styles.input}
                value={autoArchiveDays}
                onChangeText={setAutoArchiveDays}
                keyboardType="numeric"
                maxLength={3}
                placeholder="30"
                placeholderTextColor={colors.text.tertiary}
              />
              <Text style={styles.inputHint}>após completar</Text>
            </View>
          </View>
        </View>

        {/* Comportamento */}
        <View style={globalStyles.glassCard}>
          <Text style={styles.sectionTitle}>Comportamento</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Mostrar tarefas completadas</Text>
              <Text style={styles.settingDescription}>
                Exibe tarefas concluídas na lista principal
              </Text>
            </View>
            <Switch
              value={settings.tasks.showCompletedTasks}
              onValueChange={(value) => handleToggle('showCompletedTasks', value)}
              trackColor={{ false: colors.glass.border, true: colors.accent.primary }}
              thumbColor={colors.text.primary}
            />
          </View>

          <View style={globalStyles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Tarefas recorrentes</Text>
              <Text style={styles.settingDescription}>
                Permite criar tarefas que se repetem automaticamente
              </Text>
            </View>
            <Switch
              value={settings.tasks.enableRecurringTasks}
              onValueChange={(value) => handleToggle('enableRecurringTasks', value)}
              trackColor={{ false: colors.glass.border, true: colors.accent.primary }}
              thumbColor={colors.text.primary}
            />
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Icon name="information-circle-outline" size={16} color={colors.status.info} />
          <Text style={styles.infoText}>
            Tarefas completadas serão arquivadas automaticamente após o período configurado.
            Você ainda poderá acessá-las no histórico.
          </Text>
        </View>

        {/* Botões */}
        <View style={styles.buttonsRow}>
          <Pressable
            style={[globalStyles.buttonSecondary, styles.button]}
            onPress={handleReset}
          >
            <Icon name="refresh-outline" size={20} color={colors.text.primary} />
            <Text style={[globalStyles.buttonText, { marginLeft: spacing.xs }]}>
              Resetar
            </Text>
          </Pressable>

          <Pressable
            style={[globalStyles.buttonPrimary, styles.button]}
            onPress={handleSave}
          >
            <Icon name="checkmark" size={20} color={colors.text.primary} />
            <Text style={[globalStyles.buttonText, { marginLeft: spacing.xs }]}>
              Salvar
            </Text>
          </Pressable>
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
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    textAlign: 'center',
  },
  inputHint: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  priorityRow: {
    marginBottom: spacing.md,
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  priorityButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
  },
  priorityText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    padding: spacing.sm,
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.xs * 1.4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
  },
});

export default TasksSettingsScreen;
