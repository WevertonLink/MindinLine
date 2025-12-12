import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFlashcards } from '../../context/FlashcardsContext';
import DeckCard from '../../components/DeckCard';
import EmptyState from '../../components/EmptyState';
import SearchBar from '../../components/SearchBar';
import HelpButton from '../../components/HelpButton';
import { helpContent } from '../../data/helpContent';
import {
  globalStyles,
  colors,
  spacing,
  borderRadius,
  typography,
} from '../../theme/globalStyles';
import { filterDecksBySearch } from '../../features/flashcards/utils';

const FlashcardsHomeScreen = ({ navigation }: any) => {
  const { decks, stats, loading, deleteDeck } = useFlashcards();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDecks = filterDecksBySearch(decks, searchQuery);

  const handleCreateDeck = useCallback(() => {
    navigation.navigate('CreateDeck');
  }, [navigation]);

  const handleOpenDeck = useCallback((deckId: string) => {
    navigation.navigate('DeckDetail', { deckId });
  }, [navigation]);

  const handleDeleteDeck = useCallback((deckId: string, deckTitle: string) => {
    Alert.alert('Deletar Deck', `Tem certeza que deseja deletar "${deckTitle}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDeck(deckId);
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível deletar o deck');
          }
        },
      },
    ]);
  }, [deleteDeck]);

  // FlatList render functions
  const renderDeckItem = useCallback(({ item: deck }: { item: typeof filteredDecks[0] }) => (
    <DeckCard
      deck={deck}
      onPress={() => handleOpenDeck(deck.id)}
      onLongPress={() => handleDeleteDeck(deck.id, deck.title)}
    />
  ), [handleOpenDeck, handleDeleteDeck]);

  const keyExtractor = useCallback((item: typeof filteredDecks[0]) => item.id, []);

  const renderListHeader = useCallback(() => (
    <>
      {/* Header com stats */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={globalStyles.title}>Flashcards</Text>
          <HelpButton content={helpContent['flashcards.overview'].content} />
        </View>
        <Text style={globalStyles.subtitle}>
          Estude com repetição espaçada inteligente
        </Text>

        {decks.length > 0 && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.statWithHelp}>
                <Text style={styles.statValue}>{stats.totalDecks}</Text>
                <HelpButton
                  content={helpContent['flashcards.stat.total'].content}
                  size={16}
                />
              </View>
              <Text style={styles.statLabel}>Decks</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statWithHelp}>
                <Text style={[styles.statValue, { color: colors.status.warning }]}>
                  {stats.cardsToReviewToday}
                </Text>
                <HelpButton
                  content={helpContent['flashcards.stat.due'].content}
                  size={16}
                />
              </View>
              <Text style={styles.statLabel}>P/ Revisar</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statWithHelp}>
                <Text style={[styles.statValue, { color: colors.status.success }]}>
                  {stats.cardsMastered}
                </Text>
                <HelpButton
                  content={helpContent['flashcards.stat.mastered'].content}
                  size={16}
                />
              </View>
              <Text style={styles.statLabel}>Dominados</Text>
            </View>
          </View>
        )}
      </View>

      {/* Search bar */}
      {decks.length > 0 && (
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar decks..."
        />
      )}
    </>
  ), [decks.length, stats, searchQuery]);

  const renderListEmpty = useCallback(() => {
    if (decks.length > 0) {
      return (
        <EmptyState
          icon="search-outline"
          title="Nenhum resultado"
          message={`Não encontramos decks com "${searchQuery}"`}
        />
      );
    }
    return (
      <EmptyState
        icon="layers-outline"
        title="Nenhum deck criado"
        message="Crie seu primeiro deck de flashcards para começar a memorizar conceitos usando repetição espaçada"
      />
    );
  }, [decks.length, searchQuery]);

  const renderListFooter = useCallback(() => (
    <Pressable
      style={({ pressed }) => [
        globalStyles.buttonPrimary,
        pressed && styles.buttonPressed,
      ]}
      onPress={handleCreateDeck}
    >
      <Icon name="add" size={24} color={colors.text.primary} />
      <Text style={[globalStyles.buttonText, { marginLeft: spacing.sm }]}>
        Criar Novo Deck
      </Text>
    </Pressable>
  ), [handleCreateDeck]);

  if (loading) {
    return (
      <View style={[globalStyles.container, globalStyles.centered]}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
        <Text style={[globalStyles.bodyText, { marginTop: spacing.md }]}>
          Carregando decks...
        </Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={filteredDecks}
        renderItem={renderDeckItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderListEmpty}
        ListFooterComponent={renderListFooter}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />
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
  header: {
    marginBottom: spacing.lg,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statWithHelp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    paddingVertical: spacing.xs,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

export default FlashcardsHomeScreen;
