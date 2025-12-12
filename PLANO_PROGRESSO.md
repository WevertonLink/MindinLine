# 📋 PLANO DE MODERNIZAÇÃO - PROGRESSO ATUAL

**Projeto:** MindinLine - Modernização Visual e Estrutural
**Plano Original:** `/data/data/com.termux/files/home/.claude/plans/mellow-baking-anchor.md`
**Última Atualização:** 2025-12-11

---

## 🎯 VISÃO GERAL DO PLANO

### Objetivo
Transformar MindinLine em um app moderno, intuitivo e visualmente atraente, com foco especial nas necessidades de usuários com TDAH.

### Tempo Total Estimado: ~89 horas

### Fases do Projeto:
1. ✅ **FASE 1:** Fundação e Componentes Base (~19h) - **CONCLUÍDA**
2. ⏳ **FASE 2:** Onboarding e Textos (~12h) - **EM PROGRESSO**
3. 🔲 **FASE 3:** Toasts e Feedback (~6h)
4. 🔲 **FASE 4:** Animações e Transições (~8h)
5. 🔲 **FASE 5:** Empty States e Insights (~16h)
6. 🔲 **FASE 6:** Achievements e Templates (~18h)
7. 🔲 **FASE 7:** Melhorias Visuais Finais (~10h)

---

## ✅ FASE 1: FUNDAÇÃO E COMPONENTES BASE (~19h) - CONCLUÍDA

### 1.1 Renomear FlowKeeper → Trilhas ✅ (~3h)

**Status:** 100% Concluído

**Commits:**
- `329578f` - fix: atualiza referências remanescentes FlowKeeper → Trilhas
- `e2bdaf1` - feat: completa renomeação FlowKeeper → Trilhas
- `9f600bc` - fix: corrige erros de tipo após renomeação

**Mudanças realizadas:**
- ✅ 15+ arquivos renomeados/atualizados
- ✅ Todos types atualizados (Flow → Trilha, FlowStep → Etapa, etc)
- ✅ Contexts renomeados (FlowKeeperContext → TrilhasContext)
- ✅ Storage keys atualizadas (@mindinline:flows → @mindinline:trilhas)
- ✅ Timeline activity types atualizados (flow_study → trilha_estudo)
- ✅ Navegação atualizada (FlowKeeperTab → TrilhasTab)
- ✅ UI texts atualizados em todas as telas
- ✅ Build passando no GitHub Actions

---

### 1.2 Criar Componentes Reutilizáveis ✅ (~8h)

**Status:** 100% Concluído

**Commits:**
- `810addf` - feat: completa componentes reutilizáveis (FASE 1.2)
- `c017682` - refactor: substitui SearchBar duplicado por componente

**Componentes criados (6 total):**

#### A) SearchBar Component ✅
- **Arquivo:** `src/components/SearchBar.tsx`
- **Features:**
  - Input com ícone de busca
  - Botão clear automático
  - Placeholder customizável
- **Uso:** FlashcardsHomeScreen, TasksHomeScreen
- **Linhas economizadas:** ~31 linhas de código duplicado

#### B) ProgressBar Component ✅
- **Arquivo:** `src/components/ProgressBar.tsx`
- **Features:**
  - Animação suave com Animated API
  - Altura customizável
  - Cores personalizáveis
  - Opção de mostrar porcentagem
- **Pronto para uso em:** TaskCard, TrilhaCard, StudyModeScreen

#### C) StatCard Component ✅
- **Arquivo:** `src/components/StatCard.tsx`
- **Features:**
  - Ícone customizável
  - 3 tamanhos (small, medium, large)
  - Opcional onPress (para navegação)
  - Border color customizável
- **Pronto para uso em:** HomeScreen, todas as telas *HomeScreen

#### D) EmptyState Component ✅ (melhorado)
- **Arquivo:** `src/components/EmptyState.tsx`
- **Melhorias:**
  - ✅ Action button (primary/secondary)
  - ✅ Suggestions chips clicáveis
  - ✅ Layout aprimorado
  - ✅ Ícone maior (64 → 80)
- **Uso:** Todas as telas de listagem

#### E) Tooltip Component ✅
- **Arquivo:** `src/components/Tooltip.tsx`
- **Features:**
  - Modal com overlay
  - Animação fade in/out
  - Posicionamento (top/bottom/left/right)
  - Pressable para fechar

#### F) HelpButton Component ✅
- **Arquivo:** `src/components/HelpButton.tsx`
- **Features:**
  - Integrado com Tooltip
  - Ícone help-circle-outline
  - Tamanho e cor customizáveis

