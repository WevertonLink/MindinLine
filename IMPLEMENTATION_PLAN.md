# 📋 Plano de Implementação - Atualização Sala de Estudos

## 🎯 Objetivos

1. **Remover**: FlowKeeper/Trilhas (módulo fraco e confuso)
2. **Adicionar**: Sala de Estudos (Gold Idea + Biblioteca)
3. **Implementar**: Importação de flashcards
4. **Melhorias**: Polish visual e remoção de informações desnecessárias
5. **Manter**: Elegância (sem confete, animações sutis)

---

## 📊 Estrutura de Desenvolvimento

### **FASE 1: Limpeza e Preparação** ⏱️ 30 min
```
├─ 1.1 Remover FlowKeeper
│  ├─ Delete /src/screens/FlowKeeper/
│  ├─ Delete /src/context/FlowKeeperContext.tsx
│  ├─ Delete /src/features/flowkeeper/
│  ├─ Delete /src/components/FlowCard.tsx
│  ├─ Delete /src/components/StepItem.tsx
│  └─ Delete navegação FlowKeeperNavigator.tsx
│
├─ 1.2 Remover referências
│  ├─ BottomTabNavigator.tsx (remover tab Trilhas)
│  ├─ App.tsx (remover provider FlowKeeper)
│  ├─ FlashcardsContext.tsx (remover createDeckFromSteps)
│  └─ TimelineScreen.tsx (remover widget se existir)
│
└─ 1.3 Limpar settings
   └─ SettingsScreen.tsx (remover texto "vibe coding")
```

### **FASE 2: Estrutura Sala de Estudos** ⏱️ 1h
```
├─ 2.1 Criar tipos
│  └─ /src/features/studyroom/types.ts
│     ├─ CapturedIdea (audio/photo/text)
│     ├─ StudyResource (link/document/video/note)
│     ├─ CreateIdeaInput
│     ├─ CreateResourceInput
│     └─ StudyRoomStats
│
├─ 2.2 Criar utils
│  └─ /src/features/studyroom/utils.ts
│     ├─ calculateStats()
│     ├─ filterIdeas()
│     ├─ filterResources()
│     └─ formatTimestamp()
│
├─ 2.3 Criar Context
│  └─ /src/context/StudyRoomContext.tsx
│     ├─ State (ideas, resources, stats, loading)
│     ├─ CRUD Ideas (create, delete, develop)
│     ├─ CRUD Resources (create, update, delete)
│     ├─ Transform (toFlashcard, toTask)
│     └─ Storage (AsyncStorage sync)
│
└─ 2.4 Criar serviços
   ├─ /src/services/audio/AudioCaptureService.ts
   │  ├─ requestPermissions()
   │  ├─ startRecording()
   │  ├─ stopRecording() (auto 3s)
   │  └─ saveAudio()
   │
   └─ /src/services/camera/PhotoCaptureService.ts
      ├─ takePicture()
      ├─ pickFromGallery()
      └─ savePhoto()
```

### **FASE 3: UI - Captura Rápida (Gold Idea)** ⏱️ 2h
```
├─ 3.1 Modal de Captura
│  └─ /src/components/studyroom/CaptureModal.tsx
│     ├─ 3 botões: 🎤 Áudio | 📷 Foto | ✍️ Texto
│     ├─ Preview da captura
│     ├─ Confirmação elegante (sem confete)
│     ├─ Haptic feedback suave (light/success)
│     └─ Animação fade simples
│
├─ 3.2 FAB Flutuante
│  └─ /src/components/studyroom/CaptureFAB.tsx
│     ├─ Botão "✨ Capturar Ideia"
│     ├─ Posição fixa bottom-right
│     ├─ Sombra elegante
│     └─ Pulso suave ao abrir modal
│
└─ 3.3 Componente Ideia
   └─ /src/components/studyroom/IdeaCard.tsx
      ├─ Tipo de captura (áudio/foto/texto)
      ├─ Preview/thumbnail
      ├─ Timestamp relativo ("há 5 min")
      ├─ Status (capturada/desenvolvida/transformada)
      └─ Ações: [Desenvolver] [Transformar] [Arquivar]
```

