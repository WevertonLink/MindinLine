// ==========================================
// 💡 CONTEÚDO DE AJUDA CONTEXTUAL
// ==========================================

interface HelpContent {
  [key: string]: {
    title: string;
    content: string;
    tips?: string[];
  };
}

export const helpContent: HelpContent = {
  // ==========================================
  // HOME
  // ==========================================
  'home.welcome': {
    title: 'Bem-vindo ao MindinLine!',
    content: `Seu assistente cognitivo para organizar estudos e tarefas.

🧠 O QUE É:
App que combina técnicas comprovadas:
• Flashcards com repetição espaçada
• Tarefas com técnica Pomodoro
• Trilhas de estudo estruturadas
• Timeline de progresso gamificada

🎯 COMO COMEÇAR:
1. Crie um deck de flashcards
2. Adicione uma tarefa do dia
3. Use o Modo Foco para estudar
4. Acompanhe evolução na Timeline`,
    tips: ['Comece pequeno! 1 tarefa e 5 flashcards já é um ótimo início.'],
  },

  // ==========================================
  // FLASHCARDS
  // ==========================================
  'flashcards.overview': {
    title: 'Flashcards com Repetição Espaçada',
    content: `Sistema que mostra cards no momento ideal para memorizar, baseado em ciência de memorização.

📊 ENTENDA AS MÉTRICAS:
• Novos: Cards não estudados
• Aprendendo: Fase inicial (< 21 dias)
• Dominados: Já memorizados (intervalos longos)
• P/ Revisar: Cards que venceram hoje

🎯 COMO USAR:
1. Crie deck por tema
2. Adicione cards (frente/verso)
3. Estude diariamente os cards devidos
4. Avalie honestamente: Again/Hard/Good/Easy`,
    tips: ['10-15 min por dia > 2h no fim de semana!'],
  },

  'flashcards.stat.total': {
    title: 'Total de Cards',
    content: 'Todos os cards deste deck',
  },

  'flashcards.stat.new': {
    title: 'Cards Novos',
    content: 'Cards que você ainda não estudou pela primeira vez',
  },

  'flashcards.stat.learning': {
    title: 'Cards Aprendendo',
    content: 'Cards em fase de memorização com intervalo < 21 dias',
  },

  'flashcards.stat.mastered': {
    title: 'Cards Dominados',
    content: 'Cards com intervalo > 21 dias. Parabéns! Estão memorizados.',
  },

  'flashcards.stat.due': {
    title: 'Cards Para Revisar',
    content: 'Cards que venceram hoje e precisam de revisão',
  },

  'flashcards.createDeck': {
    title: 'Dicas para Criar um Bom Deck',
    content: `✅ FAÇA:
• Um deck por tema (ex: "Inglês - Verbos")
• Títulos descritivos
• Cards atômicos (1 conceito por card)

❌ EVITE:
• Decks muito grandes (divida)
• Misturar assuntos diferentes
• Frases longas demais`,
    tips: ['Deck: "JavaScript - Array Methods"\nCard 1: ".map()" → "Transforma cada item"'],
  },

  'flashcards.studyMode': {
    title: 'Como Estudar',
    content: `1. Leia a frente do card
2. Tente lembrar a resposta
3. Vire o card
4. Avalie honestamente sua lembrança

🎯 ESCOLHA A DIFICULDADE:
⛔ NOVAMENTE: Não lembrou → 1 min
⚠️ DIFÍCIL: Lembrou com esforço → 6 min
✅ BOM: Lembrou após pensar → 1 dia
🎉 FÁCIL: Lembrou instantaneamente → 4 dias`,
    tips: ['Seja honesto! Escolher "Fácil" quando não sabia prejudica seu aprendizado.'],
  },

  // ==========================================
  // TASKS
  // ==========================================
  'tasks.overview': {
    title: 'Gerenciador de Tarefas',
    content: `ESTADOS:
📝 A Fazer: Criadas mas não iniciadas
🔄 Em Progresso: Começou a trabalhar
✅ Concluída: Missão cumprida! 🎉

⚠️ PRIORIDADES:
🔴 Urgente: Fazer AGORA
🟠 Alta: Fazer hoje
🟡 Média: Fazer esta semana
🟢 Baixa: Pode esperar

⏱️ MODO FOCO:
Clique no timer para sessões de 25 min de foco total!`,
    tips: ['Use "Adicionar Rápido" para capturar ideias antes de esquecer!'],
  },

  'tasks.timer': {
    title: 'Timer de Tarefa',
    content: `Use para rastrear tempo gasto.

▶️ INICIAR: Começa a contar
⏸️ PAUSAR: Pausa sem perder tempo
⏹️ PARAR: Finaliza e salva no histórico

💡 DIFERENÇA DO MODO FOCO:
Timer: Apenas conta o tempo
Modo Foco: 25min Pomodoro com pausas`,
  },

  'tasks.subtasks': {
    title: 'Subtarefas',
    content: `Divida tarefas grandes em etapas menores!

✅ BENEFÍCIOS:
• Menos overwhelming
• Progresso visível
• Sensação de conquista`,
    tips: ['Cada subtarefa concluída = vitória! 🎉\nQuebre em passos de 5-15 min.'],
  },

  'tasks.recurrence': {
    title: 'Tarefas Recorrentes',
    content: `Automatiza tarefas repetitivas!

COMO FUNCIONA:
1. Você completa a tarefa
2. Nova tarefa é criada automaticamente
3. Com a mesma configuração

📅 EXEMPLOS:
• Diário: "Revisar flashcards"
• Semanal: "Limpar inbox"
• Mensal: "Review de metas"`,
    tips: ['Ideal para hábitos e rotinas!'],
  },

  'tasks.focusMode': {
    title: 'Modo Foco - Técnica Pomodoro',
    content: `Método de estudo em intervalos:
• 25 min de FOCO TOTAL 🎯
• 5 min de PAUSA ☕
• A cada 4 ciclos: pausa longa (15-30 min)

🎯 DURANTE O FOCO:
• Desligue notificações
• Feche redes sociais
• Uma tarefa por vez
• Sem multitasking!

☕ DURANTE A PAUSA:
• Levante e ande
• Beba água
• Olhe para longe da tela
• NÃO use celular!`,
    tips: ['Intervalos curtos mantém você engajado sem exaustão mental.'],
  },

  // ==========================================
  // TRILHAS
  // ==========================================
  'trilhas.overview': {
    title: 'Trilhas de Aprendizado',
    content: `Roteiros estruturados de aprendizado com etapas sequenciais.

📚 COMO CRIAR:
1. Defina objetivo (ex: "Aprender React")
2. Divida em etapas (ex: "JSX", "Hooks")
3. Adicione materiais em cada etapa
4. Siga em ordem!

✅ BENEFÍCIOS:
• Evita overwhelm
• Clareza do caminho
• Progresso visual
• Motivação crescente`,
    tips: ['Ter caminho claro reduz ansiedade e procrastinação!'],
  },

  // ==========================================
  // TIMELINE
  // ==========================================
  'timeline.overview': {
    title: 'Timeline - Sua Evolução',
    content: `Diário automático das suas atividades!

📊 O QUE RASTREAMOS:
✅ Tarefas completadas
📚 Flashcards revisados
⏱️ Sessões de foco
🎯 Tempo por atividade

🔥 STREAK (SEQUÊNCIA):
Dias consecutivos estudando
→ Seu maior motivador!

💪 BENEFÍCIOS:
• Visualiza progresso real
• Combate "síndrome do impostor"
• Gamifica o aprendizado
• Mostra padrões de produtividade`,
    tips: ['Você fez MUITO mais do que imagina! Tendemos a subestimar nossas realizações.'],
  },

  'timeline.stat.streak': {
    title: 'Streak (Sequência)',
    content: 'Dias consecutivos com pelo menos 1 atividade',
  },

  'timeline.stat.week': {
    title: 'Esta Semana',
    content: 'Total de atividades nos últimos 7 dias',
  },

  'timeline.stat.focus': {
    title: 'Minutos de Foco',
    content: 'Soma de todas sessões Pomodoro da semana',
  },

  'timeline.stat.record': {
    title: 'Recorde de Streak',
    content: 'Seu maior streak até hoje. Tente bater!',
  },

  // ==========================================
  // SETTINGS
  // ==========================================
  'settings.export': {
    title: 'Backup dos Seus Dados',
    content: `EXPORTAR:
Salva todos dados em arquivo de backup
Use para segurança ou migrar dispositivos

IMPORTAR:
Restaura dados de backup anterior
⚠️ CUIDADO: Substitui dados atuais!

🔒 SEGURANÇA:
Dados ficam apenas no seu dispositivo.
Recomendamos backup semanal!`,
  },
};

export default helpContent;
