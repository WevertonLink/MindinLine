import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Trilha,
  Etapa,
  Material,
  CriarTrilhaInput,
  AtualizarTrilhaInput,
  CriarEtapaInput,
  CriarMaterialInput,
  EstatisticasTrilhas,
} from '../features/trilhas/types';
import {
  generateId,
  calculateFlowProgress,
  calculateStats,
  sortStepsByOrder,
  reorderSteps,
} from '../features/trilhas/utils';
import { saveFlows, loadFlows } from '../services/storage';
import { addTimelineActivity } from '../services/timelineService';

// ==========================================
// 🎯 TRILHAS DE APRENDIZADO CONTEXT
// ==========================================

interface TrilhasContextData {
  // Estado
  trilhas: Trilha[];
  stats: EstatisticasTrilhas;
  loading: boolean;

  // CRUD de Trilhas
  criarTrilha: (input: CriarTrilhaInput) => Promise<Trilha>;
  atualizarTrilha: (trilhaId: string, input: AtualizarTrilhaInput) => Promise<void>;
  deletarTrilha: (trilhaId: string) => Promise<void>;
  obterTrilhaPorId: (trilhaId: string) => Trilha | undefined;

  // CRUD de Etapas
  adicionarEtapa: (trilhaId: string, input: CriarEtapaInput) => Promise<Etapa>;
  atualizarEtapa: (trilhaId: string, etapaId: string, updates: Partial<Etapa>) => Promise<void>;
  deletarEtapa: (trilhaId: string, etapaId: string) => Promise<void>;
  toggleEtapaConclusao: (trilhaId: string, etapaId: string) => Promise<void>;
  reordenarEtapas: (trilhaId: string, etapas: Etapa[]) => Promise<void>;

  // CRUD de Materiais
  adicionarMaterial: (trilhaId: string, etapaId: string, input: CriarMaterialInput) => Promise<Material>;
  deletarMaterial: (trilhaId: string, etapaId: string, materialId: string) => Promise<void>;

  // Utilitários
  atualizarTrilhas: () => Promise<void>;

  // Integração
  vincularDeck: (trilhaId: string, deckId: string) => Promise<void>;
}

const TrilhasContext = createContext<TrilhasContextData>({} as TrilhasContextData);

// ==========================================
// 🔧 PROVIDER
// ==========================================

interface TrilhasProviderProps {
  children: ReactNode;
}