### **FASE 4: UI - Biblioteca** ⏱️ 1.5h
```
├─ 4.1 Componente Recurso
│  └─ /src/components/studyroom/ResourceCard.tsx
│     ├─ Tipo (link/documento/vídeo/nota)
│     ├─ Título + descrição
│     ├─ Tags (pills coloridas)
│     ├─ Favorito (⭐)
│     ├─ Stats (X flashcards gerados, Y tasks)
│     └─ Ações: [Editar] [Transformar] [Deletar]
│
├─ 4.2 Filtros e Busca
│  └─ /src/components/studyroom/ResourceFilters.tsx
│     ├─ Busca por título/tags
│     ├─ Filtro por tipo
│     ├─ Filtro favoritos
│     └─ Ordenação (recente/alfabética)
│
└─ 4.3 Modal Adicionar Recurso
   └─ /src/components/studyroom/AddResourceModal.tsx
      ├─ Seletor de tipo
      ├─ Campos dinâmicos (URL/arquivo/texto)
      ├─ Tags (input com sugestões)
      └─ Validação elegante
```

### **FASE 5: Screens Principais** ⏱️ 1.5h
```
├─ 5.1 Screen Principal
│  └─ /src/screens/StudyRoom/StudyRoomHomeScreen.tsx
│     ├─ 3 Tabs: [💡 Ideias] [📚 Biblioteca] [⭐ Favoritos]
│     ├─ Stats header (X ideias, Y recursos)
│     ├─ Empty states elegantes
│     └─ FAB sempre visível
│
├─ 5.2 Screen Detalhes Ideia
│  └─ /src/screens/StudyRoom/IdeaDetailScreen.tsx
│     ├─ Preview completo (audio player/foto/texto)
│     ├─ Desenvolver (expandir para recurso)
│     ├─ Transformar (modal com opções)
│     └─ Metadados (timestamp, status)
│
└─ 5.3 Screen Detalhes Recurso
   └─ /src/screens/StudyRoom/ResourceDetailScreen.tsx
      ├─ Conteúdo completo
      ├─ Lista de flashcards gerados
      ├─ Lista de tasks geradas
      ├─ Editar tags/favorito
      └─ Transformar (adicionar mais cards/tasks)
```

### **FASE 6: Navegação e Integração** ⏱️ 45 min
```
├─ 6.1 Navigator
│  └─ /src/navigation/StudyRoomNavigator.tsx
│     ├─ StudyRoomHome
│     ├─ IdeaDetail
│     └─ ResourceDetail
│
├─ 6.2 Bottom Tab
│  └─ BottomTabNavigator.tsx
│     ├─ Substituir "Trilhas" por "Sala de Estudos"
│     ├─ Ícone: book-outline ou library-outline
│     └─ Label: "Estudos"
│
└─ 6.3 Providers
   └─ App.tsx
      ├─ Adicionar StudyRoomProvider
      └─ Ordem: Settings → StudyRoom → Flashcards → Tasks → Timeline
```

### **FASE 7: Importação de Flashcards** ⏱️ 2h
```
├─ 7.1 Service de Importação
│  └─ /src/services/import/FlashcardImportService.ts
│     ├─ Formatos suportados:
│     │  ├─ CSV (front,back)
│     │  ├─ JSON (array de {front, back})
│     │  └─ Texto (linha dupla: pergunta\nresposta\n)
│     ├─ parseCSV()
│     ├─ parseJSON()
│     ├─ parseText()
│     └─ validateImport() (min 1 card, max 1000)
│
├─ 7.2 UI de Importação
│  └─ /src/screens/Flashcards/ImportFlashcardsScreen.tsx
│     ├─ Seletor de arquivo (expo-document-picker)
│     ├─ Preview dos cards (primeiros 5)
│     ├─ Stats (X cards válidos, Y inválidos)
│     ├─ Seletor de deck destino
│     ├─ Botão "Importar"
│     └─ Feedback de progresso
│
└─ 7.3 Integração Context
   └─ FlashcardsContext.tsx
      ├─ importFlashcards(deckId, cards[])
      ├─ Validação de duplicatas
      ├─ Batch insert (otimizado)
      └─ Timeline activity (X cards importados)
```

### **FASE 8: Transformação (Ideia → Card/Task)** ⏱️ 1h
```
├─ 8.1 Modal de Transformação
│  └─ /src/components/studyroom/TransformModal.tsx
│     ├─ 2 opções: [📇 Flashcard] [✅ Task]
│     ├─ Preview do que será criado
│     ├─ Campos editáveis antes de confirmar
│     └─ Confirmação com haptic
│
├─ 8.2 Lógica no Context
│  └─ StudyRoomContext.tsx
│     ├─ transformToFlashcard(ideaId, deckId)
│     │  ├─ Cria card com conteúdo da ideia
│     │  ├─ Marca ideia como transformada
│     │  └─ +10 XP
│     │
│     └─ transformToTask(ideaId, taskData)
│        ├─ Cria task com título da ideia
│        ├─ Marca ideia como transformada
│        └─ +10 XP
│
└─ 8.3 Integração
   ├─ useFlashcards() para criar card
   ├─ useTasks() para criar task
   └─ Timeline registra transformação
```

