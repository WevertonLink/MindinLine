import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFlashcards } from '../../context/FlashcardsContext';
import DeckCard from '../../components/DeckCard';
import EmptyState from '../../components/EmptyState';
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

  const handleCreateDeck = () => {
    navigation.navigate('CreateDeck');
  };

  const handleOpenDeck = (deckId: string) => {
    navigation.navigate('DeckDetail', { deckId });
  };

  const handleDeleteDeck = (deckId: string, deckTitle: string) => {
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
  };

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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header com stats */}
        <View style={styles.header}>
          <Text style={globalStyles.title}>Flashcards</Text>
          <Text style={globalStyles.subtitle}>
            Estude com repetição espaçada inteligente
          </Text>

          {decks.length > 0 && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalDecks}</Text>
                <Text style={styles.statLabel}>Decks</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.status.warning }]}>
                  {stats.cardsToReviewToday}
                </Text>
                <Text style={styles.statLabel}>P/ Revisar</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.status.success }]}>
                  {stats.cardsMastered}
                </Text>
                <Text style={styles.statLabel}>Dominados</Text>
              </View>
            </View>
          )}
        </View>

        {/* Search bar */}
        {decks.length > 0 && (
          <View style={styles.searchContainer}>
            <Icon name="search-outline" size={20} color={colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar decks..."
              placeholderTextColor={colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={20} color={colors.text.tertiary} />
              </Pressable>
            )}
          </View>
        )}

        {/* Lista de decks */}
        {filteredDecks.length > 0 ? (
          <View style={styles.decksList}>
            {filteredDecks.map(deck => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onPress={() => handleOpenDeck(deck.id)}
                onLongPress={() => handleDeleteDeck(deck.id, deck.title)}
              />
            ))}
          </View>
        ) : decks.length > 0 ? (
          <EmptyState
            icon="search-outline"
            title="Nenhum resultado"
            message={`Não encontramos decks com "${searchQuery}"`}
          />
        ) : (
          <EmptyState
            icon="layers-outline"
            title="Nenhum deck criado"
            message="Crie seu primeiro deck de flashcards para começar a memorizar conceitos usando repetição espaçada"
          />
        )}

        {/* Botão de criar */}
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
  header: {
    marginBottom: spacing.lg,
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
  decksList: {
    marginBottom: spacing.lg,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

export default FlashcardsHomeScreen;
