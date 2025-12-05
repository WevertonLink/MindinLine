# 📦 Services

Serviços centralizados do MindinLine para funcionalidades cross-cutting.

## 📬 Notification Service

Serviço de notificações push locais e agendadas.

### Status Atual
✅ **Implementação Stub** - Pronto para expansão com biblioteca real

### Uso Atual

```typescript
import { notificationService } from '../services/notificationService';

// Solicitar permissão
await notificationService.requestPermission();

// Notificação imediata
await notificationService.showNotification({
  title: 'Título',
  body: 'Mensagem',
  sound: true,
  vibrate: true,
});

// Notificação agendada
await notificationService.scheduleNotification({
  title: 'Lembrete',
  body: 'Não esqueça de estudar!',
  scheduleTime: new Date(Date.now() + 3600000), // 1 hora
});

// Métodos específicos do domínio
await notificationService.notifyTaskDueSoon(task);
await notificationService.notifyReviewDue(deck, cardsCount);
await notificationService.notifyStreakBreak(currentStreak);
```

### Para Produção

Instalar biblioteca de notificações:

```bash
# Opção 1: Notifee (recomendado)
npm install @notifee/react-native
cd android && ./gradlew clean && cd ..
cd ios && pod install && cd ..

# Opção 2: Expo (se usando Expo)
npx expo install expo-notifications
```

Descomentar código TODO em `notificationService.ts` e implementar.

---

## 📊 Analytics Service

Serviço de analytics e crash reporting.

### Status Atual
✅ **Implementação Stub** - Pronto para expansão com Firebase/Sentry

### Uso Atual

```typescript
import { analyticsService } from '../services/analyticsService';

// Configurar
analyticsService.setUserId('user123');
analyticsService.setUserProperties({
  appVersion: '1.0.0',
  platform: 'android',
});

// Logar eventos
analyticsService.logTaskCreated('work', 'high');
analyticsService.logFocusSessionCompleted('focus', 25);
analyticsService.logScreenViewed('TasksHome');

// Logar erros
try {
  // código
} catch (error) {
  analyticsService.logError(error, { context: 'TaskCreation' });
}

// Breadcrumbs (rastreamento de ações)
analyticsService.addBreadcrumb('User clicked create task button');
```

### Integração Automática

O serviço já está integrado no `ErrorBoundary`:
- Erros não tratados são automaticamente reportados
- Breadcrumbs ajudam a entender o fluxo antes do erro

### Para Produção

**Opção 1: Firebase (gratuito até certo limite)**

```bash
npm install @react-native-firebase/app
npm install @react-native-firebase/analytics
npm install @react-native-firebase/crashlytics
```

Configurar:
1. Criar projeto no [Firebase Console](https://console.firebase.google.com/)
2. Baixar `google-services.json` (Android) → `android/app/`
3. Baixar `GoogleService-Info.plist` (iOS) → `ios/`
4. Seguir [documentação oficial](https://rnfirebase.io/)

**Opção 2: Sentry (focado em error tracking)**

```bash
npm install @sentry/react-native
npx @sentry/wizard -i reactNative -p ios android
```

Descomentar código TODO em `analyticsService.ts` e adaptar para biblioteca escolhida.

---

## 🗄️ Storage Service

Gerenciamento de persistência com AsyncStorage.

### Recursos

- ✅ Versionamento de dados
- ✅ Validação de tipos (type guards)
- ✅ Migração automática entre versões
- ✅ Tratamento de erros

### Uso

```typescript
import { saveDataVersioned, loadDataVersioned } from '../services/storage';
import { isTaskArray } from '../features/tasks/types';

// Salvar
await saveDataVersioned('tasks', tasks);

// Carregar com validação
const tasks = await loadDataVersioned('tasks', isTaskArray);
```

---

## 📍 Timeline Service

Gerenciamento de atividades do timeline.

### Uso

```typescript
import { addTimelineActivity } from '../services/timelineService';

// Adicionar atividade
addTimelineActivity({
  type: 'task_completed',
  title: task.title,
  description: `Tarefa "${task.title}" concluída`,
  metadata: {
    taskId: task.id,
    taskPriority: task.priority,
  },
});
```

Atividades são automaticamente adicionadas quando:
- ✅ Tarefa completada
- ✅ Deck de flashcards revisado
- ✅ Sessão de foco completada
- ✅ Flow completado
- ✅ Material estudado

---

## 🔐 Boas Práticas

### 1. Sempre verificar configurações do usuário

```typescript
import { useSettings } from '../context/SettingsContext';

const { settings } = useSettings();

if (settings.app.notificationsEnabled) {
  await notificationService.showNotification({...});
}

if (settings.app.analyticsEnabled) {
  analyticsService.logEvent('action');
}
```

### 2. Tratar erros graciosamente

```typescript
try {
  await someOperation();
} catch (error) {
  // Log do erro
  analyticsService.logError(error, { operation: 'someOperation' });

  // Feedback para o usuário
  Alert.alert('Erro', 'Não foi possível completar a operação');
}
```

### 3. Adicionar breadcrumbs em fluxos importantes

```typescript
analyticsService.addBreadcrumb('User started task creation');
// ... código
analyticsService.addBreadcrumb('User filled task form');
// ... código
analyticsService.addBreadcrumb('User submitted task');
```

Isso ajuda a debugar erros mostrando o que o usuário fez antes.

---

## 🚀 Roadmap

- [ ] Implementar biblioteca real de notificações
- [ ] Configurar Firebase/Sentry
- [ ] Adicionar testes unitários para services
- [ ] Implementar retry logic para operações de storage
- [ ] Adicionar telemetria de performance
- [ ] Cache de notificações offline

---

## 📚 Referências

- [Notifee Docs](https://notifee.app/react-native/docs/overview)
- [React Native Firebase](https://rnfirebase.io/)
- [Sentry React Native](https://docs.sentry.io/platforms/react-native/)
- [AsyncStorage Best Practices](https://react-native-async-storage.github.io/async-storage/docs/advanced/best-practices)