### **FASE 9: Sistema de XP** ⏱️ 1h
```
├─ 9.1 XP Context
│  └─ /src/context/XPContext.tsx (ou dentro de Settings)
│     ├─ State: totalXP, level, streak
│     ├─ addXP(amount, reason)
│     ├─ calculateLevel() → Math.floor(√(XP/100))
│     ├─ updateStreak()
│     └─ getXPHistory()
│
├─ 9.2 Valores de XP
│  └─ /src/constants/XP.ts
│     ├─ CAPTURE_IDEA: 10
│     ├─ REVIEW_CARD: 5
│     ├─ COMPLETE_TASK: 15
│     ├─ COMPLETE_STEP: 10
│     ├─ COMPLETE_POMODORO: 25
│     ├─ TRANSFORM_IDEA: 10
│     └─ IMPORT_CARDS: 20
│
└─ 9.3 UI de XP
   ├─ TimelineScreen.tsx
   │  └─ Badge header mostrando Level e XP
   │
   └─ SettingsScreen.tsx
      └─ Seção "Progresso" com stats de XP
```

### **FASE 10: Polish e Melhorias Visuais** ⏱️ 1.5h
```
├─ 10.1 Animações Elegantes
│  ├─ Fade in/out suaves (300ms)
│  ├─ Slide up para modals
│  ├─ Scale subtle em pressables (0.98)
│  └─ Pulso suave no FAB (heartbeat leve)
│
├─ 10.2 Haptic Feedback
│  ├─ Light: tocar botões normais
│  ├─ Medium: abrir modals
│  ├─ Success: confirmar ações
│  └─ Warning: deletar itens
│
├─ 10.3 Empty States
│  ├─ Ilustração minimalista (ícone grande)
│  ├─ Texto motivador
│  └─ CTA claro
│
├─ 10.4 Loading States
│  ├─ Skeleton placeholders (cards)
│  ├─ Spinner elegante (ActivityIndicator)
│  └─ Feedback de progresso em importação
│
└─ 10.5 Cleanup Settings
   ├─ Remover texto "vibe coding"
   ├─ Remover footer desnecessário
   └─ Simplificar descrições
```

### **FASE 11: Testes e Validação** ⏱️ 1h
```
├─ 11.1 Testes Funcionais
│  ├─ Capturar ideia (áudio/foto/texto)
│  ├─ Desenvolver ideia → recurso
│  ├─ Transformar → flashcard
│  ├─ Transformar → task
│  ├─ Importar CSV/JSON
│  ├─ Filtros e busca
│  ├─ XP acumulando corretamente
│  └─ AsyncStorage persistindo
│
├─ 11.2 Testes de UX
│  ├─ Haptic funcionando
│  ├─ Animações suaves
│  ├─ Navegação fluida
│  └─ Empty states claros
│
└─ 11.3 TypeScript
   └─ npx tsc --noEmit (zero erros)
```

### **FASE 12: Commit e Deploy** ⏱️ 30 min
```
├─ 12.1 Git
│  ├─ git add -A
│  ├─ git commit (mensagem descritiva)
│  └─ git push
│
├─ 12.2 Build
│  └─ GitHub Actions build automático
│
└─ 12.3 Release Notes
   └─ Documentar mudanças principais
```

---

## 📦 Arquivos Novos (Total: ~25 arquivos)

### **Types & Utils (3)**
```
src/features/studyroom/
├─ types.ts
├─ utils.ts
└─ constants.ts
```

### **Context (1)**
```
src/context/
└─ StudyRoomContext.tsx
```

### **Services (2)**
```
src/services/
├─ audio/AudioCaptureService.ts
└─ camera/PhotoCaptureService.ts
└─ import/FlashcardImportService.ts
```

### **Components (6)**
```
src/components/studyroom/
├─ CaptureModal.tsx
├─ CaptureFAB.tsx
├─ IdeaCard.tsx
├─ ResourceCard.tsx
├─ ResourceFilters.tsx
├─ AddResourceModal.tsx
└─ TransformModal.tsx
```

### **Screens (4)**
```
src/screens/StudyRoom/
├─ StudyRoomHomeScreen.tsx
├─ IdeaDetailScreen.tsx
└─ ResourceDetailScreen.tsx

src/screens/Flashcards/
└─ ImportFlashcardsScreen.tsx
```

### **Navigation (1)**
```
src/navigation/
└─ StudyRoomNavigator.tsx
```

---

## 🗑️ Arquivos Removidos (Total: ~15 arquivos)

