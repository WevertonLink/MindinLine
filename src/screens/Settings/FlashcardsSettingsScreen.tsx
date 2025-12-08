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

const FlashcardsSettingsScreen = ({ navigation }: any) => {
  const { settings, updateSettings, resetSection } = useSettings();

  const [cardsPerSession, setCardsPerSession] = useState(
    settings.flashcards.cardsPerSession.toString()
  );
  const [showAnswerTime, setShowAnswerTime] = useState(
    settings.flashcards.showAnswerTime.toString()
  );
  const [easyBonusDays, setEasyBonusDays] = useState(
    settings.flashcards.easyBonusDays.toString()
  );
  const [hardPenaltyDays, setHardPenaltyDays] = useState(
    settings.flashcards.hardPenaltyDays.toString()
  );

  const handleSave = async () => {
    const cards = parseInt(cardsPerSession);
    const answerTime = parseInt(showAnswerTime);
    const bonusDays = parseInt(easyBonusDays);
    const penaltyDays = parseInt(hardPenaltyDays);

    if (isNaN(cards) || cards < 1 || cards > 100) {
      Alert.alert('Erro', 'Cards por sessão deve estar entre 1 e 100');
      return;
    }
    if (isNaN(answerTime) || answerTime < 0 || answerTime > 10) {
      Alert.alert('Erro', 'Tempo de resposta deve estar entre 0 e 10 segundos');
      return;
    }
    if (isNaN(bonusDays) || bonusDays < 0 || bonusDays > 10) {
      Alert.alert('Erro', 'Bônus (fácil) deve estar entre 0 e 10 dias');
      return;
    }
    if (isNaN(penaltyDays) || penaltyDays < 0 || penaltyDays > 5) {
      Alert.alert('Erro', 'Penalidade (difícil) deve estar entre 0 e 5 dias');
      return;
    }

    try {
      await updateSettings({
        flashcards: {
          cardsPerSession: cards,
          showAnswerTime: answerTime,
          easyBonusDays: bonusDays,
          hardPenaltyDays: penaltyDays,
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
      'Tem certeza que deseja resetar as configurações de Flashcards para os valores padrão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetSection('flashcards');
              setCardsPerSession('20');
              setShowAnswerTime('3');
              setEasyBonusDays('2');
              setHardPenaltyDays('1');
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
    await updateSettings({ flashcards: { [key]: value } });
  };

  return (
    <View style={globalStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sessão de Estudo */}
        <View style={globalStyles.glassCard}>
          <Text style={styles.sectionTitle}>Sessão de Estudo</Text>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cards por sessão</Text>
              <TextInput
                style={styles.input}
                value={cardsPerSession}
                onChangeText={setCardsPerSession}
                keyboardType="numeric"
                maxLength={3}
                placeholder="20"
                placeholderTextColor={colors.text.tertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tempo de resposta (s)</Text>
              <TextInput
                style={styles.input}
                value={showAnswerTime}
                onChangeText={setShowAnswerTime}
                keyboardType="numeric"
                maxLength={2}
                placeholder="3"
                placeholderTextColor={colors.text.tertiary}
              />
            </View>
          </View>

          <View style={styles.infoBox}>
            <Icon name="information-circle-outline" size={16} color={colors.status.info} />
            <Text style={styles.infoText}>
              O tempo de resposta é apenas para mostrar a resposta automaticamente após virar o card.
              Use 0 para desabilitar.
            </Text>
          </View>
        </View>

        {/* Algoritmo de Repetição Espaçada */}
        <View style={globalStyles.glassCard}>
          <Text style={styles.sectionTitle}>Repetição Espaçada (SM-2)</Text>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bônus "Fácil" (dias)</Text>
              <TextInput
                style={styles.input}
                value={easyBonusDays}
                onChangeText={setEasyBonusDays}
                keyboardType="numeric"
                maxLength={2}
                placeholder="2"
                placeholderTextColor={colors.text.tertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Penalidade "Difícil" (dias)</Text>
              <TextInput
                style={styles.input}
                value={hardPenaltyDays}
                onChangeText={setHardPenaltyDays}
                keyboardType="numeric"
                maxLength={1}
                placeholder="1"
                placeholderTextColor={colors.text.tertiary}
              />
            </View>
          </View>

          <View style={styles.infoBox}>
            <Icon name="bulb-outline" size={16} color={colors.status.warning} />
            <Text style={styles.infoText}>
              O algoritmo SM-2 calcula quando você deve revisar cada card. O bônus/penalidade
              ajusta o intervalo baseado na sua avaliação (fácil, bom, difícil).
            </Text>
          </View>
        </View>

        {/* Comportamento */}
        <View style={globalStyles.glassCard}>
          <Text style={styles.sectionTitle}>Comportamento</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Embaralhar cards</Text>
              <Text style={styles.settingDescription}>
                Mistura a ordem dos cards em cada sessão
              </Text>
            </View>
            <Switch
              value={settings.flashcards.shuffleCards}
              onValueChange={(value) => handleToggle('shuffleCards', value)}
              trackColor={{ false: colors.glass.border, true: colors.accent.primary }}
              thumbColor={colors.text.primary}
            />
          </View>

          <View style={globalStyles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Auto-reproduzir áudio</Text>
              <Text style={styles.settingDescription}>
                Reproduz áudio automaticamente ao mostrar o card
              </Text>
            </View>
            <Switch
              value={settings.flashcards.autoPlayAudio}
              onValueChange={(value) => handleToggle('autoPlayAudio', value)}
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

export default FlashcardsSettingsScreen;
