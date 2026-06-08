import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { Colors } from '@/constants/theme';

interface LargeNumberInputProps {
  value: string;
  onChangeText: (text: string) => void;
  unit?: string;
  placeholder?: string;
}

export const LargeNumberInput: React.FC<LargeNumberInputProps> = ({
  value,
  onChangeText,
  unit,
  placeholder = '0',
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholder={placeholder}
        placeholderTextColor={Colors.dark.textSecondary}
        maxLength={3}
      />
      {unit && (
        <Typography variant="h2" color={Colors.dark.textSecondary} style={styles.unit}>
          {unit}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginVertical: 40,
  },
  input: {
    fontSize: 72,
    fontWeight: 'bold',
    color: Colors.dark.text,
    minWidth: 100,
    textAlign: 'center',
  },
  unit: {
    marginLeft: 8,
  },
});
