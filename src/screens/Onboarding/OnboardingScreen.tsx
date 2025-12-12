import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../../components';
import {
  colors,
  spacing,
  borderRadius,
  typography,
} from '../../theme/globalStyles';

const { width } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  description: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: '1',
    icon: 'rocket-outline',
    iconColor: colors.accent.primary,
    title: 'Bem-vindo ao MindinLine',
    description: 'Seu assistente cognitivo para organizar estudos, tarefas e maximizar sua produtividade.',
  },
  {
    id: '2',
    icon: 'layers-outline',
    iconColor: colors.status.info,
    title: 'Flashcards Inteligentes',
    description: 'Memorize conceitos com repetição espaçada. Suas revisões são otimizadas automaticamente para melhor aprendizado.',
  },
  {
    id: '3',
    icon: 'checkmark-circle-outline',
    iconColor: colors.status.success,
    title: 'Tarefas com Foco',
    description: 'Gerencie suas tarefas e use o modo Pomodoro integrado para manter o foco e a produtividade.',
  },
  {
    id: '4',
    icon: 'library-outline',
    iconColor: colors.status.warning,
    title: 'Trilhas de Aprendizado',
    description: 'Crie roteiros estruturados de estudo. Organize seu aprendizado em etapas sequenciais.',
  },
  {
    id: '5',
    icon: 'time-outline',
    iconColor: colors.accent.secondary,
    title: 'Acompanhe sua Evolução',
    description: 'Timeline automática registra todas suas atividades. Veja seu progresso e mantenha sequências diárias.',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < onboardingSteps.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem('@mindinline:onboarding_completed', 'true');
      onComplete();
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      onComplete(); // Continue anyway
    }
  };

  const renderStep = ({ item }: { item: OnboardingStep }) => (
    <View style={styles.stepContainer}>
      <View style={styles.stepContent}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${item.iconColor}20` }]}>
          <Icon name={item.icon} size={80} color={item.iconColor} />
        </View>

        {/* Text */}
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {onboardingSteps.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentIndex && styles.dotActive,
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Skip button */}
      {currentIndex < onboardingSteps.length - 1 && (
        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Pular</Text>
        </Pressable>
      )}

      {/* Steps */}
      <FlatList
        ref={flatListRef}
        data={onboardingSteps}
        renderItem={renderStep}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        bounces={false}
      />

      {/* Dots indicator */}
      {renderDots()}

      {/* Bottom buttons */}
      <View style={styles.buttonsContainer}>
        <Button
          label={currentIndex === onboardingSteps.length - 1 ? 'Começar' : 'Próximo'}
          icon={currentIndex === onboardingSteps.length - 1 ? 'rocket' : 'arrow-forward'}
          iconPosition="right"
          variant="primary"
          size="large"
          onPress={handleNext}
          fullWidth
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  skipButton: {
    position: 'absolute',
    top: spacing.xl * 2,
    right: spacing.lg,
    zIndex: 10,
    padding: spacing.md,
  },
  skipText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  stepContainer: {
    width: width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl * 2,
  },
  stepContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl * 2,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.lg * 1.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.glass.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.accent.primary,
  },
  buttonsContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
});

export default OnboardingScreen;
