import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { RulerPicker } from '@/components/RulerPicker';
import { CustomButton } from '@/components/CustomButton';
import { Colors } from '@/constants/theme';

export default function WeightScreen() {
  const router = useRouter();
  const { weight, setWeight } = useOnboardingStore();
  const [localWeight, setLocalWeight] = useState(weight.value || 70);

  const handleContinue = () => {
    setWeight(localWeight, weight.unit);
    router.push('/assessment/age');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header step={3} totalSteps={17} onBack={() => router.back()} />
      
      <View style={styles.content}>
        <Typography variant="h2" align="center" style={styles.title}>
          What is your weight?
        </Typography>
        
        <View style={styles.centerContainer}>
          <View style={styles.unitToggle}>
            {(['kg', 'lbs'] as const).map((unit) => (
              <TouchableOpacity
                key={unit}
                onPress={() => setWeight(localWeight, unit)}
                style={[styles.unitButton, weight.unit === unit && styles.unitButtonActive]}
              >
                <Typography variant="caption" weight="700" color={weight.unit === unit ? Colors.dark.text : Colors.dark.textSecondary}>{unit}</Typography>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.valueContainer}>
            <Typography style={styles.valueText}>{localWeight}</Typography>
            <Typography style={styles.unitText}>{weight.unit}</Typography>
          </View>

          <RulerPicker 
            value={localWeight} 
            onValueChange={setLocalWeight} 
            min={40} 
            max={200} 
            step={0.1}
          />
        </View>

        <View style={styles.footer}>
          <CustomButton 
            title="Continue" 
            onPress={handleContinue} 
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
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    marginTop: 20,
    marginBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitToggle: { 
    flexDirection: 'row', 
    backgroundColor: Colors.dark.backgroundElement, 
    borderRadius: 18, 
    padding: 4,
    marginBottom: 40,
    width: 200,
  },
  unitButton: { 
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10, 
    borderRadius: 14 
  },
  unitButtonActive: { 
    backgroundColor: Colors.dark.primary 
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 40,
  },
  valueText: {
    fontSize: 96,
    fontFamily: 'WorkSans-Black',
    lineHeight: 100,
    color: '#FFF',
  },
  unitText: {
    fontSize: 32,
    fontFamily: 'WorkSans-Bold',
    color: Colors.dark.textSecondary,
    marginLeft: 8,
  },
  footer: {
    paddingTop: 16,
  },
});
