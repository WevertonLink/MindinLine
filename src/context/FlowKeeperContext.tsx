import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Flow,
  FlowStep,
  Material,
  CreateFlowInput,
  UpdateFlowInput,
  CreateStepInput,
  CreateMaterialInput,
  FlowKeeperStats,
} from '../features/flowkeeper/types';
import {
  generateId,
  calculateFlowProgress,
  calculateStats,
  sortStepsByOrder,
  reorderSteps,
} from '../features/flowkeeper/utils';
import { saveFlows, loadFlows } from '../services/storage';
import { addTimelineActivity } from '../services/timelineService';

// ==========================================
// 🎯 FLOWKEEPER CONTEXT
// ==========================================

interface FlowKeeperContextData {
  // Estado
  flows: Flow[];
  stats: FlowKeeperStats;
  loading: boolean;

  // CRUD de Fluxos
  createFlow: (input: CreateFlowInput) => Promise<Flow>;
  updateFlow: (flowId: string, input: UpdateFlowInput) => Promise<void>;
  deleteFlow: (flowId: string) => Promise<void>;
  getFlowById: (flowId: string) => Flow | undefined;

  // CRUD de Steps
  addStep: (flowId: string, input: CreateStepInput) => Promise<FlowStep>;
  updateStep: (flowId: string, stepId: string, updates: Partial<FlowStep>) => Promise<void>;
  deleteStep: (flowId: string, stepId: string) => Promise<void>;
  toggleStepCompletion: (flowId: string, stepId: string) => Promise<void>;
  reorderStepsInFlow: (flowId: string, steps: FlowStep[]) => Promise<void>;

  // CRUD de Materials
  addMaterial: (flowId: string, stepId: string, input: CreateMaterialInput) => Promise<Material>;
  deleteMaterial: (flowId: string, stepId: string, materialId: string) => Promise<void>;

  // Utilitários
  refreshFlows: () => Promise<void>;
}

const FlowKeeperContext = createContext<FlowKeeperContextData>({} as FlowKeeperContextData);

// ==========================================
// 🔧 PROVIDER
// ==========================================

interface FlowKeeperProviderProps {
  children: ReactNode;
}