```
DELETE src/screens/FlowKeeper/
DELETE src/context/FlowKeeperContext.tsx
DELETE src/features/flowkeeper/
DELETE src/components/FlowCard.tsx
DELETE src/components/StepItem.tsx
DELETE src/navigation/FlowKeeperNavigator.tsx
```

---

## ⏱️ Timeline Estimada

| Fase | Duração | Acumulado |
|------|---------|-----------|
| 1. Limpeza | 30 min | 30 min |
| 2. Estrutura | 1h | 1h 30min |
| 3. Captura UI | 2h | 3h 30min |
| 4. Biblioteca UI | 1.5h | 5h |
| 5. Screens | 1.5h | 6h 30min |
| 6. Navegação | 45 min | 7h 15min |
| 7. Importação | 2h | 9h 15min |
| 8. Transformação | 1h | 10h 15min |
| 9. Sistema XP | 1h | 11h 15min |
| 10. Polish | 1.5h | 12h 45min |
| 11. Testes | 1h | 13h 45min |
| 12. Deploy | 30 min | **14h 15min** |

**Total: ~14 horas de desenvolvimento**
**Dividido em 2-3 dias de trabalho**

---

## 🎨 Design Guidelines

### **Cores**
```typescript
// Manter tema atual
primary: #5B7EFF (azul)
gold: #FFD700 (para XP/level)
success: #39F7B6
warning: #F7AA39
error: #FF5B7E
```

### **Animações (Sutis)**
```typescript
// Fade
duration: 300ms
easing: ease-in-out

// Scale (botões)
transform: scale(0.98)
duration: 150ms

// Slide (modals)
translateY: 100% → 0%
duration: 400ms

// Pulso (FAB)
scale: 1 → 1.05 → 1
duration: 2000ms
loop: true
```

### **Haptic**
```typescript
import * as Haptics from 'expo-haptics';

// Levels
Light: tocar botões
Medium: abrir modals
Success: confirmar ações
Warning: deletar
```

---

## 🔄 Fluxos de Usuário

### **Fluxo 1: Captura Rápida**
```
1. User está estudando
2. Tem insight/ideia
3. Toca FAB ✨
4. Modal abre
5. Escolhe tipo (áudio/foto/texto)
6. Captura conteúdo
7. Confirma
8. Haptic success + fade out
9. +10 XP
10. Ideia aparece em "Ideias"
```

### **Fluxo 2: Desenvolver Ideia**
```
1. User abre "Sala de Estudos"
2. Tab "💡 Ideias"
3. Vê ideia capturada
4. Toca "Desenvolver"
5. Expande texto, adiciona tags, link
6. Salva
7. Vira "Recurso" na Biblioteca
```

### **Fluxo 3: Transformar → Flashcard**
```
1. User abre recurso
2. Toca "Transformar"
3. Escolhe "Flashcard"
4. Modal mostra preview
5. Edita frente/verso
6. Seleciona deck destino
7. Confirma
8. Card criado + +10 XP
9. Recurso mostra "3 flashcards gerados"
```

### **Fluxo 4: Importar Flashcards**
```
1. User em FlashcardsHome
2. Menu "⋮" → "Importar"
3. Seleciona arquivo CSV/JSON
4. Preview cards (primeiros 5)
5. Escolhe deck destino
6. Confirma
7. Progresso (X de Y)
8. Completa + +20 XP
9. Timeline registra "50 cards importados"
```

---

## ✅ Checklist Final

### **Funcionalidades Core**
- [ ] Captura áudio (3s auto-stop)
- [ ] Captura foto (câmera/galeria)
- [ ] Captura texto (30 chars)
- [ ] Feed de ideias recentes
- [ ] Desenvolver ideia → recurso
- [ ] Biblioteca com tags/busca
- [ ] Transformar → flashcard
- [ ] Transformar → task
- [ ] Importar CSV/JSON
- [ ] Sistema de XP

### **UX/UI**
- [ ] Animações elegantes (sem confete)
- [ ] Haptic feedback
- [ ] Empty states
- [ ] Loading states
- [ ] Navegação fluida

### **Qualidade**
- [ ] Zero erros TypeScript
- [ ] AsyncStorage funcionando
- [ ] Tudo testado no celular
- [ ] Commits organizados

---

## 🚀 Pronto para Começar!

Este plano está salvo e pronto para execução.

**Ordem de execução:**
1. Fases 1-2 (base)
2. Fase 3 (captura - MVP)
3. Teste no celular
4. Fases 4-6 (biblioteca)
5. Fases 7-9 (importação + XP)
6. Fases 10-12 (polish + deploy)

**Total:** 14h divididas em 2-3 dias de desenvolvimento focado.
