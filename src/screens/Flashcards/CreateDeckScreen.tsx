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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFlashcards } from '../../context/FlashcardsContext';
import { DeckCategory } from '../../features/flashcards/types';
import { validateTitle, translateCategory } from '../../features/flashcards/utils';
import {
  globalStyles,
  colors,
  spacing,
  borderRadius,
  typography,
} from '../../theme/globalStyles';

const CATEGORIES: DeckCategory[] = [
  'language',
  'programming',
  'science',
  'math',
  'history',
  'general',
  'other',
];

const CreateDeckScreen = ({ navigation }: any) => {
  const { createDeck } = useFlashcards();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DeckCategory | undefined>();
  const [isCreating, setIsCreating] = useState(false);

  // Handler para criar deck
  const handleCreate = async () => {
    // Validar título
    if (!validateTitle(title)) {
      Alert.alert('Erro', 'O título deve ter no mínimo 3 caracteres');
      return;
    }

    try {
      setIsCreating(true);

      const newDeck = await createDeck({
        title: title.trim(),
        description: description.trim() || undefined,
        category: selectedCategory,
      });

      Alert.alert('Sucesso', 'Deck criado com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar o deck');
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
          <Text style={globalStyles.title}>Criar Novo Deck</Text>
          <Text style={globalStyles.subtitle}>
            Organize seus flashcards por temas de estudo
          </Text>
        </View>

        {/* Título */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Título <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Vocabulário Inglês"
            placeholderTextColor={colors.text.tertiary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Text style={styles.helperText}>
            {title.length}/100 caracteres
          </Text>
        </View>

        {/* Descrição */}
        <View style={styles.section}>
          <Text style={styles.label}>Descrição (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descreva o conteúdo deste deck..."
            placeholderTextColor={colors.text.tertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.helperText}>
            {description.length}/500 caracteres
          </Text>
        </View>

        {/* Categoria */}
        <View style={styles.section}>
          <Text style={styles.label}>Categoria (opcional)</Text>
          <View style={styles.categoriesGrid}>
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
                    setSelectedCategory(
                      isSelected ? undefined : category
                    )
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

        {/* Info box */}
        <View style={styles.infoBox}>
          <Icon name="information-circle-outline" size={20} color={colors.accent.primary} />
          <Text style={styles.infoText}>
            Após criar o deck, você poderá adicionar flashcards para começar a estudar
          </Text>
        </View>
      </ScrollView>

      {/* Footer com botões */}
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
            {isCreating ? 'Criando...' : 'Criar Deck'}
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
  categoriesGrid: {
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
});

export default CreateDeckScreen;