export const FlowKeeperProvider: React.FC<FlowKeeperProviderProps> = ({ children }) => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [stats, setStats] = useState<FlowKeeperStats>({
    totalFlows: 0,
    activeFlows: 0,
    completedFlows: 0,
    totalSteps: 0,
    completedSteps: 0,
    averageProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  // Carregar fluxos do storage ao iniciar
  useEffect(() => {
    loadFlowsFromStorage();
  }, []);

  // Atualizar stats sempre que flows mudar
  useEffect(() => {
    setStats(calculateStats(flows));
  }, [flows]);

  // Carregar fluxos do AsyncStorage
  const loadFlowsFromStorage = async () => {
    try {
      setLoading(true);
      const savedFlows = await loadFlows();
      if (savedFlows && Array.isArray(savedFlows)) {
        setFlows(savedFlows);
      }
    } catch (error) {
      console.error('Erro ao carregar fluxos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Salvar fluxos no AsyncStorage
  const saveFlowsToStorage = async (updatedFlows: Flow[]) => {
    try {
      await saveFlows(updatedFlows);
      setFlows(updatedFlows);
    } catch (error) {
      console.error('Erro ao salvar fluxos:', error);
      throw error;
    }
  };

  // ==========================================
  // CRUD DE FLUXOS
  // ==========================================

  const createFlow = async (input: CreateFlowInput): Promise<Flow> => {
    const newFlow: Flow = {
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

    const updatedFlows = [...flows, newFlow];
    await saveFlowsToStorage(updatedFlows);

    return newFlow;
  };

  const updateFlow = async (flowId: string, input: UpdateFlowInput): Promise<void> => {
    const updatedFlows = flows.map(flow => {
      if (flow.id === flowId) {
        return {
          ...flow,
          ...input,
          updatedAt: new Date().toISOString(),
        };
      }
      return flow;
    });

    await saveFlowsToStorage(updatedFlows);
  };

  const deleteFlow = async (flowId: string): Promise<void> => {
    const updatedFlows = flows.filter(flow => flow.id !== flowId);
    await saveFlowsToStorage(updatedFlows);
  };

  const getFlowById = (flowId: string): Flow | undefined => {
    return flows.find(flow => flow.id === flowId);
  };

  // ==========================================
  // CRUD DE STEPS
  // ==========================================

  const addStep = async (flowId: string, input: CreateStepInput): Promise<FlowStep> => {
    const flow = flows.find(f => f.id === flowId);
    if (!flow) throw new Error('Fluxo não encontrado');

    const newStep: FlowStep = {
      id: generateId(),
      title: input.title,
      description: input.description,
      completed: false,
      order: flow.steps.length,
      materials: [],
      estimatedTime: input.estimatedTime,
      createdAt: new Date().toISOString(),
    };

    const updatedSteps = [...flow.steps, newStep];
    const updatedFlow = {
      ...flow,
      steps: updatedSteps,
      progress: calculateFlowProgress(updatedSteps),
      updatedAt: new Date().toISOString(),
    };

    const updatedFlows = flows.map(f => (f.id === flowId ? updatedFlow : f));
    await saveFlowsToStorage(updatedFlows);

    return newStep;
  };

  const updateStep = async (
    flowId: string,
    stepId: string,
    updates: Partial<FlowStep>
  ): Promise<void> => {
    const flow = flows.find(f => f.id === flowId);
    if (!flow) throw new Error('Fluxo não encontrado');

    const updatedSteps = flow.steps.map(step => {
      if (step.id === stepId) {
        return { ...step, ...updates };
      }
      return step;
    });

    const updatedFlow = {
      ...flow,
      steps: updatedSteps,
      progress: calculateFlowProgress(updatedSteps),
      updatedAt: new Date().toISOString(),
    };

    const updatedFlows = flows.map(f => (f.id === flowId ? updatedFlow : f));
    await saveFlowsToStorage(updatedFlows);
  };

  const deleteStep = async (flowId: string, stepId: string): Promise<void> => {
    const flow = flows.find(f => f.id === flowId);
    if (!flow) throw new Error('Fluxo não encontrado');

    const updatedSteps = reorderSteps(flow.steps.filter(s => s.id !== stepId));

    const updatedFlow = {
      ...flow,
      steps: updatedSteps,
      progress: calculateFlowProgress(updatedSteps),
      updatedAt: new Date().toISOString(),
    };

    const updatedFlows = flows.map(f => (f.id === flowId ? updatedFlow : f));
    await saveFlowsToStorage(updatedFlows);
  };

  const toggleStepCompletion = async (flowId: string, stepId: string): Promise<void> => {
    const flow = flows.find(f => f.id === flowId);
    if (!flow) throw new Error('Fluxo não encontrado');

    const step = flow.steps.find(s => s.id === stepId);
    if (!step) throw new Error('Step não encontrado');

    const isCompleting = !step.completed;

    const updatedSteps = flow.steps.map(s => {
      if (s.id === stepId) {
        return {
          ...s,
          completed: !s.completed,
          completedAt: !s.completed ? new Date().toISOString() : undefined,
        };
      }
      return s;
    });

    const newProgress = calculateFlowProgress(updatedSteps);
    const isFlowCompleted = newProgress === 100;

    const updatedFlow = {
      ...flow,
      steps: updatedSteps,
      progress: newProgress,
      updatedAt: new Date().toISOString(),
    };

    const updatedFlows = flows.map(f => (f.id === flowId ? updatedFlow : f));
    await saveFlowsToStorage(updatedFlows);

    // Registrar no Timeline quando completar step
    if (isCompleting) {
      await addTimelineActivity({
        type: 'flow_study',
        title: `Estudo: ${step.title}`,
        description: `Flow: ${flow.title}`,
        metadata: {
          flowId: flow.id,
          flowTitle: flow.title,
          stepId: step.id,
          stepTitle: step.title,
        },
      });

      // Se o flow foi completado (100%), registrar também
      if (isFlowCompleted) {
        await addTimelineActivity({
          type: 'flow_completed',
          title: `Flow concluído: ${flow.title}`,
          description: `${flow.steps.length} etapas completadas`,
          metadata: {
            flowId: flow.id,
            flowTitle: flow.title,
          },
        });
      }
    }
  };

  const reorderStepsInFlow = async (flowId: string, newSteps: FlowStep[]): Promise<void> => {
    const flow = flows.find(f => f.id === flowId);
    if (!flow) throw new Error('Fluxo não encontrado');

    const reorderedSteps = reorderSteps(newSteps);

    const updatedFlow = {
      ...flow,
      steps: reorderedSteps,
      updatedAt: new Date().toISOString(),
    };

    const updatedFlows = flows.map(f => (f.id === flowId ? updatedFlow : f));
    await saveFlowsToStorage(updatedFlows);
  };

  // ==========================================
  // CRUD DE MATERIALS
  // ==========================================

  const addMaterial = async (
    flowId: string,
    stepId: string,
    input: CreateMaterialInput
  ): Promise<Material> => {
    const flow = flows.find(f => f.id === flowId);
    if (!flow) throw new Error('Fluxo não encontrado');

    const newMaterial: Material = {
      id: generateId(),
      title: input.title,
      type: input.type,
      url: input.url,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    };

    const updatedSteps = flow.steps.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          materials: [...step.materials, newMaterial],
        };
      }
      return step;
    });

    const updatedFlow = {
      ...flow,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    };

    const updatedFlows = flows.map(f => (f.id === flowId ? updatedFlow : f));
    await saveFlowsToStorage(updatedFlows);

    return newMaterial;
  };

  const deleteMaterial = async (
    flowId: string,
    stepId: string,
    materialId: string
  ): Promise<void> => {
    const flow = flows.find(f => f.id === flowId);
    if (!flow) throw new Error('Fluxo não encontrado');

    const updatedSteps = flow.steps.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          materials: step.materials.filter(m => m.id !== materialId),
        };
      }
      return step;
    });

    const updatedFlow = {
      ...flow,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    };

    const updatedFlows = flows.map(f => (f.id === flowId ? updatedFlow : f));
    await saveFlowsToStorage(updatedFlows);
  };

  // ==========================================
  // UTILITÁRIOS
  // ==========================================

  const refreshFlows = async (): Promise<void> => {
    await loadFlowsFromStorage();
  };

  // ==========================================
  // PROVIDER VALUE
  // ==========================================

  const value: FlowKeeperContextData = {
    flows,
    stats,
    loading,
    createFlow,
    updateFlow,
    deleteFlow,
    getFlowById,
    addStep,
    updateStep,
    deleteStep,
    toggleStepCompletion,
    reorderStepsInFlow,
    addMaterial,
    deleteMaterial,
    refreshFlows,
  };

  return <FlowKeeperContext.Provider value={value}>{children}</FlowKeeperContext.Provider>;
};

// ==========================================
// 🪝 HOOK
// ==========================================

export const useFlowKeeper = () => {
  const context = useContext(FlowKeeperContext);

  if (!context) {
    throw new Error('useFlowKeeper must be used within FlowKeeperProvider');
  }

  return context;
};

export default FlowKeeperContext;
