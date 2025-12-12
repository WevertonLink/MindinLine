import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFlashcards } from '../../context/FlashcardsContext';
import DeckCard from '../../components/DeckCard';
import { Button, Card, SectionHeader } from '../../components';
import EmptyState from '../../components/EmptyState';
import SearchBar from '../../components/SearchBar';
import HelpButton from '../../components/HelpButton';
import { helpContent } from '../../data/helpContent';
import { errorMessages, confirmMessages } from '../../utils/messages';
import {
  globalStyles,
  colors,
  spacing,
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
    const deleteConfirm = confirmMessages.delete.deck(deckTitle);

    Alert.alert(
      deleteConfirm.title,
      deleteConfirm.message,
      [
        { text: deleteConfirm.cancelText, style: 'cancel' },
        {
          text: deleteConfirm.confirmText,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDeck(deckId);
            } catch (error) {
              Alert.alert(
                errorMessages.flashcards.deleteDeck.title,
                errorMessages.flashcards.deleteDeck.message
              );
            }
          },
        },
      ]
    );
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
      {/* Header */}
      <SectionHeader
        title="Flashcards"
        subtitle="Estude com repetição espaçada inteligente"
        icon="layers-outline"
        helpContent={helpContent['flashcards.overview'].content}
      />

      {/* Stats */}
      {decks.length > 0 && (
        <Card variant="glass" size="medium" style={styles.statsCard}>
          <View style={styles.statsRow}>
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
        </Card>
      )}

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
          action={{
            label: 'Limpar Busca',
            onPress: () => setSearchQuery(''),
            variant: 'secondary',
          }}
        />
      );
    }
    return (
      <EmptyState
        icon="layers-outline"
        title="Comece sua jornada de aprendizado"
        message="Flashcards são perfeitos para memorizar idiomas, conceitos técnicos, fórmulas e muito mais."
        action={{
          label: 'Criar Primeiro Deck',
          onPress: handleCreateDeck,
          variant: 'primary',
        }}
        suggestions={[
          'Inglês - Vocabulário',
          'Programação - JavaScript',
          'Estudos - História',
        ]}
        onSuggestionPress={(suggestion) => {
          // Futuramente pode criar deck com template
          handleCreateDeck();
        }}
      />
    );
  }, [decks.length, searchQuery, handleCreateDeck]);

  const renderListFooter = useCallback(() => (
    <Button
      label="Criar Novo Deck"
      icon="add"
      variant="primary"
      onPress={handleCreateDeck}
      fullWidth
    />
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
  scrollContent: {
    padding: spacing.lg,
  },
  statsCard: {
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
});

export default FlashcardsHomeScreen;
