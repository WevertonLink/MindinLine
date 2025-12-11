import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Share,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  pick,
  keepLocalCopy,
  types as DocumentPickerTypes,
} from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import { useFlashcards } from '../../context/FlashcardsContext';
import EmptyState from '../../components/EmptyState';
import {
  globalStyles,
  colors,
  spacing,
  borderRadius,
  typography,
} from '../../theme/globalStyles';
import { formatRelativeDate, getCardsToStudy } from '../../features/flashcards/utils';

const DeckDetailScreen = ({ route, navigation }: any) => {
  const { deckId } = route.params;
  const { getDeckById, deleteDeck, deleteFlashcard, exportDeck, importDeck } = useFlashcards();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const deck = getDeckById(deckId);

  // Se deck não encontrado
  if (!deck) {
    return (
      <View style={[globalStyles.container, globalStyles.centered]}>
        <EmptyState
          icon="alert-circle-outline"
          title="Deck não encontrado"
          message="Este deck pode ter sido removido"
        />
      </View>
    );
  }

  const cardsToStudy = getCardsToStudy(deck);

  // Handler para deletar deck
  const handleDeleteDeck = () => {
    Alert.alert(
      'Deletar Deck',
      `Tem certeza que deseja deletar "${deck.title}"? Todos os ${deck.totalCards} flashcards serão removidos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDeck(deckId);
              Alert.alert('Sucesso', 'Deck deletado com sucesso!');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar o deck');
            }
          },
        },
      ]
    );
  };

  // Handler para deletar flashcard
  const handleDeleteCard = (cardId: string, cardFront: string) => {
    Alert.alert(
      'Deletar Flashcard',
      `Tem certeza que deseja deletar este flashcard?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFlashcard(deckId, cardId);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar o flashcard');
            }
          },
        },
      ]
    );
  };

  // Handler para iniciar estudo
  const handleStartStudy = () => {
    if (cardsToStudy.length === 0) {
      Alert.alert('Atenção', 'Não há flashcards para estudar agora');
      return;
    }

    navigation.navigate('StudyMode', { deckId });
  };

  // Handler para exportar deck
  const handleExportDeck = async () => {
    try {
      setExporting(true);

      // 1. Gerar JSON do deck
      const deckData = await exportDeck(deckId);

      // 2. Criar nome do arquivo
      const sanitizedTitle = deck.title
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();
      const filename = `${sanitizedTitle}_deck_${Date.now()}.json`;

      // 3. Pedir permissão (Android 10+)
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Permissão de Armazenamento',
            message: 'MindinLine precisa salvar o arquivo exportado',
            buttonPositive: 'OK',
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error('Permissão de armazenamento negada');
        }
      }

      // 4. Salvar em Downloads
      const path = `${RNFS.DownloadDirectoryPath}/${filename}`;
      await RNFS.writeFile(path, deckData, 'utf8');

      // 5. Sucesso
      Alert.alert(
        'Deck Exportado!',
        `Deck "${deck.title}" salvo em:\nDownloads/${filename}\n\n${deck.totalCards} cards exportados`,
        [{ text: 'OK' }]
      );

      console.log('Deck exportado:', { deckId, filename, path });
    } catch (error: any) {
      console.error('Erro ao exportar deck:', error);
      Alert.alert('Erro', error.message || 'Não foi possível exportar o deck');
    } finally {
      setExporting(false);
    }
  };

  // Handler para importar deck
  const handleImportDeck = async () => {
    try {
      setImporting(true);

      // 1. Pick retorna ARRAY agora (API v11)
      const [file] = await pick({
        type: [DocumentPickerTypes.allFiles],
      });

      // 2. Fazer cópia local explicitamente
      const [localCopy] = await keepLocalCopy({
        files: [{
          uri: file.uri,
          fileName: file.name || 'imported-deck.json',
        }],
        destination: 'cachesDirectory',
      });

      // 3. Ler da cópia local
      const fileContent = await RNFS.readFile(localCopy.uri, 'utf8');

      // 4. Validar estrutura antes de importar
      const data = JSON.parse(fileContent);
      if (!data.version || !data.deck) {
        throw new Error('Arquivo inválido ou corrompido');
      }

      // 5. Importar
      await importDeck(fileContent);

      Alert.alert(
        'Sucesso!',
        `Deck "${data.deck.title}" importado com ${data.deck.flashcards.length} cards`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('FlashcardsHome'),
          },
        ]
      );
    } catch (error: any) {
      // Usuário cancelou
      if (error.message === 'User canceled document picker') {
        return;
      }

      console.error('Erro ao importar deck:', error);
      Alert.alert(
        'Erro',
        error.message || 'Não foi possível importar o deck. Verifique se o arquivo é válido.'
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header do deck */}
        <View style={globalStyles.glassCard}>
          <Text style={styles.deckTitle}>{deck.title}</Text>

          {deck.description && (
            <Text style={styles.deckDescription}>{deck.description}</Text>
          )}

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Icon name="albums-outline" size={24} color={colors.accent.primary} />
              <Text style={styles.statNumber}>{deck.totalCards}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>

            <View style={styles.statCard}>
              <Icon name="eye-outline" size={24} color={colors.status.info} />
              <Text style={styles.statNumber}>{deck.newCards}</Text>
              <Text style={styles.statLabel}>Novos</Text>
            </View>

            <View style={styles.statCard}>
              <Icon name="school-outline" size={24} color={colors.status.warning} />
              <Text style={styles.statNumber}>{deck.learningCards}</Text>
              <Text style={styles.statLabel}>Aprendendo</Text>
            </View>

            <View style={styles.statCard}>
              <Icon name="checkmark-done-outline" size={24} color={colors.status.success} />
              <Text style={styles.statNumber}>{deck.masteredCards}</Text>
              <Text style={styles.statLabel}>Dominados</Text>
            </View>
          </View>

          {/* Review status */}
          {deck.reviewCards > 0 && (
            <View style={styles.reviewAlert}>
              <Icon name="time-outline" size={20} color={colors.status.warning} />
              <Text style={styles.reviewAlertText}>
                {deck.reviewCards} card{deck.reviewCards !== 1 ? 's' : ''} para revisar hoje
              </Text>
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <Pressable
              style={[globalStyles.buttonPrimary, styles.actionButton]}
              onPress={handleStartStudy}
              disabled={cardsToStudy.length === 0}
            >
              <Icon name="play" size={20} color={colors.text.primary} />
              <Text style={[globalStyles.buttonText, { marginLeft: spacing.xs }]}>
                Estudar {cardsToStudy.length > 0 ? `(${cardsToStudy.length})` : ''}
              </Text>
            </Pressable>

            <Pressable
              style={[globalStyles.buttonSecondary, styles.actionButton]}
              onPress={() => navigation.navigate('AddCard', { deckId })}
            >
              <Icon name="add" size={20} color={colors.text.primary} />
              <Text style={[globalStyles.buttonText, { marginLeft: spacing.xs }]}>
                Adicionar Card
              </Text>
            </Pressable>
          </View>

          {/* Export/Import buttons */}
          <View style={styles.secondaryButtons}>
            <Pressable
              style={[globalStyles.buttonSecondary, styles.secondaryButton]}
              onPress={handleExportDeck}
              disabled={exporting}
            >
              <Icon name="download-outline" size={18} color={colors.text.secondary} />
              <Text style={[globalStyles.buttonTextSecondary, { marginLeft: spacing.xs }]}>
                {exporting ? 'Exportando...' : 'Exportar'}
              </Text>
            </Pressable>

            <Pressable
              style={[globalStyles.buttonSecondary, styles.secondaryButton]}
              onPress={handleImportDeck}
              disabled={importing}
            >
              <Icon name="cloud-upload-outline" size={18} color={colors.text.secondary} />
              <Text style={[globalStyles.buttonTextSecondary, { marginLeft: spacing.xs }]}>
                {importing ? 'Importando...' : 'Importar'}
              </Text>
            </Pressable>

            <Pressable
              style={[globalStyles.buttonSecondary, styles.secondaryButton]}
              onPress={handleDeleteDeck}
            >
              <Icon name="trash-outline" size={18} color={colors.status.error} />
              <Text style={[globalStyles.buttonTextSecondary, { marginLeft: spacing.xs, color: colors.status.error }]}>
                Deletar
              </Text>
            </Pressable>
          </View>

          {/* Last studied */}
          {deck.lastStudiedAt && (
            <Text style={styles.lastStudied}>
              Último estudo: {formatRelativeDate(deck.lastStudiedAt)}
            </Text>
          )}
        </View>

        {/* Flashcards List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flashcards ({deck.totalCards})</Text>

          {deck.flashcards.length > 0 ? (
            deck.flashcards.map(card => (
              <View key={card.id} style={styles.cardItem}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardFront} numberOfLines={2}>
                    {card?.front || 'Sem conteúdo'}
                  </Text>
                  <Text style={styles.cardBack} numberOfLines={1}>
                    {card?.back || 'Sem conteúdo'}
                  </Text>
                  {card.repetitions > 0 && (
                    <View style={styles.cardStats}>
                      <Icon name="repeat-outline" size={14} color={colors.text.tertiary} />
                      <Text style={styles.cardStatsText}>
                        {card.repetitions}x revisões
                      </Text>
                    </View>
                  )}
                </View>

                <Pressable
                  style={styles.deleteCardButton}
                  onPress={() => handleDeleteCard(card.id, card?.front || 'Card')}
                >
                  <Icon name="trash-outline" size={20} color={colors.status.error} />
                </Pressable>
              </View>
            ))
          ) : (
            <EmptyState
              icon="albums-outline"
              title="Nenhum flashcard"
              message="Adicione flashcards para começar a estudar"
            />
          )}
        </View>

        {/* Delete Deck */}
        <Pressable style={styles.deleteButton} onPress={handleDeleteDeck}>
          <Icon name="trash-outline" size={20} color={colors.status.error} />
          <Text style={styles.deleteButtonText}>Deletar Deck</Text>
        </Pressable>
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
  deckTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  deckDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    lineHeight: typography.fontSize.base * 1.5,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  reviewAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  reviewAlertText: {
    fontSize: typography.fontSize.sm,
    color: colors.status.warning,
    fontWeight: typography.fontWeight.medium,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  lastStudied: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardContent: {
    flex: 1,
  },
  cardFront: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  cardBack: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardStatsText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  deleteCardButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
});

export default DeckDetailScreen;
