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
import { useFlowKeeper } from '../../context/FlowKeeperContext';
import FlowCard from '../../components/FlowCard';
import EmptyState from '../../components/EmptyState';
import {
  globalStyles,
  colors,
  spacing,
  borderRadius,
  typography,
} from '../../theme/globalStyles';
import { filterFlowsBySearch } from '../../features/flowkeeper/utils';

const FlowKeeperHomeScreen = ({ navigation }: any) => {
  const { flows, stats, loading, deleteFlow } = useFlowKeeper();
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar trilhas por busca
  const filteredFlows = filterFlowsBySearch(flows, searchQuery);

  // Handler para criar nova trilha
  const handleCreateFlow = () => {
    navigation.navigate('CreateFlow');
  };

  // Handler para abrir detalhes da trilha
  const handleOpenFlow = (flowId: string) => {
    navigation.navigate('FlowDetail', { flowId });
  };

  // Handler para deletar trilha
  const handleDeleteFlow = (flowId: string, flowTitle: string) => {
    Alert.alert(
      'Deletar Trilha',
      `Tem certeza que deseja deletar "${flowTitle}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFlow(flowId);
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
          <Text style={globalStyles.title}>Trilhas de Estudo</Text>
          <Text style={globalStyles.subtitle}>
            Organize seu aprendizado em roteiros estruturados
          </Text>

          {/* Stats */}
          {flows.length > 0 && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalFlows}</Text>
                <Text style={styles.statLabel}>Trilhas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.activeFlows}</Text>
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
        {flows.length > 0 && (
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
        {filteredFlows.length > 0 ? (
          <View style={styles.flowsList}>
            {filteredFlows.map(flow => (
              <FlowCard
                key={flow.id}
                flow={flow}
                onPress={() => handleOpenFlow(flow.id)}
                onLongPress={() => handleDeleteFlow(flow.id, flow.title)}
              />
            ))}
          </View>
        ) : flows.length > 0 ? (
          <EmptyState
            icon="search-outline"
            title="Nenhum resultado"
            message={`Não encontramos fluxos com "${searchQuery}"`}
          />
        ) : (
          <EmptyState
            icon="library-outline"
            title="Nenhum fluxo criado"
            message="Comece criando seu primeiro fluxo de aprendizado para organizar seu estudo de forma estruturada"
          />
        )}

        {/* Botão de criar */}
        <Pressable
          style={({ pressed }) => [
            globalStyles.buttonPrimary,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleCreateFlow}
        >
          <Icon name="add" size={24} color={colors.text.primary} />
          <Text style={[globalStyles.buttonText, { marginLeft: spacing.sm }]}>
            Criar Novo Fluxo
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
  flowsList: {
    marginBottom: spacing.lg,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

export default FlowKeeperHomeScreen;
