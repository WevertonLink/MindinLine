import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTrilhas } from '../../context/TrilhasContext';
import { Material, MaterialType } from '../../features/trilhas/types';
import EmptyState from '../../components/EmptyState';
import {
  globalStyles,
  colors,
  spacing,
  borderRadius,
  typography,
} from '../../theme/globalStyles';
import { formatTime } from '../../features/trilhas/utils';

const MATERIAL_TYPES: { value: MaterialType; label: string; icon: string }[] = [
  { value: 'video', label: 'Vídeo', icon: 'play-circle-outline' },
  { value: 'article', label: 'Artigo', icon: 'document-text-outline' },
  { value: 'book', label: 'Livro', icon: 'book-outline' },
  { value: 'pdf', label: 'PDF', icon: 'document-outline' },
  { value: 'link', label: 'Link', icon: 'link-outline' },
  { value: 'note', label: 'Nota', icon: 'create-outline' },
  { value: 'other', label: 'Outro', icon: 'ellipsis-horizontal-outline' },
];

const StepDetailScreen = ({ route, navigation }: any) => {
  const { trilhaId, stepId } = route.params;
  const {
    obterTrilhaPorId,
    toggleEtapaConclusao,
    adicionarMaterial,
    deletarMaterial,
  } = useTrilhas();

  const trilha = obterTrilhaPorId(trilhaId);
  const step = trilha?.steps.find(s => s.id === stepId);

  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialUrl, setMaterialUrl] = useState('');
  const [materialNotes, setMaterialNotes] = useState('');
  const [materialType, setMaterialType] = useState<MaterialType>('article');
  const [isAdding, setIsAdding] = useState(false);

  // Se step não encontrado
  if (!step || !trilha) {
    return (
      <View style={[globalStyles.container, globalStyles.centered]}>
        <EmptyState
          icon="alert-circle-outline"
          title="Etapa não encontrada"
          message="Esta etapa pode ter sido removida"
        />
      </View>
    );
  }

  // Handler para toggle completion
  const handleToggle = async () => {
    try {
      await toggleEtapaConclusao(trilhaId, stepId);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a etapa');
    }
  };

  // Handler para adicionar material
  const handleAddMaterial = async () => {
    if (materialTitle.trim().length < 3) {
      Alert.alert('Erro', 'O título deve ter no mínimo 3 caracteres');
      return;
    }

    try {
      setIsAdding(true);

      await adicionarMaterial(trilhaId, stepId, {
        title: materialTitle.trim(),
        type: materialType,
        url: materialUrl.trim() || undefined,
        notes: materialNotes.trim() || undefined,
      });

      // Reset form
      setMaterialTitle('');
      setMaterialUrl('');
      setMaterialNotes('');
      setMaterialType('article');
      setShowAddMaterialModal(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar o material');
    } finally {
      setIsAdding(false);
    }
  };

  // Handler para deletar material
  const handleDeleteMaterial = (material: Material) => {
    Alert.alert(
      'Deletar Material',
      `Tem certeza que deseja deletar "${material.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarMaterial(trilhaId, stepId, material.id);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar o material');
            }
          },
        },
      ]
    );
  };

  // Handler para abrir URL
  const handleOpenUrl = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o link');
      }
    } catch (error) {
      Alert.alert('Erro', 'URL inválida');
    }
  };

  // Helper para obter ícone do tipo de material
  const getMaterialIcon = (type: MaterialType) => {
    return MATERIAL_TYPES.find(t => t.value === type)?.icon || 'link-outline';
  };

  return (
    <View style={globalStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header da etapa */}
        <View style={globalStyles.glassCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepInfo}>
              <Text style={styles.orderNumber}>Etapa {step.order + 1}</Text>
              <Text style={styles.stepTitle}>{step.title}</Text>
            </View>

            <Pressable
              style={[styles.checkbox, step.completed && styles.checkboxCompleted]}
              onPress={handleToggle}
            >
              {step.completed && (
                <Icon name="checkmark" size={20} color={colors.text.primary} />
              )}
            </Pressable>
          </View>

          {step.description && (
            <Text style={styles.stepDescription}>{step.description}</Text>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            {step.estimatedTime && (
              <View style={styles.statItem}>
                <Icon name="time-outline" size={16} color={colors.text.tertiary} />
                <Text style={styles.statText}>
                  {formatTime(step.estimatedTime)}
                </Text>
              </View>
            )}

            <View style={styles.statItem}>
              <Icon name="link-outline" size={16} color={colors.text.tertiary} />
              <Text style={styles.statText}>
                {step.materials.length} material
                {step.materials.length !== 1 ? 'is' : ''}
              </Text>
            </View>
          </View>

          {/* Botão de editar */}
          <Pressable
            style={styles.editButton}
            onPress={() =>
              navigation.navigate('EditStep', { trilhaId, stepId })
            }
          >
            <Icon name="create-outline" size={18} color={colors.accent.primary} />
            <Text style={styles.editButtonText}>Editar Etapa</Text>
          </Pressable>
        </View>

        {/* Materiais */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Materiais de Estudo</Text>
            <Pressable
              style={styles.addButton}
              onPress={() => setShowAddMaterialModal(true)}
            >
              <Icon name="add-circle" size={24} color={colors.accent.primary} />
            </Pressable>
          </View>

          {step.materials.length > 0 ? (
            step.materials.map(material => (
              <View key={material.id} style={styles.materialCard}>
                <View style={styles.materialHeader}>
                  <Icon
                    name={getMaterialIcon(material.type)}
                    size={24}
                    color={colors.accent.primary}
                  />
                  <View style={styles.materialInfo}>
                    <Text style={styles.materialTitle}>{material.title}</Text>
                    <Text style={styles.materialType}>
                      {MATERIAL_TYPES.find(t => t.value === material.type)?.label}
                    </Text>
                  </View>
                </View>

                {material.notes && (
                  <Text style={styles.materialNotes}>{material.notes}</Text>
                )}

                <View style={styles.materialActions}>
                  {material.url && (
                    <Pressable
                      style={styles.materialButton}
                      onPress={() => handleOpenUrl(material.url!)}
                    >
                      <Icon
                        name="open-outline"
                        size={18}
                        color={colors.accent.primary}
                      />
                      <Text style={styles.materialButtonText}>Abrir</Text>
                    </Pressable>
                  )}

                  <Pressable
                    style={styles.materialButton}
                    onPress={() => handleDeleteMaterial(material)}
                  >
                    <Icon
                      name="trash-outline"
                      size={18}
                      color={colors.status.error}
                    />
                    <Text
                      style={[
                        styles.materialButtonText,
                        { color: colors.status.error },
                      ]}
                    >
                      Deletar
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))
          ) : (
            <EmptyState
              icon="folder-open-outline"
              title="Nenhum material"
              message="Adicione materiais de estudo para esta etapa"
            />
          )}
        </View>
      </ScrollView>

      {/* Modal de adicionar material */}
      <Modal
        visible={showAddMaterialModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddMaterialModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Material</Text>
              <Pressable onPress={() => setShowAddMaterialModal(false)}>
                <Icon name="close" size={24} color={colors.text.primary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Título */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>
                  Título <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Tutorial React Native"
                  placeholderTextColor={colors.text.tertiary}
                  value={materialTitle}
                  onChangeText={setMaterialTitle}
                  maxLength={100}
                />
              </View>

              {/* Tipo */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Tipo</Text>
                <View style={styles.typeGrid}>
                  {MATERIAL_TYPES.map(type => (
                    <Pressable
                      key={type.value}
                      style={[
                        styles.typeChip,
                        materialType === type.value && styles.typeChipSelected,
                      ]}
                      onPress={() => setMaterialType(type.value)}
                    >
                      <Icon
                        name={type.icon}
                        size={20}
                        color={
                          materialType === type.value
                            ? colors.text.primary
                            : colors.text.secondary
                        }
                      />
                      <Text
                        style={[
                          styles.typeChipText,
                          materialType === type.value &&
                            styles.typeChipTextSelected,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* URL */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>URL (opcional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://..."
                  placeholderTextColor={colors.text.tertiary}
                  value={materialUrl}
                  onChangeText={setMaterialUrl}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>

              {/* Notas */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Notas (opcional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Anotações sobre este material..."
                  placeholderTextColor={colors.text.tertiary}
                  value={materialNotes}
                  onChangeText={setMaterialNotes}
                  multiline
                  numberOfLines={3}
                  maxLength={300}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            {/* Botões */}
            <View style={styles.modalFooter}>
              <Pressable
                style={[globalStyles.buttonSecondary, styles.modalButton]}
                onPress={() => setShowAddMaterialModal(false)}
              >
                <Text style={globalStyles.buttonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[globalStyles.buttonPrimary, styles.modalButton]}
                onPress={handleAddMaterial}
                disabled={isAdding}
              >
                <Text style={globalStyles.buttonText}>
                  {isAdding ? 'Adicionando...' : 'Adicionar'}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  stepInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  orderNumber: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.accent.primary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  stepTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    lineHeight: typography.fontSize['2xl'] * 1.3,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  stepDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.5,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  editButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.accent.primary,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  addButton: {
    padding: spacing.xs,
  },
  materialCard: {
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  materialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  materialInfo: {
    flex: 1,
  },
  materialTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: 2,
  },
  materialType: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  materialNotes: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * 1.4,
    marginBottom: spacing.sm,
  },
  materialActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  materialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  materialButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.accent.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  modalSection: {
    marginBottom: spacing.lg,
  },
  modalLabel: {
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  typeChipSelected: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  typeChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  typeChipTextSelected: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
  },
});

export default StepDetailScreen;
