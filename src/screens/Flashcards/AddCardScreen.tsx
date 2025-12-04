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
import { validateFlashcard } from '../../features/flashcards/utils';
import {
  globalStyles,
  colors,
  spacing,
  borderRadius,
  typography,
} from '../../theme/globalStyles';

const AddCardScreen = ({ route, navigation }: any) => {
  const { deckId } = route.params;
  const { getDeckById, addFlashcard } = useFlashcards();

  const deck = getDeckById(deckId);

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addMore, setAddMore] = useState(true);

  // Se deck não encontrado
  if (!deck) {
    return (
      <View style={[globalStyles.container, globalStyles.centered]}>
        <Icon name="alert-circle-outline" size={64} color={colors.text.tertiary} />
        <Text style={globalStyles.title}>Deck não encontrado</Text>
      </View>
    );
  }

  // Handler para adicionar flashcard
  const handleAdd = async () => {
    // Validar flashcard
    if (!validateFlashcard(front, back)) {
      Alert.alert('Erro', 'Preencha a frente e o verso do flashcard');
      return;
    }

    try {
      setIsAdding(true);

      await addFlashcard(deckId, {
        front: front.trim(),
        back: back.trim(),
      });

      // Se addMore estiver habilitado, limpar form e continuar
      if (addMore) {
        setFront('');
        setBack('');
        Alert.alert('Sucesso', 'Flashcard adicionado! Adicione mais um.');
      } else {
        Alert.alert('Sucesso', 'Flashcard adicionado com sucesso!');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar o flashcard');
    } finally {
      setIsAdding(false);
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
          <Text style={globalStyles.title}>Adicionar Flashcard</Text>
          <Text style={globalStyles.subtitle}>Deck: {deck.title}</Text>
        </View>

        {/* Preview Card (visual) */}
        <View style={styles.previewCard}>
          <View style={styles.previewSide}>
            <Text style={styles.previewLabel}>FRENTE</Text>
            <Text style={styles.previewText} numberOfLines={3}>
              {front || 'Pergunta / Termo'}
            </Text>
          </View>
          <Icon name="swap-horizontal" size={24} color={colors.accent.primary} />
          <View style={styles.previewSide}>
            <Text style={styles.previewLabel}>VERSO</Text>
            <Text style={styles.previewText} numberOfLines={3}>
              {back || 'Resposta / Definição'}
            </Text>
          </View>
        </View>

        {/* Frente */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Frente (Pergunta) <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ex: What is React Native?"
            placeholderTextColor={colors.text.tertiary}
            value={front}
            onChangeText={setFront}
            multiline
            numberOfLines={3}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.helperText}>{front.length}/500 caracteres</Text>
        </View>

        {/* Verso */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Verso (Resposta) <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ex: A framework for building native mobile apps using React"
            placeholderTextColor={colors.text.tertiary}
            value={back}
            onChangeText={setBack}
            multiline
            numberOfLines={3}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.helperText}>{back.length}/500 caracteres</Text>
        </View>

        {/* Toggle: Adicionar mais */}
        <Pressable
          style={styles.toggleButton}
          onPress={() => setAddMore(!addMore)}
        >
          <Icon
            name={addMore ? 'checkbox' : 'square-outline'}
            size={24}
            color={addMore ? colors.accent.primary : colors.text.tertiary}
          />
          <Text style={styles.toggleText}>
            Adicionar mais flashcards após salvar
          </Text>
        </Pressable>

        {/* Info */}
        <View style={styles.infoBox}>
          <Icon name="bulb-outline" size={20} color={colors.status.info} />
          <Text style={styles.infoText}>
            Use frases curtas e objetivas para melhor memorização
          </Text>
        </View>
      </ScrollView>

      {/* Footer com botões */}
      <View style={styles.footer}>
        <Pressable
          style={[globalStyles.buttonSecondary, styles.button]}
          onPress={() => navigation.goBack()}
          disabled={isAdding}
        >
          <Text style={globalStyles.buttonText}>Cancelar</Text>
        </Pressable>

        <Pressable
          style={[
            globalStyles.buttonPrimary,
            styles.button,
            isAdding && styles.buttonDisabled,
          ]}
          onPress={handleAdd}
          disabled={isAdding}
        >
          <Icon name="checkmark" size={20} color={colors.text.primary} />
          <Text style={[globalStyles.buttonText, { marginLeft: spacing.xs }]}>
            {isAdding ? 'Adicionando...' : addMore ? 'Adicionar Mais' : 'Adicionar'}
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
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  previewSide: {
    flex: 1,
  },
  previewLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.accent.primary,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  previewText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
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
    minHeight: 80,
    paddingTop: spacing.md,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  toggleText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
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

export default AddCardScreen;
