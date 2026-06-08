import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'button';
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  weight?: 'normal' | 'bold' | '400' | '500' | '600' | '700' | '800';
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = Colors.dark.text,
  align = 'left',
  weight,
  style,
  children,
  ...props
}) => {
  return (
    <Text
      style={[
        styles[variant],
        { color, textAlign: align },
        weight && { fontWeight: weight },
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
    fontWeight: 'bold',
    marginBottom: 8,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
  },
  caption: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  button: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
