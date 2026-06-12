import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { Typography } from './Typography';
import { Ionicons } from '@expo/vector-icons';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  showArrow?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  showArrow = false,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return Colors.dark.backgroundSelected;
    if (variant === 'primary') return Colors.dark.primary;
    if (variant === 'secondary') return Colors.dark.backgroundElement;
    return 'transparent';
  };

  const getTextColor = () => {
    if (disabled) return Colors.dark.textSecondary;
    if (variant === 'outline') return Colors.dark.primary;
    return Colors.dark.text;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.outlineButton,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.content}>
          <Typography variant="button" weight="800" color={getTextColor()} style={{ marginRight: showArrow ? 8 : 0 }}>
            {title}
          </Typography>
          {showArrow && (
            <Ionicons name="arrow-forward" size={20} color={getTextColor()} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 28, // Pill shape
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    marginVertical: 16,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
