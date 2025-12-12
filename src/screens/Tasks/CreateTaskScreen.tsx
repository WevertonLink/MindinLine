import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTasks } from '../../context/TasksContext';
import { TaskPriority, TaskCategory, RecurrenceType } from '../../features/tasks/types';
import { validateTitle, translatePriority, translateCategory, parseBrazilianDate } from '../../features/tasks/utils';
import {
  globalStyles,
  colors,
  spacing,
  borderRadius,
  typography,
} from '../../theme/globalStyles';

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
const CATEGORIES: TaskCategory[] = ['work', 'study', 'personal', 'health', 'finance', 'home', 'other'];

const CreateTaskScreen = ({ navigation }: any) => {
  const { createTask } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority>('medium');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | undefined>();
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Recurrence states
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('daily');
  const [recurrenceInterval, setRecurrenceInterval] = useState('1');

  const handleCreate = async () => {
    if (!validateTitle(title)) {
      Alert.alert('Erro', 'O título deve ter no mínimo 3 caracteres');
      return;
    }

    if (isRecurring && !dueDate) {
      Alert.alert('Erro', 'Tarefas recorrentes precisam de uma data de vencimento');
      return;
    }

    // Converter data brasileira para ISO
    let dueDateISO: string | undefined = undefined;
    if (dueDate) {
      const parsed = parseBrazilianDate(dueDate);
      if (!parsed) {
        Alert.alert('Erro', 'Data inválida. Use o formato DD/MM/AAAA (ex: 31/12/2025)');
        return;
      }
      dueDateISO = parsed;
    }

    try {
      setIsCreating(true);

      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority: selectedPriority,
        category: selectedCategory,
        dueDate: dueDateISO,
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
        isRecurring,
        recurrence: isRecurring ? {
          type: recurrenceType,
          interval: parseInt(recurrenceInterval) || 1,
        } : undefined,
      });

      Alert.alert('Sucesso', isRecurring ? 'Tarefa recorrente criada com sucesso!' : 'Tarefa criada com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a tarefa');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={globalStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={globalStyles.title}>Criar Nova Tarefa</Text>
          <Text style={globalStyles.subtitle}>
            Organize suas atividades com foco e produtividade
          </Text>
        </View>

        {/* Título */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Título <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Revisar flashcards de inglês"
            placeholderTextColor={colors.text.tertiary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Text style={styles.helperText}>{title.length}/100 caracteres</Text>
        </View>

        {/* Descrição */}
        <View style={styles.section}>
          <Text style={styles.label}>Descrição (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descreva os detalhes desta tarefa..."
            placeholderTextColor={colors.text.tertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.helperText}>{description.length}/500 caracteres</Text>
        </View>

        {/* Prioridade */}
        <View style={styles.section}>
          <Text style={styles.label}>Prioridade</Text>
          <View style={styles.priorityGrid}>
            {PRIORITIES.map(priority => {
              const isSelected = selectedPriority === priority;
              return (
                <Pressable
                  key={priority}
                  style={[
                    styles.priorityChip,
                    isSelected && styles.priorityChipSelected,
                  ]}
                  onPress={() => setSelectedPriority(priority)}
                >
                  <Text
                    style={[
                      styles.priorityChipText,
                      isSelected && styles.priorityChipTextSelected,
                    ]}
                  >
                    {translatePriority(priority)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Categoria */}
        <View style={styles.section}>
          <Text style={styles.label}>Categoria (opcional)</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(category => {
              const isSelected = selectedCategory === category;
              return (
                <Pressable
                  key={category}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipSelected,
                  ]}
                  onPress={() =>
                    setSelectedCategory(isSelected ? undefined : category)
                  }
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextSelected,
                    ]}
                  >
                    {translateCategory(category)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Data de vencimento */}
        <View style={styles.section}>
          <Text style={styles.label}>Data de Vencimento (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={colors.text.tertiary}
            value={dueDate}
            onChangeText={setDueDate}
            keyboardType="numeric"
            maxLength={10}
          />
          <Text style={styles.helperText}>Formato: DD/MM/AAAA</Text>
        </View>

        {/* Tempo estimado */}
        <View style={styles.section}>
          <Text style={styles.label}>Tempo Estimado (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 60"
            placeholderTextColor={colors.text.tertiary}
            value={estimatedMinutes}
            onChangeText={setEstimatedMinutes}
            keyboardType="numeric"
            maxLength={4}
          />
          <Text style={styles.helperText}>Em minutos</Text>
        </View>

        {/* Recorrência */}
        <View style={styles.section}>
          <View style={styles.recurrenceHeader}>
            <Icon name="repeat-outline" size={20} color={colors.accent.primary} />
            <Text style={styles.label}>Tarefa Recorrente</Text>
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
              trackColor={{ false: colors.glass.border, true: colors.accent.primary }}
              thumbColor={colors.text.primary}
            />
          </View>

          {isRecurring && (
            <View style={styles.recurrenceConfig}>
              {/* Tipo de recorrência */}
              <View style={styles.recurrenceRow}>
                <Text style={styles.recurrenceLabel}>Repetir:</Text>
                <View style={styles.recurrenceTypeButtons}>
                  {(['daily', 'weekly', 'monthly'] as RecurrenceType[]).map(type => (
                    <Pressable
                      key={type}
                      style={[
                        styles.recurrenceTypeButton,
                        recurrenceType === type && styles.recurrenceTypeButtonSelected,
                      ]}
                      onPress={() => setRecurrenceType(type)}
                    >
                      <Text style={[
                        styles.recurrenceTypeText,
                        recurrenceType === type && styles.recurrenceTypeTextSelected,
                      ]}>
                        {type === 'daily' ? 'Diário' : type === 'weekly' ? 'Semanal' : 'Mensal'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Intervalo */}
              <View style={styles.recurrenceRow}>
                <Text style={styles.recurrenceLabel}>A cada:</Text>
                <View style={styles.intervalContainer}>
                  <TextInput
                    style={styles.intervalInput}
                    value={recurrenceInterval}
                    onChangeText={setRecurrenceInterval}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <Text style={styles.intervalUnit}>
                    {recurrenceType === 'daily' ? 'dia(s)' :
                     recurrenceType === 'weekly' ? 'semana(s)' : 'mês(es)'}
                  </Text>
                </View>
              </View>

              <Text style={styles.helperText}>
                Nova tarefa será criada automaticamente ao concluir esta
              </Text>
            </View>
          )}
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Icon name="information-circle-outline" size={20} color={colors.accent.primary} />
          <Text style={styles.infoText}>
            Após criar a tarefa, você poderá adicionar subtarefas e iniciar sessões de foco Pomodoro
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          style={[globalStyles.buttonSecondary, styles.button]}
          onPress={() => navigation.goBack()}
          disabled={isCreating}
        >
          <Text style={globalStyles.buttonText}>Cancelar</Text>
        </Pressable>

        <Pressable
          style={[
            globalStyles.buttonPrimary,
            styles.button,
            isCreating && styles.buttonDisabled,
          ]}
          onPress={handleCreate}
          disabled={isCreating}
        >
          <Icon name="checkmark" size={20} color={colors.text.primary} />
          <Text style={[globalStyles.buttonText, { marginLeft: spacing.xs }]}>
            {isCreating ? 'Criando...' : 'Criar Tarefa'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
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
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.status.error,
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
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.md,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  priorityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  priorityChip: {
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  priorityChipSelected: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  priorityChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  priorityChipTextSelected: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  categoryChipSelected: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  categoryChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  categoryChipTextSelected: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    padding: spacing.md,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * 1.4,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
    backgroundColor: colors.background.primary,
  },
  button: {
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  recurrenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  recurrenceConfig: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
  },
  recurrenceRow: {
    marginBottom: spacing.md,
  },
  recurrenceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  recurrenceTypeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  recurrenceTypeButton: {
    flex: 1,
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  recurrenceTypeButtonSelected: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  recurrenceTypeText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  recurrenceTypeTextSelected: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  intervalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  intervalInput: {
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    width: 60,
    textAlign: 'center',
  },
  intervalUnit: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
});

export default CreateTaskScreen;
