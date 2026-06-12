import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { LargeNumberInput } from '@/components/LargeNumberInput';
import { CustomButton } from '@/components/CustomButton';
import { Colors } from '@/constants/theme';

export default function AgeScreen() {
  const router = useRouter();
  const { age, setAge } = useOnboardingStore();
  const [localAge, setLocalAge] = useState(age ? age.toString() : '');

  const handleContinue = () => {
    if (isValidAge) {
      setAge(parseInt(localAge, 10));
      router.push('/assessment/fitnessLevel');
    }
  };
  const ageNumber = Number(localAge);
  const isValidAge = Number.isInteger(ageNumber) && ageNumber >= 18 && ageNumber <= 99;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header step={4} totalSteps={17} onBack={() => router.back()} />
      
      <View style={styles.content}>
        <Typography variant="h2" align="center" style={styles.title}>
          What is your age?
        </Typography>
        
        <View style={styles.inputContainer}>
          <LargeNumberInput
            value={localAge}
            onChangeText={setLocalAge}
            placeholder="0"
          />
          <Typography variant="caption" color={localAge && !isValidAge ? '#FF6B6B' : Colors.dark.textSecondary}>
            You must be between 18 and 99 years old.
          </Typography>
        </View>

        <View style={styles.footer}>
          <CustomButton 
            title="Continue" 
            onPress={handleContinue} 
            disabled={!isValidAge}
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
  footer: {
    paddingTop: 16,
  },
});