---

### 1.3 Sistema de Conteúdo de Ajuda ✅ (~8h)

**Status:** 100% Concluído

**Commits:**
- `232aa41` - feat: inicia FASE 1.3 - Sistema de Ajuda Contextual
- `5000cdd` - feat: completa FASE 1.3 - Sistema de Ajuda Contextual

**Arquivo criado:**
- `src/data/helpContent.ts` - 20+ tooltips contextuais

**HelpButtons implementados:**

#### HomeScreen ✅
- Header: Mensagem de boas-vindas ao MindinLine

#### FlashcardsHomeScreen ✅
- Header: Explicação de repetição espaçada (SM-2)
- Stats: 3 tooltips
  - Total de Cards
  - Para Revisar (cards vencidos)
  - Dominados (intervalo > 21 dias)

#### TasksHomeScreen ✅
- Header: Explicação do gerenciador de tarefas
- Estados, prioridades, modo foco

#### TrilhasHomeScreen ✅
- Header: Explicação de trilhas de aprendizado
- Roteiros estruturados, etapas sequenciais

#### TimelineScreen ✅
- Header: Explicação da timeline (evolução cognitiva)
- 4 Stats com tooltips:
  - Streak (dias consecutivos)
  - Atividades esta semana
  - Minutos de foco
  - Recorde de streak

#### SettingsScreen ✅
- Seção Dados: Explicação de Export/Import
- Segurança e backup

**Total de HelpButtons:** ~15 implementados

**Conteúdo específico para TDAH:**
- Dicas práticas ("10-15 min por dia > 2h fim de semana")
- Explicações de algoritmos (SM-2, Pomodoro)
- Combate síndrome do impostor
- Motivação para sequências (streaks)

---

## ⏳ FASE 2: ONBOARDING E TEXTOS (~12h) - PRÓXIMA

### 2.1 Onboarding para Novos Usuários ⏳ (~8h)

**Status:** 0% - INICIANDO AGORA

#### A) Criar telas de onboarding (~4h)
- [ ] Criar `src/screens/Onboarding/OnboardingScreen.tsx`
- [ ] 5 steps com FlatList horizontal
  1. Bem-vindo ao MindinLine 🧠
  2. Flashcards Inteligentes 📚
  3. Tarefas com Foco 🎯
  4. Trilhas de Aprendizado 🗺️
  5. Acompanhe sua Evolução 📈
- [ ] Indicadores de progresso (dots)
- [ ] Botões "Pular" e "Próximo/Começar"
- [ ] Animação de scroll suave

#### B) Modificar AppNavigator (~1h)
- [ ] Adicionar check de onboarding completado
- [ ] Mostrar onboarding apenas no primeiro launch
- [ ] Usar AsyncStorage: `@mindinline:onboarding_completed`
- [ ] LoadingView enquanto checa

#### C) Tour Guiado Interativo (~3h)
- [ ] Criar `src/components/InteractiveTour.tsx`
- [ ] Spotlight em elementos da UI
- [ ] 4 tours contextuais:
  - Home tour (primeira visita)
  - Flashcards tour (ao criar primeiro deck)
  - Tasks tour (ao criar primeira tarefa)
  - Focus Mode tour (primeira sessão)

---

### 2.2 Melhorar Microcopy e Textos (~4h)

**Status:** 0% - Pendente

#### A) Substituir textos técnicos (~2h)
- [ ] Simplificar jargões técnicos
- [ ] Tornar mensagens mais amigáveis
- [ ] Adicionar emojis estrategicamente
- [ ] Foco em clareza para TDAH

#### B) Mensagens de erro humanizadas (~1h)
- [ ] Substituir erros genéricos
- [ ] Adicionar sugestões de solução
- [ ] Tom amigável e encorajador

#### C) Empty states com contexto (~1h)
- [ ] Mensagens específicas por contexto
- [ ] Dicas práticas
- [ ] CTAs claros

---

## 🔲 FASE 3: TOASTS E FEEDBACK (~6h)

### 3.1 Sistema de Toasts/Snackbars (~6h)

**Status:** 0% - Pendente

- [ ] Criar `src/components/Toast.tsx`
- [ ] Provider com context
- [ ] 4 tipos: success, error, warning, info
- [ ] Animação slide-up
- [ ] Auto-dismiss configurável
- [ ] Substituir todos Alerts

---

## 🔲 FASE 4: ANIMAÇÕES E TRANSIÇÕES (~8h)

