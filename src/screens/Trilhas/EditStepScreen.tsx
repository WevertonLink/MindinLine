import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTrilhas } from '../../context/TrilhasContext';
import {
  globalStyles,
  colors,
  spacing,
  borderRadius,
  typography,
} from '../../theme/globalStyles';

const EditStepScreen = ({ route, navigation }: any) => {
  const { trilhaId, stepId } = route.params;
  const { obterTrilhaPorId, atualizarEtapa, deletarEtapa } = useTrilhas();

  const trilha = obterTrilhaPorId(trilhaId);
  const step = trilha?.steps.find(s => s.id === stepId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Carregar dados do step
  useEffect(() => {
    if (step) {
      setTitle(step.title);
      setDescription(step.description || '');
      setEstimatedTime(step.estimatedTime ? String(step.estimatedTime) : '');
    }
  }, [step]);

  // Se step não encontrado
  if (!step || !trilha) {
    return (
      <View style={[globalStyles.container, globalStyles.centered]}>
        <Icon name="alert-circle-outline" size={64} color={colors.text.tertiary} />
        <Text style={globalStyles.title}>Etapa não encontrada</Text>
      </View>
    );
  }

  // Handler para salvar
  const handleSave = async () => {
    if (title.trim().length < 3) {
      Alert.alert('Erro', 'O título deve ter no mínimo 3 caracteres');
      return;
    }

    try {
      setIsSaving(true);

      await atualizarEtapa(trilhaId, stepId, {
        title: title.trim(),
        description: description.trim() || undefined,
        estimatedTime: estimatedTime ? parseInt(estimatedTime) : undefined,
      });

      Alert.alert('Sucesso', 'Etapa atualizada com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a etapa');
    } finally {
      setIsSaving(false);
    }
  };

  // Handler para deletar
  const handleDelete = () => {
    Alert.alert(
      'Deletar Etapa',
      `Tem certeza que deseja deletar "${step.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarEtapa(trilhaId, stepId);
              Alert.alert('Sucesso', 'Etapa deletada com sucesso!');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar a etapa');
            }
          },
        },
      ]
    );
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
        {/* Título */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Título <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Estudar fundamentos"
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
            placeholder="Descreva o que precisa ser feito..."
            placeholderTextColor={colors.text.tertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={300}
            textAlignVertical="top"
          />
          <Text style={styles.helperText}>
            {description.length}/300 caracteres
          </Text>
        </View>

        {/* Tempo estimado */}
        <View style={styles.section}>
          <Text style={styles.label}>Tempo estimado (minutos)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 60"
            placeholderTextColor={colors.text.tertiary}
            value={estimatedTime}
            onChangeText={setEstimatedTime}
            keyboardType="numeric"
            maxLength={4}
          />
        </View>

        {/* Botão de deletar */}
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Icon name="trash-outline" size={20} color={colors.status.error} />
          <Text style={styles.deleteButtonText}>Deletar Etapa</Text>
        </Pressable>
      </ScrollView>

      {/* Footer com botões */}
      <View style={styles.footer}>
        <Pressable
          style={[globalStyles.buttonSecondary, styles.button]}
          onPress={() => navigation.goBack()}
          disabled={isSaving}
        >
          <Text style={globalStyles.buttonText}>Cancelar</Text>
        </Pressable>

        <Pressable
          style={[
            globalStyles.buttonPrimary,
            styles.button,
            isSaving && styles.buttonDisabled,
          ]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Icon name="checkmark" size={20} color={colors.text.primary} />
          <Text style={[globalStyles.buttonText, { marginLeft: spacing.xs }]}>
            {isSaving ? 'Salvando...' : 'Salvar'}
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  deleteButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.status.error,
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
});

export default EditStepScreen;
