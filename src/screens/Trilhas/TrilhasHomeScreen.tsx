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
import { useTrilhas } from '../../context/TrilhasContext';
import TrilhaCard from '../../components/TrilhaCard';
import EmptyState from '../../components/EmptyState';
import HelpButton from '../../components/HelpButton';
import { helpContent } from '../../data/helpContent';
import {
  globalStyles,
  colors,
  spacing,
  borderRadius,
  typography,
} from '../../theme/globalStyles';
import { filterTrilhasBySearch } from '../../features/trilhas/utils';

const TrilhasHomeScreen = ({ navigation }: any) => {
  const { trilhas, stats, loading, deletarTrilha } = useTrilhas();
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar trilhas por busca
  const trilhasFiltradas = filterTrilhasBySearch(trilhas, searchQuery);

  // Handler para criar nova trilha
  const handleCriarTrilha = () => {
    navigation.navigate('CreateTrilha');
  };

  // Handler para abrir detalhes da trilha
  const handleAbrirTrilha = (trilhaId: string) => {
    navigation.navigate('TrilhaDetail', { trilhaId });
  };

  // Handler para deletar trilha
  const handleDeletarTrilha = (trilhaId: string, trilhaTitulo: string) => {
    Alert.alert(
      'Deletar Trilha',
      `Tem certeza que deseja deletar "${trilhaTitulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarTrilha(trilhaId);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar a trilha');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[globalStyles.container, globalStyles.centered]}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
        <Text style={[globalStyles.bodyText, { marginTop: spacing.md }]}>
          Carregando trilhas...
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
          <View style={styles.headerTitleRow}>
            <Text style={globalStyles.title}>Trilhas de Estudo</Text>
            <HelpButton content={helpContent['trilhas.overview'].content} />
          </View>
          <Text style={globalStyles.subtitle}>
            Organize seu aprendizado em roteiros estruturados
          </Text>

          {/* Stats */}
          {trilhas.length > 0 && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalTrilhas}</Text>
                <Text style={styles.statLabel}>Trilhas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.activeTrilhas}</Text>
                <Text style={styles.statLabel}>Ativas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.averageProgress}%</Text>
                <Text style={styles.statLabel}>Progresso</Text>
              </View>
            </View>
          )}
        </View>

        {/* Search bar */}
        {trilhas.length > 0 && (
          <View style={styles.searchContainer}>
            <Icon name="search-outline" size={20} color={colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar trilhas..."
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

        {/* Lista de trilhas */}
        {trilhasFiltradas.length > 0 ? (
          <View style={styles.trilhasList}>
            {trilhasFiltradas.map(trilha => (
              <TrilhaCard
                key={trilha.id}
                trilha={trilha}
                onPress={() => handleAbrirTrilha(trilha.id)}
                onLongPress={() => handleDeletarTrilha(trilha.id, trilha.title)}
              />
            ))}
          </View>
        ) : trilhas.length > 0 ? (
          <EmptyState
            icon="search-outline"
            title="Nenhum resultado"
            message={`Não encontramos trilhas com "${searchQuery}"`}
          />
        ) : (
          <EmptyState
            icon="library-outline"
            title="Nenhuma trilha criada"
            message="Comece criando sua primeira trilha de aprendizado para organizar seu estudo de forma estruturada"
          />
        )}

        {/* Botão de criar */}
        <Pressable
          style={({ pressed }) => [
            globalStyles.buttonPrimary,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleCriarTrilha}
        >
          <Icon name="add" size={24} color={colors.text.primary} />
          <Text style={[globalStyles.buttonText, { marginLeft: spacing.sm }]}>
            Criar Nova Trilha
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
  trilhasList: {
    marginBottom: spacing.lg,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

export default TrilhasHomeScreen;
