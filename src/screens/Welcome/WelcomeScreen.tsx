import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, borderRadius } from '../../theme/globalStyles';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  onContinueAsGuest: () => void;
  onSignUp: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinueAsGuest, onSignUp }) => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />

      {/* Logo e Título */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>MindinLine</Text>
        <Text style={styles.subtitle}>
          Organize seus estudos com flashcards inteligentes, trilhas estruturadas e produtividade focada
        </Text>
      </View>

      {/* Features Grid */}
      <View style={styles.featuresGrid}>
        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: 'rgba(91, 126, 255, 0.15)' }]}>
            <Icon name="layers-outline" size={28} color={colors.accent.primary} />
          </View>
          <Text style={styles.featureTitle}>Flashcards</Text>
          <Text style={styles.featureDescription}>
            Repetição espaçada inteligente
          </Text>
        </View>

        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: 'rgba(247, 170, 57, 0.15)' }]}>
            <Icon name="map-outline" size={28} color={colors.accent.secondary} />
          </View>
          <Text style={styles.featureTitle}>Trilhas</Text>
          <Text style={styles.featureDescription}>
            Roteiros de estudo
          </Text>
        </View>

        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: 'rgba(57, 247, 182, 0.15)' }]}>
            <Icon name="checkmark-circle-outline" size={28} color={colors.status.success} />
          </View>
          <Text style={styles.featureTitle}>Tarefas</Text>
          <Text style={styles.featureDescription}>
            Pomodoro integrado
          </Text>
        </View>

        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: 'rgba(255, 91, 126, 0.15)' }]}>
            <Icon name="time-outline" size={28} color={colors.status.error} />
          </View>
          <Text style={styles.featureTitle}>Timeline</Text>
          <Text style={styles.featureDescription}>
            Acompanhe seu progresso
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <Pressable
          style={styles.primaryButton}
          onPress={onSignUp}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
        >
          <Text style={styles.primaryButtonText}>Criar Conta</Text>
          <Icon name="arrow-forward" size={20} color="#FFFFFF" />
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={onContinueAsGuest}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.05)' }}
        >
          <Text style={styles.secondaryButtonText}>Continuar como Convidado</Text>
          <Icon name="person-outline" size={20} color={colors.text.secondary} />
        </Pressable>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Ao continuar, você concorda com nossos{' '}
          <Text style={styles.footerLink}>Termos de Uso</Text> e{' '}
          <Text style={styles.footerLink}>Política de Privacidade</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.xl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(91, 126, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(91, 126, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: spacing.xl,
  },
  featureCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.primary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  buttonsContainer: {
    marginTop: 'auto',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: spacing.sm,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.secondary,
  },
  footer: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: colors.accent.primary,
    fontWeight: typography.fontWeight.semibold as any,
  },
});

export default WelcomeScreen;
