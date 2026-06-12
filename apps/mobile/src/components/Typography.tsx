import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'button';
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  weight?: 'normal' | 'bold' | '400' | '500' | '600' | '700' | '800';
}

const getFontFamily = (variant: string, weight?: string) => {
  let w = weight;
  if (!w) {
    switch (variant) {
      case 'h1':
      case 'h2':
      case 'button':
        w = '700';
        break;
      case 'h3':
        w = '600';
        break;
      default:
        w = '400';
    }
  }
  
  if (w === 'bold' || w === '700') return 'WorkSans_700Bold';
  if (w === '800') return 'WorkSans_800ExtraBold';
  if (w === '600') return 'WorkSans_600SemiBold';
  if (w === '500') return 'WorkSans_500Medium';
  return 'WorkSans_400Regular';
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = Colors.dark.text,
  align = 'left',
  weight,
  style,
  children,
  ...props
}) => {
  const fontFamily = getFontFamily(variant, weight);
  return (
    <Text
      style={[
        styles[variant],
        { color, textAlign: align, fontFamily },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: 32,
    marginBottom: 8,
  },
  h2: {
    fontSize: 24,
    marginBottom: 8,
  },
  h3: {
    fontSize: 20,
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
  },
  caption: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  button: {
    fontSize: 16,
  },
});
