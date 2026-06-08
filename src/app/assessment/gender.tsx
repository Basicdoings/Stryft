import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Header } from '@/components/Header';
import { Typography } from '@/components/Typography';
import { SelectionCard } from '@/components/SelectionCard';
import { CustomButton } from '@/components/CustomButton';
import { Colors } from '@/constants/theme';

export default function GenderScreen() {
  const router = useRouter();
  const { gender, setGender } = useOnboardingStore();

  const handleContinue = () => {
    if (gender) {
      router.push('/assessment/goal');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header step={1} totalSteps={17} onBack={() => router.back()} />
      
      <View style={styles.content}>
        <Typography variant="h2" align="center" style={styles.title}>
          What is your gender?
        </Typography>
        
        <View style={styles.options}>
          <SelectionCard
            title="Male"
            selected={gender === 'Male'}
            onPress={() => setGender('Male')}
            iconName="male"
          />
          <SelectionCard
            title="Female"
            selected={gender === 'Female'}
            onPress={() => setGender('Female')}
            iconName="female"
          />
          <SelectionCard
            title="Prefer not to say"
            selected={gender === 'Other'}
            onPress={() => setGender('Other')}
            iconName="person"
          />
        </View>

        <View style={styles.footer}>
          <CustomButton 
            title="Continue" 
            onPress={handleContinue} 
            disabled={!gender}
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
  options: {
    flex: 1,
  },
  footer: {
    marginTop: 'auto',
  },
});
