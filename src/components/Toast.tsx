import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ToastConfig, ToastType } from '../context/ToastContext';
import { colors, spacing, borderRadius, typography } from '../theme/globalStyles';

const { width } = Dimensions.get('window');
const TOAST_WIDTH = width - spacing.lg * 2;

interface ToastProps {
  toast: ToastConfig;
  onHide: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onHide }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-hide animation
    const hideTimer = setTimeout(() => {
      handleHide();
    }, toast.duration || 3000);

    return () => clearTimeout(hideTimer);
  }, []);

  const handleHide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide(toast.id);
    });
  };

  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          borderColor: colors.status.success,
          iconColor: colors.status.success,
          icon: 'checkmark-circle',
        };
      case 'error':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          borderColor: colors.status.error,
          iconColor: colors.status.error,
          icon: 'close-circle',
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(251, 146, 60, 0.15)',
          borderColor: colors.status.warning,
          iconColor: colors.status.warning,
          icon: 'warning',
        };
      case 'info':
        return {
          backgroundColor: 'rgba(91, 126, 255, 0.15)',
          borderColor: colors.accent.primary,
          iconColor: colors.accent.primary,
          icon: 'information-circle',
        };
    }
  };

  const style = getToastStyle(toast.type);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Pressable
        style={styles.content}
        onPress={toast.action ? toast.action.onPress : undefined}
        onLongPress={handleHide}
      >
        <Icon name={style.icon} size={24} color={style.iconColor} />

        <View style={styles.textContainer}>
          <Text style={styles.title}>{toast.title}</Text>
          {toast.message && (
            <Text style={styles.message}>{toast.message}</Text>
          )}
        </View>

        {toast.action && (
          <Pressable onPress={toast.action.onPress} style={styles.actionButton}>
            <Text style={[styles.actionText, { color: style.iconColor }]}>
              {toast.action.label}
            </Text>
          </Pressable>
        )}

        <Pressable onPress={handleHide} style={styles.closeButton}>
          <Icon name="close" size={20} color={colors.text.tertiary} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

// ==========================================
// TOAST CONTAINER
// ==========================================

interface ToastContainerProps {
  toasts: ToastConfig[];
  onHide: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onHide }) => {
  return (
    <View style={styles.toastContainer} pointerEvents="box-none">
      {toasts.map((toast, index) => (
        <View key={toast.id} style={{ marginBottom: index < toasts.length - 1 ? spacing.sm : 0 }}>
          <Toast toast={toast} onHide={onHide} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
    alignItems: 'center',
  },
  container: {
    width: TOAST_WIDTH,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  message: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * 1.4,
  },
  actionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  closeButton: {
    padding: spacing.xs,
  },
});

export default Toast;
