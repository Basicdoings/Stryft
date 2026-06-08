import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { LargeNumberInput } from '@/components/LargeNumberInput';
import { CustomButton } from '@/components/CustomButton';
import { Colors } from '@/constants/theme';

export default function WeightScreen() {
  const router = useRouter();
  const { weight, setWeight } = useOnboardingStore();
  const [localWeight, setLocalWeight] = useState(weight.value ? weight.value.toString() : '');

  const handleContinue = () => {
    if (localWeight) {
      setWeight(parseFloat(localWeight), weight.unit);
      router.push('/assessment/age');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header step={3} totalSteps={17} onBack={() => router.back()} />
      
      <View style={styles.content}>
        <Typography variant="h2" align="center" style={styles.title}>
          What is your weight?
        </Typography>
        
        <View style={styles.inputContainer}>
          <View style={styles.unitToggle}>
            {(['kg', 'lbs'] as const).map((unit) => (
              <TouchableOpacity
                key={unit}
                onPress={() => setWeight(weight.value, unit)}
                style={[styles.unitButton, weight.unit === unit && styles.unitButtonActive]}
              >
                <Typography variant="caption" weight="700" color={weight.unit === unit ? Colors.dark.text : Colors.dark.textSecondary}>{unit}</Typography>
              </TouchableOpacity>
            ))}
          </View>
          <LargeNumberInput
            value={localWeight}
            onChangeText={setLocalWeight}
            unit={weight.unit}
            placeholder="0"
          />
        </View>

        <View style={styles.footer}>
          <CustomButton 
            title="Continue" 
            onPress={handleContinue} 
            disabled={!localWeight}
            showArrow
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    marginTop: 20,
    marginBottom: 40,
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitToggle: { flexDirection: 'row', backgroundColor: Colors.dark.backgroundElement, borderRadius: 18, padding: 4 },
  unitButton: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 14 },
  unitButtonActive: { backgroundColor: Colors.dark.primary },
  footer: {
    paddingTop: 16,
  },
});
