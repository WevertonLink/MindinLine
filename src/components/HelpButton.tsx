import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Tooltip from './Tooltip';
import { colors } from '../theme/globalStyles';

// ==========================================
// ❓ HELP BUTTON COMPONENT
// ==========================================

interface HelpButtonProps {
  content: string;
  size?: number;
  color?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const HelpButton: React.FC<HelpButtonProps> = ({
  content,
  size = 20,
  color = colors.text.tertiary,
  position = 'top',
}) => {
  return (
    <Tooltip content={content} position={position}>
      <View style={styles.helpButton}>
        <Icon name="help-circle-outline" size={size} color={color} />
      </View>
    </Tooltip>
  );
};

const styles = StyleSheet.create({
  helpButton: {
    padding: 4,
  },
});

export default HelpButton;
