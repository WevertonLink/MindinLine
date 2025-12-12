/**
 * Mensagens humanizadas e amigáveis para o app
 */

export const errorMessages = {
  // Generic
  generic: {
    title: 'Ops! Algo deu errado',
    message: 'Não conseguimos completar esta ação. Tente novamente em alguns instantes.',
  },

  // Network
  network: {
    title: 'Sem conexão',
    message: 'Verifique sua conexão com a internet e tente novamente.',
  },

  // Storage
  storage: {
    save: {
      title: 'Erro ao salvar',
      message: 'Não foi possível salvar suas alterações. Verifique se há espaço disponível no dispositivo.',
    },
    load: {
      title: 'Erro ao carregar',
      message: 'Não conseguimos carregar seus dados. Tente reiniciar o app.',
    },
  },

  // Validation
  validation: {
    emptyTitle: {
      title: 'Título necessário',
      message: 'Por favor, adicione um título com pelo menos 3 caracteres.',
    },
    emptyContent: {
      title: 'Conteúdo necessário',
      message: 'Preencha o conteúdo antes de continuar.',
    },
    invalidDate: {
      title: 'Data inválida',
      message: 'Selecione uma data válida para continuar.',
    },
  },

  // Flashcards
  flashcards: {
    createDeck: {
      title: 'Erro ao criar deck',
      message: 'Não foi possível criar o deck. Verifique os dados e tente novamente.',
    },
    deleteDeck: {
      title: 'Erro ao deletar',
      message: 'Não conseguimos deletar este deck. Tente novamente.',
    },
    importCards: {
      title: 'Erro ao importar',
      message: 'O arquivo selecionado não pôde ser importado. Verifique se é um arquivo CSV válido.',
    },
    noCardsToReview: {
      title: 'Nenhum card para revisar',
      message: 'Parabéns! Você está em dia com suas revisões. Volte mais tarde para novos cards.',
    },
  },

  // Tasks
  tasks: {
    create: {
      title: 'Erro ao criar tarefa',
      message: 'Não conseguimos criar sua tarefa. Tente novamente.',
    },
    delete: {
      title: 'Erro ao deletar',
      message: 'Não foi possível deletar a tarefa. Tente novamente.',
    },
    update: {
      title: 'Erro ao atualizar',
      message: 'Não conseguimos salvar as alterações. Tente novamente.',
    },
  },

  // Trilhas
  trilhas: {
    create: {
      title: 'Erro ao criar trilha',
      message: 'Não foi possível criar a trilha. Verifique os dados e tente novamente.',
    },
    delete: {
      title: 'Erro ao deletar',
      message: 'Não conseguimos deletar esta trilha. Tente novamente.',
    },
    noSteps: {
      title: 'Adicione etapas',
      message: 'Uma trilha precisa ter pelo menos uma etapa. Adicione etapas para continuar.',
    },
  },

  // Settings
  settings: {
    export: {
      title: 'Erro ao exportar',
      message: 'Não foi possível exportar seus dados. Verifique se há espaço disponível.',
    },
    import: {
      title: 'Erro ao importar',
      message: 'O arquivo selecionado não pôde ser importado. Verifique se é um backup válido.',
    },
    invalidFile: {
      title: 'Arquivo inválido',
      message: 'Este arquivo não é um backup válido do MindinLine. Selecione outro arquivo.',
    },
  },
};

export const successMessages = {
  // Generic
  saved: {
    title: 'Salvo!',
    message: 'Suas alterações foram salvas com sucesso.',
  },
  deleted: {
    title: 'Deletado!',
    message: 'Item removido com sucesso.',
  },
  created: {
    title: 'Criado!',
    message: 'Item criado com sucesso.',
  },

  // Flashcards
  flashcards: {
    deckCreated: {
      title: 'Deck criado!',
      message: 'Agora você pode adicionar flashcards ao seu novo deck.',
    },
    cardsImported: (count: number) => ({
      title: 'Cards importados!',
      message: `${count} flashcard${count > 1 ? 's' : ''} importado${count > 1 ? 's' : ''} com sucesso.`,
    }),
    reviewComplete: {
      title: 'Revisão completa!',
      message: 'Parabéns! Você revisou todos os cards de hoje.',
    },
  },

  // Tasks
  tasks: {
    created: {
      title: 'Tarefa criada!',
      message: 'Sua nova tarefa foi adicionada à lista.',
    },
    completed: {
      title: 'Tarefa completa!',
      message: 'Mais uma tarefa finalizada. Continue assim!',
    },
  },

  // Trilhas
  trilhas: {
    created: {
      title: 'Trilha criada!',
      message: 'Sua trilha de estudo está pronta. Boa jornada!',
    },
    stepCompleted: {
      title: 'Etapa concluída!',
      message: 'Continue progredindo em sua trilha de aprendizado.',
    },
  },

  // Settings
  settings: {
    exported: {
      title: 'Dados exportados!',
      message: 'Seu backup foi criado com sucesso. Guarde-o em local seguro.',
    },
    imported: {
      title: 'Dados importados!',
      message: 'Suas informações foram restauradas com sucesso.',
    },
    reset: {
      title: 'Resetado!',
      message: 'As configurações foram restauradas para os valores padrão.',
    },
  },
};

export const confirmMessages = {
  // Delete confirmations
  delete: {
    deck: (deckTitle: string) => ({
      title: 'Deletar deck?',
      message: `Tem certeza que deseja deletar "${deckTitle}"? Todos os flashcards serão removidos. Esta ação não pode ser desfeita.`,
      confirmText: 'Deletar',
      cancelText: 'Cancelar',
    }),
    task: (taskTitle: string) => ({
      title: 'Deletar tarefa?',
      message: `Deseja deletar "${taskTitle}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Deletar',
      cancelText: 'Cancelar',
    }),
    trilha: (trilhaTitle: string) => ({
      title: 'Deletar trilha?',
      message: `Tem certeza que deseja deletar "${trilhaTitle}"? Todas as etapas serão removidas. Esta ação não pode ser desfeita.`,
      confirmText: 'Deletar',
      cancelText: 'Cancelar',
    }),
    allData: {
      title: 'Limpar todos os dados?',
      message: 'Esta ação irá DELETAR permanentemente todos os seus decks, tarefas, trilhas e atividades. As configurações também serão resetadas. Esta ação NÃO pode ser desfeita!',
      confirmText: 'Deletar Tudo',
      cancelText: 'Cancelar',
    },
  },

  // Import
  import: {
    data: (stats: { decks: number; tasks: number; trilhas: number; activities: number; date: string }) => ({
      title: 'Importar dados?',
      message: `Isso irá SUBSTITUIR todos os dados atuais.\n\nBackup de: ${stats.date}\n\nConteúdo:\n• ${stats.trilhas} Trilhas\n• ${stats.decks} Decks de Flashcards\n• ${stats.tasks} Tarefas\n• ${stats.activities} Atividades\n\nDeseja continuar?`,
      confirmText: 'Importar',
      cancelText: 'Cancelar',
    }),
  },
};
