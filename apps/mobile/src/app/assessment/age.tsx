import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { WheelPicker } from '@/components/WheelPicker';
import { CustomButton } from '@/components/CustomButton';
import { Colors } from '@/constants/theme';

export default function AgeScreen() {
  const router = useRouter();
  const { age, setAge } = useOnboardingStore();
  const [localAge, setLocalAge] = useState(age || 18);

  const handleContinue = () => {
    setAge(localAge);
    router.push('/assessment/fitnessLevel');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header step={4} totalSteps={17} onBack={() => router.back()} />
      
      <View style={styles.content}>
        <Typography variant="h2" align="center" style={styles.title}>
          What is your age?
        </Typography>
        
        <View style={styles.pickerContainer}>
          <WheelPicker 
            value={localAge} 
            onValueChange={setLocalAge} 
            min={18} 
            max={99} 
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
  pickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingTop: 16,
  },
});
