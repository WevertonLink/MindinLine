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

const FlowKeeperSettingsScreen = ({ navigation }: any) => {
  const { settings, updateSettings, resetSection } = useSettings();

  const [defaultStepDuration, setDefaultStepDuration] = useState(
    settings.flowKeeper.defaultStepDuration.toString()
  );

  const handleSave = async () => {
    const duration = parseInt(defaultStepDuration);

    if (isNaN(duration) || duration < 1 || duration > 480) {
      Alert.alert('Erro', 'Duração do step deve estar entre 1 e 480 minutos (8h)');
      return;
    }

    try {
      await updateSettings({
        flowKeeper: {
          defaultStepDuration: duration,
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
      'Tem certeza que deseja resetar as configurações do FlowKeeper para os valores padrão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetSection('flowKeeper');
              setDefaultStepDuration('30');
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
    await updateSettings({ flowKeeper: { [key]: value } });
  };

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

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Duração padrão do step (min)</Text>
              <TextInput
                style={styles.input}
                value={defaultStepDuration}
                onChangeText={setDefaultStepDuration}
                keyboardType="numeric"
                maxLength={3}
                placeholder="30"
                placeholderTextColor={colors.text.tertiary}
              />
              <Text style={styles.inputHint}>
                {parseInt(defaultStepDuration) >= 60
                  ? `${Math.floor(parseInt(defaultStepDuration) / 60)}h ${parseInt(defaultStepDuration) % 60}min`
                  : `${defaultStepDuration} minutos`}
              </Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Icon name="information-circle-outline" size={16} color={colors.status.info} />
            <Text style={styles.infoText}>
              Duração sugerida ao criar novos steps em uma trilha de estudos.
              Você pode ajustar individualmente para cada step.
            </Text>
          </View>
        </View>

        {/* Comportamento */}
        <View style={globalStyles.glassCard}>
          <Text style={styles.sectionTitle}>Comportamento</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Auto-reproduzir próximo step</Text>
              <Text style={styles.settingDescription}>
                Avança automaticamente para o próximo step ao completar um
              </Text>
            </View>
            <Switch
              value={settings.flowKeeper.autoPlayNextStep}
              onValueChange={(value) => handleToggle('autoPlayNextStep', value)}
              trackColor={{ false: colors.glass.border, true: colors.accent.primary }}
              thumbColor={colors.text.primary}
            />
          </View>

          <View style={globalStyles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Marcar material como completo ao visualizar</Text>
              <Text style={styles.settingDescription}>
                Marca materiais automaticamente como vistos quando abertos
              </Text>
            </View>
            <Switch
              value={settings.flowKeeper.markMaterialAsCompletedOnView}
              onValueChange={(value) => handleToggle('markMaterialAsCompletedOnView', value)}
              trackColor={{ false: colors.glass.border, true: colors.accent.primary }}
              thumbColor={colors.text.primary}
            />
          </View>

          <View style={globalStyles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Mostrar barra de progresso</Text>
              <Text style={styles.settingDescription}>
                Exibe progresso visual da trilha e dos steps
              </Text>
            </View>
            <Switch
              value={settings.flowKeeper.showProgressBar}
              onValueChange={(value) => handleToggle('showProgressBar', value)}
              trackColor={{ false: colors.glass.border, true: colors.accent.primary }}
              thumbColor={colors.text.primary}
            />
          </View>
        </View>

        {/* Dica */}
        <View style={styles.tipBox}>
          <Icon name="bulb-outline" size={16} color={colors.status.warning} />
          <Text style={styles.tipText}>
            <Text style={{ fontWeight: typography.fontWeight.bold }}>Dica: </Text>
            FlowKeeper ajuda você a organizar trilhas de estudo complexas dividindo-as em steps
            menores e gerenciáveis. Use para cursos, projetos ou qualquer aprendizado sequencial.
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
    marginBottom: spacing.md,
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.xs * 1.4,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    padding: spacing.sm,
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  tipText: {
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

export default FlowKeeperSettingsScreen;
