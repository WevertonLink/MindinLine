import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Animated } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme/globalStyles';

// ==========================================
// 💬 TOOLTIP COMPONENT
// ==========================================

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
}) => {
  const [visible, setVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const show = () => {
    setVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const hide = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  return (
    <View>
      <Pressable onPress={show} onLongPress={show}>
        {children}
      </Pressable>

      {visible && (
        <Modal transparent visible={visible} onRequestClose={hide}>
          <Pressable style={styles.overlay} onPress={hide}>
            <Animated.View
              style={[
                styles.tooltipContainer,
                styles[`position_${position}`],
                { opacity: fadeAnim },
              ]}
            >
              <Text style={styles.tooltipText}>{content}</Text>
            </Animated.View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  tooltipContainer: {
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.base,
    maxWidth: '80%',
  },
  tooltipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    lineHeight: typography.fontSize.sm * 1.5,
  },
  position_top: {
    // Posicionamento específico será ajustado conforme necessário
  },
  position_bottom: {
    // Posicionamento específico será ajustado conforme necessário
  },
  position_left: {
    // Posicionamento específico será ajustado conforme necessário
  },
  position_right: {
    // Posicionamento específico será ajustado conforme necessário
  },
});

export default Tooltip;