export const TrilhasProvider: React.FC<TrilhasProviderProps> = ({ children }) => {
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [stats, setStats] = useState<EstatisticasTrilhas>({
    totalTrilhas: 0,
    activeTrilhas: 0,
    completedTrilhas: 0,
    totalSteps: 0,
    completedSteps: 0,
    averageProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  // Carregar trilhas do storage ao iniciar
  useEffect(() => {
    carregarTrilhasDoStorage();
  }, []);

  // Atualizar stats sempre que trilhas mudar
  useEffect(() => {
    setStats(calculateStats(trilhas));
  }, [trilhas]);

  // Carregar trilhas do AsyncStorage
  const carregarTrilhasDoStorage = async () => {
    try {
      setLoading(true);
      const trilhasSalvas = await loadFlows();
      if (trilhasSalvas && Array.isArray(trilhasSalvas)) {
        setTrilhas(trilhasSalvas);
      }
    } catch (error) {
      console.error('Erro ao carregar trilhas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Salvar trilhas no AsyncStorage
  const salvarTrilhasNoStorage = async (trilhasAtualizadas: Trilha[]) => {
    try {
      await saveFlows(trilhasAtualizadas);
      setTrilhas(trilhasAtualizadas);
    } catch (error) {
      console.error('Erro ao salvar trilhas:', error);
      throw error;
    }
  };

  // ==========================================
  // CRUD DE TRILHAS
  // ==========================================

  const criarTrilha = async (input: CriarTrilhaInput): Promise<Trilha> => {
    const novaTrilha: Trilha = {
      id: generateId(),
      title: input.title,
      description: input.description,
      category: input.category,
      status: 'active',
      steps: [],
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: input.tags || [],
    };

    const trilhasAtualizadas = [...trilhas, novaTrilha];
    await salvarTrilhasNoStorage(trilhasAtualizadas);

    return novaTrilha;
  };

  const atualizarTrilha = async (trilhaId: string, input: AtualizarTrilhaInput): Promise<void> => {
    const trilhasAtualizadas = trilhas.map(trilha => {
      if (trilha.id === trilhaId) {
        return {
          ...trilha,
          ...input,
          updatedAt: new Date().toISOString(),
        };
      }
      return trilha;
    });

    await salvarTrilhasNoStorage(trilhasAtualizadas);
  };

  const deletarTrilha = async (trilhaId: string): Promise<void> => {
    const trilhasAtualizadas = trilhas.filter(trilha => trilha.id !== trilhaId);
    await salvarTrilhasNoStorage(trilhasAtualizadas);
  };

  const obterTrilhaPorId = (trilhaId: string): Trilha | undefined => {
    return trilhas.find(trilha => trilha.id === trilhaId);
  };

  // ==========================================
  // CRUD DE ETAPAS
  // ==========================================

  const adicionarEtapa = async (trilhaId: string, input: CriarEtapaInput): Promise<Etapa> => {
    const trilha = trilhas.find(t => t.id === trilhaId);
    if (!trilha) throw new Error('Trilha não encontrada');

    const novaEtapa: Etapa = {
      id: generateId(),
      title: input.title,
      description: input.description,
      completed: false,
      order: trilha.steps.length,
      materials: [],
      estimatedTime: input.estimatedTime,
      createdAt: new Date().toISOString(),
    };

    const etapasAtualizadas = [...trilha.steps, novaEtapa];
    const trilhaAtualizada = {
      ...trilha,
      steps: etapasAtualizadas,
      progress: calculateFlowProgress(etapasAtualizadas),
      updatedAt: new Date().toISOString(),
    };

    const trilhasAtualizadas = trilhas.map(t => (t.id === trilhaId ? trilhaAtualizada : t));
    await salvarTrilhasNoStorage(trilhasAtualizadas);

    return novaEtapa;
  };

  const atualizarEtapa = async (
    trilhaId: string,
    etapaId: string,
    updates: Partial<Etapa>
  ): Promise<void> => {
    const trilha = trilhas.find(t => t.id === trilhaId);
    if (!trilha) throw new Error('Trilha não encontrada');

    const etapasAtualizadas = trilha.steps.map(etapa => {
      if (etapa.id === etapaId) {
        return { ...etapa, ...updates };
      }
      return etapa;
    });

    const trilhaAtualizada = {
      ...trilha,
      steps: etapasAtualizadas,
      progress: calculateFlowProgress(etapasAtualizadas),
      updatedAt: new Date().toISOString(),
    };

    const trilhasAtualizadas = trilhas.map(t => (t.id === trilhaId ? trilhaAtualizada : t));
    await salvarTrilhasNoStorage(trilhasAtualizadas);
  };

  const deletarEtapa = async (trilhaId: string, etapaId: string): Promise<void> => {
    const trilha = trilhas.find(t => t.id === trilhaId);
    if (!trilha) throw new Error('Trilha não encontrada');

    const etapasAtualizadas = reorderSteps(trilha.steps.filter(e => e.id !== etapaId));

    const trilhaAtualizada = {
      ...trilha,
      steps: etapasAtualizadas,
      progress: calculateFlowProgress(etapasAtualizadas),
      updatedAt: new Date().toISOString(),
    };

    const trilhasAtualizadas = trilhas.map(t => (t.id === trilhaId ? trilhaAtualizada : t));
    await salvarTrilhasNoStorage(trilhasAtualizadas);
  };

  const toggleEtapaConclusao = async (trilhaId: string, etapaId: string): Promise<void> => {
    const trilha = trilhas.find(t => t.id === trilhaId);
    if (!trilha) throw new Error('Trilha não encontrada');

    const etapa = trilha.steps.find(e => e.id === etapaId);
    if (!etapa) throw new Error('Etapa não encontrada');

    const estaConcluindo = !etapa.completed;

    const etapasAtualizadas = trilha.steps.map(e => {
      if (e.id === etapaId) {
        return {
          ...e,
          completed: !e.completed,
          completedAt: !e.completed ? new Date().toISOString() : undefined,
        };
      }
      return e;
    });

    const novoProgresso = calculateFlowProgress(etapasAtualizadas);
    const trilhaConcluida = novoProgresso === 100;

    const trilhaAtualizada = {
      ...trilha,
      steps: etapasAtualizadas,
      progress: novoProgresso,
      updatedAt: new Date().toISOString(),
    };

    const trilhasAtualizadas = trilhas.map(t => (t.id === trilhaId ? trilhaAtualizada : t));
    await salvarTrilhasNoStorage(trilhasAtualizadas);

    // Registrar no Timeline quando completar etapa
    if (estaConcluindo) {
      await addTimelineActivity({
        type: 'trilha_estudo',
        title: `Estudo: ${etapa.title}`,
        description: `Trilha: ${trilha.title}`,
        metadata: {
          trilhaId: trilha.id,
          trilhaTitulo: trilha.title,
          etapaId: etapa.id,
          etapaTitulo: etapa.title,
        },
      });

      // Se a trilha foi completada (100%), registrar também
      if (trilhaConcluida) {
        await addTimelineActivity({
          type: 'trilha_concluida',
          title: `Trilha concluída: ${trilha.title}`,
          description: `${trilha.steps.length} etapas completadas`,
          metadata: {
            trilhaId: trilha.id,
            trilhaTitulo: trilha.title,
          },
        });
      }
    }
  };

  const reordenarEtapas = async (trilhaId: string, novasEtapas: Etapa[]): Promise<void> => {
    const trilha = trilhas.find(t => t.id === trilhaId);
    if (!trilha) throw new Error('Trilha não encontrada');

    const etapasReordenadas = reorderSteps(novasEtapas);

    const trilhaAtualizada = {
      ...trilha,
      steps: etapasReordenadas,
      updatedAt: new Date().toISOString(),
    };

    const trilhasAtualizadas = trilhas.map(t => (t.id === trilhaId ? trilhaAtualizada : t));
    await salvarTrilhasNoStorage(trilhasAtualizadas);
  };

  // ==========================================
  // CRUD DE MATERIAIS
  // ==========================================

  const adicionarMaterial = async (
    trilhaId: string,
    etapaId: string,
    input: CriarMaterialInput
  ): Promise<Material> => {
    const trilha = trilhas.find(t => t.id === trilhaId);
    if (!trilha) throw new Error('Trilha não encontrada');

    const novoMaterial: Material = {
      id: generateId(),
      title: input.title,
      type: input.type,
      url: input.url,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    };

    const etapasAtualizadas = trilha.steps.map(etapa => {
      if (etapa.id === etapaId) {
        return {
          ...etapa,
          materials: [...etapa.materials, novoMaterial],
        };
      }
      return etapa;
    });

    const trilhaAtualizada = {
      ...trilha,
      steps: etapasAtualizadas,
      updatedAt: new Date().toISOString(),
    };

    const trilhasAtualizadas = trilhas.map(t => (t.id === trilhaId ? trilhaAtualizada : t));
    await salvarTrilhasNoStorage(trilhasAtualizadas);

    return novoMaterial;
  };

  const deletarMaterial = async (
    trilhaId: string,
    etapaId: string,
    materialId: string
  ): Promise<void> => {
    const trilha = trilhas.find(t => t.id === trilhaId);
    if (!trilha) throw new Error('Trilha não encontrada');

    const etapasAtualizadas = trilha.steps.map(etapa => {
      if (etapa.id === etapaId) {
        return {
          ...etapa,
          materials: etapa.materials.filter(m => m.id !== materialId),
        };
      }
      return etapa;
    });

    const trilhaAtualizada = {
      ...trilha,
      steps: etapasAtualizadas,
      updatedAt: new Date().toISOString(),
    };

    const trilhasAtualizadas = trilhas.map(t => (t.id === trilhaId ? trilhaAtualizada : t));
    await salvarTrilhasNoStorage(trilhasAtualizadas);
  };

  // ==========================================
  // UTILITÁRIOS
  // ==========================================

  const atualizarTrilhas = async (): Promise<void> => {
    await carregarTrilhasDoStorage();
  };

  // ==========================================
  // INTEGRAÇÃO
  // ==========================================

  const vincularDeck = async (trilhaId: string, deckId: string): Promise<void> => {
    const trilhasAtualizadas = trilhas.map(trilha => {
      if (trilha.id === trilhaId) {
        return {
          ...trilha,
          linkedDeckId: deckId,
          updatedAt: new Date().toISOString(),
        };
      }
      return trilha;
    });

    await salvarTrilhasNoStorage(trilhasAtualizadas);
  };

  // ==========================================
  // PROVIDER VALUE
  // ==========================================

  const value: TrilhasContextData = {
    trilhas,
    stats,
    loading,
    criarTrilha,
    atualizarTrilha,
    deletarTrilha,
    obterTrilhaPorId,
    adicionarEtapa,
    atualizarEtapa,
    deletarEtapa,
    toggleEtapaConclusao,
    reordenarEtapas,
    adicionarMaterial,
    deletarMaterial,
    atualizarTrilhas,
    vincularDeck,
  };

  return <TrilhasContext.Provider value={value}>{children}</TrilhasContext.Provider>;
};

// ==========================================
// 🪝 HOOK
// ==========================================

export const useTrilhas = () => {
  const context = useContext(TrilhasContext);

  if (!context) {
    throw new Error('useTrilhas must be used within TrilhasProvider');
  }

  return context;
};

export default TrilhasContext;
