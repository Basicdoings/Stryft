import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { ArcSlider } from '@/components/ArcSlider';
import { CustomButton } from '@/components/CustomButton';
import { Colors } from '@/constants/theme';

export default function FitnessLevelScreen() {
  const router = useRouter();
  const { fitnessLevel, setFitnessLevel } = useOnboardingStore();
  const [localLevel, setLocalLevel] = useState(fitnessLevel || 3);

  const handleContinue = () => {
    setFitnessLevel(localLevel);
    router.push('/assessment/limitations');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header step={5} totalSteps={17} onBack={() => router.back()} />
      
      <View style={styles.content}>
        <Typography variant="h2" align="center" style={styles.title}>
          How would you rate your fitness level?
        </Typography>
        
        <View style={styles.sliderContainer}>
          <ArcSlider value={localLevel} onValueChange={setLocalLevel} />
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
  sliderContainer: {
    flex: 1,
    width: '100%',
  },
  footer: {
    paddingTop: 16,
  },
});
