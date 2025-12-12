import { Trilha } from '../features/trilhas/types';

// ==========================================
// 🧪 DADOS MOCKADOS PARA TESTE
// ==========================================

export const mockTrilhas: Trilha[] = [
  {
    id: 'flow-1',
    title: 'Aprender React Native',
    description: 'Dominar desenvolvimento mobile com React Native do zero ao avançado',
    category: 'programming',
    status: 'active',
    steps: [
      {
        id: 'step-1-1',
        title: 'Fundamentos de JavaScript',
        description: 'Revisar ES6+, async/await, promises',
        completed: true,
        order: 0,
        materials: [
          {
            id: 'mat-1-1-1',
            title: 'MDN JavaScript Guide',
            type: 'link',
            url: 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide',
            createdAt: new Date().toISOString(),
          },
        ],
        estimatedTime: 120,
        completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'step-1-2',
        title: 'Setup do ambiente',
        description: 'Instalar Node, npm, React Native CLI',
        completed: true,
        order: 1,
        materials: [],
        estimatedTime: 60,
        completedAt: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      {
        id: 'step-1-3',
        title: 'Componentes básicos',
        description: 'View, Text, Image, ScrollView, FlatList',
        completed: false,
        order: 2,
        materials: [
          {
            id: 'mat-1-3-1',
            title: 'React Native Docs - Core Components',
            type: 'link',
            url: 'https://reactnative.dev/docs/components-and-apis',
            createdAt: new Date().toISOString(),
          },
        ],
        estimatedTime: 180,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'step-1-4',
        title: 'Navegação',
        description: 'React Navigation - Stack, Tabs, Drawer',
        completed: false,
        order: 3,
        materials: [],
        estimatedTime: 120,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
    progress: 50,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    startedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    tags: ['mobile', 'javascript', 'frontend'],
  },
  {
    id: 'flow-2',
    title: 'Inglês Fluente',
    description: 'Alcançar fluência no inglês focando em conversação e compreensão',
    category: 'language',
    status: 'active',
    steps: [
      {
        id: 'step-2-1',
        title: 'Vocabulário básico do dia a dia',
        description: '500 palavras mais comuns',
        completed: true,
        order: 0,
        materials: [],
        estimatedTime: 300,
        completedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      },
      {
        id: 'step-2-2',
        title: 'Prática de listening',
        description: 'Assistir séries com legendas em inglês',
        completed: false,
        order: 1,
        materials: [
          {
            id: 'mat-2-2-1',
            title: 'Friends - Season 1',
            type: 'video',
            notes: 'Começar com episódios curtos',
            createdAt: new Date().toISOString(),
          },
        ],
        estimatedTime: 480,
        createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      },
    ],
    progress: 50,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    startedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    tags: ['idiomas', 'inglês'],
  },
  {
    id: 'flow-3',
    title: 'Fundamentos de UI/UX Design',
    description: 'Aprender princípios de design de interfaces',
    category: 'arts',
    status: 'paused',
    steps: [
      {
        id: 'step-3-1',
        title: 'Teoria das cores',
        description: 'Psicologia das cores, paletas, contraste',
        completed: false,
        order: 0,
        materials: [],
        estimatedTime: 90,
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      },
    ],
    progress: 0,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    tags: ['design', 'ui', 'ux'],
  },
];

export default mockTrilhas;
