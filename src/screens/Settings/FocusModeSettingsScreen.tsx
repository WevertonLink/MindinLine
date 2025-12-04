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

const FocusModeSettingsScreen = ({ navigation }: any) => {
  const { settings, updateSettings, resetSection } = useSettings();

  const [focusDuration, setFocusDuration] = useState(settings.focusMode.focusDuration.toString());
  const [shortBreak, setShortBreak] = useState(settings.focusMode.shortBreakDuration.toString());
  const [longBreak, setLongBreak] = useState(settings.focusMode.longBreakDuration.toString());
  const [sessionsBeforeLong, setSessionsBeforeLong] = useState(settings.focusMode.sessionsBeforeLongBreak.toString());

  const handleSave = async () => {
    const focus = parseInt(focusDuration);
    const short = parseInt(shortBreak);
    const long = parseInt(longBreak);
    const sessions = parseInt(sessionsBeforeLong);

    if (isNaN(focus) || focus < 1 || focus > 90) {
      Alert.alert('Erro', 'Duração do foco deve estar entre 1 e 90 minutos');
      return;
    }
    if (isNaN(short) || short < 1 || short > 30) {
      Alert.alert('Erro', 'Pausa curta deve estar entre 1 e 30 minutos');
      return;
    }
    if (isNaN(long) || long < 1 || long > 60) {
      Alert.alert('Erro', 'Pausa longa deve estar entre 1 e 60 minutos');
      return;
    }
    if (isNaN(sessions) || sessions < 2 || sessions > 10) {
      Alert.alert('Erro', 'Sessões antes da pausa longa deve estar entre 2 e 10');
      return;
    }

    try {
      await updateSettings({
        focusMode: {
          focusDuration: focus,
          shortBreakDuration: short,
          longBreakDuration: long,
          sessionsBeforeLongBreak: sessions,
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
      'Tem certeza que deseja resetar as configurações do Focus Mode para os valores padrão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetSection('focusMode');
              setFocusDuration('25');
              setShortBreak('5');
              setLongBreak('15');
              setSessionsBeforeLong('4');
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
    await updateSettings({ focusMode: { [key]: value } });
  };

  return (
    <View style={globalStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Durações */}
        <View style={globalStyles.glassCard}>
          <Text style={styles.sectionTitle}>Durações (minutos)</Text>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Foco</Text>
              <TextInput
                style={styles.input}
                value={focusDuration}
                onChangeText={setFocusDuration}
                keyboardType="numeric"
                maxLength={2}
                placeholder="25"
                placeholderTextColor={colors.text.tertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pausa Curta</Text>
              <TextInput
                style={styles.input}
                value={shortBreak}
                onChangeText={setShortBreak}
                keyboardType="numeric"
                maxLength={2}
                placeholder="5"
                placeholderTextColor={colors.text.tertiary}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pausa Longa</Text>
              <TextInput
                style={styles.input}
                value={longBreak}
                onChangeText={setLongBreak}
                keyboardType="numeric"
                maxLength={2}
                placeholder="15"
                placeholderTextColor={colors.text.tertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sessões p/ Longa</Text>
              <TextInput
                style={styles.input}
                value={sessionsBeforeLong}
                onChangeText={setSessionsBeforeLong}
                keyboardType="numeric"
                maxLength={2}
                placeholder="4"
                placeholderTextColor={colors.text.tertiary}
              />
            </View>
          </View>

          <View style={styles.infoBox}>
            <Icon name="information-circle-outline" size={16} color={colors.status.info} />
            <Text style={styles.infoText}>
              Técnica Pomodoro padrão: 25min foco + 5min pausa, após 4 sessões uma pausa de 15min
            </Text>
          </View>
        </View>

        {/* Comportamento */}
        <View style={globalStyles.glassCard}>
          <Text style={styles.sectionTitle}>Comportamento</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Auto-iniciar pausa</Text>
              <Text style={styles.settingDescription}>
                Inicia a pausa automaticamente após o foco
              </Text>
            </View>
            <Switch
              value={settings.focusMode.autoStartBreak}
              onValueChange={(value) => handleToggle('autoStartBreak', value)}
              trackColor={{ false: colors.glass.border, true: colors.accent.primary }}
              thumbColor={colors.text.primary}
            />
          </View>

          <View style={globalStyles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Auto-iniciar foco</Text>
              <Text style={styles.settingDescription}>
                Inicia o foco automaticamente após a pausa
              </Text>
            </View>
            <Switch
              value={settings.focusMode.autoStartFocus}
              onValueChange={(value) => handleToggle('autoStartFocus', value)}
              trackColor={{ false: colors.glass.border, true: colors.accent.primary }}
              thumbColor={colors.text.primary}
            />
          </View>

          <View style={globalStyles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Som</Text>
              <Text style={styles.settingDescription}>
                Toca som ao fim de cada sessão
              </Text>
            </View>
            <Switch
              value={settings.focusMode.soundEnabled}
              onValueChange={(value) => handleToggle('soundEnabled', value)}
              trackColor={{ false: colors.glass.border, true: colors.accent.primary }}
              thumbColor={colors.text.primary}
            />
          </View>

          <View style={globalStyles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Vibração</Text>
              <Text style={styles.settingDescription}>
                Vibra ao fim de cada sessão
              </Text>
            </View>
            <Switch
              value={settings.focusMode.vibrationEnabled}
              onValueChange={(value) => handleToggle('vibrationEnabled', value)}
              trackColor={{ false: colors.glass.border, true: colors.accent.primary }}
              thumbColor={colors.text.primary}
            />
          </View>
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

export default FocusModeSettingsScreen;