### 4.1 Animações de Transição (~8h)

**Status:** 0% - Pendente

- [ ] Transições de tela (fade, slide)
- [ ] Animação de cards (aparecer)
- [ ] Loading states animados
- [ ] Skeleton screens
- [ ] Micro-interações (botões, switches)

---

## 🔲 FASE 5: EMPTY STATES E INSIGHTS (~16h)

### 5.1 Empty States Contextuais (~4h)

**Status:** 0% - Pendente

- [ ] Melhorar todos EmptyStates com ações
- [ ] Adicionar suggestions em cada contexto
- [ ] Ilustrações ou animações Lottie

### 5.2 Insights Automáticos na Timeline (~12h)

**Status:** 0% - Pendente

- [ ] Cards de insight na timeline
- [ ] Análise de padrões
- [ ] Sugestões personalizadas
- [ ] Celebrações de conquistas

---

## 🔲 FASE 6: ACHIEVEMENTS E TEMPLATES (~18h)

### 6.1 Sistema de Achievements (~10h)

**Status:** 0% - Pendente

- [ ] Criar sistema de badges/conquistas
- [ ] Gamificação sutil
- [ ] Celebrações visuais

### 6.2 Templates e Sugestões (~8h)

**Status:** 0% - Pendente

- [ ] Templates de trilhas
- [ ] Templates de decks
- [ ] Sugestões inteligentes

---

## 🔲 FASE 7: MELHORIAS VISUAIS FINAIS (~10h)

### 7.1 Polish Geral (~10h)

**Status:** 0% - Pendente

- [ ] Revisar espaçamentos
- [ ] Consistência de cores
- [ ] Iconografia padronizada
- [ ] Acessibilidade (contrast ratio)
- [ ] Performance otimizada

---

## 📊 PROGRESSO GERAL

### Concluído: FASE 1 (19h / 89h total)
**Progresso:** 21.3% do plano total

### Em Progresso: FASE 2 (0h / 12h)
**Próximo:** Iniciar FASE 2.1 - Onboarding

### Pendente: FASES 3-7 (58h restantes)

---

## 🚀 COMMITS RELEVANTES

### FASE 1 - Renomeação (FASE 1.1)
- `329578f` - fix: atualiza referências remanescentes FlowKeeper → Trilhas
- `e2bdaf1` - feat: completa renomeação FlowKeeper → Trilhas
- `9f600bc` - fix: corrige erros de tipo após renomeação
- (vários commits anteriores com renomeações parciais)

### FASE 1 - Componentes (FASE 1.2)
- `810addf` - feat: completa componentes reutilizáveis (FASE 1.2)
- `c017682` - refactor: substitui SearchBar duplicado por componente

### FASE 1 - Ajuda (FASE 1.3)
- `232aa41` - feat: inicia FASE 1.3 - Sistema de Ajuda Contextual
- `5000cdd` - feat: completa FASE 1.3 - Sistema de Ajuda Contextual

---

## 📝 NOTAS IMPORTANTES

### Plano Antigo vs Plano Atual

**Plano Antigo (crispy-imagining-mountain.md):**
- ✅ FASE 1: Quick Wins - CONCLUÍDA
- ✅ FASE 2: Features Críticas - CONCLUÍDA
  - Task Recurrence ✅
  - Import Data ✅
  - Import Flashcards ✅
  - Timer Convencional ✅
  - Dashboard Home ✅
  - Module Settings ✅

**Plano Atual (mellow-baking-anchor.md):**
- Foco em modernização visual e UX
- Componentes reutilizáveis
- Sistema de ajuda
- Onboarding
- Gamificação sutil

### Não Desviar do Plano!

⚠️ **IMPORTANTE:** Este plano deve ser seguido sequencialmente:
1. Completar cada fase antes de passar para a próxima
2. Não pular etapas
3. Não adicionar features fora do plano
4. Manter commits organizados por fase

---

## 🎯 PRÓXIMA AÇÃO

**INICIAR AGORA:** FASE 2.1 - Onboarding para Novos Usuários

**Primeira tarefa:** Criar `src/screens/Onboarding/OnboardingScreen.tsx`

**Tempo estimado:** ~4 horas

**Objetivo:** Criar experiência de primeira execução que ensina os 5 módulos do app de forma visual e engajante.

---

**Última Atualização:** 2025-12-11 23:15 UTC
**Autor:** Claude Sonnet 4.5
**Desenvolvedor:** Weverton Link
